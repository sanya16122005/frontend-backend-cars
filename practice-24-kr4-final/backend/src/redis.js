const { createClient } = require('redis');

const url = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const redis = createClient({ url });

redis.on('error', (err) => console.error('Redis error:', err.message));

async function connectRedis() {
  await redis.connect();
  console.log('✅ Redis connected:', url);
}

// Кэш-помощники
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

module.exports = { redis, connectRedis, cacheGet, cacheSet, cacheDel };
