# ⭐ Практика 24 — Итоговый проект (КР4)

Объединение всех четырёх контрольных работ в один работающий проект:

| КР | Что взято |
|---|---|
| **КР1** | React-клиент, тёмная тема на **Sass/SCSS**, **Swagger**-документация API, единый CRUD автомобилей |
| **КР2** | **JWT** access+refresh, **RBAC** (`user` / `seller` / `admin`), axios interceptors с автообновлением токена |
| **КР3** | **PWA**: manifest + Service Worker + установка на устройство, **Socket.IO** для real-time уведомлений между вкладками, **Web Push** для системных уведомлений |
| **КР4** | **PostgreSQL** для данных, **Redis** для кэша GET-запросов и общего хранилища push-подписок, **Socket.IO Redis adapter** для синхронизации событий между инстансами, **Nginx** балансирует **3 backend-контейнера**, всё в **Docker Compose** |

Поднимается **одной командой**: `docker compose up --build`.

---

## 🏗️ Архитектура

```
                          🌐 client (browser)
                                 │
                                 ▼  http://localhost:8080
                       ┌───────────────────┐
                       │  nginx:alpine     │
                       │  + React SPA      │  ← собранный фронт лежит внутри образа
                       └────────┬──────────┘
                                │
            ┌───────────────────┼────────────────────┐
            │                   │                    │
   /api/* + /api-docs   /socket.io/* (WS)           /, /assets/*, /sw.js
   (Round Robin)        (sticky-less, Redis pub/sub)  (статика SPA)
            │                   │
            └─────┬─────────────┘
                  ▼
   ┌──────────────────────────────────────┐
   │        upstream cars_backend         │
   │  cars-backend-1 (active)             │
   │  cars-backend-2 (active)             │
   │  cars-backend-3 (backup)             │
   └────────────┬─────────────────────────┘
                │ pg + redis (по DNS)
       ┌────────┴────────┐
       ▼                 ▼
  ┌─────────┐      ┌──────────────────┐
  │postgres │      │      redis       │
  │  :5432  │      │      :6379       │
  └─────────┘      ├──────────────────┤
                   │ • cache (cars/users) │
                   │ • push:subscriptions │
                   │ • socket.io adapter  │
                   └──────────────────┘
```

Снаружи доступен **только Nginx** через `8080:80`. PostgreSQL, Redis и все backend-инстансы изолированы в bridge-сети `cars-net` и общаются по DNS-именам сервисов.

---

## 📁 Структура

```text
practice-24-kr4-final/
│
├── frontend/                       # React + Vite + Sass + PWA
│   ├── Dockerfile                  # multi-stage: build → nginx со встроенной статикой
│   ├── package.json
│   ├── vite.config.js              # dev-proxy /api и /socket.io
│   ├── index.html                  # подключает manifest, иконки, тему
│   ├── public/
│   │   ├── manifest.json           # PWA-манифест
│   │   ├── sw.js                   # Service Worker: Cache First + push handler
│   │   └── icons/                  # 16/32/180/192/512
│   └── src/
│       ├── main.jsx                # регистрация SW + рендер App
│       ├── App.jsx                 # роутер + header + Socket.IO
│       ├── styles/
│       │   ├── _variables.scss
│       │   ├── _mixins.scss
│       │   └── main.scss           # тёмная тема, кнопки, формы, карточки
│       ├── api/
│       │   └── client.js           # axios + interceptors (auto-refresh)
│       ├── hooks/
│       │   ├── useAuth.js          # login / register / logout / hasRole
│       │   └── useToasts.js        # тосты + ToastHost
│       ├── pages/
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── CarsPage.jsx        # каталог + ролевые кнопки + индикатор cache/server
│       │   └── UsersPage.jsx       # таблица пользователей (admin)
│       └── components/
│           ├── PrivateRoute.jsx    # защита роутов + проверка роли
│           ├── CarItem.jsx
│           ├── CarModal.jsx
│           └── PushToggle.jsx      # кнопка подписки на push
│
├── backend/                        # Express + JWT + RBAC + PG + Redis + Socket.IO + Swagger
│   ├── Dockerfile                  # node:18-alpine + кэш слоёв
│   ├── package.json
│   └── src/
│       ├── server.js               # точка входа: HTTP + Socket.IO + Redis adapter
│       ├── db.js                   # pg.Pool
│       ├── redis.js                # main + pub + sub clients, кэш + хранилище подписок
│       ├── init-db.js              # CREATE TABLE users/cars + seed (admin + 5 авто)
│       ├── auth.js                 # JWT access/refresh + middleware
│       ├── push.js                 # web-push setVapidDetails + sendPushToAll
│       ├── swagger.js              # OpenAPI 3.0 spec через swagger-jsdoc
│       └── routes/
│           ├── auth.js             # register / login / refresh / me + Swagger
│           ├── users.js            # CRUD admin-only + Redis cache + Swagger
│           ├── cars.js             # CRUD по RBAC + cache + io.emit + push + Swagger
│           └── push.js             # vapid-public-key / subscribe / unsubscribe
│
├── nginx/
│   └── nginx.conf                  # / → SPA, /api → backend, /socket.io → WS upgrade, /api-docs → Swagger
│
├── docker-compose.yml              # postgres + redis + init-db + 3 backend + frontend (nginx)
├── .env.example                    # VAPID_PUBLIC / VAPID_PRIVATE
└── README.md                       # этот файл
```

