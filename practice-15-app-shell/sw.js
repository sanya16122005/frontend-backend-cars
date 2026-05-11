const SHELL_CACHE   = 'car-shell-v1';
const DYNAMIC_CACHE = 'car-dynamic-v1';

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
      Promise.all(
        keys
          .filter(k => k !== SHELL_CACHE && k !== DYNAMIC_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Статика — Cache First, контент /content/* — Network First с фолбеком
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  if (url.pathname.startsWith('/content/')) {
    event.respondWith(
      fetch(event.request)
        .then((networkRes) => {
          const clone = networkRes.clone();
          caches.open(DYNAMIC_CACHE).then(cache => cache.put(event.request, clone));
          return networkRes;
        })
        .catch(() =>
          caches.match(event.request)
            .then(cached => cached || caches.match('/content/home.html'))
        )
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
