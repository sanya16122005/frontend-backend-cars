const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');

const app = express();
app.use(express.json());

const PORT = 3000;

// Секреты подписи
const ACCESS_SECRET = 'cars_access_secret';
const REFRESH_SECRET = 'cars_refresh_secret';

// Время жизни токенов
const ACCESS_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d';

// Хранилища в памяти
const users = [];
const refreshTokens = new Set();

// Начальные данные — автомобили
let cars = [
  { id: '1', title: 'Toyota Camry',   category: 'Седан', description: 'Надёжный седан', price: 2500000 },
  { id: '2', title: 'Kia Sportage',   category: 'SUV',   description: 'Вместительный',  price: 3000000 },
  { id: '3', title: 'Lada Vesta',     category: 'Седан', description: 'Бюджетный',       price: 1200000 },
];

// Логирование
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`[${req.method}] ${req.path} -> ${res.statusCode}`);
  });
  next();
});

// ---------- Генераторы токенов ----------

function generateAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES_IN }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES_IN }
  );
}

// ---------- Auth middleware ----------

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  try {
    const payload = jwt.verify(token, ACCESS_SECRET);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ---------- Маршруты Auth ----------

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  const { email, first_name, last_name, password } = req.body;
  if (!email || !first_name || !last_name || !password) {
    return res.status(400).json({ error: 'email, first_name, last_name and password are required' });
  }
  if (users.some(u => u.email === email)) {
    return res.status(409).json({ error: 'Email already exists' });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = { id: nanoid(), email, first_name, last_name, passwordHash };
  users.push(user);
  res.status(201).json({ id: user.id, email, first_name, last_name });
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }
  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  refreshTokens.add(refreshToken);

  res.json({ accessToken, refreshToken });
});

// POST /api/auth/refresh
app.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: 'refreshToken is required' });
  }
  if (!refreshTokens.has(refreshToken)) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);
    const user = users.find(u => u.id === payload.sub);
    if (!user) return res.status(401).json({ error: 'User not found' });

    // Ротация: старый удаляем, новый создаём
    refreshTokens.delete(refreshToken);
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    refreshTokens.add(newRefreshToken);

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

// GET /api/auth/me — защищённый
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.user.sub);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name });
});

// ---------- Маршруты Cars ----------

// GET /api/cars — публичный
app.get('/api/cars', (req, res) => res.json(cars));

// GET /api/cars/:id — защищённый
app.get('/api/cars/:id', authMiddleware, (req, res) => {
  const car = cars.find(c => c.id === req.params.id);
  if (!car) return res.status(404).json({ error: 'Car not found' });
  res.json(car);
});

// POST /api/cars — защищённый
app.post('/api/cars', authMiddleware, (req, res) => {
  const { title, category, description, price } = req.body;
  if (!title || !price) return res.status(400).json({ error: 'title and price are required' });
  const car = { id: nanoid(), title, category, description, price };
  cars.push(car);
  res.status(201).json(car);
});

// PUT /api/cars/:id — защищённый
app.put('/api/cars/:id', authMiddleware, (req, res) => {
  const idx = cars.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Car not found' });
  cars[idx] = { ...cars[idx], ...req.body };
  res.json(cars[idx]);
});

// DELETE /api/cars/:id — защищённый
app.delete('/api/cars/:id', authMiddleware, (req, res) => {
  const idx = cars.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Car not found' });
  cars.splice(idx, 1);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
