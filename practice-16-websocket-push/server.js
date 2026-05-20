const express    = require('express');
const http       = require('http');
const path       = require('path');
const cors       = require('cors');
const bodyParser = require('body-parser');
const socketIo   = require('socket.io');
const webpush    = require('web-push');

// ───── VAPID-ключи ─────────────────────────────────────────────────
// Если в .env переданы валидные ключи — используем их,
// иначе генерируем пару на лету, чтобы push работал «из коробки».
let vapidKeys;
let pushEnabled = false;
try {
  const envPub  = process.env.VAPID_PUBLIC;
  const envPriv = process.env.VAPID_PRIVATE;
  if (envPub && envPriv && !envPriv.startsWith('CHANGE_ME')) {
    vapidKeys = { publicKey: envPub, privateKey: envPriv };
  } else {
    vapidKeys = webpush.generateVAPIDKeys();
    console.log('🔑 Сгенерированы временные VAPID-ключи. Для постоянных:');
    console.log(`   VAPID_PUBLIC=${vapidKeys.publicKey}`);
    console.log(`   VAPID_PRIVATE=${vapidKeys.privateKey}`);
  }
  webpush.setVapidDetails('mailto:cars-tasks@example.com', vapidKeys.publicKey, vapidKeys.privateKey);
  pushEnabled = true;
} catch (err) {
  console.error('⚠️  VAPID setup failed, push отключён:', err.message);
  vapidKeys = { publicKey: '', privateKey: '' };
}

// ───── Express + Socket.IO ──────────────────────────────────────────
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Отдаём публичный ключ клиенту, чтобы не зашивать его в JS
app.get('/api/vapid-public-key', (req, res) => {
  res.json({ key: vapidKeys.publicKey });
});

let subscriptions = []; // { endpoint, keys: {...} }

const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

io.on('connection', (socket) => {
  console.log('Клиент подключён:', socket.id);

  // Новая задача по автомобилю — рассылаем всем + push
  socket.on('newCarTask', (task) => {
    io.emit('carTaskAdded', task);

    const payload = JSON.stringify({
      title: '🚗 Новая задача',
      body:  task.text
    });

    if (pushEnabled) {
      subscriptions.forEach(sub => {
        webpush.sendNotification(sub, payload).catch(err => {
          console.error('Push error:', err.statusCode || err.message);
        });
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Клиент отключён:', socket.id);
  });
});

// ───── Push-подписки ────────────────────────────────────────────────
app.post('/subscribe', (req, res) => {
  const sub = req.body;
  if (!subscriptions.some(s => s.endpoint === sub.endpoint)) {
    subscriptions.push(sub);
  }
  res.status(201).json({ message: 'Подписка сохранена' });
});

app.post('/unsubscribe', (req, res) => {
  const { endpoint } = req.body;
  subscriptions = subscriptions.filter(s => s.endpoint !== endpoint);
  res.json({ message: 'Подписка удалена' });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Cars WebSocket+Push сервер запущен на http://localhost:${PORT}`);
});
