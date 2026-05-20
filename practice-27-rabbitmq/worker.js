// Worker — Consumer с retry-логикой и DLQ.
// Запускать в нескольких терминалах:
//   WORKER_ID=1 npm run worker
//   WORKER_ID=2 npm run worker
// RabbitMQ распределит задачи между воркерами (prefetch(1)).

const amqplib = require('amqplib');

const AMQP_URL    = process.env.AMQP_URL || 'amqp://localhost';
const QUEUE       = 'tasks_queue';
const WORKER_ID   = process.env.WORKER_ID || '1';
const MAX_RETRIES = 3;

const BASE_DELAY_MS = 1000;  // первая повторная попытка — через ~1с
const MAX_DELAY_MS  = 30000;

// «Обработка» задачи: имитируем работу. Случайно валим
// для демонстрации retry + DLQ.
async function processTask(task) {
  console.log(`[Worker ${WORKER_ID}] ▶ обработка ${task.id} (${task.type})`);
  await new Promise(r => setTimeout(r, 500));  // имитация полезной работы

  // ~60% задач вида "email" падают, чтобы увидеть retry
  if (task.type === 'email' && Math.random() < 0.6) {
    throw new Error('Email service временно недоступен');
  }

  console.log(`[Worker ${WORKER_ID}] ✓ ${task.id} выполнена`);
}

async function start() {
  const connection = await amqplib.connect(AMQP_URL);
  const channel    = await connection.createChannel();
  channel.prefetch(1);

  console.log(`[Worker ${WORKER_ID}] ожидание задач из ${QUEUE}…`);

  channel.consume(QUEUE, async (msg) => {
    if (!msg) return;
    const retryCount = Number(msg.properties.headers?.['x-retry-count'] || 0);

    let task;
    try { task = JSON.parse(msg.content.toString()); }
    catch {
      console.error(`[Worker ${WORKER_ID}] невалидный JSON, отправляю в DLQ`);
      return channel.nack(msg, false, false);
    }

    console.log(`[Worker ${WORKER_ID}] попытка ${retryCount + 1}/${MAX_RETRIES + 1}:`, task.id);

    try {
      await processTask(task);
      channel.ack(msg);
    } catch (err) {
      console.error(`[Worker ${WORKER_ID}] ✗ ошибка ${task.id}:`, err.message);

      if (retryCount >= MAX_RETRIES) {
        // Исчерпали все попытки — пусть RabbitMQ отправит в DLX
        console.error(`[Worker ${WORKER_ID}] → DLQ (исчерпаны ${MAX_RETRIES} retry): ${task.id}`);
        return channel.nack(msg, false, false);
      }

      // Экспоненциальная задержка с джиттером
      const exp    = Math.min(BASE_DELAY_MS * 2 ** retryCount, MAX_DELAY_MS);
      const jitter = Math.random() * 500;
      const delay  = exp + jitter;
      console.log(`[Worker ${WORKER_ID}] повтор через ${Math.round(delay)}ms…`);

      await new Promise(r => setTimeout(r, delay));

      // Подтверждаем текущее сообщение и перепубликуем копию с увеличенным счётчиком
      channel.ack(msg);
      channel.sendToQueue(QUEUE, msg.content, {
        persistent: true,
        headers: { 'x-retry-count': retryCount + 1 }
      });
    }
  });
}

start().catch(err => {
  console.error(`[Worker ${WORKER_ID}] startup error:`, err.message);
  process.exit(1);
});
