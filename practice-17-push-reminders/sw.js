const SHELL_CACHE   = 'car-shell-v3';
const DYNAMIC_CACHE = 'car-dynamic-v3';

const SHELL_ASSETS = [
  '/', '/index.html', '/style.css', '/app.js', '/manifest.json',
  '/icons/favicon-16x16.png', '/icons/favicon-32x32.png',
  '/icons/apple-touch-icon.png',
  '/icons/android-chrome-192x192.png', '/icons/android-chrome-512x512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL_CACHE).then(c => c.addAll(SHELL_ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== SHELL_CACHE && k !== DYNAMIC_CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.startsWith('/socket.io/') || url.pathname.startsWith('/api/') ||
      ['/subscribe','/unsubscribe','/snooze','/reminders'].includes(url.pathname)) return;

  if (url.pathname.startsWith('/content/')) {
    e.respondWith(
      fetch(e.request)
        .then(r => { const c = r.clone(); caches.open(DYNAMIC_CACHE).then(x => x.put(e.request, c)); return r; })
        .catch(() => caches.match(e.request).then(c => c || caches.match('/content/home.html')))
    );
    return;
  }
  e.respondWith(caches.match(e.request).then(c => c || fetch(e.request)));
});

// ── Push с reminderId и кнопкой «Отложить» ──────────────
self.addEventListener('push', (event) => {
  let data = { title: '🚗 Уведомление', body: '', reminderId: null };
  if (event.data) {
    try { data = event.data.json(); }
    catch { data.body = event.data.text(); }
  }

  const options = {
    body: data.body,
    icon: '/icons/android-chrome-192x192.png',
    badge: '/icons/favicon-32x32.png',
    data: { reminderId: data.reminderId }
  };

  if (data.reminderId) {
    options.actions = [
      { action: 'snooze', title: '⏸ Отложить на 5 минут' }
    ];
  }

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;
  const reminderId = notification.data && notification.data.reminderId;

  if (action === 'snooze' && reminderId) {
    event.waitUntil(
      fetch(`/snooze?reminderId=${reminderId}`, { method: 'POST' })
        .then(() => notification.close())
        .catch(err => console.error('Snooze fetch error:', err))
    );
    return;
  }

  notification.close();
  event.waitUntil(clients.openWindow('/'));
});
