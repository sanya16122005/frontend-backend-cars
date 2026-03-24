# 🚗 Frontend & Backend — Cars (Практики 1–12)

Репозиторий с практическими заданиями по дисциплине **«Фронтенд и бэкенд разработка»**  
Институт ИПТИП, кафедра Индустриального программирования, 4 семестр 2025/2026.  
**Тема индивидуального задания: Автомобили.**

---

## 📁 Структура репозитория

| Папка | Что внутри | Результат |
|---|---|---|
| `practice-01-car-card` | Sass (SCSS), HTML-страница | Карточки автомобилей, демонстрация возможностей препроцессора |
| `practice-02-car-api` | Express API (CRUD) | Сервер с эндпоинтами для автомобилей |
| `practice-03-postman` | Postman коллекции/запросы | Проверка CRUD и работа с JSON |
| `practice-04-car-shop` | React клиент + Express сервер | Мини-магазин автомобилей (CRUD через UI) |
| `practice-05-swagger` | Express + Swagger (OpenAPI) | Интерактивная документация API на `/api-docs` |
| `practice-06-final` | Единый итоговый проект КР1 | React + Express API + Swagger + Sass |
| `practice-07-auth` | Express + bcrypt | Регистрация/логин с хешированием паролей |
| `practice-08-jwt` | Express + JWT | Выдача access-токена, защищённые маршруты |
| `practice-09-refresh` | Express + JWT refresh | Refresh-токены, ротация пары токенов |
| `practice-10-frontend-auth` | React + Express + axios interceptors | Фронтенд с аутентификацией, хранение токенов |
| `practice-11-rbac` | React + Express + RBAC | Система ролей: user / seller / admin |
| `practice-12-final` | **Единый итоговый проект КР2** | React + Express + JWT + RBAC + Swagger + Sass |

---

## 🧰 Технологии

- **Node.js + npm** — установка зависимостей, запуск серверов/клиента
- **Express.js** — REST API, обработка маршрутов, middleware, JSON
- **bcrypt** — хеширование паролей с солью
- **jsonwebtoken (JWT)** — access и refresh токены, авторизация
- **CORS** — разрешение запросов с клиента (React) к серверу
- **nanoid** — генерация коротких уникальных `id`
- **React** — клиентское приложение (каталог, модалки, формы, роутинг)
- **axios + interceptors** — HTTP-клиент с автоматическим обновлением токенов
- **react-router-dom** — клиентский роутинг, защищённые маршруты
- **Sass (SCSS)** — стили с переменными, миксинами, тёмная тема
- **Swagger (swagger-jsdoc + swagger-ui-express)** — документация API

---

## ⚙️ Общие требования

- Node.js **18+**
- npm **9+**
- Postman (для практик 3, 7–9)

---

# ✅ Практика 1 — CSS-препроцессор (Sass)

## Цель
Показать использование Sass: переменные, миксины, вложенность, условные конструкции, циклы и компиляция в CSS.

## Что реализовано
- Карточки автомобилей (пример компонента UI)
- Sass-конструкции: переменные, миксины, вложенность (`&__title`, `&--accent`), условие темы (`@if`), генерация классов через `@each`

## Как запустить
```bash
cd practice-01-car-card
npm install
npm run sass
```
Открыть `src/index.html` в браузере.

---

# ✅ Практика 2 — Node.js + Express REST API

## Цель
Создать сервер на Express и реализовать CRUD для сущности автомобиль.

## Данные
Сущность автомобиля: `id`, `name`, `price`

## Маршруты
| Метод | Путь | Описание |
|---|---|---|
| GET | /cars | Список всех автомобилей |
| GET | /cars/:id | Получить по id |
| POST | /cars | Создать |
| PATCH | /cars/:id | Обновить |
| DELETE | /cars/:id | Удалить |

## Как запустить
```bash
cd practice-02-car-api
npm install
npm start
```
Сервер: `http://localhost:3000`

---

# ✅ Практика 3 — JSON и Postman

## Цель
Проверить API запросами из Postman и закрепить работу с JSON.

## Что сделано
- CRUD-запросы к API (POST, GET, PATCH, DELETE)
- Проверка статусов (200/201/204/400/404)
- Проверка тела ответа и обработки ошибок

## Как повторить
1. Запустить сервер из практики 2
2. В Postman выполнить запросы из коллекции

---

# ✅ Практика 4 — React + Express (Car Shop)

## Цель
Собрать полноценное приложение: React-клиент + Express-сервер, CRUD через UI.

## Как запустить
```bash
# Сервер
cd practice-04-car-shop/server
npm install
npm start

# Клиент (в другом терминале)
cd practice-04-car-shop/client
npm install
npm start
```
Сервер: `http://localhost:3000` | Клиент: `http://localhost:3001`

