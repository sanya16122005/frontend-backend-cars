# ⭐ Контрольная работа №4 — Серверная инфраструктура для cars-backend (практики 19–24)

Итоговый отчёт по КР4. Цель блока — построить полноценную серверную инфраструктуру для каталога автомобилей: реляционная и документоориентированная БД, кэширование с инвалидацией, балансировка нагрузки и контейнеризация всего стека.

---

## 🗺️ Эволюция стека

```
19. PostgreSQL CRUD       ─┐
                           │
20. MongoDB CRUD          ─┤   ← два варианта персистентного хранилища
                           │
21. RBAC + Redis cache    ─┤   ← кэш поверх API из практики 11
                           │
22. Nginx + HAProxy       ─┤   ← балансировка трёх backend-инстансов
                           │
23. Docker Compose        ─┘   ← всё то же, но в контейнерах
                  ↓
24. Сборка КР4
```

Везде используется единая сущность **Car** (`brand`, `model`, `year`, `price`, `vin`, `created_at`, `updated_at`), чтобы сравнить подходы и связать практики между собой.

---

## 📁 Структура блока

```text
practice-19-postgres/         # Express + pg + PostgreSQL
practice-20-mongodb/          # Express + mongoose + MongoDB
practice-21-redis-cache/      # RBAC + JWT + Redis (TTL, инвалидация)
practice-22-load-balancing/   # Nginx + HAProxy + 3 backend-инстанса
practice-23-docker/           # Docker Compose: 3 backend + Nginx
practice-24-kr4-final/        # Этот README
```

---

# ✅ Практика 19 — PostgreSQL

## Цель
Реализовать REST API для управления автомобилями на **Express + pg**, данные хранить в реляционной СУБД **PostgreSQL**. Использовать параметризованные запросы, проверки целостности (`CHECK`, `UNIQUE`), индексы.

## Теория

### Что такое реляционная СУБД?
Реляционная СУБД хранит данные в **таблицах** с фиксированной схемой: каждая колонка имеет тип, могут быть индексы и ограничения целостности. Между таблицами — связи (`FOREIGN KEY`). Стандарт запросов — **SQL**.

PostgreSQL — мощная open-source РСУБД с поддержкой транзакций, индексов, оконных функций, JSON-полей, расширений (например, `PostGIS`).

### Драйвер `pg` и пул соединений
```js
const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres', host: 'localhost',
  database: 'cars_db', password: 'postgres', port: 5432
});

// Параметризованный запрос — защита от SQL-инъекций
const { rows } = await pool.query('SELECT * FROM cars WHERE id = $1', [carId]);
```

Параметры передаются через `$1, $2, …` — драйвер сам экранирует значения, не подставляя их в строку SQL.

## Что реализовано

### Структура
```text
practice-19-postgres/
├── src/
│   ├── db.js           ← создаёт pg.Pool
│   ├── init-db.js      ← CREATE TABLE + индексы
│   └── server.js       ← CRUD-маршруты
├── .env.example
└── package.json
```

### Модель данных (Car)
| Поле | Тип | Описание |
|---|---|---|
| `id`         | SERIAL PRIMARY KEY    | автоинкремент |
| `brand`      | VARCHAR(80) NOT NULL  | производитель (Toyota, BMW, …) |
| `model`      | VARCHAR(120) NOT NULL | модель (Camry, X5, …) |
| `year`       | INTEGER, CHECK 1900–2100 | год выпуска |
| `price`      | NUMERIC(12,2), CHECK ≥ 0 | цена в ₽ |
| `vin`        | VARCHAR(17) UNIQUE    | VIN-номер (опционально) |
| `created_at` | TIMESTAMPTZ DEFAULT NOW() | время создания |
| `updated_at` | TIMESTAMPTZ DEFAULT NOW() | время изменения |

Индексы: `idx_cars_brand`, `idx_cars_year` — ускоряют поиск по типичным фильтрам.

### SQL-скрипт инициализации (`init-db.js`)
```sql
CREATE TABLE IF NOT EXISTS cars (
  id          SERIAL PRIMARY KEY,
  brand       VARCHAR(80)   NOT NULL,
  model       VARCHAR(120)  NOT NULL,
  year        INTEGER       NOT NULL CHECK (year BETWEEN 1900 AND 2100),
  price       NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  vin         VARCHAR(17)   UNIQUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cars_brand ON cars(brand);
CREATE INDEX IF NOT EXISTS idx_cars_year  ON cars(year);
```

