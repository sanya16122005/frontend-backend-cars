const webpush = require('web-push');
const { getAllSubscriptions, removeSubscription } = require('./redis');

const PUBLIC_KEY  = process.env.VAPID_PUBLIC  || 'BNxRsl7y0n9wWQ8sZK2Q1Xz0WyYC0HwQ8Hh8aE7q3qSxKxRk5q6Xc9Vy2KxJh8Pk9aLn0_RbF8t8sP2gQ4cU0w7E';
const PRIVATE_KEY = process.env.VAPID_PRIVATE || 'CHANGE_ME_PRIVATE_KEY_FROM_npm_run_vapid';
const VAPID_EMAIL = process.env.VAPID_EMAIL   || 'mailto:cars@example.com';

webpush.setVapidDetails(VAPID_EMAIL, PUBLIC_KEY, PRIVATE_KEY);

async function sendPushToAll(payload) {
  const subs = await getAllSubscriptions();
  if (!subs.length) return;
  const body = JSON.stringify(payload);

  await Promise.all(subs.map(async (sub) => {
    try {
      await webpush.sendNotification(sub, body);
    } catch (err) {
      // 404/410 = подписка устарела, удаляем
      if (err.statusCode === 404 || err.statusCode === 410) {
        await removeSubscription(sub.endpoint);
      } else {
        console.error('Push error:', err.statusCode || err.message);
      }
    }
  }));
}

module.exports = { sendPushToAll, PUBLIC_KEY };
