const express = require('express');
const cors    = require('cors');
const { pool } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// ── GET /api/cars ─────────────────────────────────────────
app.get('/api/cars', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM cars ORDER BY id');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── GET /api/cars/:id ─────────────────────────────────────
app.get('/api/cars/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM cars WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Автомобиль не найден' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── POST /api/cars ────────────────────────────────────────
app.post('/api/cars', async (req, res) => {
  const { brand, model, year, price, vin } = req.body || {};
  if (!brand || !model || !year || price == null) {
    return res.status(400).json({ error: 'brand, model, year, price обязательны' });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO cars (brand, model, year, price, vin)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [brand, model, year, price, vin || null]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'VIN уже существует' });
    res.status(500).json({ error: e.message });
  }
});

// ── PATCH /api/cars/:id ───────────────────────────────────
app.patch('/api/cars/:id', async (req, res) => {
  const fields = ['brand','model','year','price','vin'];
  const updates = [];
  const values  = [];
  let idx = 1;
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = $${idx++}`);
      values.push(req.body[f]);
    }
  }
  if (!updates.length) return res.status(400).json({ error: 'Нет полей для обновления' });
  updates.push(`updated_at = NOW()`);
  values.push(req.params.id);

  try {
    const { rows } = await pool.query(
      `UPDATE cars SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    if (!rows.length) return res.status(404).json({ error: 'Автомобиль не найден' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── DELETE /api/cars/:id ──────────────────────────────────
app.delete('/api/cars/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM cars WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Автомобиль не найден' });
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Cars PG API запущен на http://localhost:${PORT}`));
