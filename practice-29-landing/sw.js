const CACHE_NAME = 'cars-landing-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Cache First — статика мгновенно из кэша, новые ресурсы кешируются на лету
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    try {
      const res = await fetch(event.request);
      const clone = res.clone();
      caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
      return res;
    } catch {
      if (event.request.mode === 'navigate') return caches.match('/index.html');
      throw new Error('offline and not cached');
    }
  })());
});