### API эндпоинты
| Метод | Путь | Описание | Статус |
|---|---|---|---|
| GET    | /api/cars       | Все автомобили      | 200 |
| GET    | /api/cars/:id   | Авто по id          | 200 / 404 |
| POST   | /api/cars       | Создать             | 201 / 400 / 409 (VIN уник.) |
| PATCH  | /api/cars/:id   | Обновить (любые поля) | 200 / 400 / 404 |
| DELETE | /api/cars/:id   | Удалить             | 204 / 404 |

### Пример PATCH с динамическим SET
```js
const fields  = ['brand','model','year','price','vin'];
const updates = [];
const values  = [];
let idx = 1;

for (const f of fields) {
  if (req.body[f] !== undefined) {
    updates.push(`${f} = $${idx++}`);
    values.push(req.body[f]);
  }
}
updates.push(`updated_at = NOW()`);
values.push(req.params.id);

const { rows } = await pool.query(
  `UPDATE cars SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
  values
);
```

### Обработка ошибки уникальности
```js
if (e.code === '23505') return res.status(409).json({ error: 'VIN уже существует' });
```

## Как запустить
```bash
# 1. Установите PostgreSQL и создайте БД
psql -U postgres -c "CREATE DATABASE cars_db;"

# 2. Зависимости
cd practice-19-postgres
npm install

# 3. Инициализация таблицы
npm run init-db        # → ✅ Таблица cars готова

# 4. Сервер
npm start              # → Cars PG API запущен на http://localhost:3000
```

Переменные подключения переопределяются через окружение (`PGUSER`, `PGPASSWORD`, `PGHOST`, `PGPORT`, `PGDATABASE`).

## Примеры запросов
```bash
curl -X POST http://localhost:3000/api/cars \
  -H "Content-Type: application/json" \
  -d '{"brand":"BMW","model":"X5","year":2022,"price":75000,"vin":"WBA12345678901234"}'

curl http://localhost:3000/api/cars

curl -X PATCH http://localhost:3000/api/cars/1 \
  -H "Content-Type: application/json" \
  -d '{"price":72000}'

curl -X DELETE http://localhost:3000/api/cars/1
```

---

# ✅ Практика 20 — MongoDB

## Цель
Тот же CRUD-API автомобилей, но на **MongoDB** через ODM **mongoose**. Сравнить подход с РСУБД: гибкая схема, документы вместо строк, агрегации через pipeline.

## Теория

### NoSQL и MongoDB
**NoSQL** — класс хранилищ без жёсткой схемы. MongoDB — документоориентированная: хранит **документы** (BSON ≈ бинарный JSON) в **коллекциях**. Документы могут иметь разные поля, вложенные структуры, массивы.

### Mongoose: схемы и модели
```js
const carSchema = new mongoose.Schema({
  brand: { type: String, required: true },
  year:  { type: Number, min: 1900, max: 2100 }
}, { timestamps: true });

