// Producer — Express API. POST /tasks принимает задачу
// { type, payload } и публикует её в tasks_queue.

const express = require('express');
const amqplib = require('amqplib');

const AMQP_URL = process.env.AMQP_URL || 'amqp://localhost';
const QUEUE    = 'tasks_queue';
const PORT     = Number(process.env.PORT) || 3000;

let channel;
async function connect() {
  const connection = await amqplib.connect(AMQP_URL);
  channel = await connection.createChannel();
  await channel.assertQueue(QUEUE, {
    durable: true,
    arguments: {
      'x-dead-letter-exchange':    'tasks_dlx',
      'x-dead-letter-routing-key': 'dead'
    }
  });
  console.log(`✅ Producer подключён к RabbitMQ (${AMQP_URL})`);
}

const app = express();
app.use(express.json());

app.post('/tasks', (req, res) => {
  const { type, payload } = req.body || {};
  if (!type) return res.status(400).json({ error: 'type required' });

  const task = {
    id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    payload: payload || {},
    createdAt: new Date().toISOString()
  };

  channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(task)), {
    persistent: true,
    headers: { 'x-retry-count': 0 }
  });

  console.log(`[Producer] → ${QUEUE}:`, task.id, task.type);
  res.status(202).json({ message: 'Задача поставлена в очередь', task });
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

connect()
  .then(() => app.listen(PORT, () => console.log(`🚀 Producer API: http://localhost:${PORT}`)))
  .catch(err => {
    console.error('❌ Producer startup error:', err.message);
    process.exit(1);
  });