---

# ✅ Практика 5 — Swagger документация

## Цель
Сделать документацию REST API в формате OpenAPI/Swagger.

## Как запустить
```bash
cd practice-05-swagger
npm install
npm start
```
Swagger UI: `http://localhost:3000/api-docs`

---

# ⭐ Практика 6 — Итоговый проект (КР1)

## Цель
Объединить результаты практик 1–5: UI (React) + стили (Sass) + API (Express CRUD) + документация (Swagger).

## Что реализовано
- React-приложение с компонентами `CarItem`, `CarsList`, `CarModal`, `CarsPage`
- Sass/SCSS стили с переменными и миксинами
- Express CRUD API для автомобилей
- Swagger UI документация
- Логирование запросов на сервере

## Модель данных — Автомобиль
| Поле | Тип | Описание |
|---|---|---|
| `id` | string | Уникальный идентификатор (nanoid) |
| `name` | string | Название автомобиля |
| `category` | string | Категория (Седан, SUV и т.д.) |
| `description` | string | Краткое описание |
| `price` | number | Стоимость в рублях |
| `stock` | number | Количество на складе |

## Маршруты API
| Метод | Путь | Описание |
|---|---|---|
| GET | /api/cars | Список всех автомобилей |
| GET | /api/cars/:id | Получить по id |
| POST | /api/cars | Создать автомобиль |
| PATCH | /api/cars/:id | Обновить автомобиль |
| DELETE | /api/cars/:id | Удалить автомобиль |

## Как запустить
```bash
# Терминал 1 — сервер
cd practice-06-final/server
npm install
npm start

# Терминал 2 — клиент
cd practice-06-final/client
npm install
npm start
```

| URL | Описание |
|---|---|
| `http://localhost:3001` | React-приложение |
| `http://localhost:3000/api/cars` | REST API |
| `http://localhost:3000/api-docs` | Swagger UI |

---

# ✅ Практика 7 — Базовая аутентификация (bcrypt)

## Цель
Создать сервер с регистрацией и входом, хеширование паролей через bcrypt + соль.

## Маршруты
| Метод | Путь | Описание |
|---|---|---|
| POST | /api/auth/register | Регистрация пользователя |
| POST | /api/auth/login | Вход в систему |
| GET | /api/cars | Список автомобилей |
| POST | /api/cars | Создать автомобиль |
| GET | /api/cars/:id | Получить по id |
| PUT | /api/cars/:id | Обновить |
| DELETE | /api/cars/:id | Удалить |

## Сущность пользователя
`id`, `email`, `first_name`, `last_name`, `password` (хешируется bcrypt)

## Как запустить
```bash
cd practice-07-auth
npm install
npm start
```
Сервер: `http://localhost:3000`

---

# ✅ Практика 8 — JWT (access-токен)

## Цель
Выдавать JWT при логине, защитить маршруты через `authMiddleware`.

## Что добавлено к практике 7
- Генерация `accessToken` при логине (срок жизни 15 минут)
- `authMiddleware` — проверка `Bearer <token>` в заголовке `Authorization`
- Маршрут `GET /api/auth/me` — возвращает текущего пользователя по токену
- Защищены: `GET /api/cars/:id`, `PUT /api/cars/:id`, `DELETE /api/cars/:id`

## Как запустить
```bash
cd practice-08-jwt
npm install
npm start
```

---

# ✅ Практика 9 — Refresh-токены

## Цель
Добавить refresh-токены и ротацию пары токенов.

## Что добавлено к практике 8
- Генерация `refreshToken` при логине (срок жизни 7 дней)
- Хранилище refresh-токенов в памяти (`Set`)
- Маршрут `POST /api/auth/refresh` — выдаёт новую пару токенов, старый refresh удаляется (ротация)

## Формат ответа `/api/auth/login` и `/api/auth/refresh`
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

## Как запустить
```bash
cd practice-09-refresh
npm install
npm start
```

---

# ✅ Практика 10 — Фронтенд + аутентификация

## Цель
React-клиент со страницами логина/регистрации, хранение токенов в `localStorage`, автообновление через axios interceptors.

## Что реализовано
- Страница входа (`/login`) и регистрации (`/register`)
- Страница каталога автомобилей (`/cars`) — только для авторизованных
- Детальная страница авто (`/cars/:id`)
- `PrivateRoute` — редирект на `/login` если нет токена
- axios interceptors: автоматическая подстановка токена в заголовок + обновление пары при 401

## Как запустить
```bash
# Сервер
cd practice-10-frontend-auth/server
npm install
npm start

# Клиент
cd practice-10-frontend-auth/client
npm install
npm start
```

---

# ✅ Практика 11 — RBAC (роли)

## Цель
Добавить систему ролей с разграничением прав доступа на сервере и клиенте.

