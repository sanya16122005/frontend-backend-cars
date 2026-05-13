# ⭐ Практика 24 — Итоговый проект (КР4)

Собранное воедино приложение по итогам практик 19–23.

Все компоненты КР4 — PostgreSQL (19), Redis-кэш (21), балансировка Nginx (22) и Docker Compose (23) — объединены в один стек с авторизацией JWT и ролевой моделью (RBAC) из практики 11. Поднимается одной командой `docker compose up --build`.

> Подробное описание каждой технологии в отдельных практиках 19–23. Здесь — сборка.

---

## 🧱 Архитектура стека

```
                   client (browser / Postman)
                          │
                          ▼  http://localhost:8080
                  ┌───────────────┐
                  │ nginx:alpine  │     ← практика 22 (LB) + 23 (Docker)
                  └──────┬────────┘
                         │ Round Robin
            ┌────────────┼────────────┐
            ▼            ▼            ▼
       ┌─────────┐ ┌─────────┐ ┌─────────┐
       │ back-1  │ │ back-2  │ │ back-3  │   ← практика 11 (RBAC) + 19 (PG)
       │  :3000  │ │  :3000  │ │  :3000  │     + 21 (Redis cache)
       └────┬────┘ └────┬────┘ └────┬────┘
            └───────────┼───────────┘
                        │
              ┌─────────┴─────────┐
              ▼                   ▼
         ┌──────────┐        ┌─────────┐
         │ postgres │        │  redis  │   ← практика 19 + 21
         │   :5432  │        │  :6379  │
         └──────────┘        └─────────┘
                  ↑ pg-data (volume)
```

Только Nginx торчит наружу через `8080:80`. Backend-инстансы, PostgreSQL и Redis изолированы в bridge-сети `cars-net` и обращаются друг к другу по DNS-именам сервисов.

---

## 📁 Структура проекта

```
practice-24-kr4-final/
├── backend/
│   ├── Dockerfile                  # FROM node:18-alpine + кэширование слоёв
│   ├── .dockerignore
│   ├── package.json
│   └── src/
│       ├── server.js               # точка входа: Express, /health, /, монтаж роутов
│       ├── db.js                   # pg.Pool
│       ├── redis.js                # redis.createClient + cacheGet/cacheSet/cacheDel
│       ├── init-db.js              # CREATE TABLE users, cars + seed (5 авто + admin)
│       ├── auth.js                 # JWT access/refresh + authMiddleware + roleMiddleware
│       └── routes/
│           ├── auth.js             # register, login, refresh, me
│           ├── users.js            # CRUD (только admin) + Redis cache
│           └── cars.js             # CRUD (RBAC по ролям) + Redis cache
├── nginx/
│   └── nginx.conf                  # upstream → 3 backend, max_fails, backup
├── docker-compose.yml              # postgres + redis + 3 backend + nginx + init-db
└── README.md
```

---

## 🗂️ Модели данных

### Car (таблица `cars`)
| Поле | Тип | Описание |
|---|---|---|
| id          | `SERIAL PRIMARY KEY`     | автоинкремент |
| brand       | `VARCHAR(80) NOT NULL`   | производитель |
| model       | `VARCHAR(120) NOT NULL`  | модель |
| year        | `INTEGER` (CHECK 1900–2100) | год выпуска |
| price       | `NUMERIC(12,2)` (CHECK ≥0) | цена в ₽ |
| vin         | `VARCHAR(17) UNIQUE`     | VIN-номер |
| created_at  | `TIMESTAMPTZ DEFAULT NOW()` | создан |
| updated_at  | `TIMESTAMPTZ DEFAULT NOW()` | обновлён |

Индексы: `idx_cars_brand`, `idx_cars_year`.

### User (таблица `users`)
| Поле | Тип | Описание |
|---|---|---|
| id             | `VARCHAR(40) PRIMARY KEY` | nanoid |
| email          | `VARCHAR(120) UNIQUE`     | логин |
| first_name     | `VARCHAR(80)`             | имя |
| last_name      | `VARCHAR(80)`             | фамилия |
| password_hash  | `VARCHAR(120)`            | bcrypt-хеш |
| role           | `VARCHAR(20)`             | `user` / `seller` / `admin` |
| blocked        | `BOOLEAN`                 | мягкое удаление |
| created_at     | `TIMESTAMPTZ`             | создан |

---

## 🔐 API эндпоинты

| Метод | Путь | Роль | Описание | Статус |
|---|---|---|---|---|
| POST   | /api/auth/register | Все           | Регистрация (роль по желанию) | 201 / 400 / 409 |
| POST   | /api/auth/login    | Все           | Получение пары токенов        | 200 / 401 |
| POST   | /api/auth/refresh  | Все           | Обновление пары токенов       | 200 / 401 |
| GET    | /api/auth/me       | user+         | Текущий пользователь          | 200 / 401 |
| GET    | /api/cars          | user+         | Список авто (кэш 10 мин)      | 200 / 401 |
| GET    | /api/cars/:id      | user+         | Авто по id (кэш 10 мин)       | 200 / 401 / 404 |
| POST   | /api/cars          | seller, admin | Создать авто                  | 201 / 400 / 403 / 409 |
| PATCH  | /api/cars/:id      | seller, admin | Обновить авто                 | 200 / 403 / 404 |
| DELETE | /api/cars/:id      | admin         | Удалить авто                  | 204 / 403 / 404 |
| GET    | /api/users         | admin         | Список пользователей (кэш 1 мин) | 200 / 403 |
| GET    | /api/users/:id     | admin         | Пользователь по id (кэш 1 мин)   | 200 / 403 / 404 |
| PUT    | /api/users/:id     | admin         | Обновить пользователя         | 200 / 403 / 404 |
| DELETE | /api/users/:id     | admin         | Заблокировать                 | 200 / 403 / 404 |
| GET    | /health            | —             | Health-check для Nginx        | 200 |
| GET    | /                  | —             | Отладка (server, host, port)  | 200 |

