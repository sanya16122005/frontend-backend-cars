const webpush = require('web-push');
const { redis, getAllSubscriptions, removeSubscription } = require('./redis');

const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:cars@example.com';
const VAPID_REDIS_KEY = 'push:vapid';

let PUBLIC_KEY  = '';
let PRIVATE_KEY = '';
let pushEnabled = false;

// Инициализация вызывается из server.js ПОСЛЕ connectRedis()
async function initPush() {
  try {
    const envPub  = process.env.VAPID_PUBLIC;
    const envPriv = process.env.VAPID_PRIVATE;

    if (envPub && envPriv && !envPriv.startsWith('CHANGE_ME')) {
      PUBLIC_KEY  = envPub;
      PRIVATE_KEY = envPriv;
    } else {
      // 1) Пытаемся прочитать существующую пару из Redis (общая для всех инстансов)
      const cached = await redis.get(VAPID_REDIS_KEY);
      if (cached) {
        const pair = JSON.parse(cached);
        PUBLIC_KEY  = pair.publicKey;
        PRIVATE_KEY = pair.privateKey;
        console.log('🔑 VAPID-ключи загружены из Redis');
      } else {
        // 2) Первый инстанс — генерирует и кладёт в Redis (SET NX — атомарно)
        const generated = webpush.generateVAPIDKeys();
        const ok = await redis.set(VAPID_REDIS_KEY, JSON.stringify(generated), { NX: true });
        if (ok) {
          PUBLIC_KEY  = generated.publicKey;
          PRIVATE_KEY = generated.privateKey;
          console.log('🔑 Сгенерирована и сохранена в Redis новая пара VAPID-ключей');
        } else {
          // Другой инстанс успел положить раньше — забираем его
          const winner = JSON.parse(await redis.get(VAPID_REDIS_KEY));
          PUBLIC_KEY  = winner.publicKey;
          PRIVATE_KEY = winner.privateKey;
        }
      }
    }

    webpush.setVapidDetails(VAPID_EMAIL, PUBLIC_KEY, PRIVATE_KEY);
    pushEnabled = true;
    console.log('✅ Push включён');
  } catch (err) {
    console.error('⚠️  VAPID setup failed, push отключён:', err.message);
    pushEnabled = false;
  }
}

async function sendPushToAll(payload) {
  if (!pushEnabled) return;
  const subs = await getAllSubscriptions();
  if (!subs.length) return;
  const body = JSON.stringify(payload);

  await Promise.all(subs.map(async (sub) => {
    try {
      await webpush.sendNotification(sub, body);
    } catch (err) {
      // 404/410 — подписка устарела, удаляем
      if (err.statusCode === 404 || err.statusCode === 410) {
        await removeSubscription(sub.endpoint);
      } else {
        console.error('Push error:', err.statusCode || err.message);
      }
    }
  }));
}

module.exports = {
  initPush,
  sendPushToAll,
  getPublicKey: () => PUBLIC_KEY,
  isPushEnabled: () => pushEnabled
};
