const express = require('express');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const cors    = require('cors');
const { nanoid } = require('nanoid');
const { createClient } = require('redis');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;
const ACCESS_SECRET     = 'cars_access_secret';
const REFRESH_SECRET    = 'cars_refresh_secret';
const ACCESS_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d';

const USERS_TTL    = 60;       // 1 минута
const PRODUCTS_TTL = 60 * 10;  // 10 минут — для cars

// ── Redis ───────────────────────────────────────────────
const redis = createClient({ url: process.env.REDIS_URL || 'redis://127.0.0.1:6379' });
redis.on('error', e => console.error('Redis error:', e.message));

// ── Состояние ───────────────────────────────────────────
const users = [];
const refreshTokens = new Set();

let cars = [
  { id: '1', title: 'Toyota Camry',    category: 'Седан', description: 'Надёжный японский седан', price: 2500000 },
  { id: '2', title: 'Kia Sportage',    category: 'SUV',   description: 'Популярный кроссовер',    price: 3000000 },
  { id: '3', title: 'Lada Vesta',      category: 'Седан', description: 'Бюджетный отечественный', price: 1200000 },
  { id: '4', title: 'BMW X5',          category: 'SUV',   description: 'Премиум кроссовер',       price: 7500000 },
  { id: '5', title: 'Hyundai Solaris', category: 'Седан', description: 'Доступный и практичный',  price: 1600000 }
];

// ── Утилиты ─────────────────────────────────────────────
function generateAccessToken(u)  { return jwt.sign({ sub: u.id, email: u.email, role: u.role }, ACCESS_SECRET,  { expiresIn: ACCESS_EXPIRES_IN }); }
function generateRefreshToken(u) { return jwt.sign({ sub: u.id, email: u.email, role: u.role }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN }); }

function authMiddleware(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  try { req.user = jwt.verify(token, ACCESS_SECRET); next(); }
  catch { res.status(401).json({ error: 'Invalid or expired token' }); }
}
function roleMiddleware(allowed) {
  return (req, res, next) => {
    if (!req.user || !allowed.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

// ── Кэширующий middleware ───────────────────────────────
function cacheMiddleware(keyBuilder, ttl) {
  return async (req, res, next) => {
    try {
      const key = keyBuilder(req);
      const cached = await redis.get(key);
      if (cached) return res.json({ source: 'cache', data: JSON.parse(cached) });
      req.cacheKey = key;
      req.cacheTTL = ttl;
      next();
    } catch (e) {
      console.error('Cache read error:', e.message);
      next();
    }
  };
}
async function saveToCache(key, data, ttl) {
  try { await redis.set(key, JSON.stringify(data), { EX: ttl }); }
  catch (e) { console.error('Cache save error:', e.message); }
}
async function invalidateUsersCache(id = null) {
  await redis.del('users:all');
  if (id) await redis.del(`users:${id}`);
}
async function invalidateCarsCache(id = null) {
  await redis.del('cars:all');
  if (id) await redis.del(`cars:${id}`);
}

// ──────────────── AUTH ─────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  const { email, first_name, last_name, password, role } = req.body || {};
  if (!email || !first_name || !last_name || !password) return res.status(400).json({ error: 'All fields required' });
  if (users.some(u => u.email === email)) return res.status(409).json({ error: 'Email already exists' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = { id: nanoid(), email, first_name, last_name, passwordHash, role: role || 'user', blocked: false };
  users.push(user);
  await invalidateUsersCache();
  res.status(201).json({ id: user.id, email, first_name, last_name, role: user.role });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  const user = users.find(u => u.email === email);
  if (!user || user.blocked) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const accessToken  = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  refreshTokens.add(refreshToken);
  res.json({ accessToken, refreshToken });
});

// ──────────────── USERS (admin) ────────────────────────
app.get('/api/users',
  authMiddleware,
  roleMiddleware(['admin']),
  cacheMiddleware(() => 'users:all', USERS_TTL),
  async (req, res) => {
    const data = users.map(u => ({ id: u.id, email: u.email, first_name: u.first_name, last_name: u.last_name, role: u.role, blocked: u.blocked }));
    await saveToCache(req.cacheKey, data, req.cacheTTL);
    res.json({ source: 'server', data });
  }
);

app.get('/api/users/:id',
  authMiddleware,
  roleMiddleware(['admin']),
  cacheMiddleware(req => `users:${req.params.id}`, USERS_TTL),
  async (req, res) => {
    const u = users.find(x => x.id === req.params.id);
    if (!u) return res.status(404).json({ error: 'Not found' });
    const data = { id: u.id, email: u.email, first_name: u.first_name, last_name: u.last_name, role: u.role, blocked: u.blocked };
    await saveToCache(req.cacheKey, data, req.cacheTTL);
    res.json({ source: 'server', data });
  }
);

app.put('/api/users/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  const u = users.find(x => x.id === req.params.id);
  if (!u) return res.status(404).json({ error: 'Not found' });
  Object.assign(u, req.body);
  await invalidateUsersCache(u.id);
  res.json(u);
});

app.delete('/api/users/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  const u = users.find(x => x.id === req.params.id);
  if (!u) return res.status(404).json({ error: 'Not found' });
  u.blocked = true;
  await invalidateUsersCache(u.id);
  res.json({ message: 'User blocked', id: u.id });
});

// ──────────────── CARS ─────────────────────────────────
app.get('/api/cars',
  authMiddleware,
  roleMiddleware(['user','seller','admin']),
  cacheMiddleware(() => 'cars:all', PRODUCTS_TTL),
  async (req, res) => {
    await saveToCache(req.cacheKey, cars, req.cacheTTL);
    res.json({ source: 'server', data: cars });
  }
);

app.get('/api/cars/:id',
  authMiddleware,
  roleMiddleware(['user','seller','admin']),
  cacheMiddleware(req => `cars:${req.params.id}`, PRODUCTS_TTL),
  async (req, res) => {
    const car = cars.find(c => c.id === req.params.id);
    if (!car) return res.status(404).json({ error: 'Not found' });
    await saveToCache(req.cacheKey, car, req.cacheTTL);
    res.json({ source: 'server', data: car });
  }
);

app.post('/api/cars', authMiddleware, roleMiddleware(['seller','admin']), async (req, res) => {
  const { title, category, description, price } = req.body || {};
  if (!title || price == null) return res.status(400).json({ error: 'title and price required' });
  const car = { id: nanoid(), title, category, description, price };
  cars.push(car);
  await invalidateCarsCache();
  res.status(201).json(car);
});

app.put('/api/cars/:id', authMiddleware, roleMiddleware(['seller','admin']), async (req, res) => {
  const idx = cars.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  cars[idx] = { ...cars[idx], ...req.body };
  await invalidateCarsCache(cars[idx].id);
  res.json(cars[idx]);
});

app.delete('/api/cars/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  const idx = cars.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const [removed] = cars.splice(idx, 1);
  await invalidateCarsCache(removed.id);
  res.status(204).send();
});

// ── Старт ───────────────────────────────────────────────
(async () => {
  await redis.connect();
  console.log('✅ Redis connected');
  app.listen(PORT, () => console.log(`Cars RBAC + Redis: http://localhost:${PORT}`));
})();
