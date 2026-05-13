const express = require('express');
const cors    = require('cors');
const os      = require('os');

const { pool } = require('./db');
const { connectRedis } = require('./redis');
const authRoutes  = require('./routes/auth');
const usersRoutes = require('./routes/users');
const carsRoutes  = require('./routes/cars');

const PORT      = Number(process.env.PORT)      || 3000;
const SERVER_ID = process.env.SERVER_ID         || `cars-${os.hostname()}`;

const app = express();
app.use(cors());
app.use(express.json());

// Кладём идентификатор инстанса в req — чтобы видеть, какой backend ответил
app.use((req, _res, next) => { req.serverId = SERVER_ID; next(); });

// Логи
app.use((req, res, next) => {
  res.on('finish', () =>
    console.log(`[${SERVER_ID}] ${req.method} ${req.path} → ${res.statusCode}`)
  );
  next();
});

// Health-check для балансировщика
app.get('/health', (req, res) => res.status(200).send('OK'));

// Корень — отладка балансировки
app.get('/', (req, res) => {
  res.json({
    server: SERVER_ID,
    host: os.hostname(),
    port: PORT,
    message: '🚗 cars-backend (KR4 unified)',
    endpoints: ['/api/auth/*', '/api/users/*', '/api/cars/*']
  });
});

app.use('/api/auth',  authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/cars',  carsRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Старт: ждём БД и Redis, потом слушаем
async function waitForPg(retries = 20) {
  for (let i = 0; i < retries; i++) {
    try { await pool.query('SELECT 1'); return; }
    catch { console.log(`[${SERVER_ID}] waiting for postgres… (${i+1}/${retries})`); await new Promise(r => setTimeout(r, 1500)); }
  }
  throw new Error('Postgres unavailable');
}

(async () => {
  try {
    await waitForPg();
    await connectRedis();
    app.listen(PORT, '0.0.0.0', () =>
      console.log(`✅ [${SERVER_ID}] cars-backend on http://0.0.0.0:${PORT}`)
    );
  } catch (e) {
    console.error('Startup error:', e.message);
    process.exit(1);
  }
})();
