const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');

const app = express();
app.use(express.json());
const PORT = 3000;
const JWT_SECRET = 'cars_access_secret';
const ACCESS_EXPIRES_IN = '15m';

let users = [];
let cars = [
  { id: '1', title: 'Toyota Camry', category: 'Седан', description: 'Надёжный', price: 2500000 },
  { id: '2', title: 'Kia Sportage', category: 'SUV', description: 'Вместительный', price: 3000000 },
];

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token)
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

app.post('/api/auth/register', async (req, res) => {
  const { email, first_name, last_name, password } = req.body;
  if (!email || !password || !first_name || !last_name)
    return res.status(400).json({ error: 'All fields required' });
  if (users.find(u => u.email === email))
    return res.status(409).json({ error: 'Email exists' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = { id: nanoid(), email, first_name, last_name, passwordHash };
  users.push(user);
  res.status(201).json({ id: user.id, email, first_name, last_name });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });
  const accessToken = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
  res.json({ accessToken });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.user.sub);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name });
});

// Публичный
app.get('/api/cars', (req, res) => res.json(cars));

// Защищённые
app.get('/api/cars/:id', authMiddleware, (req, res) => {
  const car = cars.find(c => c.id === req.params.id);
  if (!car) return res.status(404).json({ error: 'Not found' });
  res.json(car);
});
app.post('/api/cars', authMiddleware, (req, res) => {
  const { title, category, description, price } = req.body;
  if (!title || !price) return res.status(400).json({ error: 'title and price required' });
  const car = { id: nanoid(), title, category, description, price };
  cars.push(car);
  res.status(201).json(car);
});
app.put('/api/cars/:id', authMiddleware, (req, res) => {
  const idx = cars.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  cars[idx] = { ...cars[idx], ...req.body };
  res.json(cars[idx]);
});
app.delete('/api/cars/:id', authMiddleware, (req, res) => {
  const idx = cars.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  cars.splice(idx, 1);
  res.status(204).send();
});

app.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));
