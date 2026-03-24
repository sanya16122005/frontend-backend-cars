const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = 3000;

app.use(cors({
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Логирование
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) console.log('Body:', req.body);
  });
  next();
});

// ── Константы JWT ────────────────────────────────────────
const ACCESS_SECRET = 'cars_access_secret';
const REFRESH_SECRET = 'cars_refresh_secret';
const ACCESS_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d';

// ── Хранилища ────────────────────────────────────────────
const users = [];
const refreshTokens = new Set();

let cars = [
  { id: nanoid(6), name: 'Toyota Camry',    category: 'Седан',        description: 'Надёжный семейный седан',           price: 2500000, stock: 5  },
  { id: nanoid(6), name: 'BMW X5',          category: 'Внедорожник',  description: 'Мощный премиальный внедорожник',    price: 6800000, stock: 3  },
  { id: nanoid(6), name: 'Tesla Model 3',   category: 'Электромобиль',description: 'Электрический седан с автопилотом', price: 4200000, stock: 7  },
  { id: nanoid(6), name: 'Ford Mustang',    category: 'Спорткар',     description: 'Легендарный американский маслкар',  price: 3900000, stock: 2  },
  { id: nanoid(6), name: 'Volkswagen Golf', category: 'Хэтчбек',      description: 'Популярный городской хэтчбек',      price: 1800000, stock: 10 },
  { id: nanoid(6), name: 'Mercedes GLE',   category: 'Внедорожник',  description: 'Люксовый полноразмерный SUV',       price: 7500000, stock: 4  },
  { id: nanoid(6), name: 'Audi A4',         category: 'Седан',        description: 'Спортивный бизнес-седан с quattro', price: 3200000, stock: 6  },
  { id: nanoid(6), name: 'Hyundai Tucson',  category: 'Кроссовер',    description: 'Стильный кроссовер',               price: 2100000, stock: 8  },
  { id: nanoid(6), name: 'Porsche 911',     category: 'Спорткар',     description: 'Культовый спортивный автомобиль',   price: 12000000,stock: 1  },
  { id: nanoid(6), name: 'Lada Vesta',      category: 'Седан',        description: 'Доступный российский седан',        price: 900000,  stock: 15 },
];

// ── Swagger ──────────────────────────────────────────────
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Cars API + Auth', version: '2.0.0', description: 'API интернет-магазина автомобилей с авторизацией и ролями' },
    servers: [{ url: `http://localhost:${PORT}`, description: 'Локальный сервер' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    }
  },
  apis: ['./app.js'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── Middleware ───────────────────────────────────────────
function generateAccessToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
}
function generateRefreshToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
}

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

function roleMiddleware(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role))
      return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

function findCarOr404(id, res) {
  const car = cars.find(c => c.id === id);
  if (!car) { res.status(404).json({ error: 'Car not found' }); return null; }
  return car;
}

// ── Auth маршруты ────────────────────────────────────────
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, first_name, last_name, password]
 *             properties:
 *               email:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, seller, admin]
 *     responses:
 *       201:
 *         description: Пользователь создан
 *       409:
 *         description: Email уже занят
 */
app.post('/api/auth/register', async (req, res) => {
  const { email, first_name, last_name, password, role } = req.body;
  if (!email || !first_name || !last_name || !password)
    return res.status(400).json({ error: 'All fields required' });
  if (users.some(u => u.email === email))
    return res.status(409).json({ error: 'Email already exists' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = { id: nanoid(), email, first_name, last_name, passwordHash, role: role || 'user', blocked: false };
  users.push(user);
  res.status(201).json({ id: user.id, email, first_name, last_name, role: user.role });
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вход в систему
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Токены выданы
 *       401:
 *         description: Неверные данные
 */
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

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Обновить пару токенов
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Новая пара токенов
 */
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

// ── Users маршруты (admin) ───────────────────────────────
app.get('/api/users', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  res.json(users.map(u => ({ id: u.id, email: u.email, first_name: u.first_name, last_name: u.last_name, role: u.role, blocked: u.blocked })));
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
app.delete('/api/users/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  users[idx].blocked = true;
  res.status(204).send();
});

// ── Cars маршруты + Swagger ──────────────────────────────
/**
 * @swagger
 * components:
 *   schemas:
 *     Car:
 *       type: object
 *       required: [name, category, price]
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         category:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: integer
 *         stock:
 *           type: integer
 *       example:
 *         id: "abc123"
 *         name: "Toyota Camry"
 *         category: "Седан"
 *         description: "Надёжный семейный седан"
 *         price: 2500000
 *         stock: 5
 */

/**
 * @swagger
 * /api/cars:
 *   get:
 *     summary: Получить все автомобили
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список автомобилей
 */
app.get('/api/cars', authMiddleware, roleMiddleware(['user', 'seller', 'admin']), (req, res) => res.json(cars));

app.get('/api/cars/:id', authMiddleware, roleMiddleware(['user', 'seller', 'admin']), (req, res) => {
  const car = findCarOr404(req.params.id, res);
  if (!car) return;
  res.json(car);
});

/**
 * @swagger
 * /api/cars:
 *   post:
 *     summary: Добавить автомобиль (seller, admin)
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 */
app.post('/api/cars', authMiddleware, roleMiddleware(['seller', 'admin']), (req, res) => {
  const { name, category, description, price, stock } = req.body;
  if (!name || !category || price === undefined)
    return res.status(400).json({ error: 'name, category и price обязательны' });
  const newCar = { id: nanoid(6), name: name.trim(), category: category.trim(), description: description?.trim() ?? '', price: Number(price), stock: Number(stock) || 0 };
  cars.push(newCar);
  res.status(201).json(newCar);
});

app.patch('/api/cars/:id', authMiddleware, roleMiddleware(['seller', 'admin']), (req, res) => {
  const car = findCarOr404(req.params.id, res);
  if (!car) return;
  const { name, category, description, price, stock } = req.body;
  if (name !== undefined)        car.name        = name.trim();
  if (category !== undefined)    car.category    = category.trim();
  if (description !== undefined) car.description = description.trim();
  if (price !== undefined)       car.price       = Number(price);
  if (stock !== undefined)       car.stock       = Number(stock);
  res.json(car);
});

app.delete('/api/cars/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  const exists = cars.some(c => c.id === req.params.id);
  if (!exists) return res.status(404).json({ error: 'Car not found' });
  cars = cars.filter(c => c.id !== req.params.id);
  res.status(204).send();
});

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error: 'Internal server error' }); });

app.listen(PORT, () => {
  console.log(`Сервер: http://localhost:${PORT}`);
  console.log(`Swagger: http://localhost:${PORT}/api-docs`);
});