const Car = mongoose.model('Car', carSchema);
```

`mongoose.Schema` + `mongoose.model` дают «строгую» схему поверх MongoDB: валидация, индексы, типы, виртуальные поля, методы. `timestamps: true` автоматически добавляет `createdAt` и `updatedAt`.

### Pipeline-агрегация
```js
Car.aggregate([
  { $group: { _id: '$brand', avgPrice: { $avg: '$price' }, count: { $sum: 1 } } },
  { $sort:  { avgPrice: -1 } }
]);
```
Запрос проходит по стадиям (`$group`, `$sort`, `$match` и т. д.) и возвращает агрегированные данные.

## Что реализовано

### Структура
```text
practice-20-mongodb/
├── src/
│   ├── models/Car.js    ← mongoose-схема
│   └── server.js        ← CRUD + агрегация
└── package.json
```

### Модель данных (Car)
| Поле | Тип | Описание |
|---|---|---|
| `_id`        | ObjectId | автоматический |
| `brand`      | String, required, index | производитель |
| `model`      | String, required        | модель |
| `year`       | Number, 1900–2100, index | год выпуска |
| `price`      | Number ≥ 0              | цена в ₽ |
| `vin`        | String, **unique sparse** | VIN-номер (опц.) |
| `createdAt`  | Date — автоматически    | timestamps |
| `updatedAt`  | Date — автоматически    | timestamps |

> **unique sparse** позволяет нескольким документам не иметь VIN (`null`), но если он есть — он уникален.

### API эндпоинты
| Метод | Путь | Описание | Статус |
|---|---|---|---|
| GET    | /api/cars                       | Все автомобили      | 200 |
| GET    | /api/cars/:id                   | Авто по id          | 200 / 400 / 404 |
| POST   | /api/cars                       | Создать             | 201 / 400 / 409 |
| PATCH  | /api/cars/:id                   | Обновить            | 200 / 400 / 404 |
| DELETE | /api/cars/:id                   | Удалить             | 204 / 404 |
| GET    | /api/cars-stats/avg-price       | Бонус: средняя цена по бренду | 200 |

### Пример агрегации
```js
GET /api/cars-stats/avg-price
→ 200 OK
[
  { "_id": "BMW",    "avgPrice": 7500000, "count": 2 },
  { "_id": "Audi",   "avgPrice": 4200000, "count": 1 },
  { "_id": "Toyota", "avgPrice": 2500000, "count": 3 }
]
```

### Обработка ошибок
| Ситуация | Код | Тело ответа |
|---|---|---|
| Некорректный `id`           | 400 | `{ "error": "Некорректный id" }` (Mongoose CastError) |
| Дубликат `vin`              | 409 | `{ "error": "VIN уже существует" }` (E11000) |
| Не найдено                  | 404 | `{ "error": "Автомобиль не найден" }` |

## Как запустить
```bash
# Linux:
sudo systemctl start mongod

# Windows (Docker):
docker run -d -p 27017:27017 --name mongo mongo:7

cd practice-20-mongodb
npm install
npm start                 # → http://localhost:3000
```

Подключение настраивается через `MONGO_URL` (по умолчанию `mongodb://localhost:27017/cars_db`).

## Сравнение с PostgreSQL (практика 19)
| Аспект | PostgreSQL (19) | MongoDB (20) |
|---|---|---|
| Схема | Жёсткая (CREATE TABLE) | Гибкая (определяется в коде) |
| Запросы | SQL | Mongoose API + JS-объекты |
| Уникальность | `UNIQUE` ограничение | `unique: true` (+ sparse) |
| Связи | `FOREIGN KEY` | Ссылки (`ref`) или вложенные документы |
| Транзакции | Из коробки | С реплика-сетом |
| Агрегации | GROUP BY, оконные функции | Pipeline (`$group`, `$lookup`, …) |

---

# ✅ Практика 21 — Redis-кэш

## Цель
Добавить слой **кэша Redis** поверх сервера из практики 11 (RBAC + JWT). Часто запрашиваемые данные (списки пользователей, список автомобилей) отдавать из памяти Redis, а не пересчитывать каждый раз. Обеспечить **инвалидацию** кэша при изменении данных.

## Теория

### Что такое Redis?
**Redis** — in-memory хранилище key-value, обычно используется как кэш, брокер сессий, очередь. Очень быстрый (десятки тысяч операций в секунду), поддерживает TTL для ключей.

```bash
SET   users:all  "{...}"  EX 60        # сохранить на 60 секунд
GET   users:all                        # прочитать
DEL   users:all                        # удалить
```

### Схема работы кэша
```
запрос → есть в Redis по ключу X? → да → отдать клиенту с пометкой source: cache
                                   → нет → достать из источника
                                          → положить в Redis с TTL
                                          → отдать клиенту с source: server
```

### Инвалидация
При изменении данных (POST/PUT/DELETE) кэш по соответствующему ключу удаляется, чтобы клиент не получил устаревший ответ:
```js
async function invalidateCarsCache(id) {
  await redis.del('cars:all');
  if (id) await redis.del(`cars:${id}`);
}
```

## Что реализовано

### Архитектура middleware
```js
function cacheMiddleware(keyBuilder, ttl) {
  return async (req, res, next) => {
    const key = keyBuilder(req);
    const cached = await redis.get(key);
    if (cached) return res.json({ source: 'cache', data: JSON.parse(cached) });

    req.cacheKey = key;
    req.cacheTTL = ttl;
    next();    // handler сам положит результат в Redis через saveToCache
  };
}
```

Каждый GET-обработчик после получения данных вызывает `saveToCache(req.cacheKey, data, req.cacheTTL)`.

