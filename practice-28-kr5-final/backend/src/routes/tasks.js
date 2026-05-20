const express = require('express');
const { pool } = require('../db');
const { cacheGet, cacheSet, cacheDel } = require('../redis');
const { authMiddleware, roleMiddleware } = require('../auth');
const { sendPushToAll } = require('../push');

const TTL = 60 * 10; // 10 минут

/**
 * @swagger
 * tags:
 *   - name: Tasks
 *     description: Kanban-задачи автосервиса (RBAC + Redis cache)
 */
module.exports = function tasksRoutes(getIo) {
  const router = express.Router();

  /**
   * @swagger
   * /api/tasks:
   *   get:
   *     summary: Список задач Kanban (кэш 10 минут)
   *     tags: [Tasks]
   *     security: [{ bearerAuth: [] }]
   *     responses:
   *       200:
   *         description: Список задач
   */
  router.get('/',
    authMiddleware,
    roleMiddleware(['user', 'seller', 'admin']),
    async (req, res) => {
      const key = 'tasks:all';
      try {
        const cached = await cacheGet(key);
        if (cached) {
          return res.json({ source: 'cache', server: req.serverId, data: JSON.parse(cached) });
        }

        const { rows } = await pool.query(`
          SELECT t.*, 
                 u.email as assignee_email, 
                 u.first_name as assignee_first_name, 
                 u.last_name as assignee_last_name
          FROM tasks t
          LEFT JOIN users u ON t.assignee_id = u.id
          ORDER BY t.id
        `);
        await cacheSet(key, rows, TTL);
        res.json({ source: 'server', server: req.serverId, data: rows });
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    }
  );

  /**
   * @swagger
   * /api/tasks/{id}:
   *   get:
   *     summary: Получить задачу по id (кэш 10 минут)
   *     tags: [Tasks]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer }
   *     responses:
   *       200: { description: Задача найдена }
   *       404: { description: Не найдено }
   */
  router.get('/:id',
    authMiddleware,
    roleMiddleware(['user', 'seller', 'admin']),
    async (req, res) => {
      const key = `tasks:${req.params.id}`;
      try {
        const cached = await cacheGet(key);
        if (cached) {
          return res.json({ source: 'cache', server: req.serverId, data: JSON.parse(cached) });
        }

        const { rows } = await pool.query(`
          SELECT t.*, 
                 u.email as assignee_email, 
                 u.first_name as assignee_first_name, 
                 u.last_name as assignee_last_name
          FROM tasks t
          LEFT JOIN users u ON t.assignee_id = u.id
          WHERE t.id = $1
        `, [req.params.id]);

        if (!rows.length) return res.status(404).json({ error: 'Task not found' });
        await cacheSet(key, rows[0], TTL);
        res.json({ source: 'server', server: req.serverId, data: rows[0] });
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    }
  );

  /**
   * @swagger
   * /api/tasks:
   *   post:
   *     summary: Создать задачу (seller, admin)
   *     tags: [Tasks]
   *     security: [{ bearerAuth: [] }]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [title, car_model, price_estimate]
   *             properties:
   *               title: { type: string }
   *               description: { type: string }
   *               status: { type: string, enum: [todo, in-progress, done] }
   *               car_model: { type: string }
   *               price_estimate: { type: number }
   *               assignee_id: { type: string }
   *               reminder_time: { type: string }
   *     responses:
   *       201: { description: Создано }
   *       400: { description: Невалидные данные }
   */
  router.post('/',
    authMiddleware,
    roleMiddleware(['seller', 'admin']),
    async (req, res) => {
      const { title, description, status = 'todo', car_model, price_estimate, assignee_id, reminder_time } = req.body || {};
      if (!title || !car_model || price_estimate == null) {
        return res.status(400).json({ error: 'title, car_model, price_estimate required' });
      }
      if (!['todo', 'in-progress', 'done'].includes(status)) {
        return res.status(400).json({ error: 'invalid status' });
      }
      try {
        const { rows } = await pool.query(
          `INSERT INTO tasks (title, description, status, car_model, price_estimate, assignee_id, reminder_time)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
          [title, description || null, status, car_model, price_estimate, assignee_id || null, reminder_time || null]
        );
        const task = rows[0];

        // Получаем полные данные о задаче с исполнителем для сокета
        const { rows: fullRows } = await pool.query(`
          SELECT t.*, 
                 u.email as assignee_email, 
                 u.first_name as assignee_first_name, 
                 u.last_name as assignee_last_name
          FROM tasks t
          LEFT JOIN users u ON t.assignee_id = u.id
          WHERE t.id = $1
        `, [task.id]);
        const fullTask = fullRows[0] || task;

        await cacheDel('tasks:all');

        // Socket.IO оповещение о создании задачи
        const io = getIo();
        if (io) io.emit('taskCreated', fullTask);

        // Отправка Push-уведомления
        sendPushToAll({
          title: '📋 Новая Kanban-задача',
          body:  `Добавлено: ${fullTask.title} для ${fullTask.car_model}. Статус: ${fullTask.status}`,
          url:   '/kanban'
        });

        res.status(201).json(fullTask);
      } catch (e) {
        res.status(400).json({ error: e.message });
      }
    }
  );

  /**
   * @swagger
   * /api/tasks/{id}:
   *   patch:
   *     summary: Обновить задачу (все роли с ограничениями)
   *     tags: [Tasks]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer }
   *     responses:
   *       200: { description: Обновлено }
   */
  router.patch('/:id',
    authMiddleware,
    roleMiddleware(['user', 'seller', 'admin']),
    async (req, res) => {
      // Ограничение: обычный user может менять ТОЛЬКО статус задачи (Drag-n-Drop), если роль - user.
      // Seller и Admin могут менять любые поля.
      const isOnlyStatusUpdate = Object.keys(req.body).length === 1 && req.body.status !== undefined;
      if (req.user.role === 'user' && !isOnlyStatusUpdate) {
        return res.status(403).json({ error: 'Водитель может обновлять только статус (Drag-n-Drop)' });
      }

      const fields = ['title', 'description', 'status', 'car_model', 'price_estimate', 'assignee_id', 'reminder_time'];
      const updates = [];
      const values  = [];
      let idx = 1;

      for (const f of fields) {
        if (req.body[f] !== undefined) {
          if (f === 'status' && !['todo', 'in-progress', 'done'].includes(req.body[f])) {
            return res.status(400).json({ error: 'invalid status' });
          }
          updates.push(`${f} = $${idx++}`);
          values.push(req.body[f]);
        }
      }

      if (!updates.length) return res.status(400).json({ error: 'No fields to update' });
      updates.push('updated_at = NOW()');
      values.push(req.params.id);

      try {
        const { rows } = await pool.query(
          `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
          values
        );
        if (!rows.length) return res.status(404).json({ error: 'Task not found' });
        const task = rows[0];

        // Получаем полные данные о задаче с исполнителем
        const { rows: fullRows } = await pool.query(`
          SELECT t.*, 
                 u.email as assignee_email, 
                 u.first_name as assignee_first_name, 
                 u.last_name as assignee_last_name
          FROM tasks t
          LEFT JOIN users u ON t.assignee_id = u.id
          WHERE t.id = $1
        `, [task.id]);
        const fullTask = fullRows[0] || task;

        await cacheDel('tasks:all', `tasks:${req.params.id}`);

        const io = getIo();
        if (io) io.emit('taskUpdated', fullTask);

        res.json(fullTask);
      } catch (e) {
        res.status(400).json({ error: e.message });
      }
    }
  );

  /**
   * @swagger
   * /api/tasks/{id}:
   *   delete:
   *     summary: Удалить задачу (admin only)
   *     tags: [Tasks]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer }
   *     responses:
   *       204: { description: Удалено }
   *       403: { description: Forbidden }
   */
  router.delete('/:id',
    authMiddleware,
    roleMiddleware(['admin']),
    async (req, res) => {
      try {
        const { rowCount } = await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
        if (!rowCount) return res.status(404).json({ error: 'Task not found' });
        
        await cacheDel('tasks:all', `tasks:${req.params.id}`);

        const io = getIo();
        if (io) io.emit('taskDeleted', { id: Number(req.params.id) });

        res.status(204).end();
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    }
  );

  return router;
};
