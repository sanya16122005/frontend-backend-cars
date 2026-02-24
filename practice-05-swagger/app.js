const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Middleware для логирования
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      console.log('Body:', req.body);
    }
  });
  next();
});

// Начальные данные — автомобили
let cars = [
  { id: nanoid(6), name: 'Toyota Camry',   category: 'Седан',        description: 'Надёжный семейный седан',          price: 2500000, stock: 5 },
  { id: nanoid(6), name: 'BMW X5',          category: 'Внедорожник',  description: 'Мощный премиальный внедорожник',    price: 6800000, stock: 3 },
  { id: nanoid(6), name: 'Tesla Model 3',   category: 'Электромобиль',description: 'Электрический седан с автопилотом', price: 4200000, stock: 7 },
  { id: nanoid(6), name: 'Ford Mustang',    category: 'Спорткар',     description: 'Легендарный американский маслкар',  price: 3900000, stock: 2 },
  { id: nanoid(6), name: 'Volkswagen Golf', category: 'Хэтчбек',     description: 'Популярный городской хэтчбек',      price: 1800000, stock: 10 },
  { id: nanoid(6), name: 'Mercedes GLE',    category: 'Внедорожник',  description: 'Люксовый полноразмерный SUV',       price: 7500000, stock: 4 },
  { id: nanoid(6), name: 'Audi A4',         category: 'Седан',        description: 'Спортивный бизнес-седан с quattro', price: 3200000, stock: 6 },
  { id: nanoid(6), name: 'Hyundai Tucson',  category: 'Кроссовер',    description: 'Стильный кроссовер',                price: 2100000, stock: 8 },
  { id: nanoid(6), name: 'Porsche 911',     category: 'Спорткар',     description: 'Культовый спортивный автомобиль',   price: 12000000, stock: 1 },
  { id: nanoid(6), name: 'Lada Vesta',      category: 'Седан',        description: 'Доступный российский седан',        price: 900000, stock: 15 },
];

// ===== SWAGGER НАСТРОЙКА =====
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cars API',
      version: '1.0.0',
      description: 'API для управления каталогом автомобилей',
    },
    servers: [{ url: `http://localhost:${port}`, description: 'Локальный сервер' }],
  },
  apis: ['./app.js'], // файл, где ищем JSDoc-комментарии
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ===== SWAGGER СХЕМА =====
/**
 * @swagger
 * components:
 *   schemas:
 *     Car:
 *       type: object
 *       required:
 *         - name
 *         - category
 *         - price
 *       properties:
 *         id:
 *           type: string
 *           description: Автоматически сгенерированный ID
 *         name:
 *           type: string
 *           description: Название автомобиля
 *         category:
 *           type: string
 *           description: Категория (Седан, Внедорожник и т.д.)
 *         description:
 *           type: string
 *           description: Описание автомобиля
 *         price:
 *           type: integer
 *           description: Цена в рублях
 *         stock:
 *           type: integer
 *           description: Количество на складе
 *       example:
 *         id: "abc123"
 *         name: "Toyota Camry"
 *         category: "Седан"
 *         description: "Надёжный семейный седан"
 *         price: 2500000
 *         stock: 5
 */

// Функция-помощник
function findCarOr404(id, res) {
  const car = cars.find(c => c.id === id);
  if (!car) {
    res.status(404).json({ error: 'Car not found' });
    return null;
  }
  return car;
}

// ===== МАРШРУТЫ =====

/**
 * @swagger
 * /api/cars:
 *   get:
 *     summary: Получить список всех автомобилей
 *     tags: [Cars]
 *     responses:
 *       200:
 *         description: Список автомобилей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Car'
 */
app.get('/api/cars', (req, res) => {
  res.json(cars);
});

/**
 * @swagger
 * /api/cars/{id}:
 *   get:
 *     summary: Получить автомобиль по ID
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID автомобиля
 *     responses:
 *       200:
 *         description: Данные автомобиля
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Car'
 *       404:
 *         description: Автомобиль не найден
 */
app.get('/api/cars/:id', (req, res) => {
  const car = findCarOr404(req.params.id, res);
  if (!car) return;
  res.json(car);
});

/**
 * @swagger
 * /api/cars:
 *   post:
 *     summary: Добавить новый автомобиль
 *     tags: [Cars]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: integer
 *               stock:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Автомобиль успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Car'
 *       400:
 *         description: Ошибка в теле запроса
 */
app.post('/api/cars', (req, res) => {
  const { name, category, description, price, stock } = req.body;
  if (!name || !category || price === undefined) {
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

/**
 * @swagger
 * /api/cars/{id}:
 *   patch:
 *     summary: Обновить данные автомобиля
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID автомобиля
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: integer
 *               stock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Обновлённый автомобиль
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Car'
 *       400:
 *         description: Нет данных для обновления
 *       404:
 *         description: Автомобиль не найден
 */
app.patch('/api/cars/:id', (req, res) => {
  const car = findCarOr404(req.params.id, res);
  if (!car) return;

  const { name, category, description, price, stock } = req.body;
  if (name === undefined && category === undefined && price === undefined && stock === undefined && description === undefined) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  if (name !== undefined) car.name = name.trim();
  if (category !== undefined) car.category = category.trim();
  if (description !== undefined) car.description = description.trim();
  if (price !== undefined) car.price = Number(price);
  if (stock !== undefined) car.stock = Number(stock);

  res.json(car);
});

/**
 * @swagger
 * /api/cars/{id}:
 *   delete:
 *     summary: Удалить автомобиль
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID автомобиля
 *     responses:
 *       204:
 *         description: Автомобиль успешно удалён
 *       404:
 *         description: Автомобиль не найден
 */
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
  console.log(`Swagger UI доступен по адресу http://localhost:${port}/api-docs`);
});