### Кэшируемые маршруты
| Маршрут | TTL | Ключ Redis | Инвалидация при |
|---|---|---|---|
| GET /api/users     | 1 мин  | `users:all`  | POST/PUT/DELETE /api/users… |
| GET /api/users/:id | 1 мин  | `users:<id>` | PUT/DELETE того же id |
| GET /api/cars      | 10 мин | `cars:all`   | POST/PUT/DELETE /api/cars… |
| GET /api/cars/:id  | 10 мин | `cars:<id>`  | PUT/DELETE того же id |

### Структура ответа
```json
{
  "source": "cache",          // или "server"
  "data": [ {...}, {...} ]
}
```
Поле `source` нужно для отладки — видно, откуда пришли данные.

### Полная цепочка GET /api/cars
```js
app.get('/api/cars',
  authMiddleware,                                    // 1) проверяем JWT
  roleMiddleware(['user','seller','admin']),         // 2) проверяем роль
  cacheMiddleware(() => 'cars:all', PRODUCTS_TTL),   // 3) пытаемся отдать из Redis
  async (req, res) => {                              // 4) если нет — собираем из источника
    await saveToCache(req.cacheKey, cars, req.cacheTTL);
    res.json({ source: 'server', data: cars });
  }
);
```

## Как запустить
```bash
# Redis (через Docker)
docker run -d --name redis-cars -p 6379:6379 redis:7-alpine

# Сервер
cd practice-21-redis-cache/server
npm install
npm start                        # → http://localhost:3000
```

`REDIS_URL` по умолчанию `redis://127.0.0.1:6379`.

## Как проверить
1. Зарегистрировать админа и войти, получить `accessToken`.
2. Первый GET — `source: server`:
   ```bash
   curl http://localhost:3000/api/cars -H "Authorization: Bearer <token>"
   # → { "source": "server", "data": [...] }
   ```
3. Повторный GET в течение 10 минут — `source: cache`.
4. После `PUT /api/cars/:id` — следующий GET снова `source: server` (инвалидация сработала).

---

# ✅ Практика 22 — Балансировка нагрузки (Nginx + HAProxy)

## Цель
Запустить **три идентичных backend-инстанса** cars-API на разных портах и распределить нагрузку между ними. Сделать это двумя разными балансировщиками — **Nginx** и **HAProxy** — и проверить отказоустойчивость.

## Теория

### Зачем балансировка
- Производительность — нагрузка распределяется между несколькими процессами.
- Отказоустойчивость — если один инстанс упал, остальные продолжают работать.
- Горизонтальное масштабирование — можно добавить ещё один инстанс без изменения клиента.

### Алгоритмы Nginx
- **Round Robin** (по умолчанию) — запросы по кругу.
- **Least Connections** — на инстанс с минимумом активных соединений.
- **IP Hash** — клиент с одним IP всегда попадает на один и тот же инстанс (sticky session).

### Отказоустойчивость в Nginx
```nginx
upstream cars_backend {
    server 127.0.0.1:3001 max_fails=2 fail_timeout=30s;
    server 127.0.0.1:3002 max_fails=2 fail_timeout=30s;
    server 127.0.0.1:3003 backup;
}
```
- `max_fails=2 fail_timeout=30s` — после двух неудачных подряд запросов инстанс на 30 секунд исключается из ротации.
- `backup` — резервный сервер, используется только если основные недоступны.

### HAProxy и health-check
```haproxy
backend cars_back
    balance roundrobin
    option httpchk GET /health
    server cars1 127.0.0.1:3001 check inter 5s fall 3 rise 2
```
- `option httpchk GET /health` — проверка раз в `inter` секунд по эндпоинту `/health`.
- `fall 3` — после 3 подряд провалов сервер помечается DOWN.
- `rise 2` — после 2 подряд успешных проверок снова UP.

## Что реализовано

### Структура
```text
practice-22-load-balancing/
├── backend/
│   ├── server.js          ← Express, отдаёт {server, host, port}
│   └── package.json
├── nginx/nginx.conf       ← upstream + Round Robin + max_fails + backup
├── haproxy/haproxy.cfg    ← frontend/backend + httpchk
├── start-backends.ps1     ← Windows: 3 окна PowerShell
└── start-backends.sh      ← Linux/WSL: один процесс с тремя &
```