GET-ответы для cars и users заворачиваются в:
```json
{ "source": "server" | "cache", "server": "cars-backend-2", "data": ... }
```
- `source` — пришли данные из Redis или из PostgreSQL.
- `server` — какой именно backend-инстанс ответил (видно балансировку).

---

## 🚀 Запуск

### Один шаг — Docker Compose
```bash
cd practice-24-kr4-final
docker compose up --build
```

Что произойдёт:
1. Поднимается `postgres:16-alpine` с томом `pg-data`.
2. Поднимается `redis:7-alpine`.
3. После `pg_isready` запускается одноразовый сервис **init-db** — создаёт таблицы `users`, `cars`, индексы и засеивает данные (5 автомобилей + admin).
4. После успешного init-db стартуют **три инстанса** cars-backend (одинаковый образ, разные `SERVER_ID`).
5. Поднимается **nginx**, начинает балансировать.

В логах будет:
```
init-db          | ✅ Таблицы users и cars готовы
init-db          | 👤 Создан admin: admin@cars.local / admin123
init-db          | 🚗 Засеяно 5 автомобилей
cars-backend-1   | ✅ [cars-backend-1] cars-backend on http://0.0.0.0:3000
cars-backend-2   | ✅ [cars-backend-2] cars-backend on http://0.0.0.0:3000
cars-backend-3   | ✅ [cars-backend-3] cars-backend on http://0.0.0.0:3000
nginx            | ...
```

### Демо-пользователь после init-db
| Email | Пароль | Роль |
|---|---|---|
| `admin@cars.local` | `admin123` | `admin` |

---

## 🧪 Сценарий приёмки

### 1. Балансировка
```bash
curl http://localhost:8080/
curl http://localhost:8080/
curl http://localhost:8080/
```
Поле `server` меняется: `cars-backend-1`, `cars-backend-2`, `cars-backend-1`, …

### 2. Авторизация admin'ом
```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cars.local","password":"admin123"}' | jq -r .accessToken)
```

### 3. Список авто (PostgreSQL → Redis cache)
```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/cars
# → { "source": "server", "server": "cars-backend-2", "data": [...5 cars...] }

curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/cars
# → { "source": "cache",  "server": "cars-backend-1", "data": [...] }
```

### 4. Создание авто (требует роль `seller` или `admin`)
```bash
curl -X POST http://localhost:8080/api/cars \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"brand":"Audi","model":"Q7","year":2024,"price":6800000}'
```
После этого следующий `GET /api/cars` снова вернёт `source: "server"` — кэш инвалидирован.

### 5. RBAC — user-роль не может удалять
```bash
# Создаём обычного пользователя
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"u@u","first_name":"U","last_name":"U","password":"u","role":"user"}'

# Логинимся под ним
USER_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"u@u","password":"u"}' | jq -r .accessToken)

# Пробуем удалить — 403 Forbidden
curl -i -X DELETE http://localhost:8080/api/cars/1 \
  -H "Authorization: Bearer $USER_TOKEN"
# HTTP/1.1 403 Forbidden
```

### 6. Отказоустойчивость
```bash
# Останавливаем один backend
docker compose stop cars-backend-1

# Запросы идут на оставшиеся, нет ошибок
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/cars
# server: cars-backend-2 или cars-backend-3 (backup)

# Поднимаем обратно
docker compose start cars-backend-1
```

---

## 🧰 Полезные команды

```bash
docker compose ps                            # все сервисы
docker compose logs -f cars-backend-1        # логи одного инстанса
docker compose exec postgres psql -U postgres -d cars_db -c "SELECT * FROM cars;"
docker compose exec redis    redis-cli       # → KEYS *  → GET cars:all

docker compose down                          # остановить
docker compose down -v                       # + удалить тома (сброс БД)
```

---

## ✅ Чек-лист сборки КР4

- [x] **PostgreSQL** — таблицы `users`, `cars`, индексы, `CHECK`-ограничения, `UNIQUE vin` (практика 19).
- [x] **Redis** — кэш TTL 10 мин для cars, 1 мин для users, инвалидация при изменении (практика 21).
- [x] **RBAC** — три роли `user` / `seller` / `admin`, JWT access+refresh, `authMiddleware` + `roleMiddleware` (практика 11).
- [x] **Балансировка Nginx** — Round Robin по 3 backend-инстансам, `max_fails`/`fail_timeout`, `backup` (практика 22).
- [x] **Docker Compose** — единый стек, изолированная сеть `cars-net`, проброс портов только у балансировщика (практика 23).
- [x] **Seed** — admin + 5 автомобилей создаются автоматически через сервис `init-db`.
- [x] **Health-check** — `/health` + healthcheck postgres/redis, корректный порядок старта через `depends_on: condition`.
