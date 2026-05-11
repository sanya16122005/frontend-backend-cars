# Практика 16 — WebSocket + Push

Расширяем «Авто-задачи» из практики 15: **Socket.IO** для двусторонней связи в реальном времени между вкладками и **Web Push** для уведомлений даже при закрытом приложении.

## Структура
```
practice-16-websocket-push/
├── content/           # home.html, about.html (App Shell)
├── icons/             # PWA иконки
├── index.html         # каркас + кнопки уведомлений
├── app.js             # клиент: Socket.IO + push-подписки
├── sw.js              # Service Worker: кэширование + push handler
├── manifest.json
├── style.css
├── server.js          # Express + Socket.IO + web-push
└── package.json
```

## Установка и запуск
```bash
cd practice-16-websocket-push
npm install
```

### Генерация VAPID-ключей
```bash
npx web-push generate-vapid-keys
```

Скопировать `Public Key` и `Private Key` в `server.js` (поля `vapidKeys.publicKey` и `vapidKeys.privateKey`) либо передать через переменные окружения:
```bash
$env:VAPID_PUBLIC="..."
$env:VAPID_PRIVATE="..."
npm start
```

Сервер запустится на `http://localhost:3001`.

## Что происходит
1. При подключении клиент открывает WebSocket-соединение через Socket.IO.
2. Кнопка **«Включить уведомления»** запрашивает разрешение и регистрирует push-подписку через `PushManager`. Подписка отправляется на `POST /subscribe`.
3. При добавлении задачи клиент эмитит событие `newCarTask`. Сервер:
   - рассылает `carTaskAdded` всем подключённым клиентам (toast «🚗 Новая задача»);
   - отправляет push всем подписанным клиентам через `webpush.sendNotification`.
4. SW обрабатывает `push` и показывает системное уведомление с иконкой автомобиля.

## Проверка
1. Открыть `http://localhost:3001` в **двух** вкладках.
2. В одной нажать «Включить уведомления».
3. Во второй добавить задачу — в первой появится toast и системный push.
4. Свернуть браузер → добавить задачу из другой вкладки → push придёт на уровне ОС.
5. Кнопка «Отключить уведомления» удаляет подписку — push больше не приходит, но toast от WebSocket работает.
