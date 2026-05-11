# Практика 19 — PostgreSQL

REST API для управления автомобилями на **Express + pg**, данные хранятся в реляционной СУБД **PostgreSQL**.

## Структура
```
practice-19-postgres/
├── src/
│   ├── db.js        # пул подключений pg
│   ├── init-db.js   # создаёт таблицу cars и индексы
│   └── server.js    # CRUD-маршруты
├── .env.example
└── package.json
```

## Сущность Car
| Поле       | Тип          | Описание |
|---|---|---|
| id         | SERIAL PK    | автоинкремент |
| brand      | VARCHAR(80)  | производитель |
| model      | VARCHAR(120) | модель |
| year       | INTEGER      | год выпуска (1900–2100) |
| price      | NUMERIC(12,2)| цена |
| vin        | VARCHAR(17) UNIQUE | VIN-номер (опц.) |
| created_at | TIMESTAMPTZ  | время создания |
| updated_at | TIMESTAMPTZ  | время изменения |

## Маршруты
| Метод  | Путь            | Описание |
|---|---|---|
| GET    | /api/cars       | Список всех автомобилей |
| GET    | /api/cars/:id   | Получить по id |
| POST   | /api/cars       | Создать |
| PATCH  | /api/cars/:id   | Обновить (любые поля) |
| DELETE | /api/cars/:id   | Удалить |

## Подготовка БД
```bash
# 1. Установите PostgreSQL и создайте БД
psql -U postgres -c "CREATE DATABASE cars_db;"

# 2. Установите зависимости
cd practice-19-postgres
npm install

# 3. Инициализация таблицы и индексов
npm run init-db
```

## Запуск
```bash
npm start
# Cars PG API запущен на http://localhost:3000
```

Все переменные подключения переопределяются через окружение (`PGUSER`, `PGPASSWORD`, `PGHOST`, `PGPORT`, `PGDATABASE`) — см. `.env.example`.

## Примеры запросов
```bash
# Создать
curl -X POST http://localhost:3000/api/cars \
  -H "Content-Type: application/json" \
  -d '{"brand":"BMW","model":"X5","year":2022,"price":75000,"vin":"WBA12345678901234"}'

# Список
curl http://localhost:3000/api/cars

# Обновить
curl -X PATCH http://localhost:3000/api/cars/1 \
  -H "Content-Type: application/json" \
  -d '{"price":72000}'

# Удалить
curl -X DELETE http://localhost:3000/api/cars/1
```
