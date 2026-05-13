const express = require('express');
const { pool } = require('../db');
const { cacheGet, cacheSet, cacheDel } = require('../redis');
const { authMiddleware, roleMiddleware } = require('../auth');
const { sendPushToAll } = require('../push');

const TTL = 60 * 10; // 10 минут

/**
 * @swagger
 * tags:
 *   - name: Cars
 *     description: Каталог автомобилей (RBAC + Redis cache)
 */
module.exports = function carsRoutes(getIo) {
  const router = express.Router();

  /**
   * @swagger
   * /api/cars:
   *   get:
   *     summary: Список автомобилей (кэш 10 минут)
   *     tags: [Cars]
   *     security: [{ bearerAuth: [] }]
   *     responses:
   *       200:
   *         description: Список авто
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/CachedListResponse' }
   */
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

  /**
   * @swagger
   * /api/cars/{id}:
   *   get:
   *     summary: Авто по id (кэш 10 минут)
   *     tags: [Cars]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer }
   *     responses:
   *       200: { description: Авто найдено }
   *       404: { description: Не найдено }
   */
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

  /**
   * @swagger
   * /api/cars:
   *   post:
   *     summary: Создать авто (seller, admin)
   *     tags: [Cars]
   *     security: [{ bearerAuth: [] }]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema: { $ref: '#/components/schemas/Car' }
   *     responses:
   *       201: { description: Создано }
   *       400: { description: Невалидные данные }
   *       403: { description: Forbidden }
   *       409: { description: VIN уже существует }
   */
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
        const car = rows[0];
        await cacheDel('cars:all');

        // Real-time: рассылка через Socket.IO (всем инстансам через Redis adapter)
        const io = getIo();
        if (io) io.emit('carCreated', car);

        // Push всем подписанным
        sendPushToAll({
          title: '🚗 Новый автомобиль',
          body:  `${car.brand} ${car.model} (${car.year}) — ${Number(car.price).toLocaleString('ru-RU')} ₽`,
          url:   '/cars'
        });

        res.status(201).json(car);
      } catch (e) {
        if (e.code === '23505') return res.status(409).json({ error: 'VIN already exists' });
        res.status(400).json({ error: e.message });
      }
    }
  );

  /**
   * @swagger
   * /api/cars/{id}:
   *   patch:
   *     summary: Обновить авто (seller, admin)
   *     tags: [Cars]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer }
   *     responses:
   *       200: { description: Обновлено }
   *       403: { description: Forbidden }
   *       404: { description: Не найдено }
   */
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
        const car = rows[0];
        await cacheDel('cars:all', `cars:${req.params.id}`);

        const io = getIo();
        if (io) io.emit('carUpdated', car);

        res.json(car);
      } catch (e) {
        if (e.code === '23505') return res.status(409).json({ error: 'VIN already exists' });
        res.status(400).json({ error: e.message });
      }
    }
  );

  /**
   * @swagger
   * /api/cars/{id}:
   *   delete:
   *     summary: Удалить авто (admin)
   *     tags: [Cars]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer }
   *     responses:
   *       204: { description: Удалено }
   *       403: { description: Forbidden }
   *       404: { description: Не найдено }
   */
  router.delete('/:id',
    authMiddleware,
    roleMiddleware(['admin']),
    async (req, res) => {
      const { rowCount } = await pool.query('DELETE FROM cars WHERE id = $1', [req.params.id]);
      if (!rowCount) return res.status(404).json({ error: 'Car not found' });
      await cacheDel('cars:all', `cars:${req.params.id}`);

      const io = getIo();
      if (io) io.emit('carDeleted', { id: Number(req.params.id) });

      res.status(204).end();
    }
  );

  return router;
};
