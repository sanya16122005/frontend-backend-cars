const express  = require('express');
const cors     = require('cors');
const mongoose = require('mongoose');
const Car      = require('./models/Car');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/cars_db';

mongoose.connect(MONGO_URL)
  .then(() => console.log('✅ MongoDB connected:', MONGO_URL))
  .catch(err => { console.error('Mongo connection error:', err.message); process.exit(1); });

const app = express();
app.use(cors());
app.use(express.json());

// GET всех
app.get('/api/cars', async (req, res) => {
  try { res.json(await Car.find().sort({ createdAt: -1 })); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// GET по id
app.get('/api/cars/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ error: 'Автомобиль не найден' });
    res.json(car);
  } catch (e) {
    if (e.name === 'CastError') return res.status(400).json({ error: 'Некорректный id' });
    res.status(500).json({ error: e.message });
  }
});

// POST
app.post('/api/cars', async (req, res) => {
  try {
    const car = await Car.create(req.body);
    res.status(201).json(car);
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: 'VIN уже существует' });
    res.status(400).json({ error: e.message });
  }
});

// PATCH
app.patch('/api/cars/:id', async (req, res) => {
  try {
    const car = await Car.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!car) return res.status(404).json({ error: 'Автомобиль не найден' });
    res.json(car);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// DELETE
app.delete('/api/cars/:id', async (req, res) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);
    if (!car) return res.status(404).json({ error: 'Автомобиль не найден' });
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Агрегация: средняя цена по бренду (бонус)
app.get('/api/cars-stats/avg-price', async (req, res) => {
  try {
    const stats = await Car.aggregate([
      { $group: { _id: '$brand', avgPrice: { $avg: '$price' }, count: { $sum: 1 } } },
      { $sort: { avgPrice: -1 } }
    ]);
    res.json(stats);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Cars Mongo API запущен на http://localhost:${PORT}`));