---

## 🧰 Стек технологий

### Frontend (КР1+КР2+КР3)
- **React 18** — UI, хуки, функциональные компоненты
- **Vite 5** — dev-сервер с HMR, production-сборка через Rollup
- **react-router-dom** — клиентский роутинг + `PrivateRoute` с проверкой роли
- **axios** — HTTP-клиент с interceptors:
  - request: подставляет `Authorization: Bearer <accessToken>`
  - response: при `401` дёргает `/api/auth/refresh`, обновляет пару, повторяет запрос
- **socket.io-client** — real-time toast'ы между вкладками
- **Sass/SCSS** — переменные, миксины, тёмная тема (`#0b0f19`, accent `#818cf8`)
- **PWA**:
  - `manifest.json` — установка на устройство
  - `sw.js` — Cache First для статики, обработка `push` и `notificationclick`
  - `PushManager.subscribe` + кнопка «🔔 Уведомления»

### Backend (КР1+КР3+КР4)
- **Express 4** + **cors** + **express.json**
- **bcrypt** — хеш паролей (saltRounds = 10)
- **jsonwebtoken** — `accessToken` (15 мин), `refreshToken` (7 дней)
- **nanoid** — id пользователей
- **pg** — параметризованные запросы к PostgreSQL, пул соединений
- **redis** + **@socket.io/redis-adapter** — кэш + хранилище подписок + pub/sub для синхронизации Socket.IO между инстансами
- **socket.io** — события `carCreated` / `carUpdated` / `carDeleted`
- **web-push** — отправка push-уведомлений через VAPID
- **swagger-jsdoc** + **swagger-ui-express** — документация API из JSDoc-комментариев → `/api-docs`

### Инфраструктура (КР4)
- **PostgreSQL 16** (alpine) с healthcheck `pg_isready`, том `pg-data`
- **Redis 7** (alpine) с healthcheck `redis-cli ping`
- **3 идентичных backend-контейнера** — одинаковый образ, разные `SERVER_ID`
- **Nginx alpine**:
  - отдаёт SPA из `/usr/share/nginx/html`
  - `/api/*` → `upstream cars_backend` (Round Robin, `max_fails=2 fail_timeout=30s`, `backup`)
  - `/socket.io/*` → тот же upstream с upgrade-заголовками для WebSocket
  - `/api-docs` → backend (Swagger UI)
  - `/sw.js`, `/manifest.json` — `Cache-Control: no-store`
  - `try_files $uri $uri/ /index.html` — SPA fallback
- **Docker Compose**: `depends_on: condition: service_healthy / service_completed_successfully` — корректный порядок старта

---

## 🗂️ Модели данных

### Car (таблица `cars`)
| Поле | Тип | Описание |
|---|---|---|
| id          | `SERIAL PK`                  | автоинкремент |
| brand       | `VARCHAR(80) NOT NULL`       | производитель |
| model       | `VARCHAR(120) NOT NULL`      | модель |
| year        | `INTEGER` (CHECK 1900–2100)  | год выпуска |
| price       | `NUMERIC(12,2)` (CHECK ≥ 0)  | цена ₽ |
| vin         | `VARCHAR(17) UNIQUE`         | VIN |
| created_at  | `TIMESTAMPTZ DEFAULT NOW()`  | создан |
| updated_at  | `TIMESTAMPTZ DEFAULT NOW()`  | обновлён |

Индексы: `idx_cars_brand`, `idx_cars_year`.