## Роли
| Роль | Права |
|---|---|
| `user` | Просмотр автомобилей |
| `seller` | Просмотр + создание + редактирование |
| `admin` | Все права + удаление авто + управление пользователями |

## Таблица доступа
| Маршрут | Метод | Роль |
|---|---|---|
| /api/auth/register | POST | Все |
| /api/auth/login | POST | Все |
| /api/auth/refresh | POST | Все |
| /api/auth/me | GET | user+ |
| /api/cars | GET | user+ |
| /api/cars/:id | GET | user+ |
| /api/cars | POST | seller, admin |
| /api/cars/:id | PUT | seller, admin |
| /api/cars/:id | DELETE | admin |
| /api/users | GET | admin |
| /api/users/:id | PUT | admin |
| /api/users/:id | DELETE (блокировка) | admin |

## Как запустить
```bash
# Сервер
cd practice-11-rbac/server
npm install
npm start

# Клиент
cd practice-11-rbac/client
npm install
npm start
```

---

# ⭐ Практика 12 — Итоговый проект (КР2)

## Цель
Объединить результаты практик 6–11 в единое приложение:
- UI (React) + тёмная тема (Sass/SCSS)
- REST API (Express CRUD)
- Аутентификация (bcrypt + JWT access/refresh)
- Авторизация (RBAC — роли user/seller/admin)
- Документация (Swagger UI)

## Структура
```
practice-12-final/
  server/
    app.js              — Express API + Auth + RBAC + Swagger
    package.json
  client/
    src/
      api/
        client.js             — axios + interceptors (авто-обновление токена)
      components/
        CarItem.jsx            — карточка автомобиля
        CarsList.jsx           — список автомобилей
        CarModal.jsx           — модалка добавить/редактировать
        PrivateRoute.jsx       — защита роутов + проверка роли
      pages/
        CarsPage/
          CarsPage.jsx         — каталог с ролевыми кнопками
          CarsPage.scss        — тёмная тема (SCSS)
        LoginPage.jsx          — страница входа
        RegisterPage.jsx       — страница регистрации (с выбором роли)
        UsersPage.jsx          — управление пользователями (admin)
      auth.scss                — стили страниц аутентификации
      App.js                   — роутинг
```

## Модель данных — Автомобиль
| Поле | Тип | Описание |
|---|---|---|
| `id` | string | Уникальный идентификатор (nanoid) |
| `name` | string | Название автомобиля |
| `category` | string | Категория (Седан, SUV и т.д.) |
| `description` | string | Краткое описание |
| `price` | number | Стоимость в рублях |
| `stock` | number | Количество на складе |

## Модель данных — Пользователь
| Поле | Тип | Описание |
|---|---|---|
| `id` | string | Уникальный идентификатор |
| `email` | string | Email (используется как логин) |
| `first_name` | string | Имя |
| `last_name` | string | Фамилия |
| `password` | string | Хешированный пароль (bcrypt) |
| `role` | string | Роль: user / seller / admin |
| `blocked` | boolean | Заблокирован ли пользователь |

## Маршруты API
| Метод | Путь | Роль | Описание |
|---|---|---|---|
| POST | /api/auth/register | Все | Регистрация |
| POST | /api/auth/login | Все | Вход, получение токенов |
| POST | /api/auth/refresh | Все | Обновление пары токенов |
| GET | /api/auth/me | user+ | Текущий пользователь |
| GET | /api/cars | user+ | Список автомобилей |
| GET | /api/cars/:id | user+ | Автомобиль по id |
| POST | /api/cars | seller, admin | Создать автомобиль |
| PATCH | /api/cars/:id | seller, admin | Обновить автомобиль |
| DELETE | /api/cars/:id | admin | Удалить автомобиль |
| GET | /api/users | admin | Список пользователей |
| PUT | /api/users/:id | admin | Обновить пользователя |
| DELETE | /api/users/:id | admin | Заблокировать пользователя |

## Как запустить
```bash
# Терминал 1 — сервер
cd practice-12-final/server
npm install
npm start

# Терминал 2 — клиент
cd practice-12-final/client
npm install
npm start
```

## Адреса
| URL | Описание |
|---|---|
| `http://localhost:3001` | React-приложение |
| `http://localhost:3000/api/cars` | REST API автомобилей |
| `http://localhost:3000/api/auth/login` | Аутентификация |
| `http://localhost:3000/api-docs` | Swagger UI |

## Тестовые аккаунты
Зарегистрируй через форму регистрации (выбрав нужную роль):

| Email | Роль | Что доступно |
|---|---|---|
| user@test.com | user | Просмотр каталога |
| seller@test.com | seller | + Добавить / редактировать авто |
| admin@test.com | admin | + Удалить авто + страница пользователей |