### Backend (`backend/server.js`)
Идентичный код для всех трёх инстансов, ID берётся из переменной окружения:
```js
const PORT      = Number(process.env.PORT)      || 3000;
const SERVER_ID = process.env.SERVER_ID         || `cars-${PORT}`;

app.get('/', (req, res) => res.json({ server: SERVER_ID, host: os.hostname(), port: PORT }));
app.get('/api/cars', (req, res) => res.json({ server: SERVER_ID, cars }));
app.get('/health',   (req, res) => res.status(200).send('OK'));
```

### Топология
```
                ┌──────────────┐
        :8080 → │    Nginx     │ ┐
                └──────────────┘ │
                                 ├──→ cars-3001 (active)
                ┌──────────────┐ │
        :8090 → │   HAProxy    │ ┼──→ cars-3002 (active)
                └──────────────┘ │
                                 └──→ cars-3003 (backup)
```

### Nginx-конфигурация (`nginx/nginx.conf`)
```nginx
upstream cars_backend {
    server 127.0.0.1:3001 max_fails=2 fail_timeout=30s;
    server 127.0.0.1:3002 max_fails=2 fail_timeout=30s;
    server 127.0.0.1:3003 backup;
}

server {
    listen 8080;
    location / {
        proxy_pass http://cars_backend;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    }
}
```

### HAProxy-конфигурация (`haproxy/haproxy.cfg`)
```haproxy
frontend cars_front
    bind *:8090
    default_backend cars_back

backend cars_back
    balance roundrobin
    option httpchk GET /health
    server cars1 127.0.0.1:3001 check inter 5s fall 3 rise 2
    server cars2 127.0.0.1:3002 check inter 5s fall 3 rise 2
    server cars3 127.0.0.1:3003 check backup
```

## Как запустить
```bash
cd practice-22-load-balancing/backend
npm install

# Запустить 3 инстанса
./start-backends.sh                  # Linux / WSL
.\start-backends.ps1                 # Windows

# Затем балансировщик
nginx  -c $(pwd)/../nginx/nginx.conf  -p $(pwd)/../nginx        # :8080
# или
haproxy -f ../haproxy/haproxy.cfg                                # :8090
```

## Как проверить
```bash
# Прямые запросы — видим, что инстансы разные
curl http://localhost:3001/   # {"server":"cars-3001",...}
curl http://localhost:3002/
curl http://localhost:3003/

# Через Nginx — Round Robin
curl http://localhost:8080/   # повторите 4-6 раз
# server: cars-3001, cars-3002, cars-3001, cars-3002, …

# Отказоустойчивость
docker compose stop cars-backend-1   # или Ctrl+C в окне cars-3001
curl http://localhost:8080/          # теперь только cars-3002
# (после 2 фейлов Nginx исключает упавший инстанс на 30 секунд)

# Через HAProxy
curl http://localhost:8090/          # GET /health каждые 5 секунд
```

---

# ✅ Практика 23 — Контейнеризация (Docker + Docker Compose)

## Цель
То же приложение, что в практике 22, но в **контейнерах Docker**: каждый backend-инстанс — отдельный контейнер, Nginx — отдельный контейнер. Всё запускается одной командой `docker compose up`.

## Теория

### Зачем Docker
**Контейнер** упаковывает приложение вместе с его зависимостями (Node.js, npm-пакеты, конфиги) в изолированный «образ». Запускается одинаково на любой машине, где установлен Docker.

В отличие от виртуальной машины, контейнер использует **ядро ОС хоста** и стартует за секунды, потребляя минимум памяти.

### Ключевые понятия
| Понятие | Что это |
|---|---|
| **Image (образ)** | Шаблон с готовой ФС, кодом и зависимостями |
| **Container (контейнер)** | Запущенный экземпляр образа |
| **Dockerfile** | Инструкции для сборки образа |
| **Compose** | Декларативное описание стека (несколько контейнеров + сети + тома) |
| **Volume (том)** | Хранилище данных, переживает удаление контейнера |
| **Network (сеть)** | Изолированная сеть, контейнеры в ней видят друг друга по DNS-именам сервисов |

### Кэширование слоёв Docker
Docker кэширует каждую инструкцию `Dockerfile`. Если копировать сначала только `package.json` и установить зависимости, потом копировать код — `npm install` не будет переезапускаться при каждом изменении кода:
```dockerfile
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
```

## Что реализовано

