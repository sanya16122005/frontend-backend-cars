const express = require('express');
const cors    = require('cors');
const http    = require('http');
const os      = require('os');
const swaggerUi = require('swagger-ui-express');
const { Server: SocketIOServer } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');

const { pool } = require('./db');
const { connectRedis, pubClient, subClient } = require('./redis');
const { initPush } = require('./push');
const swaggerSpec = require('./swagger');

const authRoutes  = require('./routes/auth');
const usersRoutes = require('./routes/users');
const tasksRoutes = require('./routes/tasks');
const pushRoutes  = require('./routes/push');

const PORT      = Number(process.env.PORT) || 3000;
const SERVER_ID = process.env.SERVER_ID    || `cars-${os.hostname()}`;

const app = express();
app.use(cors());
app.use(express.json());

// Идентификатор инстанса в req → попадает в ответы
app.use((req, _res, next) => { req.serverId = SERVER_ID; next(); });

// Логи
app.use((req, res, next) => {
  res.on('finish', () =>
    console.log(`[${SERVER_ID}] ${req.method} ${req.path} → ${res.statusCode}`)
  );
  next();
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Car Service API (KR5 Kanban)'
}));

// Health-check для Nginx
app.get('/health', (req, res) => res.status(200).send('OK'));

// Отладка балансировки
app.get('/', (req, res) => {
  res.json({
    server: SERVER_ID,
    host: os.hostname(),
    port: PORT,
    message: '🚗 Car Service Backend (KR5 Kanban)',
    docs: '/api-docs',
    endpoints: ['/api/auth/*', '/api/users/*', '/api/tasks/*', '/api/push/*']
  });
});

app.use('/api/auth',  authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/tasks',  tasksRoutes(getIo));   // фабрика, чтобы внутрь попал io
app.use('/api/push',  pushRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// ────────── Старт ──────────
async function waitForPg(retries = 30) {
  for (let i = 0; i < retries; i++) {
    try { await pool.query('SELECT 1'); return; }
    catch { console.log(`[${SERVER_ID}] waiting for postgres… (${i+1}/${retries})`); await new Promise(r => setTimeout(r, 1500)); }
  }
  throw new Error('Postgres unavailable');
}

let io;
function getIo() { return io; }

(async () => {
  try {
    await waitForPg();
    await connectRedis();
    await initPush();

    const server = http.createServer(app);
    io = new SocketIOServer(server, {
      path: '/socket.io',
      cors: { origin: '*' }
    });

    // Redis-адаптер — события распространяются между всеми тремя backend-инстансами
    io.adapter(createAdapter(pubClient, subClient));

    io.on('connection', (socket) => {
      console.log(`[${SERVER_ID}] socket connected:`, socket.id);
      socket.on('disconnect', () => console.log(`[${SERVER_ID}] socket disconnected:`, socket.id));
    });

    server.listen(PORT, '0.0.0.0', () =>
      console.log(`✅ [${SERVER_ID}] cars-backend on http://0.0.0.0:${PORT} (docs: /api-docs)`)
    );
  } catch (e) {
    console.error('Startup error:', e.message);
    process.exit(1);
  }
})();
