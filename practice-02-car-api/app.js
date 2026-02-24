const express = require('express');
const app = express();
const port = 3000;

// Наш список автомобилей (товаров)
let cars = [
  { id: 1, name: 'BMW M3', price: 5500000 },
  { id: 2, name: 'Audi RS6', price: 7200000 },
  { id: 3, name: 'Lada Vesta Sport', price: 1400000 },
];

// Middleware для парсинга JSON
app.use(express.json());

// Главная страница
app.get('/', (req, res) => {
  res.send('API автомобилей');
});

// CREATE: добавление нового авто
app.post('/cars', (req, res) => {
  const { name, price } = req.body;

  const newCar = {
    id: Date.now(),
    name,
    price,
  };

  cars.push(newCar);
  res.status(201).json(newCar);
});

// READ: список всех авто
app.get('/cars', (req, res) => {
  res.json(cars);
});

// READ: одно авто по id
app.get('/cars/:id', (req, res) => {
  const car = cars.find(c => c.id == req.params.id);
  if (!car) {
    return res.status(404).send('Car not found');
  }
  res.json(car);
});

// UPDATE: частичное обновление авто
app.patch('/cars/:id', (req, res) => {
  const car = cars.find(c => c.id == req.params.id);
  if (!car) {
    return res.status(404).send('Car not found');
  }

  const { name, price } = req.body;
  if (name !== undefined) car.name = name;
  if (price !== undefined) car.price = price;

  res.json(car);
});

// DELETE: удаление авто по id
app.delete('/cars/:id', (req, res) => {
  cars = cars.filter(c => c.id != req.params.id);
  res.send('Ok');
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