### Структура
```text
practice-23-docker/
├── backend/
│   ├── Dockerfile         ← node:18-alpine + кэширование слоёв
│   ├── .dockerignore      ← исключает node_modules, .git
│   ├── package.json
│   └── server.js          ← тот же сервер, что в практике 22
├── nginx/nginx.conf       ← upstream → имена сервисов compose
└── docker-compose.yml     ← 3 backend + nginx + сеть cars-net
```

### Dockerfile backend-сервиса
```dockerfile
FROM node:18-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev    # кэшируемый слой с зависимостями

COPY . .                      # код меняется чаще, поэтому ниже

EXPOSE 3000
CMD ["npm", "start"]
```

### docker-compose.yml
```yaml
services:
  cars-backend-1:
    build: ./backend
    environment:
      - PORT=3000
      - SERVER_ID=cars-backend-1
    networks: [cars-net]

  cars-backend-2:
    build: ./backend
    environment:
      - PORT=3000
      - SERVER_ID=cars-backend-2
    networks: [cars-net]

  cars-backend-3:
    build: ./backend
    environment:
      - PORT=3000
      - SERVER_ID=cars-backend-3
    networks: [cars-net]

  nginx:
    image: nginx:alpine
    depends_on: [cars-backend-1, cars-backend-2, cars-backend-3]
    ports:
      - "8080:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    networks: [cars-net]

networks:
  cars-net:
    driver: bridge
```

### Nginx-конфиг внутри сети `cars-net`
```nginx
upstream cars_backend {
    # Балансируем по DNS-именам сервисов
    server cars-backend-1:3000 max_fails=2 fail_timeout=30s;
    server cars-backend-2:3000 max_fails=2 fail_timeout=30s;
    server cars-backend-3:3000 backup;
}
```

### Топология
```
   host:8080
       │
       ▼
┌───────────────┐
│ nginx:alpine  │           ← единственный контейнер с пробросом порта
└──────┬────────┘
       │ Round Robin (внутри сети cars-net)
       ├──→ cars-backend-1:3000
       ├──→ cars-backend-2:3000
       └──→ cars-backend-3:3000 (backup)
```

Backend-сервисы не пробрасываются наружу — снаружи доступен только Nginx.

## Как запустить
```bash
cd practice-23-docker
docker compose up --build
```

Логи:
```
cars-backend-1  | [cars-backend-1] listening on 3000
cars-backend-2  | [cars-backend-2] listening on 3000
cars-backend-3  | [cars-backend-3] listening on 3000
nginx           | ...
```

## Как проверить
```bash
# Балансировка
curl http://localhost:8080/
curl http://localhost:8080/
curl http://localhost:8080/
# server: cars-backend-1, cars-backend-2, cars-backend-1, …

# Останавливаем один инстанс
docker compose stop cars-backend-1
curl http://localhost:8080/          # все запросы идут на cars-backend-2

# Поднимаем обратно
docker compose start cars-backend-1
```

## Полезные команды
```bash
docker compose ps                      # запущенные контейнеры
docker compose logs -f nginx           # логи Nginx в реальном времени
docker compose exec cars-backend-1 sh  # зайти внутрь контейнера
docker compose down                    # остановить и удалить
docker compose down -v                 # + удалить тома
```

---

# ⭐ Сборка КР4 — итоговая инфраструктура

## 🧰 Технологии

- **PostgreSQL + pg** — реляционное хранение Car, параметризованные запросы, индексы.
- **MongoDB + mongoose** — документоориентированное хранение, агрегация (`$group`/`$avg`).
- **Redis** — in-memory кэш с TTL, инвалидация при изменении данных, ответы `{source, data}`.
- **Nginx** — Round Robin, `max_fails`, `fail_timeout`, `backup`.
- **HAProxy** — `httpchk`, `inter`, `fall`, `rise`.
- **Docker + Docker Compose** — мультисервисный стек, изолированная сеть `cars-net`, проброс портов только у балансировщика.

## 🏗️ Полная архитектура

