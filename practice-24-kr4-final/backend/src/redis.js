const { createClient } = require('redis');

const url = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// Основной клиент — для кэша + хранения push-подписок
const redis = createClient({ url });

// Отдельные клиенты для socket.io-redis-adapter (нельзя переиспользовать pub/sub поверх обычного клиента)
const pubClient = createClient({ url });
const subClient = pubClient.duplicate();

redis.on('error',     (err) => console.error('Redis error:',     err.message));
pubClient.on('error', (err) => console.error('Redis pub error:', err.message));
subClient.on('error', (err) => console.error('Redis sub error:', err.message));

async function connectRedis() {
  await Promise.all([redis.connect(), pubClient.connect(), subClient.connect()]);
  console.log('✅ Redis connected:', url);
}

// ── Кэш ────────────────────────────────────────────────
async function cacheGet(key) {
  try { return await redis.get(key); }
  catch (e) { console.error('cacheGet error:', e.message); return null; }
}

async function cacheSet(key, value, ttl) {
  try { await redis.set(key, JSON.stringify(value), { EX: ttl }); }
  catch (e) { console.error('cacheSet error:', e.message); }
}

async function cacheDel(...keys) {
  try { if (keys.length) await redis.del(keys); }
  catch (e) { console.error('cacheDel error:', e.message); }
}

// ── Push-подписки (общие для всех инстансов) ──────────
// Используем Hash: key=endpoint, value=stringified subscription
const SUBS_KEY = 'push:subscriptions';

async function saveSubscription(sub) {
  await redis.hSet(SUBS_KEY, sub.endpoint, JSON.stringify(sub));
}
async function removeSubscription(endpoint) {
  await redis.hDel(SUBS_KEY, endpoint);
}
async function getAllSubscriptions() {
  const all = await redis.hGetAll(SUBS_KEY);
  return Object.values(all).map(s => JSON.parse(s));
}

module.exports = {
  redis, pubClient, subClient,
  connectRedis,
  cacheGet, cacheSet, cacheDel,
  saveSubscription, removeSubscription, getAllSubscriptions
};
