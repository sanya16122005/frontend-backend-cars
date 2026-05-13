const express = require('express');
const { saveSubscription, removeSubscription } = require('../redis');
const { PUBLIC_KEY } = require('../push');

const router = express.Router();

/**
 * @swagger
 * /api/push/vapid-public-key:
 *   get:
 *     summary: Публичный VAPID-ключ для подписки на push
 *     tags: [Push]
 *     responses:
 *       200:
 *         description: Ключ
 */
router.get('/vapid-public-key', (req, res) => res.json({ key: PUBLIC_KEY }));

/**
 * @swagger
 * /api/push/subscribe:
 *   post:
 *     summary: Сохранить push-подписку текущего клиента
 *     tags: [Push]
 *     responses:
 *       201:
 *         description: Подписка сохранена
 */
router.post('/subscribe', async (req, res) => {
  const sub = req.body;
  if (!sub || !sub.endpoint) return res.status(400).json({ error: 'Invalid subscription' });
  await saveSubscription(sub);
  res.status(201).json({ message: 'Подписка сохранена' });
});

/**
 * @swagger
 * /api/push/unsubscribe:
 *   post:
 *     summary: Удалить push-подписку
 *     tags: [Push]
 *     responses:
 *       200:
 *         description: Подписка удалена
 */
router.post('/unsubscribe', async (req, res) => {
  const { endpoint } = req.body || {};
  if (!endpoint) return res.status(400).json({ error: 'endpoint required' });
  await removeSubscription(endpoint);
  res.json({ message: 'Подписка удалена' });
});

module.exports = router;
