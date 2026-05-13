const express = require('express');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const { nanoid } = require('nanoid');
const { pool } = require('../db');
const { cacheDel } = require('../redis');
const {
  ACCESS_SECRET, REFRESH_SECRET,
  generateAccessToken, generateRefreshToken,
  authMiddleware
} = require('../auth');

const router = express.Router();
const refreshTokens = new Set();   // в реальном приложении — Redis или БД

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

router.get('/me', authMiddleware, async (req, res) => {
  const { rows } = await pool.query(
    'SELECT id, email, first_name, last_name, role, blocked FROM users WHERE id = $1',
    [req.user.sub]
  );
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

module.exports = router;
