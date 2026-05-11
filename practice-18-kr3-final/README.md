# ⭐ Контрольная работа №3 — PWA «Авто-задачи» (практики 13–18)

Итоговый отчёт по КР3. Цель блока — превратить простой to-do-список задач по автомобилям в полноценное **прогрессивное веб-приложение (PWA)** с офлайн-режимом, App Shell, двусторонней связью через WebSocket и push-уведомлениями (в том числе запланированными напоминаниями с возможностью «Отложить»).

---

## 🗺️ Эволюция приложения

```
13. SW + cache       →   14. + Web App Manifest   →   15. + App Shell + HTTPS
                                                            ↓
                                                      16. + Socket.IO + Web Push
                                                            ↓
                                                      17. + scheduled reminders + snooze
                                                            ↓
                                                      18. итог КР3
```

Каждая практика — отдельная папка, наследует код предыдущей и добавляет ровно один слой. Везде используется тёмная тема, иконки `🚗`, сущность — **задача по автомобилю** (ТО, замена масла, ремонт и т. п.).

---

## 📁 Структура блока

```text
practice-13-service-worker/   # Service Worker + Cache First
practice-14-manifest/         # PWA-манифест и иконки
practice-15-app-shell/        # App Shell + HTTPS + два кэша
practice-16-websocket-push/   # Socket.IO + web-push (VAPID)
practice-17-push-reminders/   # Запланированные напоминания + snooze
practice-18-kr3-final/        # Этот README
```

---

# ✅ Практика 13 — Service Worker (Cache First)

## Цель
Зарегистрировать **Service Worker**, кэшировать статику приложения и обеспечить офлайн-режим: после первой загрузки приложение должно открываться даже без сети.

## Теория

### Что такое Service Worker?
**Service Worker (SW)** — это специальный JavaScript-воркер, который браузер запускает в отдельном потоке. Он играет роль программируемого прокси между страницей и сетью: может перехватывать любые запросы (`fetch`), читать и писать в `Cache Storage`, работать в фоне.

Жизненный цикл SW:
1. **register** — страница регистрирует воркер: `navigator.serviceWorker.register('/sw.js')`.
2. **install** — браузер загружает воркер, выполняется обработчик `install` (обычно — открыть кэш и положить туда статику).
3. **activate** — старый воркер заменяется новым, можно удалить устаревшие кэши.
4. **fetch** — на каждый сетевой запрос вызывается обработчик `fetch`, в котором мы решаем, откуда отдавать ответ — из кэша, из сети или комбинировать.

### Стратегия Cache First
```
запрос → есть в кэше? → да → отдаём из кэша
                       → нет → идём в сеть → отдаём ответ
```

Подходит для **неизменной статики** (HTML/CSS/JS, иконки): быстрый ответ, работает офлайн, но при изменении файлов нужно вручную увеличить версию кэша (`car-notes-v1` → `car-notes-v2`).

## Что реализовано

### Файлы
| Файл | Назначение |
|---|---|
| `index.html` | Каркас страницы и контейнер списка задач |
| `app.js` | Логика to-do (localStorage) + регистрация SW |
| `sw.js` | Service Worker: install / activate / fetch |
| `style.css` | Тёмная тема |

### Стратегия в `sw.js`
```js
const CACHE_NAME = 'car-notes-v1';
const ASSETS = ['/', '/index.html', '/style.css', '/app.js'];

// install — открываем кэш и кладём статику
self.addEventListener('install', e => e.waitUntil(
  caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
));

// activate — удаляем устаревшие кэши
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(keys => Promise.all(
    keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
  ))
));
self.clients.claim();

// fetch — сначала кэш, потом сеть
self.addEventListener('fetch', e => e.respondWith(
  caches.match(e.request).then(cached => cached || fetch(e.request))
));
```

### Регистрация в `app.js`
```js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW зарегистрирован:', reg.scope))
      .catch(err => console.error('Ошибка регистрации SW:', err));
  });
}
```

## Как проверить
1. Открыть приложение → DevTools → **Application → Service Workers** → статус `activated`.
2. **Application → Cache Storage → car-notes-v1** — содержит HTML/CSS/JS.
3. Отключить сеть (DevTools → Network → Offline) → перезагрузить — приложение работает.

---

# ✅ Практика 14 — Web App Manifest (установка PWA)

## Цель
Добавить файл **manifest.json**, иконки и мета-теги, чтобы приложение можно было установить как нативное (значок на рабочем столе / в меню «Пуск», полноэкранный режим, цвет темы).

