const express = require('express');
const { randomBytes } = require('crypto');
const nanoid = (size = 6) => randomBytes(size).toString('hex').slice(0, size);
const cors = require('cors');

const app = express();
const port = 3000;

// Разрешаем запросы от фронтенда на порту 3001
app.use(cors({
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Middleware для логирования запросов
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      console.log('Body:', req.body);
    }
  });
  next();
});

// Начальные данные — 10 автомобилей
let cars = [
  { id: nanoid(6), name: 'Toyota Camry', category: 'Седан', description: 'Надёжный и комфортный семейный седан', price: 2500000, stock: 5 },
  { id: nanoid(6), name: 'BMW X5', category: 'Внедорожник', description: 'Мощный премиальный внедорожник', price: 6800000, stock: 3 },
  { id: nanoid(6), name: 'Tesla Model 3', category: 'Электромобиль', description: 'Электрический седан с автопилотом', price: 4200000, stock: 7 },
  { id: nanoid(6), name: 'Ford Mustang', category: 'Спорткар', description: 'Легендарный американский маслкар', price: 3900000, stock: 2 },
  { id: nanoid(6), name: 'Volkswagen Golf', category: 'Хэтчбек', description: 'Популярный городской хэтчбек', price: 1800000, stock: 10 },
  { id: nanoid(6), name: 'Mercedes GLE', category: 'Внедорожник', description: 'Люксовый полноразмерный SUV', price: 7500000, stock: 4 },
  { id: nanoid(6), name: 'Audi A4', category: 'Седан', description: 'Спортивный бизнес-седан с quattro', price: 3200000, stock: 6 },
  { id: nanoid(6), name: 'Hyundai Tucson', category: 'Кроссовер', description: 'Стильный кроссовер с богатой комплектацией', price: 2100000, stock: 8 },
  { id: nanoid(6), name: 'Porsche 911', category: 'Спорткар', description: 'Культовый спортивный автомобиль', price: 12000000, stock: 1 },
  { id: nanoid(6), name: 'Lada Vesta', category: 'Седан', description: 'Доступный российский седан', price: 900000, stock: 15 },
];

// Функция-помощник: найти авто или вернуть 404
function findCarOr404(id, res) {
  const car = cars.find(c => c.id === id);
  if (!car) {
    res.status(404).json({ error: 'Car not found' });
    return null;
  }
  return car;
}

// GET /api/cars — все автомобили
app.get('/api/cars', (req, res) => {
  res.json(cars);
});

// GET /api/cars/:id — один автомобиль
app.get('/api/cars/:id', (req, res) => {
  const car = findCarOr404(req.params.id, res);
  if (!car) return;
  res.json(car);
});

// POST /api/cars — добавить автомобиль
app.post('/api/cars', (req, res) => {
  const { name, category, description, price, stock } = req.body;
  if (!name || !category || !price) {
    return res.status(400).json({ error: 'name, category и price обязательны' });
  }
  const newCar = {
    id: nanoid(6),
    name: name.trim(),
    category: category.trim(),
    description: description?.trim() ?? '',
    price: Number(price),
    stock: Number(stock) || 0,
  };
  cars.push(newCar);
  res.status(201).json(newCar);
});

// PATCH /api/cars/:id — обновить автомобиль
app.patch('/api/cars/:id', (req, res) => {
  const car = findCarOr404(req.params.id, res);
  if (!car) return;

  const { name, category, description, price, stock } = req.body;
  if (name !== undefined) car.name = name.trim();
  if (category !== undefined) car.category = category.trim();
  if (description !== undefined) car.description = description.trim();
  if (price !== undefined) car.price = Number(price);
  if (stock !== undefined) car.stock = Number(stock);

  res.json(car);
});

// DELETE /api/cars/:id — удалить автомобиль
app.delete('/api/cars/:id', (req, res) => {
  const exists = cars.some(c => c.id === req.params.id);
  if (!exists) return res.status(404).json({ error: 'Car not found' });
  cars = cars.filter(c => c.id !== req.params.id);
  res.status(204).send();
});

// 404 для неизвестных маршрутов
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
