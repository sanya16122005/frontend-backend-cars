const express = require('express');
const { pool } = require('../db');
const { cacheGet, cacheSet, cacheDel } = require('../redis');
const { authMiddleware, roleMiddleware } = require('../auth');

const router = express.Router();
const TTL = 60;   // 1 минута

const SAFE_FIELDS = 'id, email, first_name, last_name, role, blocked, created_at';

router.get('/',
  authMiddleware,
  roleMiddleware(['admin']),
  async (req, res) => {
    const key = 'users:all';
    const cached = await cacheGet(key);
    if (cached) return res.json({ source: 'cache', server: req.serverId, data: JSON.parse(cached) });

    const { rows } = await pool.query(`SELECT ${SAFE_FIELDS} FROM users ORDER BY created_at DESC`);
    await cacheSet(key, rows, TTL);
    res.json({ source: 'server', server: req.serverId, data: rows });
  }
);

router.get('/:id',
  authMiddleware,
  roleMiddleware(['admin']),
  async (req, res) => {
    const key = `users:${req.params.id}`;
    const cached = await cacheGet(key);
    if (cached) return res.json({ source: 'cache', server: req.serverId, data: JSON.parse(cached) });

    const { rows } = await pool.query(`SELECT ${SAFE_FIELDS} FROM users WHERE id = $1`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    await cacheSet(key, rows[0], TTL);
    res.json({ source: 'server', server: req.serverId, data: rows[0] });
  }
);

router.put('/:id',
  authMiddleware,
  roleMiddleware(['admin']),
  async (req, res) => {
    const fields = ['first_name', 'last_name', 'role', 'blocked'];
    const updates = [];
    const values  = [];
    let idx = 1;
    for (const f of fields) {
      if (req.body[f] !== undefined) { updates.push(`${f} = $${idx++}`); values.push(req.body[f]); }
    }
    if (!updates.length) return res.status(400).json({ error: 'No fields to update' });
    values.push(req.params.id);

    const { rows } = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING ${SAFE_FIELDS}`,
      values
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    await cacheDel('users:all', `users:${req.params.id}`);
    res.json(rows[0]);
  }
);

router.delete('/:id',
  authMiddleware,
  roleMiddleware(['admin']),
  async (req, res) => {
    const { rows } = await pool.query(
      `UPDATE users SET blocked = TRUE WHERE id = $1 RETURNING ${SAFE_FIELDS}`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    await cacheDel('users:all', `users:${req.params.id}`);
    res.json({ message: 'User blocked', user: rows[0] });
  }
);

module.exports = router;
