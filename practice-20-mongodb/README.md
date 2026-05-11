# Практика 20 — MongoDB

REST API для управления автомобилями на **Express + mongoose**, данные хранятся в **MongoDB**.

## Структура
```
practice-20-mongodb/
├── src/
│   ├── models/Car.js   # Mongoose-схема Car
│   └── server.js       # CRUD-маршруты + агрегация
└── package.json
```

## Схема Car
| Поле       | Тип     | Описание |
|---|---|---|
| brand      | String  | required, индексируется |
| model      | String  | required |
| year       | Number  | required, 1900–2100, индексируется |
| price      | Number  | required, ≥ 0 |
| vin        | String  | unique sparse |
| createdAt  | Date    | автоматически (timestamps) |
| updatedAt  | Date    | автоматически |

## Маршруты
| Метод  | Путь                          | Описание |
|---|---|---|
| GET    | /api/cars                     | Список |
| GET    | /api/cars/:id                 | По id |
| POST   | /api/cars                     | Создать |
| PATCH  | /api/cars/:id                 | Обновить |
| DELETE | /api/cars/:id                 | Удалить |
| GET    | /api/cars-stats/avg-price     | Бонус: средняя цена по бренду |

## Подготовка
```bash
# Linux:
sudo systemctl start mongod

# Windows (Docker):
docker run -d -p 27017:27017 --name mongo mongo:7

cd practice-20-mongodb
npm install
```

## Запуск
```bash
npm start
# Cars Mongo API запущен на http://localhost:3000
```

Подключение настраивается через `MONGO_URL` (по умолчанию `mongodb://localhost:27017/cars_db`).

## Примеры
```bash
curl -X POST http://localhost:3000/api/cars \
  -H "Content-Type: application/json" \
  -d '{"brand":"Audi","model":"A4","year":2021,"price":42000}'

curl http://localhost:3000/api/cars
curl http://localhost:3000/api/cars-stats/avg-price
```
