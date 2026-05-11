# Практика 17 — Детализация Push (напоминания)

Расширяем приложение из практики 16: добавляем **запланированные push-напоминания** и действие **«Отложить на 5 минут»** прямо в системном уведомлении.

## Что добавлено
- Форма «Задача с напоминанием»: текст + `datetime-local`.
- На клиенте задача сохраняется в `localStorage` с полями `id` и `reminder` (timestamp).
- Клиент эмитит `newReminder` через Socket.IO — сервер планирует push через `setTimeout`.
- В push-уведомлении кнопка **«Отложить на 5 минут»** — Service Worker ловит `notificationclick` с `action === 'snooze'` и шлёт `POST /snooze?reminderId=…`.
- Сервер очищает старый таймер и заводит новый на +5 минут.

## Структура
```
practice-17-push-reminders/
├── content/{home,about}.html
├── icons/
├── index.html
├── app.js                # клиент + Socket.IO + push
├── sw.js                 # SW с push + notificationclick(snooze)
├── manifest.json
├── style.css
├── server.js             # Express + Socket.IO + web-push + Map<id, timer>
└── package.json
```

## Серверные эндпоинты
| Метод | Путь | Описание |
|---|---|---|
| GET  | `/api/vapid-public-key` | Публичный VAPID-ключ |
| POST | `/subscribe`            | Сохранить push-подписку |
| POST | `/unsubscribe`          | Удалить подписку |
| POST | `/snooze?reminderId=…`  | Отложить напоминание на 5 минут |
| GET  | `/reminders`            | Список активных напоминаний (отладка) |

## Запуск
```bash
cd practice-17-push-reminders
npm install
npx web-push generate-vapid-keys     # подставить ключи в server.js
npm start
```

`http://localhost:3001`

## Проверка
1. Разрешить уведомления.
2. Создать задачу с напоминанием на **2–3 минуты** вперёд.
3. Закрыть/свернуть вкладку.
4. В нужное время приходит push с кнопкой «⏸ Отложить на 5 минут».
5. Нажать кнопку → через 5 минут уведомление повторится.