### User (таблица `users`)
| Поле | Тип | Описание |
|---|---|---|
| id            | `VARCHAR(40) PK` | nanoid |
| email         | `VARCHAR(120) UNIQUE` | логин |
| first_name    | `VARCHAR(80)`    | имя |
| last_name     | `VARCHAR(80)`    | фамилия |
| password_hash | `VARCHAR(120)`   | bcrypt |
| role          | `VARCHAR(20)`    | `user` / `seller` / `admin` |
| blocked       | `BOOLEAN`        | мягкое удаление |
| created_at    | `TIMESTAMPTZ`    | создан |

---

## 🔐 Полная таблица доступа

| Метод | Путь | Роль | Кэш | Real-time | Push |
|---|---|---|---|---|---|
| POST   | /api/auth/register | Все           | — | — | — |
| POST   | /api/auth/login    | Все           | — | — | — |
| POST   | /api/auth/refresh  | Все           | — | — | — |
| GET    | /api/auth/me       | user+         | — | — | — |
| GET    | /api/cars          | user+         | **10 мин** | — | — |
| GET    | /api/cars/:id      | user+         | **10 мин** | — | — |
| POST   | /api/cars          | seller, admin | invalidate | `carCreated` | ✅ |
| PATCH  | /api/cars/:id      | seller, admin | invalidate | `carUpdated` | — |
| DELETE | /api/cars/:id      | admin         | invalidate | `carDeleted` | — |
| GET    | /api/users         | admin         | **1 мин**  | — | — |
| GET    | /api/users/:id     | admin         | **1 мин**  | — | — |
| PUT    | /api/users/:id     | admin         | invalidate | — | — |
| DELETE | /api/users/:id     | admin         | invalidate | — | — |
| GET    | /api/push/vapid-public-key | — | — | — | — |
| POST   | /api/push/subscribe        | — | — | — | — |
| POST   | /api/push/unsubscribe      | — | — | — | — |
| GET    | /api-docs                  | — | — | — | — |
| GET    | /health                    | — | — | — | — |

GET cars/users возвращают:
```json
{
  "source": "cache" | "server",
  "server": "cars-backend-2",
  "data": [ ... ]
}
```

---

## 🚀 Запуск

```bash
cd practice-24-kr4-final
docker compose up --build
```

Что произойдёт автоматически:
1. Поднимаются `postgres:16-alpine` и `redis:7-alpine`, оба с healthcheck.
2. После `pg_isready` запускается одноразовый сервис `init-db` — создаёт таблицы `users`, `cars`, индексы и засевает данные:
   - админ: `admin@cars.local` / `admin123`
   - 5 автомобилей (Toyota Camry, Kia Sportage, Lada Vesta, BMW X5, Hyundai Solaris)
