const express = require('express');
const { pool } = require('../db');
const { cacheGet, cacheSet, cacheDel } = require('../redis');
const { authMiddleware, roleMiddleware } = require('../auth');

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: Управление пользователями (только admin)
 */
const router = express.Router();
const TTL = 60;

const SAFE_FIELDS = 'id, email, first_name, last_name, role, blocked, created_at';

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Список пользователей (кэш 1 минута, только admin)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Список
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CachedListResponse' }
 *       403: { description: Forbidden }
 */
router.get('/',
  authMiddleware, roleMiddleware(['admin']),
  async (req, res) => {
    const key = 'users:all';
    const cached = await cacheGet(key);
    if (cached) return res.json({ source: 'cache', server: req.serverId, data: JSON.parse(cached) });

    const { rows } = await pool.query(`SELECT ${SAFE_FIELDS} FROM users ORDER BY created_at DESC`);
    await cacheSet(key, rows, TTL);
    res.json({ source: 'server', server: req.serverId, data: rows });
  }
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Пользователь по id (кэш 1 минута)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Найден }
 *       404: { description: Не найден }
 */
router.get('/:id',
  authMiddleware, roleMiddleware(['admin']),
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

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Обновить пользователя (admin)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Обновлено }
 *       404: { description: Не найден }
 */
router.put('/:id',
  authMiddleware, roleMiddleware(['admin']),
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

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Заблокировать пользователя (мягкое удаление — blocked=true)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Заблокировано }
 *       404: { description: Не найден }
 */
router.delete('/:id',
  authMiddleware, roleMiddleware(['admin']),
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
