const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { nanoid } = require('nanoid');
const { pool } = require('../db');
const { cacheDel } = require('../redis');
const {
  REFRESH_SECRET,
  generateAccessToken, generateRefreshToken,
  authMiddleware
} = require('../auth');

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Регистрация, вход, refresh, профиль
 */
const router = express.Router();
const refreshTokens = new Set();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, first_name, last_name, password]
 *             properties:
 *               email:      { type: string, example: u@u }
 *               first_name: { type: string, example: Иван }
 *               last_name:  { type: string, example: Иванов }
 *               password:   { type: string, example: secret }
 *               role:       { type: string, enum: [user, seller, admin], default: user }
 *     responses:
 *       201: { description: Пользователь создан, $ref: '#/components/schemas/User' }
 *       409: { description: Email уже существует }
 */
router.post('/register', async (req, res) => {
  const { email, first_name, last_name, password, role } = req.body || {};
  if (!email || !first_name || !last_name || !password) {
    return res.status(400).json({ error: 'All fields required' });
  }
  const dup = await pool.query('SELECT 1 FROM users WHERE email = $1', [email]);
  if (dup.rowCount) return res.status(409).json({ error: 'Email already exists' });

  const passwordHash = await bcrypt.hash(password, 10);
  const id = nanoid();
  await pool.query(
    `INSERT INTO users (id, email, first_name, last_name, password_hash, role)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [id, email, first_name, last_name, passwordHash, role || 'user']
  );
  await cacheDel('users:all');
  res.status(201).json({ id, email, first_name, last_name, role: role || 'user' });
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вход — пара access + refresh токенов
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, example: admin@cars.local }
 *               password: { type: string, example: admin123 }
 *     responses:
 *       200: { description: Пара токенов, $ref: '#/components/schemas/AuthTokens' }
 *       401: { description: Неверные учётные данные }
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = rows[0];
  if (!user || user.blocked) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password || '', user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const accessToken  = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  refreshTokens.add(refreshToken);
  res.json({ accessToken, refreshToken });
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Обновить пару токенов по refreshToken
 *     tags: [Auth]
 *     responses:
 *       200: { description: Новая пара токенов }
 *       401: { description: refreshToken невалиден или истёк }
 */
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken || !refreshTokens.has(refreshToken)) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);
    refreshTokens.delete(refreshToken);
    const user = { id: payload.sub, email: payload.email, role: payload.role };
    const accessNew  = generateAccessToken(user);
    const refreshNew = generateRefreshToken(user);
    refreshTokens.add(refreshNew);
    res.json({ accessToken: accessNew, refreshToken: refreshNew });
  } catch {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Текущий пользователь по accessToken
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Профиль, $ref: '#/components/schemas/User' }
 *       401: { description: Не авторизован }
 */
router.get('/me', authMiddleware, async (req, res) => {
  const { rows } = await pool.query(
    'SELECT id, email, first_name, last_name, role, blocked FROM users WHERE id = $1',
    [req.user.sub]
  );
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

module.exports = router;