## Теория

### Что такое Web App Manifest?
**Web App Manifest** — это JSON-файл, описывающий PWA-приложение для браузера и операционной системы: имя, иконки, режим отображения, цвет темы. Подключается через `<link rel="manifest" href="/manifest.json">` в `<head>`.

Минимальный набор условий, чтобы браузер предложил установку:
- HTTPS (или localhost),
- Service Worker зарегистрирован,
- Подключён валидный `manifest.json` с иконками 192 и 512 px,
- Поля `start_url` и `display`.

## Что реализовано

### manifest.json
```json
{
  "name": "Авто-задачи",
  "short_name": "Авто",
  "start_url": "/index.html",
  "display": "standalone",
  "background_color": "#0b0f19",
  "theme_color": "#0b0f19",
  "icons": [
    { "src": "/icons/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

### Подключение в `index.html`
```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#0b0f19">
<meta name="mobile-web-app-capable" content="yes">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
```

### Иконки
В папке `icons/`:
- `favicon-16x16.png`, `favicon-32x32.png`
- `apple-touch-icon.png` (180×180)
- `android-chrome-192x192.png`, `android-chrome-512x512.png`

## Как проверить
1. Открыть приложение в Chrome → **DevTools → Application → Manifest** — все поля валидны, иконки отображаются.
2. В адресной строке появляется значок «Установить приложение» — нажать → приложение появится как нативное.
3. После установки оно открывается без адресной строки (`display: standalone`), цвет шапки соответствует `theme_color`.

---

# ✅ Практика 15 — HTTPS + App Shell

## Цель
1. Запустить приложение **по HTTPS** локально — это обязательное условие для PWA-функций (SW, push, геолокация).
2. Перейти к архитектуре **App Shell**: каркас (шапка, табы, футер) грузится мгновенно из кэша, а контент страниц — динамически через `fetch`.

## Теория

### App Shell
```
┌────────────────────────────────────┐
│  HEADER  (всегда виден)            │   ← кэшируется навсегда
├──────────┬─────────────────────────┤
│  TABS    │  Главная │ О приложении │   ← кэшируется навсегда
├──────────┴─────────────────────────┤
│                                    │
│  CONTENT (подгружается /content/*)│   ← Network First
│                                    │
└────────────────────────────────────┘
│  FOOTER                            │   ← кэшируется навсегда
└────────────────────────────────────┘
```

Каркас (App Shell) и контент кэшируются разными стратегиями и в разных кэшах:
- **Cache First** для статики → `car-shell-v1`,
- **Network First** для `/content/*` → `car-dynamic-v1`, с фолбеком на `home.html` при offline.

### Локальный HTTPS через mkcert
`mkcert` создаёт самоподписанный сертификат и **добавляет его в системное доверенное хранилище**, поэтому Chrome не ругается на «небезопасное соединение».

```powershell
choco install mkcert
mkcert -install
mkcert localhost 127.0.0.1 ::1
http-server --ssl --cert localhost.pem --key localhost-key.pem -p 3000
```

## Что реализовано

### Структура
```text
practice-15-app-shell/
├── content/
│   ├── home.html      ← форма + список задач (динамический фрагмент)
│   └── about.html     ← статичная страница «О приложении»
├── icons/
├── index.html         ← App Shell (header + tabs + main + footer)
├── app.js             ← навигация + initNotes() + SW регистрация
├── sw.js              ← две стратегии: Cache First и Network First
├── manifest.json
└── style.css
```

### Динамическая загрузка контента (`app.js`)
```js
async function loadContent(page) {
  const res = await fetch(`/content/${page}.html`);
  contentEl.innerHTML = await res.text();
  if (page === 'home') initNotes();
}

tabs.forEach(t => t.addEventListener('click', () => {
  setActiveTab(t.dataset.page);
  loadContent(t.dataset.page);
}));
loadContent('home');
```

### Две стратегии кэширования (`sw.js`)
```js
const SHELL_CACHE   = 'car-shell-v1';
const DYNAMIC_CACHE = 'car-dynamic-v1';

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  // Network First для контента
  if (url.pathname.startsWith('/content/')) {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          const clone = res.clone();
          caches.open(DYNAMIC_CACHE).then(c => c.put(event.request, clone));
          return res;
        })
        .catch(() =>
          caches.match(event.request).then(c => c || caches.match('/content/home.html'))
        )
    );
    return;
  }

  // Cache First для всего остального
  event.respondWith(caches.match(event.request).then(c => c || fetch(event.request)));
});
```

## Как запустить
```powershell
# Установка mkcert и сертификата
choco install mkcert
mkcert -install
cd practice-15-app-shell
mkcert localhost 127.0.0.1 ::1

# Сервер
npm install -g http-server
http-server . --ssl --cert localhost.pem --key localhost-key.pem -p 3000
```

Открыть `https://localhost:3000`.

## Как проверить
1. **DevTools → Application → Cache Storage** — два кэша: `car-shell-v1` и `car-dynamic-v1`.
2. **DevTools → Security** — статус `Secure` (валидный сертификат от mkcert).
3. Network → Slow 3G + перезагрузка — каркас появляется мгновенно, контент чуть позже.
4. Offline + перезагрузка — приложение полностью грузится из кэша, задачи на месте.

---

# ✅ Практика 16 — WebSocket + Web Push

## Цель
Добавить:
1. **WebSocket** через Socket.IO — двусторонняя связь между клиентом и сервером (toast «Новая задача» в реальном времени между вкладками).
2. **Web Push** — уведомления приходят на уровне ОС даже при закрытой вкладке.

## Теория

### WebSocket vs HTTP
HTTP — запрос-ответ, инициатива всегда у клиента. **WebSocket** — постоянное двустороннее соединение, сервер может сам слать данные клиенту. Идеально для чатов, нотификаций, лент активности.

**Socket.IO** — обёртка над WebSocket: автопереподключение, события, fallback на long-polling в старых браузерах.
```
клиент: socket.emit('newCarTask', task)
сервер: io.on('connection', s => s.on('newCarTask', t => io.emit('carTaskAdded', t)))
клиент: socket.on('carTaskAdded', task => showToast(...))
```

### Web Push и VAPID
**Web Push** работает в три участника:
```
сервер → push-сервис (FCM/Mozilla/…) → браузер → Service Worker → showNotification
```

**VAPID** (Voluntary Application Server Identification) — пара ключей (public/private), которой сервер подписывает push-сообщения. Публичный ключ передаётся клиенту, приватный остаётся на сервере.

```bash
npx web-push generate-vapid-keys
# Public Key:  BNxRsl7y0n9w…
# Private Key: …
```

Клиент подписывается через `PushManager.subscribe({ applicationServerKey })`. Получает объект `{ endpoint, keys: { p256dh, auth } }`, отправляет его на сервер. Сервер хранит подписки и при событии шлёт push через `webpush.sendNotification(sub, payload)`.

## Что реализовано

### Серверная часть (`server.js`)
- **Express + Socket.IO** на порту `3001`, отдаёт статику.
- Событие `newCarTask` → сервер рассылает `carTaskAdded` всем + шлёт push всем подписчикам.
- Эндпоинты `/subscribe`, `/unsubscribe`, `/api/vapid-public-key`.

```js
io.on('connection', (socket) => {
  socket.on('newCarTask', (task) => {
    io.emit('carTaskAdded', task);          // WebSocket — всем
    const payload = JSON.stringify({ title: '🚗 Новая задача', body: task.text });
    subscriptions.forEach(sub =>
      webpush.sendNotification(sub, payload).catch(console.error)  // Push — всем
    );
  });
});
```

### Клиентская часть (`app.js`)
- Сохраняет задачу в `localStorage` и эмитит `newCarTask`.
- Подписывается на `carTaskAdded` → показывает toast в правом верхнем углу.
- Кнопки **«🔔 Включить уведомления»** / **«🔕 Отключить»** в футере.

```js
async function subscribeToPush() {
  const reg = await navigator.serviceWorker.ready;
  const { key } = await fetch('/api/vapid-public-key').then(r => r.json());
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(key)
  });
  await fetch('/subscribe', { method:'POST', headers:{'Content-Type':'application/json'},
                              body: JSON.stringify(sub) });
}
```

### Service Worker (`sw.js`)
```js
self.addEventListener('push', (event) => {
  const data = event.data.json();
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
```

### Серверные эндпоинты
| Метод | Путь | Описание |
|---|---|---|
| GET  | `/api/vapid-public-key` | Возвращает публичный VAPID-ключ |
| POST | `/subscribe`            | Сохранить push-подписку (`{endpoint, keys: …}`) |
| POST | `/unsubscribe`          | Удалить подписку по `endpoint` |

### Socket.IO события
| Событие | Кто отправляет | Кто слушает | Назначение |
|---|---|---|---|
| `newCarTask`   | клиент | сервер | новая задача создана |
| `carTaskAdded` | сервер | все клиенты | broadcast — показать toast |

## Как запустить
```bash
cd practice-16-websocket-push
npm install
npx web-push generate-vapid-keys     # подставить в server.js
npm start
```
`http://localhost:3001`

## Как проверить
1. Открыть две вкладки `http://localhost:3001`.
2. В одной нажать «🔔 Включить уведомления», разрешить.
3. В **другой** вкладке добавить задачу — в первой появляется toast.
4. Свернуть браузер → добавить задачу из другой вкладки → push приходит на уровне ОС.
5. Кнопка «🔕 Отключить» удаляет подписку — push больше не приходит, toast остаётся.

---

# ✅ Практика 17 — Детализация Push (запланированные напоминания)

## Цель
Добавить функционал **напоминаний**: пользователь выбирает дату/время, сервер планирует push на этот момент. В уведомлении — кнопка **«⏸ Отложить на 5 минут»**, которая пересоздаёт таймер.

## Теория

### Действия (actions) в push-уведомлении
В `showNotification(title, options)` можно передать массив `actions`:
```js
{
  actions: [
    { action: 'snooze', title: '⏸ Отложить на 5 минут' }
  ]
}
```
При нажатии на кнопку срабатывает `notificationclick` с заполненным `event.action === 'snooze'`. Через `event.waitUntil(fetch(...))` можно сделать запрос на сервер, не закрывая уведомление до завершения операции.

### Хранение таймеров на сервере
Серверу нужно знать, какое напоминание к какому таймеру относится. Используется `Map<id, { timeoutId, text, reminderTime }>`. При snooze:
```js
clearTimeout(reminder.timeoutId);
const newTime = Date.now() + 5 * 60 * 1000;
scheduleReminder({ id, text, reminderTime: newTime });
```

## Что реализовано

### Структура данных задач
В отличие от практики 16, у задачи теперь есть `id` и опциональный `reminder`:
```js
// localStorage 'car-notes-v2'
[
  { id: 1700000000000, text: 'ТО Audi A4', done: false, reminder: 1700003600000 }
]
```

### Форма «Задача с напоминанием»
`content/home.html`:
```html
<form id="reminder-form" class="form form--column">
  <input id="reminder-text" type="text" placeholder="Текст напоминания" required />
  <div class="form-row">
    <input id="reminder-time" type="datetime-local" required />
    <button class="btn btn--success">⏰ Запланировать</button>
  </div>
</form>
```

### Серверный планировщик (`server.js`)
```js
const reminders = new Map();           // id → { timeoutId, text, reminderTime }
const SNOOZE_MS = 5 * 60 * 1000;

function scheduleReminder({ id, text, reminderTime }) {
  const delay = reminderTime - Date.now();
  if (delay <= 0) return;

  const timeoutId = setTimeout(() => {
    broadcastPush({ title: '⏰ Напоминание (авто)', body: text, reminderId: id });
    reminders.delete(id);
  }, delay);

  reminders.set(id, { timeoutId, text, reminderTime });
}

// Эндпоинт snooze
app.post('/snooze', (req, res) => {
  const id = Number(req.query.reminderId);
  const r  = reminders.get(id);
  if (!r) return res.status(404).json({ error: 'Напоминание не найдено' });

  clearTimeout(r.timeoutId);
  scheduleReminder({ id, text: r.text, reminderTime: Date.now() + SNOOZE_MS });

  io.emit('reminderSnoozed', { id, reminderTime: Date.now() + SNOOZE_MS });
  res.json({ message: 'Напоминание отложено на 5 минут' });
});
```

### Push с действием (`sw.js`)
```js
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/android-chrome-192x192.png',
    badge: '/icons/favicon-32x32.png',
    data: { reminderId: data.reminderId }
  };
  if (data.reminderId) {
    options.actions = [{ action: 'snooze', title: '⏸ Отложить на 5 минут' }];
  }
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  const { reminderId } = event.notification.data || {};
  if (event.action === 'snooze' && reminderId) {
    event.waitUntil(
      fetch(`/snooze?reminderId=${reminderId}`, { method: 'POST' })
        .then(() => event.notification.close())
    );
    return;
  }
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});
```

### Серверные эндпоинты
| Метод | Путь | Описание |
|---|---|---|
| GET  | `/api/vapid-public-key`         | Публичный VAPID-ключ |
| POST | `/subscribe`                    | Сохранить push-подписку |
| POST | `/unsubscribe`                  | Удалить подписку |
| POST | `/snooze?reminderId=…`          | Перепланировать напоминание на +5 минут |
| GET  | `/reminders`                    | Список активных напоминаний (отладка) |

### Socket.IO события
| Событие | Описание |
|---|---|
| `newCarTask`        | новая задача (без напоминания) |
| `carTaskAdded`      | broadcast всем — toast |
| `newReminder`       | задача с напоминанием → сервер планирует таймер |
| `reminderScheduled` | подтверждение от сервера |
| `reminderSnoozed`   | broadcast: напоминание отложено |

## Как запустить
```bash
cd practice-17-push-reminders
npm install
npx web-push generate-vapid-keys     # подставить в server.js
npm start
```
`http://localhost:3001`

## Как проверить
1. Разрешить уведомления.
2. Создать задачу с напоминанием на **2–3 минуты вперёд**.
3. Закрыть/свернуть вкладку.
4. В нужное время приходит push с кнопкой «⏸ Отложить на 5 минут».
5. Нажать на кнопку — через 5 минут push приходит повторно.

---

# ⭐ Сборка КР3 — что показывает итоговое приложение

## 🧰 Технологии

- **HTML/CSS/vanilla JS** — клиент без фреймворков
- **Service Worker API** — кэширование, офлайн, фон, push
- **Web App Manifest** — установка PWA на устройство
- **Cache Storage API** — два кэша: `car-shell-vN` (Cache First), `car-dynamic-vN` (Network First)
- **mkcert + http-server --ssl** — локальный HTTPS
- **Express + Socket.IO** — двусторонняя связь
- **web-push + VAPID** — серверная отправка push
- **PushManager + Notification API** — подписки и системные уведомления
- **setTimeout + Map** — серверное планирование напоминаний
- **localStorage** — клиентское хранение задач

## 🏗️ Архитектура (на примере практики 17 — самая полная)

```
┌─────────────────────────────────────────────────────────────┐
│                       Browser                               │
│  ┌────────────┐  ┌────────────────┐  ┌──────────────────┐   │
│  │  App Shell │  │  /content/*.html│  │  Service Worker  │   │
│  │ (cached)   │  │ (network-first) │  │  (cached + push) │   │
│  └────────────┘  └────────────────┘  └──────────────────┘   │
│        │                  │                    │            │
│        └────────── localStorage ───────────────┘            │
│        │                  │                    │            │
└────────┼──────────────────┼────────────────────┼────────────┘
         │ Socket.IO         │ HTTP fetch         │ Push (ОС)
         ▼                   ▼                    ▲
┌─────────────────────────────────────────────────────────────┐
│  Express + Socket.IO + web-push (server.js, port 3001)      │
│                                                             │
│  subscriptions[]                                            │
│  reminders: Map<id, { timeoutId, text, reminderTime }>      │
│                                                             │
│  /subscribe   /unsubscribe   /snooze   /reminders           │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Чек-лист готовности

- [x] Service Worker регистрируется, статика кэшируется (DevTools → Application → SW).
- [x] `manifest.json` валиден, иконки 192/512, `theme_color`.
- [x] При установке PWA в Chrome иконка появляется на рабочем столе.
- [x] App Shell кэшируется в `car-shell-vN`, контент `/content/*` — в `car-dynamic-vN`.
- [x] При offline главная и «О приложении» открываются из кэша.
- [x] Socket.IO: две вкладки видят события друг друга (toast).
- [x] Push приходит на ОС при закрытой вкладке.
- [x] Запланированное напоминание срабатывает в указанное время.
- [x] Snooze в уведомлении пересоздаёт таймер на +5 минут.

## 🚀 Быстрый запуск самого полного приложения

```bash
cd practice-17-push-reminders
npm install
npx web-push generate-vapid-keys     # подставить ключи в server.js
npm start                            # http://localhost:3001
```

В двух вкладках:
1. Нажать «🔔 Включить уведомления».
2. Создать задачу через «+ Добавить» — toast приходит в другую вкладку.
3. Создать задачу с напоминанием на 1–2 минуты вперёд → закрыть вкладку → дождаться push.
4. В уведомлении нажать «⏸ Отложить на 5 минут» — push повторится через 5 минут.

## 🔗 Адреса (практика 17)
| URL | Описание |
|---|---|
| `http://localhost:3001/` | PWA «Авто-задачи» |
| `http://localhost:3001/content/home.html` | Динамический контент главной |
| `http://localhost:3001/content/about.html` | Динамический контент «О приложении» |
| `http://localhost:3001/api/vapid-public-key` | Публичный VAPID-ключ |
| `http://localhost:3001/reminders` | Список активных напоминаний (отладка) |
