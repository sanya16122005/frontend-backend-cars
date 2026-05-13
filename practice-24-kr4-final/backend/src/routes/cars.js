const express = require('express');
const { pool } = require('../db');
const { cacheGet, cacheSet, cacheDel } = require('../redis');
const { authMiddleware, roleMiddleware } = require('../auth');

const router = express.Router();
const TTL = 60 * 10;   // 10 минут

router.get('/',
  authMiddleware,
  roleMiddleware(['user', 'seller', 'admin']),
  async (req, res) => {
    const key = 'cars:all';
    const cached = await cacheGet(key);
    if (cached) return res.json({ source: 'cache', server: req.serverId, data: JSON.parse(cached) });

    const { rows } = await pool.query('SELECT * FROM cars ORDER BY id');
    await cacheSet(key, rows, TTL);
    res.json({ source: 'server', server: req.serverId, data: rows });
  }
);

router.get('/:id',
  authMiddleware,
  roleMiddleware(['user', 'seller', 'admin']),
  async (req, res) => {
    const key = `cars:${req.params.id}`;
    const cached = await cacheGet(key);
    if (cached) return res.json({ source: 'cache', server: req.serverId, data: JSON.parse(cached) });

    const { rows } = await pool.query('SELECT * FROM cars WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Car not found' });
    await cacheSet(key, rows[0], TTL);
    res.json({ source: 'server', server: req.serverId, data: rows[0] });
  }
);

router.post('/',
  authMiddleware,
  roleMiddleware(['seller', 'admin']),
  async (req, res) => {
    const { brand, model, year, price, vin } = req.body || {};
    if (!brand || !model || !year || price == null) {
      return res.status(400).json({ error: 'brand, model, year, price required' });
    }
    try {
      const { rows } = await pool.query(
        `INSERT INTO cars (brand, model, year, price, vin)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [brand, model, year, price, vin || null]
      );
      await cacheDel('cars:all');
      res.status(201).json(rows[0]);
    } catch (e) {
      if (e.code === '23505') return res.status(409).json({ error: 'VIN already exists' });
      res.status(400).json({ error: e.message });
    }
  }
);

router.patch('/:id',
  authMiddleware,
  roleMiddleware(['seller', 'admin']),
  async (req, res) => {
    const fields = ['brand', 'model', 'year', 'price', 'vin'];
    const updates = [];
    const values  = [];
    let idx = 1;
    for (const f of fields) {
      if (req.body[f] !== undefined) { updates.push(`${f} = $${idx++}`); values.push(req.body[f]); }
    }
    if (!updates.length) return res.status(400).json({ error: 'No fields to update' });
    updates.push('updated_at = NOW()');
    values.push(req.params.id);

    try {
      const { rows } = await pool.query(
        `UPDATE cars SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
        values
      );
      if (!rows.length) return res.status(404).json({ error: 'Car not found' });
      await cacheDel('cars:all', `cars:${req.params.id}`);
      res.json(rows[0]);
    } catch (e) {
      if (e.code === '23505') return res.status(409).json({ error: 'VIN already exists' });
      res.status(400).json({ error: e.message });
    }
  }
);

router.delete('/:id',
  authMiddleware,
  roleMiddleware(['admin']),
  async (req, res) => {
    const { rowCount } = await pool.query('DELETE FROM cars WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Car not found' });
    await cacheDel('cars:all', `cars:${req.params.id}`);
    res.status(204).end();
  }
);

module.exports = router;
