const express    = require('express');
const http       = require('http');
const path       = require('path');
const cors       = require('cors');
const bodyParser = require('body-parser');
const socketIo   = require('socket.io');
const webpush    = require('web-push');

const vapidKeys = {
  publicKey:  process.env.VAPID_PUBLIC  || 'BNxRsl7y0n9wWQ8sZK2Q1Xz0WyYC0HwQ8Hh8aE7q3qSxKxRk5q6Xc9Vy2KxJh8Pk9aLn0_RbF8t8sP2gQ4cU0w7E',
  privateKey: process.env.VAPID_PRIVATE || 'CHANGE_ME_PRIVATE_KEY_FROM_npm_run_vapid'
};

webpush.setVapidDetails('mailto:cars-tasks@example.com', vapidKeys.publicKey, vapidKeys.privateKey);

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

app.get('/api/vapid-public-key', (req, res) => res.json({ key: vapidKeys.publicKey }));

let subscriptions = [];
const reminders   = new Map(); // id → { timeoutId, text, reminderTime }
const SNOOZE_MS   = 5 * 60 * 1000;

function broadcastPush(payload) {
  const body = JSON.stringify(payload);
  subscriptions.forEach(sub => {
    webpush.sendNotification(sub, body).catch(err => console.error('Push error:', err.statusCode || err.message));
  });
}

function scheduleReminder({ id, text, reminderTime }) {
  const delay = reminderTime - Date.now();
  if (delay <= 0) return;

  const timeoutId = setTimeout(() => {
    broadcastPush({
      title: '⏰ Напоминание (авто)',
      body:  text,
      reminderId: id
    });
    reminders.delete(id);
  }, delay);

  reminders.set(id, { timeoutId, text, reminderTime });
}

// ───── Socket.IO ────────────────────────────────────────
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*', methods: ['GET','POST'] } });

io.on('connection', (socket) => {
  console.log('Клиент подключён:', socket.id);

  socket.on('newCarTask', (task) => {
    io.emit('carTaskAdded', task);
    broadcastPush({ title: '🚗 Новая задача', body: task.text });
  });

  socket.on('newReminder', (reminder) => {
    scheduleReminder(reminder);
    io.emit('reminderScheduled', { id: reminder.id, reminderTime: reminder.reminderTime });
  });

  socket.on('disconnect', () => console.log('Клиент отключён:', socket.id));
});

// ───── HTTP API ─────────────────────────────────────────
app.post('/subscribe', (req, res) => {
  const sub = req.body;
  if (!subscriptions.some(s => s.endpoint === sub.endpoint)) subscriptions.push(sub);
  res.status(201).json({ message: 'Подписка сохранена' });
});

app.post('/unsubscribe', (req, res) => {
  const { endpoint } = req.body;
  subscriptions = subscriptions.filter(s => s.endpoint !== endpoint);
  res.json({ message: 'Подписка удалена' });
});

// Отложить напоминание на 5 минут
app.post('/snooze', (req, res) => {
  const reminderId = Number(req.query.reminderId || req.body.reminderId);
  const current = reminders.get(reminderId);
  if (!current) return res.status(404).json({ error: 'Напоминание не найдено' });

  clearTimeout(current.timeoutId);
  const newTime = Date.now() + SNOOZE_MS;
  scheduleReminder({ id: reminderId, text: current.text, reminderTime: newTime });

  io.emit('reminderSnoozed', { id: reminderId, reminderTime: newTime });
  res.json({ message: 'Напоминание отложено на 5 минут', reminderTime: newTime });
});

// Список активных напоминаний (для отладки)
app.get('/reminders', (req, res) => {
  res.json(Array.from(reminders.entries()).map(([id, r]) => ({
    id, text: r.text, reminderTime: r.reminderTime
  })));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Cars Push Reminders сервер запущен на http://localhost:${PORT}`));
