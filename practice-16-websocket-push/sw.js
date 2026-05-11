const SHELL_CACHE   = 'car-shell-v2';
const DYNAMIC_CACHE = 'car-dynamic-v2';

const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/icons/favicon-16x16.png',
  '/icons/favicon-32x32.png',
  '/icons/apple-touch-icon.png',
  '/icons/android-chrome-192x192.png',
  '/icons/android-chrome-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== SHELL_CACHE && k !== DYNAMIC_CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  // Не кэшируем Socket.IO и API
  if (url.pathname.startsWith('/socket.io/') || url.pathname.startsWith('/api/') ||
      url.pathname === '/subscribe' || url.pathname === '/unsubscribe') return;

  if (url.pathname.startsWith('/content/')) {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          const clone = res.clone();
          caches.open(DYNAMIC_CACHE).then(c => c.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request).then(c => c || caches.match('/content/home.html')))
    );
    return;
  }

  event.respondWith(caches.match(event.request).then(c => c || fetch(event.request)));
});

// ── Push ────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = { title: '🚗 Уведомление', body: '' };
  if (event.data) {
    try { data = event.data.json(); }
    catch { data.body = event.data.text(); }
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/android-chrome-192x192.png',
      badge: '/icons/favicon-32x32.png'
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});
