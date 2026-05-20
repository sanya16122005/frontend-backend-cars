const express    = require('express');
const http       = require('http');
const path       = require('path');
const cors       = require('cors');
const bodyParser = require('body-parser');
const socketIo   = require('socket.io');
const webpush    = require('web-push');

// VAPID-ключи. Если в .env переданы валидные ключи — используем их,
// иначе генерируем рабочую пару на лету, чтобы push работал «из коробки».
let vapidKeys;
let pushEnabled = false;
try {
  const envPub  = process.env.VAPID_PUBLIC;
  const envPriv = process.env.VAPID_PRIVATE;
  if (envPub && envPriv && !envPriv.startsWith('CHANGE_ME')) {
    vapidKeys = { publicKey: envPub, privateKey: envPriv };
  } else {
    vapidKeys = webpush.generateVAPIDKeys();
    console.log('🔑 Сгенерированы временные VAPID-ключи (живут пока работает процесс).');
    console.log('   Для постоянных подписок добавьте в .env:');
    console.log(`   VAPID_PUBLIC=${vapidKeys.publicKey}`);
    console.log(`   VAPID_PRIVATE=${vapidKeys.privateKey}`);
  }
  webpush.setVapidDetails('mailto:cars-tasks@example.com', vapidKeys.publicKey, vapidKeys.privateKey);
  pushEnabled = true;
} catch (err) {
  console.error('⚠️  VAPID setup failed, push отключён:', err.message);
  vapidKeys = { publicKey: '', privateKey: '' };
}

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

app.get('/api/vapid-public-key', (req, res) => res.json({ key: vapidKeys.publicKey }));

let subscriptions = [];
const reminders   = new Map(); // id → { timeoutId, text, reminderTime }
const SNOOZE_MS   = 5 * 60 * 1000;

function broadcastPush(payload) {
  if (!pushEnabled) return;
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
