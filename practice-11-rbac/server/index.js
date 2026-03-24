const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3001' }));

const PORT = 3000;
const ACCESS_SECRET = 'cars_access_secret';
const REFRESH_SECRET = 'cars_refresh_secret';
const ACCESS_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d';

const users = [];
const refreshTokens = new Set();

let cars = [
  { id: '1', title: 'Toyota Camry',    category: 'Седан', description: 'Надёжный японский седан', price: 2500000 },
  { id: '2', title: 'Kia Sportage',    category: 'SUV',   description: 'Популярный кроссовер',    price: 3000000 },
  { id: '3', title: 'Lada Vesta',      category: 'Седан', description: 'Бюджетный отечественный', price: 1200000 },
  { id: '4', title: 'BMW X5',          category: 'SUV',   description: 'Премиум кроссовер',       price: 7500000 },
  { id: '5', title: 'Hyundai Solaris', category: 'Седан', description: 'Доступный и практичный',  price: 1600000 },
];

app.use((req, res, next) => {
  res.on('finish', () => console.log(`[${req.method}] ${req.path} -> ${res.statusCode}`));
  next();
});

// ── Токены ──────────────────────────────────────────────
function generateAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES_IN }
  );
}
function generateRefreshToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES_IN }
  );
}

// ── Middleware ───────────────────────────────────────────
function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token)
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  try {
    req.user = jwt.verify(token, ACCESS_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// roleMiddleware принимает массив разрешённых ролей
function roleMiddleware(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role))
      return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

// ── Auth маршруты ────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  const { email, first_name, last_name, password, role } = req.body;
  if (!email || !first_name || !last_name || !password)
    return res.status(400).json({ error: 'All fields required' });
  if (users.some(u => u.email === email))
    return res.status(409).json({ error: 'Email already exists' });
  const passwordHash = await bcrypt.hash(password, 10);
  // роль по умолчанию — 'user', можно передать 'seller' или 'admin'
  const user = { id: nanoid(), email, first_name, last_name, passwordHash, role: role || 'user', blocked: false };
  users.push(user);
  res.status(201).json({ id: user.id, email, first_name, last_name, role: user.role });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  if (user.blocked) return res.status(403).json({ error: 'User is blocked' });
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  refreshTokens.add(refreshToken);
  res.json({ accessToken, refreshToken });
});

app.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'refreshToken required' });
  if (!refreshTokens.has(refreshToken)) return res.status(401).json({ error: 'Invalid refresh token' });
  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);
    const user = users.find(u => u.id === payload.sub);
    if (!user) return res.status(401).json({ error: 'User not found' });
    refreshTokens.delete(refreshToken);
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    refreshTokens.add(newRefreshToken);
    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.user.sub);
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json({ id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role });
});

// ── Users маршруты (только admin) ───────────────────────
app.get('/api/users', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  res.json(users.map(u => ({ id: u.id, email: u.email, first_name: u.first_name, last_name: u.last_name, role: u.role, blocked: u.blocked })));
});

app.get('/api/users/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json({ id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role, blocked: user.blocked });
});

app.put('/api/users/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const { first_name, last_name, role } = req.body;
  if (first_name) users[idx].first_name = first_name;
  if (last_name)  users[idx].last_name  = last_name;
  if (role)       users[idx].role       = role;
  const u = users[idx];
  res.json({ id: u.id, email: u.email, first_name: u.first_name, last_name: u.last_name, role: u.role });
});

// DELETE /api/users/:id — блокировка пользователя
app.delete('/api/users/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  users[idx].blocked = true;
  res.status(204).send();
});

// ── Cars маршруты ────────────────────────────────────────
// user, seller, admin — просмотр
app.get('/api/cars', authMiddleware, roleMiddleware(['user', 'seller', 'admin']), (req, res) => {
  res.json(cars);
});

app.get('/api/cars/:id', authMiddleware, roleMiddleware(['user', 'seller', 'admin']), (req, res) => {
  const car = cars.find(c => c.id === req.params.id);
  if (!car) return res.status(404).json({ error: 'Not found' });
  res.json(car);
});

// seller, admin — создание и редактирование
app.post('/api/cars', authMiddleware, roleMiddleware(['seller', 'admin']), (req, res) => {
  const { title, category, description, price } = req.body;
  if (!title || !price) return res.status(400).json({ error: 'title and price required' });
  const car = { id: nanoid(), title, category, description, price };
  cars.push(car);
  res.status(201).json(car);
});

app.put('/api/cars/:id', authMiddleware, roleMiddleware(['seller', 'admin']), (req, res) => {
  const idx = cars.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  cars[idx] = { ...cars[idx], ...req.body };
  res.json(cars[idx]);
});

// только admin — удаление
app.delete('/api/cars/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  const idx = cars.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  cars.splice(idx, 1);
  res.status(204).send();
});

app.listen(PORT, () => console.log(`Сервер: http://localhost:${PORT}`));
