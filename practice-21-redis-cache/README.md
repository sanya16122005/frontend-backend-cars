# Практика 21 — Кэширование с Redis

Доработка сервера из практики 11 (RBAC + JWT): для тяжёлых GET-маршрутов добавляется слой кэша **Redis**. Кэш инвалидируется при изменении сущностей.

## Кэшируемые маршруты
| Маршрут          | TTL     | Ключ кэша      |
|---|---|---|
| GET /api/users      | 1 мин   | `users:all`    |
| GET /api/users/:id  | 1 мин   | `users:<id>`   |
| GET /api/cars       | 10 мин  | `cars:all`     |
| GET /api/cars/:id   | 10 мин  | `cars:<id>`    |

При **POST / PUT / DELETE** для соответствующей сущности вызываются `invalidateUsersCache` / `invalidateCarsCache`, чтобы не отдавать устаревшие данные.

## Структура
```
practice-21-redis-cache/
└── server/
    ├── index.js
    └── package.json
```

## Запуск Redis
```bash
# Docker (быстро и без установки)
docker run -d --name redis-cars -p 6379:6379 redis:7-alpine

# или нативно (Linux/WSL)
sudo apt install -y redis-server
sudo systemctl start redis
```

## Запуск сервера
```bash
cd practice-21-redis-cache/server
npm install
npm start
```

`http://localhost:3000` — API. Подключение к Redis настраивается переменной `REDIS_URL` (по умолчанию `redis://127.0.0.1:6379`).

## Проверка
1. Зарегистрировать пользователя с ролью `admin`:
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"a@a","first_name":"A","last_name":"B","password":"123","role":"admin"}'
   ```
2. Войти и получить `accessToken`:
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" -d '{"email":"a@a","password":"123"}'
   ```
3. Первый запрос — `source: server`:
   ```bash
   curl http://localhost:3000/api/cars -H "Authorization: Bearer <token>"
   # → { "source": "server", "data": [...] }
   ```
4. Повторный запрос в течение 10 минут — `source: cache`:
   ```bash
   # → { "source": "cache", "data": [...] }
   ```
5. После `PUT /api/cars/:id` кэш сбрасывается → следующий GET снова идёт на сервер.

## Ответ всегда имеет вид
```json
{ "source": "server" | "cache", "data": ... }
```
Поле `source` позволяет видеть в DevTools, откуда пришёл ответ.