```
                  ┌──────────────────────────┐
                  │  client (browser/Postman)│
                  └──────────────┬───────────┘
                                 │ :8080
                                 ▼
                          ┌─────────────┐
                          │ Nginx (LB)  │  ← практики 22 / 23
                          └──────┬──────┘
                                 │ round-robin
            ┌────────────────────┼────────────────────┐
            ▼                    ▼                    ▼
     ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
     │ cars-back-1 │      │ cars-back-2 │      │ cars-back-3 │   ← Docker (23)
     └──────┬──────┘      └──────┬──────┘      └──────┬──────┘
            │                    │                    │
            └────────────────────┼────────────────────┘
                                 │
                ┌────────────────┼────────────────┐
                ▼                ▼                ▼
         ┌────────────┐  ┌──────────────┐  ┌──────────────┐
         │ PostgreSQL │  │   MongoDB    │  │    Redis     │
         │ (pract.19) │  │  (pract.20)  │  │  (pract.21)  │
         └────────────┘  └──────────────┘  └──────────────┘
              ↑                ↑                ↑
              └─ источник      └─ источник      └─ кэш для GET
```

## 🗂️ Единая сущность Car

| Поле | PostgreSQL (19) | MongoDB (20) |
|---|---|---|
| id           | `SERIAL PRIMARY KEY` | `ObjectId` |
| brand        | `VARCHAR(80) NOT NULL` | `String, required, index` |
| model        | `VARCHAR(120) NOT NULL` | `String, required` |
| year         | `INTEGER CHECK 1900-2100` | `Number, min/max, index` |
| price        | `NUMERIC(12,2) ≥ 0` | `Number ≥ 0` |
| vin          | `VARCHAR(17) UNIQUE` | `String, unique sparse` |
| created_at / createdAt | `TIMESTAMPTZ DEFAULT NOW()` | `Date` (timestamps) |
| updated_at / updatedAt | `TIMESTAMPTZ DEFAULT NOW()` | `Date` (timestamps) |

## 🎯 Чек-лист готовности

- [x] PostgreSQL CRUD: 5 эндпоинтов, валидация, уникальность VIN.
- [x] MongoDB CRUD: 5 эндпоинтов + агрегация средней цены по бренду.
- [x] Redis-кэш: TTL 1 мин (users), 10 мин (cars), `source: cache | server`.
- [x] Инвалидация кэша при POST/PUT/DELETE.
- [x] Nginx балансирует трафик между тремя инстансами.
- [x] HAProxy с health-check `GET /health`.
- [x] Docker Compose поднимает весь стек одной командой.
- [x] Только Nginx торчит наружу, остальные сервисы изолированы в `cars-net`.

## 🚀 Демо-запуск всего

```bash
# 1. PostgreSQL вариант
cd practice-19-postgres && npm install && npm run init-db && npm start

# 2. MongoDB вариант
cd practice-20-mongodb && npm install && npm start

# 3. RBAC + Redis
docker run -d --name redis-cars -p 6379:6379 redis:7-alpine
cd practice-21-redis-cache/server && npm install && npm start

# 4. Балансировка вручную (Linux/WSL)
cd practice-22-load-balancing
chmod +x start-backends.sh && ./start-backends.sh
nginx -c $(pwd)/nginx/nginx.conf -p $(pwd)/nginx     # :8080
# или
haproxy -f haproxy/haproxy.cfg                         # :8090

# 5. Всё то же — но в Docker
cd practice-23-docker
docker compose up --build                              # :8080
```

## 🔗 Адреса итогового стека

| URL | Описание |
|---|---|
| `http://localhost:3000/api/cars`            | CRUD (PG / Mongo / RBAC, в зависимости от того, что запустили) |
| `http://localhost:3000/api/cars-stats/avg-price` | Средняя цена по бренду (только MongoDB, практика 20) |
| `http://localhost:8080/`                    | Точка входа через Nginx → балансировка по 3 backend |
| `http://localhost:8080/api/cars`            | Запрос через балансировщик |
| `http://localhost:8090/`                    | Точка входа через HAProxy |
| `redis://127.0.0.1:6379`                    | Redis-кэш (практика 21) |

## 🧪 Сценарий приёмки

1. Поднять **PostgreSQL**: `npm run init-db && npm start` → `POST/GET/PATCH/DELETE` через curl. Убедиться, что валидация (year 1900-2100, цена ≥ 0) работает.
2. Остановить, поднять **MongoDB**: `POST` 5 авто разных брендов → `GET /api/cars-stats/avg-price` показывает средние цены.
3. Поднять **Redis** и сервер 21: первый GET — `source: server`, второй — `source: cache`, после PUT — снова `server`.
4. Запустить **3 инстанса + Nginx** (практика 22) → curl возвращает разные `server`. Убить один → запросы идут на оставшиеся.
5. То же самое в **Docker Compose** (практика 23) — одна команда `docker compose up --build`.
