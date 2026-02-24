const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

// Собственное middleware — логируем каждый запрос
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Начальные данные автомобилей: id, название, стоимость
let cars = [
  { id: 1, name: 'Toyota Camry',   price: 2500000 },
  { id: 2, name: 'BMW X5',         price: 6800000 },
  { id: 3, name: 'Tesla Model 3',  price: 4200000 },
  { id: 4, name: 'Ford Mustang',   price: 3900000 },
  { id: 5, name: 'Volkswagen Golf',price: 1800000 },
];

// Главная страница
app.get('/', (req, res) => {
  res.send('Cars API работает!');
});

// GET /cars — все автомобили
app.get('/cars', (req, res) => {
  res.json(cars);
});

// GET /cars/:id — один автомобиль
app.get('/cars/:id', (req, res) => {
  const id = Number(req.params.id);
  const car = cars.find(c => c.id === id);
  if (!car) return res.status(404).json({ error: 'Car not found' });
  res.json(car);
});

// POST /cars — создать автомобиль
app.post('/cars', (req, res) => {
  const { name, price } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ error: 'name и price обязательны' });
  }
  const newCar = {
    id: Date.now(),
    name,
    price: Number(price),
  };
  cars.push(newCar);
  res.status(201).json(newCar);
});

// PATCH /cars/:id — обновить автомобиль
app.patch('/cars/:id', (req, res) => {
  const id = Number(req.params.id);
  const car = cars.find(c => c.id === id);
  if (!car) return res.status(404).json({ error: 'Car not found' });

  const { name, price } = req.body;
  if (name !== undefined) car.name = name;
  if (price !== undefined) car.price = Number(price);

  res.json(car);
});

// DELETE /cars/:id — удалить автомобиль
app.delete('/cars/:id', (req, res) => {
  const id = Number(req.params.id);
  const exists = cars.some(c => c.id === id);
  if (!exists) return res.status(404).json({ error: 'Car not found' });
  cars = cars.filter(c => c.id !== id);
  res.send('Ok');
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
