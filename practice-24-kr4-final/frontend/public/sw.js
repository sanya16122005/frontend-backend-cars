// Service Worker для итогового проекта.
// Стратегии:
//  - App Shell (HTML / JS / CSS / иконки) — Cache First
//  - API (/api/*) и WebSocket (/socket.io/*) — всегда сеть (без кэша)
//  - Push-уведомления и действие "Отложить на 5 минут"

const SHELL_CACHE = 'cars-shell-v1';

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    // Vite кладёт hashed-ассеты в /assets/*. При первой загрузке
    // мы их закэшируем динамически в fetch-обработчике.
    const cache = await caches.open(SHELL_CACHE);
    try {
      await cache.addAll([
        '/',
        '/manifest.json',
        '/icons/favicon-16x16.png',
        '/icons/favicon-32x32.png',
        '/icons/apple-touch-icon.png',
        '/icons/android-chrome-192x192.png',
        '/icons/android-chrome-512x512.png'
      ]);
    } catch (e) {
      console.warn('SW install partial:', e);
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== SHELL_CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  // Никогда не кэшируем API и сокеты
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/socket.io/')) return;

  // Cache First для статики + App Shell fallback
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;

    try {
      const res = await fetch(event.request);
      if (res.ok && event.request.method === 'GET') {
        const clone = res.clone();
        const cache = await caches.open(SHELL_CACHE);
        cache.put(event.request, clone);
      }
      return res;
    } catch {
      // Offline + переход на новый роут → отдаём корень (SPA)
      if (event.request.mode === 'navigate') return caches.match('/');
      throw new Error('offline and not cached');
    }
  })());
});

// ── Push ────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = { title: '🚗 Cars', body: '' };
  if (event.data) {
    try { data = event.data.json(); }
    catch { data.body = event.data.text(); }
  }

  const options = {
    body: data.body,
    icon: '/icons/android-chrome-192x192.png',
    badge: '/icons/favicon-32x32.png',
    data: { reminderId: data.reminderId, url: data.url || '/' }
  };

  if (data.reminderId) {
    options.actions = [{ action: 'snooze', title: '⏸ Отложить на 5 минут' }];
  }

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  const { reminderId, url } = event.notification.data || {};

  if (event.action === 'snooze' && reminderId) {
    event.waitUntil(
      fetch(`/api/reminders/${reminderId}/snooze`, { method: 'POST' })
        .then(() => event.notification.close())
        .catch(err => console.error('Snooze fetch error:', err))
    );
    return;
  }

  event.notification.close();
  event.waitUntil(clients.openWindow(url || '/'));
});
