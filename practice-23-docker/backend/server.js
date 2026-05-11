const express = require('express');
const os = require('os');

const app = express();
const PORT      = Number(process.env.PORT)      || 3000;
const SERVER_ID = process.env.SERVER_ID         || `cars-${os.hostname()}`;

const cars = [
  { id: 1, brand: 'Toyota', model: 'Camry',    year: 2022, price: 2500000 },
  { id: 2, brand: 'Kia',    model: 'Sportage', year: 2021, price: 3000000 },
  { id: 3, brand: 'BMW',    model: 'X5',       year: 2023, price: 7500000 }
];

app.get('/', (req, res) => {
  res.json({ server: SERVER_ID, host: os.hostname(), port: PORT });
});
app.get('/api/cars', (req, res) => res.json({ server: SERVER_ID, cars }));
app.get('/health',   (req, res) => res.status(200).send('OK'));

app.listen(PORT, '0.0.0.0', () => console.log(`[${SERVER_ID}] listening on ${PORT}`));
