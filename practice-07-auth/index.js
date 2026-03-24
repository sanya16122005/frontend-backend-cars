const express = require('express');
const bcrypt = require('bcrypt');
const { nanoid } = require('nanoid');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
app.use(express.json());
const PORT = 3000;

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Cars Auth API', version: '1.0.0' },
    servers: [{ url: `http://localhost:${PORT}` }],
  },
  apis: ['./index.js'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Хранилище в памяти
let users = [];
let cars = [];

// Логирование
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`[${req.method}] ${req.path} -> ${res.statusCode}`);
  });
  next();
});

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  const { email, first_name, last_name, password } = req.body;
  if (!email || !first_name || !last_name || !password)
    return res.status(400).json({ error: 'All fields required' });
  if (users.find(u => u.email === email))
    return res.status(409).json({ error: 'Email already exists' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = { id: nanoid(), email, first_name, last_name, passwordHash };
  users.push(user);
  res.status(201).json({ id: user.id, email, first_name, last_name });
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'email and password required' });
  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ login: true });
});

// CRUD /api/cars (без авторизации пока)
app.get('/api/cars', (req, res) => res.json(cars));
app.get('/api/cars/:id', (req, res) => {
  const car = cars.find(c => c.id === req.params.id);
  if (!car) return res.status(404).json({ error: 'Not found' });
  res.json(car);
});
app.post('/api/cars', (req, res) => {
  const { title, category, description, price } = req.body;
  if (!title || !price) return res.status(400).json({ error: 'title and price required' });
  const car = { id: nanoid(), title, category, description, price };
  cars.push(car);
  res.status(201).json(car);
});
app.put('/api/cars/:id', (req, res) => {
  const idx = cars.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  cars[idx] = { ...cars[idx], ...req.body };
  res.json(cars[idx]);
});
app.delete('/api/cars/:id', (req, res) => {
  const idx = cars.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  cars.splice(idx, 1);
  res.status(204).send();
});

app.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));
