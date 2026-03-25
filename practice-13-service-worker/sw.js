const CACHE_NAME = 'car-notes-v1';

// Список файлов для кэширования
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js'
];

// INSTALL — при первой установке кэшируем все файлы
self.addEventListener('install', (event) => {
  console.log('[SW] install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting()) // сразу активируемся, не ждём закрытия вкладки
  );
});

// ACTIVATE — удаляем старые кэши при обновлении SW
self.addEventListener('activate', (event) => {
  console.log('[SW] activate');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME) // все кэши кроме текущего
          .map(key => {
            console.log('[SW] удаляем старый кэш:', key);
            return caches.delete(key);
          })
      )
    )
  );
  self.clients.claim(); // берём контроль над открытыми вкладками сразу
});

// FETCH — перехватываем запросы: сначала кэш, потом сеть
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) {
          console.log('[SW] из кэша:', event.request.url);
          return cached;
        }
        console.log('[SW] из сети:', event.request.url);
        return fetch(event.request);
      })
  );
});
