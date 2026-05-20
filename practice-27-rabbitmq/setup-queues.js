// Создаёт основную очередь tasks_queue, Dead Letter Exchange
// и Dead Letter Queue. Запускается один раз перед стартом воркеров.

const amqplib = require('amqplib');

const AMQP_URL = process.env.AMQP_URL || 'amqp://localhost';

const MAIN_QUEUE = 'tasks_queue';
const DLX        = 'tasks_dlx';
const DLQ        = 'tasks_dlq';
const DLQ_ROUTING_KEY = 'dead';

(async () => {
  const connection = await amqplib.connect(AMQP_URL);
  const channel    = await connection.createChannel();

  // 1) Dead Letter Exchange + Dead Letter Queue
  await channel.assertExchange(DLX, 'direct', { durable: true });
  await channel.assertQueue(DLQ, { durable: true });
  await channel.bindQueue(DLQ, DLX, DLQ_ROUTING_KEY);

  // 2) Основная очередь — при nack(requeue=false) сообщения уйдут в DLX
  await channel.assertQueue(MAIN_QUEUE, {
    durable: true,
    arguments: {
      'x-dead-letter-exchange':    DLX,
      'x-dead-letter-routing-key': DLQ_ROUTING_KEY
    }
  });

  console.log(`✅ Готово: ${MAIN_QUEUE} → [${DLX}] → ${DLQ}`);
  await channel.close();
  await connection.close();
})().catch(err => {
  console.error('❌ setup-queues error:', err.message);
  process.exit(1);
});