3. После успешного init-db стартуют **три** инстанса `cars-backend-1/2/3` — одинаковый образ, разные `SERVER_ID`, общий Redis-адаптер для Socket.IO.
4. Поднимается `frontend` (Nginx с встроенным React-build'ом), начинает проксировать `/api`, `/api-docs`, `/socket.io` на upstream и отдавать SPA на `/`.

После старта в логах будет:
```
init-db          | ✅ Таблицы users и cars готовы
init-db          | 👤 Создан admin: admin@cars.local / admin123
init-db          | 🚗 Засеяно 5 автомобилей
cars-backend-1   | ✅ [cars-backend-1] cars-backend on http://0.0.0.0:3000 (docs: /api-docs)
cars-backend-2   | ✅ [cars-backend-2] cars-backend on http://0.0.0.0:3000 (docs: /api-docs)
cars-backend-3   | ✅ [cars-backend-3] cars-backend on http://0.0.0.0:3000 (docs: /api-docs)
frontend         | ...
```

Открыть **http://localhost:8080**.

### VAPID-ключи (опционально, для push)
По умолчанию используются демо-ключи. Чтобы push реально работал, сгенерируйте свои:
```bash
docker compose run --rm cars-backend-1 npx web-push generate-vapid-keys
```
Положите вывод в `.env`:
```
VAPID_PUBLIC=B...
VAPID_PRIVATE=...
```
Перезапустите: `docker compose up --build`.

---

## 🧪 Тестовый аккаунт (создаётся автоматически)

| Email | Пароль | Роль |
|---|---|---|
| `admin@cars.local` | `admin123` | `admin` |

Демо-учётка уже подставлена в форму входа.

---

## 🌐 Что доступно после `docker compose up`

| URL | Описание |
|---|---|
| `http://localhost:8080/`             | React SPA — каталог авто, авторизация, админка |
| `http://localhost:8080/login`        | Страница входа |
| `http://localhost:8080/register`     | Регистрация (можно выбрать роль) |
| `http://localhost:8080/cars`         | Каталог автомобилей (auth required) |
| `http://localhost:8080/users`        | Управление пользователями (admin only) |
| `http://localhost:8080/api/...`      | REST API через балансировщик |
| `http://localhost:8080/api-docs`     | **Swagger UI** — интерактивная документация всех эндпоинтов |
| `http://localhost:8080/sw.js`        | Service Worker |
| `http://localhost:8080/manifest.json`| PWA-манифест |

---

## 🔍 Как увидеть, что всё работает вместе

После входа под admin'ом откройте каталог. В правом верхнем углу карточки видно индикатор:
```
⚡ Redis cache · cars-backend-2     ← данные из Redis, отдал backend-2
🗄️ PostgreSQL · cars-backend-1     ← данные из PG, отдал backend-1
```

При повторном нажатии «↻ Обновить» индикатор переключается между `cache` ↔ `server` и между `cars-backend-1/2/3` — это видна и **балансировка Nginx**, и **кэширование Redis** одновременно.

При создании авто (только для seller / admin):
1. Бэкенд кладёт запись в PostgreSQL.
2. Сбрасывает кэш `cars:all` в Redis.
3. Эмитит `io.emit('carCreated', car)` — событие через **Redis-адаптер** прилетает во все три инстанса.
4. Каждый инстанс рассылает событие своим подключённым клиентам → во **всех открытых вкладках** (включая другие браузеры) появляется toast «🆕 Добавлено: BMW X5».
5. Бэкенд отправляет **web-push** всем подписанным клиентам — приходит системное уведомление, **даже если вкладка закрыта**.

---

## 🧯 Сценарий приёмки

```bash
# 1. Балансировка
curl http://localhost:8080/api/cars   # повторить — server чередуется

# 2. Логин
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cars.local","password":"admin123"}' | jq -r .accessToken)

# 3. Кэш
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/cars
# → { "source": "server", "server": "cars-backend-2", "data": [...] }
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/cars
# → { "source": "cache",  "server": "cars-backend-1", "data": [...] }

# 4. RBAC (user не может удалять)
USER_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"u@u","first_name":"U","last_name":"U","password":"u","role":"user"}' \
  | jq -r .id && curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"u@u","password":"u"}' | jq -r .accessToken)

curl -i -X DELETE http://localhost:8080/api/cars/1 -H "Authorization: Bearer $USER_TOKEN"
# HTTP/1.1 403 Forbidden

# 5. Отказоустойчивость
docker compose stop cars-backend-1
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/cars
# server: cars-backend-2 — после 2 фейлов Nginx исключает упавший на 30 сек

# 6. Swagger
# http://localhost:8080/api-docs — попробуйте Try it out

# 7. Real-time
# Открыть две вкладки http://localhost:8080
# В одной создать авто — во второй появляется toast мгновенно

# 8. Push
# Войти, нажать «🔔 Уведомления», разрешить
# Свернуть браузер
# Из другой вкладки/PG/curl создать авто
# → системное push-уведомление приходит, даже если PWA закрыта
```

---

## ✅ Чек-лист итогового проекта

- [x] React-клиент с роутером, тёмной темой на SCSS, модалкой и ролевыми кнопками — из **КР1**
- [x] Express API с CRUD автомобилей и пользователей, **Swagger** на `/api-docs` — из **КР1**
- [x] **JWT** access+refresh, **RBAC** на сервере и клиенте, axios interceptors — из **КР2**
- [x] **PWA**: manifest, иконки, Service Worker, установка на устройство — из **КР3**
- [x] **Socket.IO** real-time события + **Web Push** уведомления — из **КР3**
- [x] Данные хранятся в **PostgreSQL**, GET-маршруты кэшируются в **Redis** — из **КР4**
- [x] Push-подписки и Socket.IO события синхронизируются между **3 backend-инстансами** через Redis adapter — из **КР4**
- [x] **Nginx** балансирует трафик и проксирует WebSocket — из **КР4**
- [x] Всё в **Docker Compose**, наружу торчит только Nginx, изоляция в bridge-сети — из **КР4**
- [x] Автоматический seed (admin + 5 авто) при первом запуске
