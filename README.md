# 🚗 Frontend & Backend — Cars (Практики 1–32)

Репозиторий с практическими заданиями по дисциплине **«Фронтенд и бэкенд разработка»**  
Институт ИПТИП, кафедра Индустриального программирования, 4 семестр 2025/2026.  
**Тема индивидуального задания: Автомобили.**

Проект покрывает полный цикл разработки веб-приложения: стилизация (Sass) → REST API (Express) → тестирование (Postman) → клиент (React) → документация (Swagger) → аутентификация (bcrypt + JWT) → авторизация (RBAC) → итоговая сборка.

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
| `practice-13-service-worker` | PWA / Service Worker | Cache First, офлайн-страница, регистрация SW |
| `practice-14-manifest` | PWA / Web App Manifest | Иконки, тема, установка на главный экран |
| `practice-15-app-shell` | HTTPS + App Shell | mkcert, динамическая загрузка контента, два кэша |
| `practice-16-websocket-push` | Socket.IO + Web Push | События в реальном времени + VAPID push |
| `practice-17-push-reminders` | Запланированные напоминания | setTimeout на сервере + snooze в SW |
| `practice-18-kr3-final` | **Финальный отчёт КР3** | Сводный README по PWA-стеку |
| `practice-19-postgres` | Express + pg + PostgreSQL | CRUD `Car`, индексы, валидация |
| `practice-20-mongodb` | Express + mongoose + MongoDB | CRUD `Car` + агрегация средней цены |
| `practice-21-redis-cache` | RBAC + Redis | Кэш с TTL и инвалидацией для GET-маршрутов |
| `practice-22-load-balancing` | Nginx + HAProxy | Round Robin, max_fails, backup |
| `practice-23-docker` | Docker Compose | Стек cars-backend × 3 + Nginx |
| `practice-24-kr4-final` | **Финальный отчёт КР4** | Сводный README по серверному стеку |
| `practice-25-vite` | Vite + React.lazy + visualizer | Code splitting, ручные чанки, bundle report |
| `practice-26-graphql` | Apollo Server + GraphQL | Каталог книг: Book/Author, Query/Mutation, вложенные резолверы |
| `practice-27-rabbitmq` | RabbitMQ + amqplib | Producer + Worker + Retry (exp. backoff) + Dead Letter Queue |
| `practice-28-kr5-final` | **Подготовка к КР5** | Спецификация итогового проекта + 6 вариантов |
| `practice-29-landing` | PWA-лендинг | Service Worker, SEO, манифест, Lighthouse > 90 |
| `practice-30-social` | Express + Socket.IO | Мини-социальная сеть: посты, лайки, комментарии, real-time |
| `practice-31-tasks-shop` | Kanban-доска + DnD | 3 колонки, drag-n-drop, real-time через Socket.IO |
| `practice-32-ai` | AI-чат + RAG | SSE-стрим (mock или OpenAI), поиск по загруженным документам |

---

## 🧰 Технологии

- **Node.js + npm** — установка зависимостей, запуск серверов/клиента
- **Express.js** — REST API, обработка маршрутов, middleware, JSON
- **bcrypt** — хеширование паролей с солью (защита от перебора и утечки)
- **jsonwebtoken (JWT)** — access и refresh токены, авторизация запросов
- **CORS** — разрешение кросс-доменных запросов с клиента (React) к серверу
- **nanoid** — генерация коротких уникальных `id`
- **React** — клиентское приложение (каталог, модалки, формы, роутинг)
- **axios + interceptors** — HTTP-клиент с автоматическим обновлением токенов
- **react-router-dom** — клиентский роутинг, защищённые маршруты
- **Sass (SCSS)** — стили с переменными, миксинами, тёмная тема
- **Swagger (swagger-jsdoc + swagger-ui-express)** — документация API из JSDoc

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
- Sass-конструкции:
  - переменные для цветов/размеров
  - миксины для кнопок/карточек
  - вложенность (`&__title`, `&--accent`)
  - условие темы (`@if`)
  - генерация классов через `@each`

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
Сущность автомобиля:
- `id` — идентификатор
- `name` — название
- `price` — стоимость

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

## Сервер
- Держит массив из **10 автомобилей** (демо-данные)
- Отдаёт JSON по API (`/api/cars`)
- Поддерживает CRUD операции

## Клиент (React)
- Главная страница каталога: список, добавление, редактирование, удаление
- Модальное окно: форма с полями авто, отправка запросов на сервер

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
Сервер: `http://localhost:3000`  
Клиент: `http://localhost:3001`

---

# ✅ Практика 5 — Swagger документация

## Цель
Сделать документацию REST API в формате OpenAPI/Swagger с тестированием эндпоинтов из браузера.

## Как работает
- `swagger-jsdoc` читает JSDoc-комментарии `@swagger` в коде сервера
- Формируется OpenAPI спецификация
- `swagger-ui-express` показывает UI по адресу `/api-docs`

## Результат
- Интерактивная страница со списком эндпоинтов
- Описание схемы данных `Car`
- Кнопка **Try it out** для тестирования реальных запросов

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
Объединить результаты практик 1–5 в единое приложение:
- UI (React) + стили (Sass)
- API (Express CRUD)
- Документация (Swagger)
- Единые команды запуска

## Структура
```text
practice-06-final/
  client/   # React UI
  server/   # Express API + Swagger
```

## 🖥️ Сервер

### Что реализовано
- `express.json()` — чтение JSON тела запросов
- CORS — разрешение запросов с `http://localhost:3001`
- Логирование запросов (метод, путь, статус, body для POST/PATCH)
- 404 handler и global error handler (500)
- CRUD по автомобилям: `/api/cars`
- Swagger UI: `/api-docs`
- `nanoid` — генерация `id` при создании новых авто

### Модель данных (Car)
| Поле | Тип | Описание |
|---|---|---|
| `id` | string | Уникальный идентификатор (nanoid) |
| `name` | string | Название автомобиля |
| `category` | string | Категория (Седан, SUV и т.д.) |
| `description` | string | Краткое описание |
| `price` | number | Стоимость в рублях |
| `stock` | number | Количество на складе |

### API эндпоинты
| Метод | Путь | Описание | Статус |
|---|---|---|---|
| GET | /api/cars | Все автомобили | 200 |
| GET | /api/cars/:id | Авто по id | 200 / 404 |
| POST | /api/cars | Создать авто | 201 / 400 |
| PATCH | /api/cars/:id | Обновить авто | 200 / 404 |
| DELETE | /api/cars/:id | Удалить авто | 204 / 404 |
| GET | /api-docs | Swagger UI | 200 |

### Запуск сервера
```bash
cd practice-06-final/server
npm install
npm start
```
Сервер: `http://localhost:3000`  
Swagger: `http://localhost:3000/api-docs`

---

## 🌐 Клиент

### Что реализовано
- React-приложение (Create React App)
- Каталог автомобилей: список из 10 авто
- Кнопка «+ Добавить авто» — открывает модальное окно с формой
- Кнопки «Изменить» / «Удалить» у каждого авто
- Ссылка «Swagger API» в шапке — открывает документацию
- Стили написаны на SCSS (Sass): переменные, миксины, тёмная тема

### Запуск клиента
```bash
cd practice-06-final/client
npm install
npm start
```
Клиент: `http://localhost:3001`

## 🔗 Адреса итогового проекта

| URL | Описание |
|---|---|
| `http://localhost:3001` | React-приложение (интернет-магазин автомобилей) |
| `http://localhost:3000/api/cars` | REST API (JSON) |
| `http://localhost:3000/api-docs` | Swagger UI (документация) |

---

# ✅ Практика 7 — Базовая аутентификация (bcrypt)

## Цель
Добавить к серверу из практики 2 систему регистрации и входа пользователей.  
Познакомиться с хешированием паролей через **bcrypt** и понять, почему нельзя хранить пароли в открытом виде.

## Теория

### Почему нельзя хранить пароль открытым текстом?
Если база данных утечёт, злоумышленник сразу получит все пароли. Поэтому пароль преобразуют в **хеш** — необратимую строку. При следующем входе введённый пароль снова хешируется и сравнивается с сохранённым хешем.

### Что такое bcrypt?
`bcrypt` — алгоритм хеширования паролей с встроенной **солью** (случайные данные, добавляемые перед хешированием). Это защищает от атак по радужным таблицам. Параметр `saltRounds` (обычно 10) определяет вычислительную сложность — чем больше, тем медленнее перебор.

```js
// Хеширование при регистрации
const passwordHash = await bcrypt.hash(password, 10);

// Проверка при входе
const isValid = await bcrypt.compare(password, user.passwordHash);
```

## Что реализовано

### Сервер
- `POST /api/auth/register` — создаёт пользователя, хеширует пароль через `bcrypt.hash(password, 10)`
- `POST /api/auth/login` — проверяет пароль через `bcrypt.compare`, возвращает данные пользователя
- Хранилище пользователей в памяти (массив `users`)
- Валидация: проверка обязательных полей, уникальность email

### Модель данных (User)
| Поле | Тип | Описание |
|---|---|---|
| `id` | string | Уникальный идентификатор (nanoid) |
| `email` | string | Email пользователя (логин) |
| `first_name` | string | Имя |
| `last_name` | string | Фамилия |
| `passwordHash` | string | Хеш пароля (bcrypt) — никогда не возвращается клиенту |

### API эндпоинты
| Метод | Путь | Описание | Статус |
|---|---|---|---|
| POST | /api/auth/register | Регистрация | 201 / 400 / 409 |
| POST | /api/auth/login | Вход | 200 / 400 / 401 |
| GET | /api/cars | Список авто | 200 |
| POST | /api/cars | Создать авто | 201 / 400 |
| GET | /api/cars/:id | Авто по id | 200 / 404 |
| PUT | /api/cars/:id | Обновить авто | 200 / 404 |
| DELETE | /api/cars/:id | Удалить авто | 204 / 404 |

### Пример запроса регистрации
```json
POST /api/auth/register
{
  "email": "ivan@test.com",
  "first_name": "Иван",
  "last_name": "Иванов",
  "password": "secret123"
}
```

### Пример ответа входа
```json
POST /api/auth/login
→ 200 OK
{
  "id": "abc123",
  "email": "ivan@test.com",
  "first_name": "Иван",
  "last_name": "Иванов"
}
```

## Как запустить
```bash
cd practice-07-auth
npm install
npm start
```
Сервер: `http://localhost:3000`  
Тестировать через Postman.

---

# ✅ Практика 8 — JWT (access-токен)

## Цель
Научиться выдавать JWT-токен при входе и защищать маршруты с помощью `authMiddleware`.

## Теория

### Что такое JWT?
**JWT (JSON Web Token)** — стандарт передачи данных между клиентом и сервером в виде подписанного токена. Состоит из трёх частей, разделённых точкой:

```
header.payload.signature
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMiLCJlbWFpbCI6Ii4uLiJ9.SflKxw...
```

- **Header** — алгоритм подписи (HS256)
- **Payload** — данные: `sub` (id пользователя), `email`, `role`, `exp` (срок истечения)
- **Signature** — HMAC-подпись с секретным ключом, защищает от подделки

### Как работает схема?
1. Пользователь входит → сервер генерирует `accessToken` (срок 15 минут)
2. Клиент сохраняет токен и передаёт в каждом запросе: `Authorization: Bearer <token>`
3. `authMiddleware` проверяет подпись через `jwt.verify()` → если валиден, пропускает запрос

```js
// Генерация токена
function generateAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    ACCESS_SECRET,
    { expiresIn: '15m' }
  );
}

// Middleware проверки
function authMiddleware(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token)
    return res.status(401).json({ error: 'Missing Authorization header' });
  try {
    req.user = jwt.verify(token, ACCESS_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
```

## Что реализовано

### Что добавлено к практике 7
- `POST /api/auth/login` теперь возвращает `accessToken`
- `GET /api/auth/me` — защищённый маршрут, возвращает текущего пользователя
- `authMiddleware` — проверяет `Bearer <token>` в заголовке `Authorization`
- Маршруты `/api/cars/:id` (GET, PUT, DELETE) защищены `authMiddleware`

### API эндпоинты
| Метод | Путь | Защита | Описание | Статус |
|---|---|---|---|---|
| POST | /api/auth/register | — | Регистрация | 201 / 400 / 409 |
| POST | /api/auth/login | — | Вход, получение accessToken | 200 / 401 |
| GET | /api/auth/me | ✅ | Данные текущего пользователя | 200 / 401 |
| GET | /api/cars | — | Все автомобили | 200 |
| GET | /api/cars/:id | ✅ | Авто по id | 200 / 401 / 404 |
| PUT | /api/cars/:id | ✅ | Обновить авто | 200 / 401 / 404 |
| DELETE | /api/cars/:id | ✅ | Удалить авто | 204 / 401 / 404 |

### Пример ответа логина
```json
POST /api/auth/login
→ 200 OK
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwiZW1haWwiOiIuLi4iLCJleHAiOjE3MDAwMDAwMDB9.xxx"
}
```

### Пример защищённого запроса
```
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

## Как запустить
```bash
cd practice-08-jwt
npm install
npm start
```
Сервер: `http://localhost:3000`  
Тестировать через Postman (добавить токен в заголовок Authorization).

---

# ✅ Практика 9 — Refresh-токены

## Цель
Решить проблему короткого срока жизни access-токена: добавить **refresh-токен** и механизм ротации пары токенов без повторного входа.

## Теория

### Проблема короткого access-токена
Access-токен живёт 15 минут — это безопасно, но неудобно: пользователю придётся снова вводить логин/пароль каждые 15 минут.

### Решение — refresh-токен
При входе сервер выдаёт **два токена**:
- `accessToken` — короткий (15 мин), используется в каждом запросе
- `refreshToken` — длинный (7 дней), хранится безопасно, используется **только** для получения новой пары

### Ротация токенов
При обновлении старый `refreshToken` **удаляется** из хранилища и выдаётся новая пара. Это защищает от повторного использования перехваченного refresh-токена.

```
Клиент                          Сервер
  |  POST /auth/login              |
  |-----------------------------→  |
  |  ← accessToken (15m)          |
  |  ← refreshToken (7d)          |
  |                                |
  |  [через 15 минут]              |
  |  GET /api/cars                 |
  |  Authorization: Bearer <exp>   |
  |-----------------------------→  |
  |  ← 401 Unauthorized           |
  |                                |
  |  POST /auth/refresh            |
  |  { refreshToken: "..." }       |
  |-----------------------------→  |
  |  ← новый accessToken          |
  |  ← новый refreshToken         |
```

## Что реализовано

### Что добавлено к практике 8
- `POST /api/auth/login` теперь возвращает и `accessToken`, и `refreshToken`
- `POST /api/auth/refresh` — принимает `refreshToken`, проверяет, удаляет старый, выдаёт новую пару
- Хранилище refresh-токенов в памяти (`Set<string>`)
- `refreshToken` подписывается отдельным секретом `REFRESH_SECRET`

### API эндпоинты
| Метод | Путь | Описание | Статус |
|---|---|---|---|
| POST | /api/auth/register | Регистрация | 201 / 400 / 409 |
| POST | /api/auth/login | Вход, получение пары токенов | 200 / 401 |
| POST | /api/auth/refresh | Обновление пары токенов | 200 / 400 / 401 |
| GET | /api/auth/me | Текущий пользователь | 200 / 401 |

### Формат ответа `/api/auth/login` и `/api/auth/refresh`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

### Формат запроса `/api/auth/refresh`
```json
POST /api/auth/refresh
{
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

## Как запустить
```bash
cd practice-09-refresh
npm install
npm start
```
Сервер: `http://localhost:3000`

---

# ✅ Практика 10 — Фронтенд + аутентификация

## Цель
Подключить React-клиент к серверу с JWT-аутентификацией.  
Реализовать хранение токенов, защищённые маршруты и **автоматическое обновление токенов** через axios interceptors.

## Теория

### Где хранить токены?
- **localStorage** — простой доступ из JS, но уязвим к XSS-атакам. Используется в учебных проектах и SPA
- **httpOnly cookie** — недоступен для JS, защищён от XSS, но требует настройки CSRF-защиты

В этом проекте используется `localStorage` как наиболее простой подход для SPA.

### Что такое axios interceptors?
**Interceptors** — перехватчики запросов/ответов в axios. Позволяют централизованно:
- Добавлять заголовок `Authorization` к каждому запросу
- Автоматически обновлять токен при получении `401 Unauthorized`

```js
// Request interceptor — добавляет токен
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — обновляет токен при 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      // запрашиваем новую пару токенов
      const { data } = await axios.post('/api/auth/refresh', { refreshToken });
      localStorage.setItem('accessToken', data.accessToken);
      // повторяем исходный запрос с новым токеном
      return apiClient(error.config);
    }
    return Promise.reject(error);
  }
);
```

## Структура клиента
```text
client/src/
  api/
    client.js          — axios instance + interceptors
  components/
    PrivateRoute.jsx   — редирект на /login если нет токена
    CarModal.jsx       — модалка добавить/редактировать авто
  pages/
    LoginPage.jsx      — форма входа
    RegisterPage.jsx   — форма регистрации
    CarsPage.jsx       — список авто (только для авторизованных)
    CarDetailPage.jsx  — детальная страница авто
  App.js               — роутинг
```

## Что реализовано

### Клиент
- Страница входа (`/login`) — форма email + пароль, сохранение токенов в `localStorage`
- Страница регистрации (`/register`) — форма с полями email, имя, фамилия, пароль
- Страница каталога (`/cars`) — список авто, добавление/редактирование через модалку
- Детальная страница (`/cars/:id`) — информация об одном авто
- `PrivateRoute` — если токена нет, редирект на `/login`
- axios interceptors — автоподстановка токена + автообновление при истечении

### Как работает защита роутов
```jsx
// PrivateRoute проверяет наличие токена в localStorage
function PrivateRoute({ children }) {
  const token = localStorage.getItem('accessToken');
  return token ? children : <Navigate to="/login" />;
}

// В App.js
<Route path="/cars" element={<PrivateRoute><CarsPage /></PrivateRoute>} />
```

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

| URL | Описание |
|---|---|
| `http://localhost:3001` | React-приложение |
| `http://localhost:3001/login` | Страница входа |
| `http://localhost:3001/register` | Страница регистрации |
| `http://localhost:3001/cars` | Каталог (только авторизованные) |
| `http://localhost:3000/api/cars` | REST API |

---

# ✅ Практика 11 — RBAC (роли)

## Цель
Добавить систему ролей (**Role-Based Access Control**) — ограничить доступ к маршрутам в зависимости от роли пользователя на сервере и скрыть кнопки на клиенте.

## Теория

### Что такое RBAC?
**RBAC (Role-Based Access Control)** — модель контроля доступа, при которой права назначаются не каждому пользователю отдельно, а через **роли**. Каждая роль — набор разрешений.

Вместо: «пользователь Иван может создавать товары»  
Делаем: «роль `seller` может создавать товары, Иван имеет роль `seller`»

### Роли в проекте
| Роль | Права |
|---|---|
| `user` | Только просмотр каталога |
| `seller` | Просмотр + добавление + редактирование авто |
| `admin` | Все права + удаление авто + управление пользователями |

### Как реализован roleMiddleware?
```js
// Принимает массив разрешённых ролей
function roleMiddleware(allowedRoles) {
  return (req, res, next) => {
    // req.user установлен authMiddleware из JWT
    if (!req.user || !allowedRoles.includes(req.user.role))
      return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

// Использование — цепочка middleware
app.delete('/api/cars/:id',
  authMiddleware,              // 1. проверяем токен
  roleMiddleware(['admin']),   // 2. проверяем роль
  (req, res) => { ... }        // 3. обработчик
);
```

### Роль хранится в JWT
При генерации токена роль записывается в payload:
```js
jwt.sign({ sub: user.id, email: user.email, role: user.role }, SECRET)
```
На клиенте роль читается из токена без запроса к серверу:
```js
const role = JSON.parse(atob(token.split('.')[1])).role;
```

## Структура

```text
practice-11-rbac/
  server/
    index.js     — Express + Auth + roleMiddleware + RBAC маршруты
  client/src/
    api/
      client.js             — axios + interceptors
    components/
      PrivateRoute.jsx      — защита роутов + проверка роли
      CarItem.jsx           — карточка авто (кнопки по роли)
      CarsList.jsx          — список авто
      CarModal.jsx          — модалка добавить/редактировать
    pages/
      CarsPage.jsx          — каталог с ролевыми кнопками
      UsersPage.jsx         — управление пользователями (admin)
      LoginPage.jsx
      RegisterPage.jsx
    App.js
```

## Таблица доступа
| Маршрут | Метод | Роль | Статус при нарушении |
|---|---|---|---|
| /api/auth/register | POST | Все | — |
| /api/auth/login | POST | Все | — |
| /api/auth/refresh | POST | Все | — |
| /api/auth/me | GET | user, seller, admin | 401 |
| /api/cars | GET | user, seller, admin | 401 / 403 |
| /api/cars/:id | GET | user, seller, admin | 401 / 403 |
| /api/cars | POST | seller, admin | 403 |
| /api/cars/:id | PUT | seller, admin | 403 |
| /api/cars/:id | DELETE | admin | 403 |
| /api/users | GET | admin | 403 |
| /api/users/:id | PUT | admin | 403 |
| /api/users/:id | DELETE | admin | 403 |

## Ролевые кнопки на клиенте
```jsx
// Кнопки видны только нужным ролям
{['seller', 'admin'].includes(role) && (
  <button onClick={() => onEdit(car)}>✏️ Изменить</button>
)}
{role === 'admin' && (
  <button onClick={() => onDelete(car.id)}>🗑️ Удалить</button>
)}
```

> ⚠️ Скрытие кнопок на клиенте — это только UX-удобство.  
> Реальная защита работает на **сервере** через `roleMiddleware`.

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

| URL | Описание |
|---|---|
| `http://localhost:3001` | React-приложение |
| `http://localhost:3001/users` | Страница пользователей (только admin) |
| `http://localhost:3000/api/cars` | REST API |

---

# ⭐ Практика 12 — Итоговый проект (КР2)

## Цель
Объединить результаты практик 6–11 в единое приложение:
- UI (React) + тёмная тема (Sass/SCSS) из практики 6
- REST API (Express CRUD) с полной Swagger-документацией
- Аутентификация: bcrypt + JWT access/refresh токены
- Авторизация: RBAC (роли user / seller / admin)

## Структура
```text
practice-12-final/
  server/
    app.js              — Express API + Auth + RBAC + Swagger
    package.json
  client/
    src/
      api/
        client.js             — axios instance + request/response interceptors
      components/
        CarItem.jsx            — карточка авто с ролевыми кнопками
        CarsList.jsx           — список авто (grid-layout)
        CarModal.jsx           — модалка добавить/редактировать
        PrivateRoute.jsx       — защита роутов + проверка роли из JWT
      pages/
        CarsPage/
          CarsPage.jsx         — каталог с toolbar, ролевые кнопки, ссылка Swagger
          CarsPage.scss        — тёмная тема (SCSS, переменные, миксины)
        LoginPage.jsx          — форма входа, тёмная тема
        RegisterPage.jsx       — форма регистрации с выбором роли
        UsersPage.jsx          — управление пользователями (только admin)
      auth.scss                — общие стили страниц аутентификации
      App.js                   — роутинг всего приложения
```

## 🖥️ Сервер

### Что реализовано
- `express.json()` — чтение JSON тела запросов
- CORS — разрешение запросов с `http://localhost:3001`
- Логирование всех запросов (метод, статус, путь, body)
- `authMiddleware` — проверка JWT access-токена в заголовке
- `roleMiddleware(roles)` — проверка роли из payload токена
- Swagger UI с `bearerAuth` схемой — `/api-docs`
- Полный CRUD автомобилей с ролевой защитой
- Управление пользователями (только admin)
- Блокировка пользователей (мягкое удаление — флаг `blocked: true`)

### Модель данных (Car)
| Поле | Тип | Описание |
|---|---|---|
| `id` | string | Уникальный идентификатор (nanoid) |
| `name` | string | Название автомобиля |
| `category` | string | Категория (Седан, SUV и т.д.) |
| `description` | string | Краткое описание |
| `price` | number | Стоимость в рублях |
| `stock` | number | Количество на складе |

### Модель данных (User)
| Поле | Тип | Описание |
|---|---|---|
| `id` | string | Уникальный идентификатор |
| `email` | string | Email (логин) |
| `first_name` | string | Имя |
| `last_name` | string | Фамилия |
| `passwordHash` | string | Хеш пароля (bcrypt, не возвращается клиенту) |
| `role` | string | Роль: `user` / `seller` / `admin` |
| `blocked` | boolean | Заблокирован ли пользователь |

### API эндпоинты
| Метод | Путь | Роль | Описание | Статус |
|---|---|---|---|---|
| POST | /api/auth/register | Все | Регистрация | 201 / 400 / 409 |
| POST | /api/auth/login | Все | Вход, пара токенов | 200 / 401 / 403 |
| POST | /api/auth/refresh | Все | Обновление пары токенов | 200 / 400 / 401 |
| GET | /api/auth/me | user+ | Текущий пользователь | 200 / 401 |
| GET | /api/cars | user+ | Список авто | 200 / 401 |
| GET | /api/cars/:id | user+ | Авто по id | 200 / 401 / 404 |
| POST | /api/cars | seller, admin | Создать авто | 201 / 400 / 403 |
| PATCH | /api/cars/:id | seller, admin | Обновить авто | 200 / 403 / 404 |
| DELETE | /api/cars/:id | admin | Удалить авто | 204 / 403 / 404 |
| GET | /api/users | admin | Список пользователей | 200 / 403 |
| PUT | /api/users/:id | admin | Обновить пользователя | 200 / 403 / 404 |
| DELETE | /api/users/:id | admin | Заблокировать | 204 / 403 / 404 |
| GET | /api-docs | — | Swagger UI | 200 |

## 🌐 Клиент

### Что реализовано
- **Страница входа** (`/login`) — форма email/пароль, тёмная тема
- **Страница регистрации** (`/register`) — форма с выбором роли (user/seller/admin)
- **Каталог авто** (`/cars`) — список карточек, кнопки по роли, ссылка на Swagger
- **Страница пользователей** (`/users`) — таблица, смена роли через select, блокировка (только admin)
- **PrivateRoute** — защита маршрутов: без токена → `/login`, без роли → `/cars`
- **axios interceptors** — автоподстановка токена + автообновление пары при `401`

### Как работает автообновление токена
```
1. Запрос с истёкшим accessToken → сервер отвечает 401
2. Response interceptor перехватывает 401
3. Отправляет POST /api/auth/refresh с refreshToken
4. Получает новую пару, сохраняет в localStorage
5. Повторяет исходный запрос с новым accessToken
6. Пользователь ничего не замечает
```

### Ролевая логика на клиенте
| Элемент интерфейса | user | seller | admin |
|---|---|---|---|
| Кнопка «+ Добавить» | ❌ | ✅ | ✅ |
| Кнопка «✏️ Изменить» | ❌ | ✅ | ✅ |
| Кнопка «🗑️ Удалить» | ❌ | ❌ | ✅ |
| Кнопка «👥 Пользователи» | ❌ | ❌ | ✅ |
| Страница `/users` | ❌ | ❌ | ✅ |

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

## 🔗 Адреса итогового проекта
| URL | Описание |
|---|---|
| `http://localhost:3001` | React-приложение |
| `http://localhost:3001/login` | Страница входа |
| `http://localhost:3001/register` | Страница регистрации |
| `http://localhost:3001/cars` | Каталог авто (авторизованные) |
| `http://localhost:3001/users` | Управление пользователями (admin) |
| `http://localhost:3000/api/cars` | REST API автомобилей |
| `http://localhost:3000/api/auth/login` | Эндпоинт аутентификации |
| `http://localhost:3000/api-docs` | Swagger UI (документация + тестирование) |

## 🧪 Тестовые аккаунты
Зарегистрировать через форму регистрации на `/register` (выбрать нужную роль):

| Email | Роль | Что доступно |
|---|---|---|
| `user@test.com` | `user` | Просмотр каталога |
| `seller@test.com` | `seller` | + Добавление и редактирование авто |
| `admin@test.com` | `admin` | + Удаление авто + страница пользователей |

---

# ✅ Практика 13 — Service Worker (Cache First)

## Цель
Зарегистрировать Service Worker, кэшировать статику приложения «Авто-задачи» и обеспечить **офлайн-режим**: после первой загрузки PWA должно открываться даже без сети.

## Теория

### Что такое Service Worker
**Service Worker (SW)** — JavaScript-воркер в отдельном потоке, играет роль программируемого прокси между страницей и сетью. Перехватывает `fetch`, читает и пишет в `Cache Storage`, работает в фоне.

Жизненный цикл: **register → install → activate → fetch**. На каждый сетевой запрос вызывается `fetch`-обработчик, в котором мы решаем — отдать из кэша, из сети или скомбинировать.

### Стратегия Cache First
```
запрос → есть в кэше? → да → отдаём из кэша
                       → нет → идём в сеть → отдаём ответ
```
Подходит для неизменной статики (HTML/CSS/JS, иконки): мгновенный ответ, работа офлайн. При изменении файлов нужно поднять версию кэша (`car-notes-v1` → `v2`).

## Что реализовано

### Файлы
| Файл | Назначение |
|---|---|
| `index.html` | Каркас и контейнер списка задач |
| `app.js` | Логика to-do (localStorage) + регистрация SW |
| `sw.js` | Service Worker: install / activate / fetch |
| `style.css` | Тёмная тема |

### sw.js
```js
const CACHE_NAME = 'car-notes-v1';
const ASSETS = ['/', '/index.html', '/style.css', '/app.js'];

self.addEventListener('install', e => e.waitUntil(
  caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
));

self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(keys => Promise.all(
    keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
  ))
));

self.addEventListener('fetch', e => e.respondWith(
  caches.match(e.request).then(cached => cached || fetch(e.request))
));
```

### Регистрация в app.js
```js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () =>
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered:', reg.scope))
  );
}
```

## Как запустить
```bash
cd practice-13-service-worker
# Открыть index.html через любой статический сервер (для PWA нужен http(s)://, не file://)
npx serve .
```
DevTools → Application → Service Workers → статус `activated`. Offline + reload → приложение работает.

---

# ✅ Практика 14 — Web App Manifest (установка PWA)

## Цель
Добавить **manifest.json**, иконки и мета-теги, чтобы приложение можно было установить как нативное (значок на рабочем столе, полноэкранный режим, цвет темы).

## Теория

### Web App Manifest
JSON-файл с описанием PWA для браузера и ОС: имя, иконки, режим отображения, цвет темы. Подключается через `<link rel="manifest" href="/manifest.json">`.

### Условия для предложения установки
- HTTPS (или localhost),
- Service Worker зарегистрирован,
- Валидный `manifest.json` с иконками 192 и 512 px,
- Поля `start_url`, `display`.

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

### Подключение в index.html
```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#0b0f19">
<meta name="mobile-web-app-capable" content="yes">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
```

### Иконки в `icons/`
`favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png` (180×180), `android-chrome-192x192.png`, `android-chrome-512x512.png`.

## Как проверить
1. DevTools → **Application → Manifest** — все поля валидны.
2. В адресной строке Chrome — значок «Установить приложение», нажать.
3. Приложение откроется без адресной строки (`display: standalone`), цвет шапки соответствует `theme_color`.

---

# ✅ Практика 15 — HTTPS + App Shell

## Цель
1. Запустить приложение **по HTTPS** локально (необходимо для Service Worker, push, геолокации).
2. Перейти к архитектуре **App Shell**: каркас (шапка, табы, футер) грузится мгновенно из кэша, контент страниц подгружается динамически через `fetch`.

## Теория

### App Shell
```
┌────────────────────────────────────┐
│  HEADER  (всегда виден)            │   ← cache-first
├──────────┬─────────────────────────┤
│  TABS    │  Главная │ О приложении │   ← cache-first
├──────────┴─────────────────────────┤
│  CONTENT (подгружается /content/*)│   ← network-first
└────────────────────────────────────┘
│  FOOTER                            │   ← cache-first
└────────────────────────────────────┘
```
Каркас и контент кэшируются разными стратегиями в разных кэшах:
- **Cache First** для статики → `car-shell-v1`,
- **Network First** для `/content/*` → `car-dynamic-v1`, фолбек на `home.html`.

### Локальный HTTPS через mkcert
`mkcert` создаёт самоподписанный сертификат и добавляет его в системное доверенное хранилище — Chrome не ругается.

## Что реализовано

### Структура
```text
practice-15-app-shell/
├── content/
│   ├── home.html      ← форма + список задач (динамически)
│   └── about.html     ← статичная страница «О приложении»
├── icons/
├── index.html         ← App Shell (header + tabs + main + footer)
├── app.js             ← навигация + initNotes() + регистрация SW
├── sw.js              ← две стратегии: Cache First и Network First
├── manifest.json
└── style.css
```

### app.js — динамическая загрузка
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

### sw.js — две стратегии
```js
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  if (url.pathname.startsWith('/content/')) {              // Network First
    event.respondWith(
      fetch(event.request)
        .then(res => {
          const clone = res.clone();
          caches.open(DYNAMIC_CACHE).then(c => c.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request).then(c => c || caches.match('/content/home.html')))
    );
    return;
  }

  event.respondWith(caches.match(event.request).then(c => c || fetch(event.request)));   // Cache First
});
```

## Как запустить
```powershell
choco install mkcert
mkcert -install
cd practice-15-app-shell
mkcert localhost 127.0.0.1 ::1

npm install -g http-server
http-server . --ssl --cert localhost.pem --key localhost-key.pem -p 3000
```
Открыть `https://localhost:3000`.

## Что проверить
1. Application → Cache Storage — два кэша: `car-shell-v1`, `car-dynamic-v1`.
2. DevTools → Security — статус `Secure`.
3. Slow 3G + reload — каркас сразу, контент чуть позже.
4. Offline + reload — приложение полностью грузится из кэша.

---

# ✅ Практика 16 — WebSocket + Web Push

## Цель
1. **WebSocket** через Socket.IO — двусторонняя связь сервер↔клиент (toast «Новая задача» в реальном времени между вкладками).
2. **Web Push** — уведомления приходят на ОС даже при закрытой вкладке.

## Теория

### WebSocket vs HTTP
HTTP — запрос-ответ, инициатива у клиента. **WebSocket** — постоянное двустороннее соединение, сервер сам шлёт данные клиенту. **Socket.IO** — обёртка с автопереподключением и событиями.
```
клиент: socket.emit('newCarTask', task)
сервер: io.on('connection', s => s.on('newCarTask', t => io.emit('carTaskAdded', t)))
клиент: socket.on('carTaskAdded', task => showToast(...))
```

### Web Push и VAPID
```
сервер → push-сервис (FCM/Mozilla/…) → браузер → Service Worker → showNotification
```
**VAPID** — пара ключей (public/private) для подписи push-сообщений. Публичный отдаётся клиенту, приватный остаётся на сервере.

```bash
npx web-push generate-vapid-keys
```

Клиент подписывается через `PushManager.subscribe({ applicationServerKey })`, получает `{endpoint, keys}` и шлёт на сервер. Сервер хранит подписки и отправляет push через `webpush.sendNotification(sub, payload)`.

## Что реализовано

### Серверные эндпоинты
| Метод | Путь | Описание |
|---|---|---|
| GET  | `/api/vapid-public-key` | Публичный VAPID-ключ |
| POST | `/subscribe`            | Сохранить push-подписку |
| POST | `/unsubscribe`          | Удалить подписку |

### Socket.IO события
| Событие | Кто | Назначение |
|---|---|---|
| `newCarTask`   | client → server | новая задача создана |
| `carTaskAdded` | server → all clients | broadcast — toast |

### Сервер — broadcast + push
```js
io.on('connection', (socket) => {
  socket.on('newCarTask', (task) => {
    io.emit('carTaskAdded', task);
    const payload = JSON.stringify({ title: '🚗 Новая задача', body: task.text });
    subscriptions.forEach(sub =>
      webpush.sendNotification(sub, payload).catch(console.error)
    );
  });
});
```

### Клиент — подписка
```js
async function subscribeToPush() {
  const reg = await navigator.serviceWorker.ready;
  const { key } = await fetch('/api/vapid-public-key').then(r => r.json());
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(key)
  });
  await fetch('/subscribe', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify(sub)
  });
}
```

### Service Worker
```js
self.addEventListener('push', (event) => {
  const data = event.data.json();
  event.waitUntil(self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icons/android-chrome-192x192.png',
    badge: '/icons/favicon-32x32.png'
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});
```

## Как запустить
```bash
cd practice-16-websocket-push
npm install
npx web-push generate-vapid-keys     # подставить в server.js
npm start                            # http://localhost:3001
```

## Как проверить
1. Открыть **две вкладки**.
2. В одной нажать «🔔 Включить уведомления», разрешить.
3. В другой добавить задачу — в первой появится toast.
4. Свернуть браузер → добавить задачу → push приходит на уровне ОС.

---

# ✅ Практика 17 — Детализация Push (запланированные напоминания)

## Цель
Добавить **запланированные напоминания**: пользователь выбирает дату/время, сервер планирует push на этот момент. В уведомлении — кнопка **«⏸ Отложить на 5 минут»**, которая пересоздаёт таймер.

## Теория

### Actions в push-уведомлении
```js
{
  actions: [
    { action: 'snooze', title: '⏸ Отложить на 5 минут' }
  ]
}
```
При нажатии срабатывает `notificationclick` с `event.action === 'snooze'`. Через `event.waitUntil(fetch(...))` SW делает запрос на сервер, не закрывая уведомление до завершения.

### Хранение таймеров
Сервер держит `Map<id, { timeoutId, text, reminderTime }>`. При snooze:
```js
clearTimeout(reminder.timeoutId);
const newTime = Date.now() + 5 * 60 * 1000;
scheduleReminder({ id, text, reminderTime: newTime });
```

## Что реализовано

### Структура задач в localStorage
```js
[
  { id: 1700000000000, text: 'ТО Audi A4', done: false, reminder: 1700003600000 }
]
```

### Серверные эндпоинты
| Метод | Путь | Описание |
|---|---|---|
| GET  | `/api/vapid-public-key`  | Публичный VAPID-ключ |
| POST | `/subscribe`             | Сохранить подписку |
| POST | `/unsubscribe`           | Удалить подписку |
| POST | `/snooze?reminderId=…`   | Перепланировать на +5 минут |
| GET  | `/reminders`             | Список активных напоминаний (отладка) |

### Socket.IO события
| Событие | Описание |
|---|---|
| `newCarTask`        | новая задача без напоминания |
| `carTaskAdded`      | broadcast — toast |
| `newReminder`       | задача с напоминанием → сервер планирует таймер |
| `reminderScheduled` | подтверждение от сервера |
| `reminderSnoozed`   | broadcast: напоминание отложено |

### Серверный планировщик
```js
const reminders = new Map();
const SNOOZE_MS = 5 * 60 * 1000;

function scheduleReminder({ id, text, reminderTime }) {
  const delay = reminderTime - Date.now();
  if (delay <= 0) return;
  const timeoutId = setTimeout(() => {
    broadcastPush({ title: '⏰ Напоминание', body: text, reminderId: id });
    reminders.delete(id);
  }, delay);
  reminders.set(id, { timeoutId, text, reminderTime });
}

app.post('/snooze', (req, res) => {
  const id = Number(req.query.reminderId);
  const r = reminders.get(id);
  if (!r) return res.status(404).json({ error: 'Not found' });
  clearTimeout(r.timeoutId);
  scheduleReminder({ id, text: r.text, reminderTime: Date.now() + SNOOZE_MS });
  res.json({ message: 'Snoozed' });
});
```

### Push с действием в Service Worker
```js
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const options = {
    body: data.body, icon: '/icons/android-chrome-192x192.png',
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

## Как запустить
```bash
cd practice-17-push-reminders
npm install
npx web-push generate-vapid-keys     # подставить в server.js
npm start                            # http://localhost:3001
```

## Как проверить
1. Разрешить уведомления.
2. Создать задачу с напоминанием на 2–3 минуты вперёд.
3. Закрыть вкладку.
4. В нужное время приходит push с кнопкой «⏸ Отложить на 5 минут».
5. Нажать — push повторится через 5 минут.

---

# ⭐ Практика 18 — Итоговый проект (КР3)

## Цель
Собрать практики 13–17 в единое PWA «Авто-задачи»:
- Service Worker + офлайн (13)
- Web App Manifest + установка (14)
- HTTPS + App Shell с двумя кэшами (15)
- WebSocket + Web Push (16)
- Запланированные напоминания + snooze (17)

Самое полное приложение блока — `practice-17-push-reminders/` (унаследовало всё от предыдущих).

## Архитектура (на примере практики 17)

```
┌─────────────────────────────────────────────────────────────┐
│                       Browser                               │
│  ┌────────────┐  ┌────────────────┐  ┌──────────────────┐   │
│  │ App Shell  │  │ /content/*.html│  │  Service Worker  │   │
│  │  (cached)  │  │ (network-first)│  │  (cache + push)  │   │
│  └────────────┘  └────────────────┘  └──────────────────┘   │
│        │                  │                    │            │
│        └──────── localStorage (задачи) ────────┘            │
│        │                  │                    │            │
└────────┼──────────────────┼────────────────────┼────────────┘
         │ Socket.IO        │ HTTP fetch         │ Push (через ОС)
         ▼                  ▼                    ▲
┌─────────────────────────────────────────────────────────────┐
│  Express + Socket.IO + web-push (server.js, port 3001)      │
│                                                             │
│  subscriptions[]                                            │
│  reminders: Map<id, { timeoutId, text, reminderTime }>      │
│                                                             │
│  /subscribe   /unsubscribe   /snooze   /reminders           │
└─────────────────────────────────────────────────────────────┘
```

## 🔗 Адреса итогового приложения (КР3)
| URL | Описание |
|---|---|
| `http://localhost:3001/`                    | PWA «Авто-задачи» |
| `http://localhost:3001/content/home.html`   | Динамический контент главной |
| `http://localhost:3001/content/about.html`  | Динамический контент «О приложении» |
| `http://localhost:3001/api/vapid-public-key`| Публичный VAPID-ключ |
| `http://localhost:3001/reminders`           | Список активных напоминаний |

## Чек-лист
- [x] SW регистрируется, статика кэшируется.
- [x] manifest валиден, иконки 192/512, можно установить PWA.
- [x] App Shell + два кэша работают, offline загружается.
- [x] Socket.IO рассылает события между вкладками.
- [x] Push приходит при закрытой вкладке.
- [x] Запланированное напоминание срабатывает в нужное время.
- [x] Snooze пересоздаёт таймер на +5 минут.

## Как запустить
```bash
cd practice-17-push-reminders
npm install
npx web-push generate-vapid-keys     # подставить в server.js
npm start                            # http://localhost:3001
```

---

# ✅ Практика 19 — PostgreSQL

## Цель
REST API для управления автомобилями на **Express + pg + PostgreSQL**. Параметризованные запросы, проверки целостности (`CHECK`, `UNIQUE`), индексы.

## Теория

### Реляционная СУБД
Хранит данные в **таблицах** с фиксированной схемой. Каждая колонка имеет тип, есть индексы и ограничения целостности (`PRIMARY KEY`, `FOREIGN KEY`, `UNIQUE`, `CHECK`). Запросы — на **SQL**.

### Драйвер `pg` и пул соединений
```js
const { Pool } = require('pg');
const pool = new Pool({ user, host, database, password, port });

// Параметризованный запрос — защита от SQL-инъекций
const { rows } = await pool.query('SELECT * FROM cars WHERE id = $1', [id]);
```

## Что реализовано

### Модель Car
| Поле | Тип | Описание |
|---|---|---|
| id          | `SERIAL PRIMARY KEY`        | автоинкремент |
| brand       | `VARCHAR(80) NOT NULL`      | производитель |
| model       | `VARCHAR(120) NOT NULL`     | модель |
| year        | `INTEGER` (CHECK 1900–2100) | год выпуска |
| price       | `NUMERIC(12,2)` (CHECK ≥0)  | цена ₽ |
| vin         | `VARCHAR(17) UNIQUE`        | VIN |
| created_at  | `TIMESTAMPTZ DEFAULT NOW()` | создан |
| updated_at  | `TIMESTAMPTZ DEFAULT NOW()` | обновлён |

Индексы: `idx_cars_brand`, `idx_cars_year`.

### API эндпоинты
| Метод | Путь | Описание | Статус |
|---|---|---|---|
| GET    | /api/cars       | Все авто               | 200 |
| GET    | /api/cars/:id   | Авто по id             | 200 / 404 |
| POST   | /api/cars       | Создать                | 201 / 400 / 409 |
| PATCH  | /api/cars/:id   | Обновить (любые поля)  | 200 / 400 / 404 |
| DELETE | /api/cars/:id   | Удалить                | 204 / 404 |

### Динамический PATCH
```js
const fields = ['brand','model','year','price','vin'];
const updates = [], values = [];
let idx = 1;
for (const f of fields) {
  if (req.body[f] !== undefined) { updates.push(`${f} = $${idx++}`); values.push(req.body[f]); }
}
updates.push('updated_at = NOW()');
values.push(req.params.id);
const { rows } = await pool.query(
  `UPDATE cars SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
  values
);
```

## Как запустить
```bash
psql -U postgres -c "CREATE DATABASE cars_db;"
cd practice-19-postgres
npm install
npm run init-db        # таблица + индексы
npm start              # http://localhost:3000
```

---

# ✅ Практика 20 — MongoDB

## Цель
Тот же CRUD-API автомобилей, но на **MongoDB** через ODM **mongoose**. Сравнить с РСУБД: гибкая схема, документы, агрегации.

## Теория

### NoSQL и MongoDB
**MongoDB** — документоориентированная NoSQL-СУБД. Хранит **документы** (BSON ≈ бинарный JSON) в **коллекциях**. Документы могут иметь разные поля, вложенные структуры, массивы.

### Mongoose
```js
const carSchema = new mongoose.Schema({
  brand: { type: String, required: true },
  year:  { type: Number, min: 1900, max: 2100 }
}, { timestamps: true });

const Car = mongoose.model('Car', carSchema);
```
`timestamps: true` автоматически добавляет `createdAt` и `updatedAt`.

### Pipeline-агрегация
```js
Car.aggregate([
  { $group: { _id: '$brand', avgPrice: { $avg: '$price' }, count: { $sum: 1 } } },
  { $sort:  { avgPrice: -1 } }
]);
```

## Что реализовано

### Модель Car
| Поле | Тип | Описание |
|---|---|---|
| `_id`        | ObjectId                     | автоматический |
| `brand`      | String required, **index**   | производитель |
| `model`      | String required              | модель |
| `year`       | Number 1900–2100, **index**  | год |
| `price`      | Number ≥ 0                   | цена |
| `vin`        | String, **unique sparse**    | VIN-номер (опц.) |
| `createdAt`  | Date — timestamps            | создан |
| `updatedAt`  | Date — timestamps            | обновлён |

> **unique sparse** позволяет нескольким документам не иметь VIN, но если он есть — уникален.

### API эндпоинты
| Метод | Путь | Описание | Статус |
|---|---|---|---|
| GET    | /api/cars                   | Все авто           | 200 |
| GET    | /api/cars/:id               | Авто по id         | 200 / 400 / 404 |
| POST   | /api/cars                   | Создать            | 201 / 400 / 409 |
| PATCH  | /api/cars/:id               | Обновить           | 200 / 400 / 404 |
| DELETE | /api/cars/:id               | Удалить            | 204 / 404 |
| GET    | /api/cars-stats/avg-price   | **Бонус**: средняя цена по бренду | 200 |

### Пример агрегации
```json
GET /api/cars-stats/avg-price
[
  { "_id": "BMW",    "avgPrice": 7500000, "count": 2 },
  { "_id": "Audi",   "avgPrice": 4200000, "count": 1 },
  { "_id": "Toyota", "avgPrice": 2500000, "count": 3 }
]
```

## Как запустить
```bash
docker run -d -p 27017:27017 --name mongo mongo:7
cd practice-20-mongodb
npm install
npm start              # http://localhost:3000
```

## Сравнение PostgreSQL vs MongoDB
| Аспект | PostgreSQL (19) | MongoDB (20) |
|---|---|---|
| Схема       | Жёсткая (CREATE TABLE) | Гибкая (определяется в коде) |
| Запросы     | SQL                    | Mongoose API + JS-объекты |
| Уникальность| `UNIQUE` ограничение   | `unique: true` (+ sparse) |
| Связи       | `FOREIGN KEY`          | Ссылки `ref` или вложенные документы |
| Агрегации   | `GROUP BY`, оконные функции | Pipeline (`$group`, `$lookup`, …) |

---

# ✅ Практика 21 — Redis-кэш

## Цель
Добавить слой **кэша Redis** поверх RBAC-сервера из практики 11. Часто запрашиваемые данные отдавать из памяти Redis, а не пересчитывать каждый раз. Обеспечить **инвалидацию** кэша при изменении данных.

## Теория

### Redis
**Redis** — in-memory key-value хранилище. Используется как кэш, брокер сессий, очередь. Десятки тысяч операций в секунду, поддержка TTL.

```
SET   users:all  "{...}"  EX 60        # сохранить на 60 секунд
GET   users:all                        # прочитать
DEL   users:all                        # удалить
```

### Схема работы кэша
```
запрос → есть в Redis по ключу X? → да → отдать (source: cache)
                                   → нет → достать из источника
                                          → положить в Redis с TTL
                                          → отдать (source: server)
```

### Инвалидация
```js
async function invalidateCarsCache(id) {
  await redis.del('cars:all');
  if (id) await redis.del(`cars:${id}`);
}
```

## Что реализовано

### Кэширующий middleware
```js
function cacheMiddleware(keyBuilder, ttl) {
  return async (req, res, next) => {
    const key = keyBuilder(req);
    const cached = await redis.get(key);
    if (cached) return res.json({ source: 'cache', data: JSON.parse(cached) });
    req.cacheKey = key;
    req.cacheTTL = ttl;
    next();
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
{ "source": "cache", "data": [ ... ] }
```
Поле `source` нужно для отладки.

### Полная цепочка GET /api/cars
```js
app.get('/api/cars',
  authMiddleware,
  roleMiddleware(['user','seller','admin']),
  cacheMiddleware(() => 'cars:all', PRODUCTS_TTL),
  async (req, res) => {
    await saveToCache(req.cacheKey, cars, req.cacheTTL);
    res.json({ source: 'server', data: cars });
  }
);
```

## Как запустить
```bash
docker run -d --name redis-cars -p 6379:6379 redis:7-alpine
cd practice-21-redis-cache/server
npm install
npm start              # http://localhost:3000
```

## Как проверить
```bash
# Первый запрос — source: server
curl http://localhost:3000/api/cars -H "Authorization: Bearer $TOKEN"
# Повторный запрос в течение 10 минут — source: cache
# После PUT — снова source: server (инвалидация сработала)
```

---

# ✅ Практика 22 — Балансировка нагрузки (Nginx + HAProxy)

## Цель
Запустить **три идентичных backend-инстанса** cars-API на разных портах и распределить нагрузку. Сделать это двумя балансировщиками — **Nginx** и **HAProxy** — и проверить отказоустойчивость.

## Теория

### Алгоритмы Nginx
- **Round Robin** (по умолчанию) — запросы по кругу.
- **Least Connections** — на инстанс с минимумом активных соединений.
- **IP Hash** — клиент с одним IP всегда попадает на один и тот же инстанс.

### Отказоустойчивость в Nginx
```nginx
upstream cars_backend {
    server 127.0.0.1:3001 max_fails=2 fail_timeout=30s;
    server 127.0.0.1:3002 max_fails=2 fail_timeout=30s;
    server 127.0.0.1:3003 backup;
}
```
- `max_fails=2 fail_timeout=30s` — после 2 фейлов инстанс на 30 сек исключается.
- `backup` — резервный, используется если основные недоступны.

### HAProxy и health-check
```haproxy
backend cars_back
    balance roundrobin
    option httpchk GET /health
    server cars1 127.0.0.1:3001 check inter 5s fall 3 rise 2
```

## Что реализовано

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

### Backend (одинаковый код, разный SERVER_ID)
```js
const PORT      = Number(process.env.PORT) || 3000;
const SERVER_ID = process.env.SERVER_ID    || `cars-${PORT}`;

app.get('/', (req, res) => res.json({ server: SERVER_ID, host, port: PORT }));
app.get('/health', (req, res) => res.status(200).send('OK'));
```

## Как запустить
```bash
cd practice-22-load-balancing/backend && npm install
./start-backends.sh                     # Linux/WSL
.\start-backends.ps1                    # Windows

# Балансировщик
nginx  -c $(pwd)/../nginx/nginx.conf -p $(pwd)/../nginx       # :8080
haproxy -f ../haproxy/haproxy.cfg                              # :8090
```

## Как проверить
```bash
curl http://localhost:8080/   # повторить 4-6 раз
# server: cars-3001, cars-3002, cars-3001, cars-3002, …

# Отказоустойчивость
docker compose stop cars-3001
curl http://localhost:8080/   # все запросы идут на cars-3002
```

---

# ✅ Практика 23 — Контейнеризация (Docker + Docker Compose)

## Цель
То же приложение, что в практике 22, но в **контейнерах Docker**: каждый backend — отдельный контейнер, Nginx — отдельный контейнер. Всё запускается одной командой.

## Теория

### Docker
**Контейнер** упаковывает приложение со всеми зависимостями в изолированный образ. Запускается одинаково на любой машине, использует ядро ОС хоста (быстрее VM).

| Понятие | Что это |
|---|---|
| Image      | Шаблон с готовой ФС и зависимостями |
| Container  | Запущенный экземпляр образа |
| Dockerfile | Инструкции для сборки образа |
| Compose    | Декларативное описание стека |
| Volume     | Хранилище данных, переживает удаление контейнера |
| Network    | Изолированная сеть, контейнеры видят друг друга по DNS |

### Кэширование слоёв
```dockerfile
COPY package*.json ./
RUN npm install --omit=dev   # ← кэшируется отдельно
COPY . .                     # ← код меняется чаще
```

## Что реализовано

### Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### docker-compose.yml
```yaml
services:
  cars-backend-1:
    build: ./backend
    environment: [PORT=3000, SERVER_ID=cars-backend-1]
    networks: [cars-net]
  cars-backend-2:
    build: ./backend
    environment: [PORT=3000, SERVER_ID=cars-backend-2]
    networks: [cars-net]
  cars-backend-3:
    build: ./backend
    environment: [PORT=3000, SERVER_ID=cars-backend-3]
    networks: [cars-net]
  nginx:
    image: nginx:alpine
    depends_on: [cars-backend-1, cars-backend-2, cars-backend-3]
    ports: ["8080:80"]
    volumes: ["./nginx/nginx.conf:/etc/nginx/nginx.conf:ro"]
    networks: [cars-net]

networks:
  cars-net: { driver: bridge }
```

### Nginx внутри сети `cars-net`
```nginx
upstream cars_backend {
    # Балансировка по DNS-именам сервисов compose
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
│ nginx:alpine  │   ← единственный с пробросом порта наружу
└──────┬────────┘
       │ Round Robin (внутри cars-net)
       ├──→ cars-backend-1:3000
       ├──→ cars-backend-2:3000
       └──→ cars-backend-3:3000 (backup)
```

## Как запустить
```bash
cd practice-23-docker
docker compose up --build
```

## Полезные команды
```bash
docker compose ps
docker compose logs -f nginx
docker compose exec cars-backend-1 sh
docker compose down       # остановить
docker compose down -v    # + удалить тома
```

---

# ⭐ Практика 24 — Итоговый проект (КР4) — объединение всех 4 КР

## Цель
Собрать в один работающий проект всё, что было сделано за курс:

| КР | Что взято в `practice-24-kr4-final/` |
|---|---|
| **КР1** | React-клиент, тёмная тема на **Sass/SCSS**, **Swagger**-документация API (`/api-docs`), CRUD автомобилей |
| **КР2** | **JWT** access+refresh, **RBAC** (`user`/`seller`/`admin`), axios interceptors с автообновлением токена, `PrivateRoute` с проверкой роли |
| **КР3** | **PWA**: manifest + Service Worker + установка на устройство, **Socket.IO** для real-time toast'ов между вкладками, **Web Push** через VAPID |
| **КР4** | **PostgreSQL** для данных, **Redis** для кэша GET и общего хранилища push-подписок, **Socket.IO Redis adapter** для синхронизации событий между инстансами, **Nginx** балансирует **3 backend-контейнера**, всё в **Docker Compose** |

Поднимается **одной командой**: `docker compose up --build`.

## Структура
```text
practice-24-kr4-final/
│
├── frontend/                       # КР1+КР2+КР3 — React + Vite + Sass + PWA
│   ├── Dockerfile                  # multi-stage: build → nginx со встроенной статикой
│   ├── package.json
│   ├── vite.config.js              # dev-proxy /api и /socket.io на backend
│   ├── index.html                  # подключает manifest, иконки, тему
│   ├── public/
│   │   ├── manifest.json           # PWA-манифест
│   │   ├── sw.js                   # Service Worker: Cache First + push handler
│   │   └── icons/                  # 16/32/180/192/512
│   └── src/
│       ├── main.jsx                # регистрация SW + рендер App
│       ├── App.jsx                 # роутер + header + Socket.IO listener
│       ├── styles/{_variables,_mixins,main}.scss
│       ├── api/client.js           # axios + interceptors (auto-refresh 401)
│       ├── hooks/{useAuth,useToasts}.js
│       ├── pages/{Login,Register,Cars,Users}Page.jsx
│       └── components/{PrivateRoute,CarItem,CarModal,PushToggle}.jsx
│
├── backend/                        # КР1+КР2+КР3+КР4
│   ├── Dockerfile                  # FROM node:18-alpine + кэш слоёв
│   ├── package.json
│   └── src/
│       ├── server.js               # Express + Socket.IO + Redis adapter + Swagger
│       ├── db.js                   # pg.Pool
│       ├── redis.js                # main + pub + sub clients, кэш + push-подписки
│       ├── init-db.js              # CREATE TABLE users/cars + seed (admin + 5 авто)
│       ├── auth.js                 # JWT access/refresh + middleware
│       ├── push.js                 # web-push setVapidDetails + sendPushToAll
│       ├── swagger.js              # OpenAPI 3.0 spec через swagger-jsdoc
│       └── routes/
│           ├── auth.js             # register, login, refresh, me + Swagger
│           ├── users.js            # CRUD admin-only + Redis cache
│           ├── cars.js             # CRUD по RBAC + cache + io.emit + push
│           └── push.js             # vapid-public-key, subscribe, unsubscribe
│
├── nginx/
│   └── nginx.conf                  # / → SPA, /api → backend, /socket.io → WS upgrade, /api-docs → Swagger
│
├── docker-compose.yml              # postgres + redis + init-db + 3 backend + frontend
├── .env.example                    # VAPID_PUBLIC / VAPID_PRIVATE
└── README.md
```

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
   /api/* + /api-docs   /socket.io/* (WS)          /, /assets/*, /sw.js
   (Round Robin)        (Redis pub/sub adapter)     (статика SPA)
            │                   │
            └─────┬─────────────┘
                  ▼
   ┌──────────────────────────────────────┐
   │        upstream cars_backend         │
   │  cars-backend-1 (active)             │
   │  cars-backend-2 (active)             │
   │  cars-backend-3 (backup)             │
   └────────────┬─────────────────────────┘
                │
       ┌────────┴────────┐
       ▼                 ▼
  ┌─────────┐      ┌──────────────────────┐
  │postgres │      │        redis         │
  │  :5432  │      │  • cache cars/users  │
  └─────────┘      │  • push:subscriptions│
                   │  • socket.io adapter │
                   └──────────────────────┘
```
Снаружи доступен **только Nginx** через `8080:80`. PostgreSQL, Redis и backend-инстансы изолированы в bridge-сети `cars-net`.

## 🖥️ Сервер

### Что реализовано
- `express.json()` + `cors`
- Логирование всех запросов с указанием `SERVER_ID`
- `authMiddleware` — проверка JWT access-токена
- `roleMiddleware(roles)` — проверка роли из payload токена
- Полный CRUD автомобилей и пользователей с RBAC
- **Swagger UI** на `/api-docs` (`bearerAuth` схема, схемы `Car`/`User`/`AuthTokens`/`CachedListResponse`)
- **Redis-кэш** на GET-маршруты с автоматической инвалидацией при изменениях
- **Socket.IO** + **Redis-адаптер** — события `carCreated` / `carUpdated` / `carDeleted` рассылаются между всеми тремя инстансами
- **web-push** — push-подписки хранятся в Redis (общие для всех инстансов), при создании авто рассылаются всем подписанным
- `init-db` сервис создаёт таблицы и засевает 5 авто + admin
- Порядок старта через `depends_on: condition: service_healthy / service_completed_successfully`

### Модель Car (таблица `cars`)
| Поле | Тип | Описание |
|---|---|---|
| id          | `SERIAL PRIMARY KEY`        | автоинкремент |
| brand       | `VARCHAR(80) NOT NULL`      | производитель |
| model       | `VARCHAR(120) NOT NULL`     | модель |
| year        | `INTEGER` (CHECK 1900–2100) | год выпуска |
| price       | `NUMERIC(12,2)` (CHECK ≥0)  | цена ₽ |
| vin         | `VARCHAR(17) UNIQUE`        | VIN |
| created_at  | `TIMESTAMPTZ DEFAULT NOW()` | создан |
| updated_at  | `TIMESTAMPTZ DEFAULT NOW()` | обновлён |

### Модель User (таблица `users`)
| Поле | Тип | Описание |
|---|---|---|
| id            | `VARCHAR(40) PRIMARY KEY` | nanoid |
| email         | `VARCHAR(120) UNIQUE`     | логин |
| first_name    | `VARCHAR(80)`             | имя |
| last_name     | `VARCHAR(80)`             | фамилия |
| password_hash | `VARCHAR(120)`            | bcrypt-хеш |
| role          | `VARCHAR(20)`             | `user` / `seller` / `admin` |
| blocked       | `BOOLEAN`                 | мягкое удаление |
| created_at    | `TIMESTAMPTZ`             | создан |

### Полная таблица доступа
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

### Формат GET-ответа cars/users
```json
{
  "source": "cache",          // или "server"
  "server": "cars-backend-2", // какой backend ответил
  "data": [ ... ]
}
```

## 🌐 Клиент

### Что реализовано
- **React 18 + Vite 5 + Sass** — тёмная тема (`#0b0f19`, accent `#818cf8`)
- **Страницы**:
  - `/login` — форма входа (демо-аккаунт уже подставлен)
  - `/register` — регистрация с выбором роли
  - `/cars` — каталог карточек, кнопки по роли (Изменить / Удалить), индикатор `cache | server`
  - `/users` — таблица пользователей, смена роли через `<select>`, блокировка (только admin)
- **PrivateRoute** — без токена редиректит на `/login`, без нужной роли — на `/cars`
- **axios interceptors** — автоподстановка `Bearer <token>` + автообновление пары при `401`
- **Socket.IO** — после входа открывается WebSocket, на `carCreated` / `carUpdated` / `carDeleted` показывается toast в правом верхнем углу
- **PWA**: `manifest.json`, иконки, регистрация SW в `main.jsx`, кнопка «🔔 Уведомления» в header'е
- **Swagger** — ссылка в навбаре открывает `/api-docs` в новой вкладке

### Ролевая логика
| Элемент | user | seller | admin |
|---|---|---|---|
| Видит каталог `/cars` | ✅ | ✅ | ✅ |
| Кнопка «+ Добавить авто» | ❌ | ✅ | ✅ |
| Кнопка «✏️ Изменить» | ❌ | ✅ | ✅ |
| Кнопка «🗑️ Удалить» | ❌ | ❌ | ✅ |
| Страница `/users` | ❌ | ❌ | ✅ |

## 🚀 Как запустить

```bash
cd practice-24-kr4-final
docker compose up --build
```

Что произойдёт автоматически:
1. Поднимаются `postgres:16-alpine` и `redis:7-alpine`, оба с healthcheck.
2. После `pg_isready` запускается одноразовый `init-db` — таблицы + seed:
   - **admin: `admin@cars.local` / `admin123`**
   - 5 автомобилей (Toyota Camry, Kia Sportage, Lada Vesta, BMW X5, Hyundai Solaris).
3. После успешного init-db стартуют **три** инстанса `cars-backend-1/2/3` — общий Redis-адаптер для Socket.IO.
4. Поднимается `frontend` (Nginx + встроенный React-build), начинает проксировать `/api`, `/api-docs`, `/socket.io` и отдавать SPA.

Открыть **http://localhost:8080**.

### VAPID-ключи (опционально)
По умолчанию используются демо-ключи. Чтобы push-уведомления реально работали, сгенерировать свои:
```bash
docker compose run --rm cars-backend-1 npx web-push generate-vapid-keys
```
Положить в `.env` (см. `.env.example`):
```
VAPID_PUBLIC=B...
VAPID_PRIVATE=...
```

## 🧪 Тестовый аккаунт
| Email | Пароль | Роль |
|---|---|---|
| `admin@cars.local` | `admin123` | `admin` |

Демо-учётка уже подставлена в форму входа.

## Сценарий приёмки
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
curl -i -X DELETE http://localhost:8080/api/cars/1 -H "Authorization: Bearer <USER_TOKEN>"
# HTTP/1.1 403 Forbidden

# 5. Отказоустойчивость
docker compose stop cars-backend-1
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/cars
# server: cars-backend-2 — после 2 фейлов Nginx исключает упавший на 30 сек

# 6. Real-time
# Открыть две вкладки http://localhost:8080
# В одной создать авто — во второй мгновенно появляется toast

# 7. Push
# Войти, нажать «🔔 Уведомления», разрешить
# Свернуть браузер
# Из другой вкладки/curl создать авто
# → системное push-уведомление приходит, даже если PWA закрыта
```

## 🔗 Адреса итогового проекта (КР4)
| URL | Описание |
|---|---|
| `http://localhost:8080/`            | React SPA (вход / каталог / админка) |
| `http://localhost:8080/login`       | Страница входа |
| `http://localhost:8080/register`    | Регистрация (можно выбрать роль) |
| `http://localhost:8080/cars`        | Каталог автомобилей |
| `http://localhost:8080/users`       | Управление пользователями (admin only) |
| `http://localhost:8080/api/...`     | REST API через балансировщик |
| `http://localhost:8080/api-docs`    | **Swagger UI** — интерактивная документация |
| `http://localhost:8080/sw.js`       | Service Worker |
| `http://localhost:8080/manifest.json`| PWA-манифест |

---

# ✅ Практика 25 — Инструменты сборки (Vite)

## Цель
React-приложение «Cars Catalog» с настроенным **Vite**, **ленивой загрузкой страниц** и **анализатором бандла**.

## Теория

### Vite
**Vite** — современный инструмент сборки. В режиме разработки использует нативные ES-модули и `esbuild` (мгновенный старт, мгновенный HMR). В production использует `Rollup` для оптимизированной сборки.

### Code Splitting
**Динамический import()** говорит бандлеру вынести модуль в отдельный чанк:
```jsx
const Catalog = lazy(() => import('./pages/Catalog.jsx'));

<Suspense fallback={<Loader />}>
  <Routes>
    <Route path="/catalog" element={<Catalog />} />
  </Routes>
</Suspense>
```
Browser запросит `Catalog-[hash].js` только при первом рендере.

### Tree-shaking
Production-сборка автоматически выбрасывает неиспользуемые экспорты. Работает только с ES-модулями (`import`/`export`).

## Что реализовано

### Структура
```
practice-25-vite/
├── index.html
├── vite.config.js          # plugins: react + visualizer, manualChunks
├── src/
│   ├── main.jsx
│   ├── App.jsx             # роуты + Suspense + React.lazy
│   ├── styles.css
│   ├── pages/
│   │   ├── Home.jsx        # в основном бандле
│   │   ├── Catalog.jsx     # отдельный чанк (lazy)
│   │   └── About.jsx       # отдельный чанк (lazy)
│   └── components/
│       └── CarCard.jsx
└── package.json
```

### vite.config.js
```js
export default defineConfig({
  plugins: [react(), visualizer({ filename: 'dist/bundle-report.html', gzipSize: true, brotliSize: true })],
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router':       ['react-router-dom']
        }
      }
    }
  }
});
```

### Что попадает в бандл
```
dist/
├── assets/
│   ├── react-vendor-[hash].js     # react + react-dom (manualChunks)
│   ├── router-[hash].js           # react-router-dom (manualChunks)
│   ├── Catalog-[hash].js          # lazy chunk
│   ├── About-[hash].js            # lazy chunk
│   ├── index-[hash].js            # main bundle (Home + App)
│   └── index-[hash].css
├── bundle-report.html             # 🔍 интерактивная карта бандла
└── index.html
```

## Как запустить
```bash
cd practice-25-vite
npm install
npm run dev          # http://localhost:5173 (HMR, мгновенный старт)
npm run build        # → dist/ + dist/bundle-report.html
npm run preview      # локальный просмотр собранной версии
```

## Как проверить lazy loading
1. `npm run dev`, открыть DevTools → Network.
2. На главной не загружаются `Catalog-*.js` и `About-*.js`.
3. Кликнуть «Каталог» — в Network появляется запрос `Catalog-*.js`.
4. Кликнуть «О нас» — запрос `About-*.js`.
5. Открыть `dist/bundle-report.html` после `npm run build` — интерактивная treemap с размерами всех чанков.

---

# ✅ Практика 26 — GraphQL + Apollo Server

## Цель
Реализовать GraphQL API для каталога книг: типы `Book` и `Author` со связью «один-ко-многим», запросы (`Query`), мутации (`Mutation`), вложенные резолверы.

## Теория

### GraphQL vs REST
| Характеристика | REST | GraphQL |
|---|---|---|
| Эндпоинты | Множество (`/users`, `/posts`) | Один (`/graphql`) |
| Структура ответа | Определяет сервер | Определяет клиент |
| Overfetching | Частая проблема | Отсутствует |
| Underfetching | Несколько запросов | Один запрос для любых данных |
| Версионирование | Нужно (`/v1`, `/v2`) | Не требуется |

Клиент сам описывает, какие именно поля ему нужны:
```graphql
{ user(id: 42) { name avatar posts { title } } }
```

### Схема и резолверы
Схема (SDL) описывает все типы и операции. Резолвер — функция, возвращающая значение поля:
```js
fieldName: (parent, args, context, info) => { ... }
```
- `parent` — результат резолвера родительского поля
- `args` — аргументы из запроса
- `context` — общий объект запроса (БД, текущий пользователь)

## Что реализовано
- `type Author { id, name, country, books: [Book!]! }`
- `type Book { id, title, year, genre, author: Author! }`
- Query: `books`, `book(id)`, `authors`, `author(id)`, `booksByGenre(genre)`
- Mutation: `createAuthor`, `createBook`, `deleteBook`
- Вложенные резолверы: `Author.books` и `Book.author`
- Демо-данные: 3 автора + 5 книг (Достоевский, Оруэлл, Маркес)

## Как запустить
```bash
cd practice-26-graphql
npm install
npm start
```
Apollo Sandbox: **http://localhost:4000**

## Пример запроса
```graphql
query {
  authors {
    name
    books { title year }
  }
}
```

---

# ✅ Практика 27 — Брокеры сообщений (RabbitMQ)

## Цель
Реализовать систему асинхронной обработки задач: Express-API кладёт задачи в очередь, несколько воркеров параллельно их обрабатывают, при ошибке — экспоненциальный retry, после исчерпания попыток — Dead Letter Queue.

## Теория

### Паттерн Message Queue
Producer публикует сообщение в **Exchange**, который маршрутизирует его в **Queue** по правилам. Consumer забирает сообщение, обрабатывает и подтверждает (`ack`) или отклоняет (`nack`).

Преимущества:
- Асинхронность — отправитель не ждёт ответа
- Буферизация нагрузки — пики трафика поглощает очередь
- Надёжность — упавший Consumer не теряет сообщения
- Слабая связанность — сервисы знают только о брокере

### Retry + DLQ
- В заголовке `x-retry-count` хранится номер попытки.
- При ошибке worker `ack`-ает и **перепубликует** копию с увеличенным счётчиком после паузы `min(1000 * 2^n, 30000) + jitter`.
- После 3 неудач — `nack(requeue=false)`, и через DLX сообщение уходит в `tasks_dlq` для ручного разбора.

## Что реализовано
| Файл | Назначение |
|---|---|
| `setup-queues.js` | Создаёт `tasks_queue`, `tasks_dlx`, `tasks_dlq` |
| `producer.js`     | Express API с `POST /tasks` |
| `worker.js`       | Consumer с prefetch(1), retry и DLQ |

### Имитация ошибок
Worker «случайно» валит ~60% задач с `type: "email"`, чтобы было видно retry и доставку в DLQ.

## Как запустить
```bash
# 1) RabbitMQ
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management

# 2) Очереди
cd practice-27-rabbitmq
npm install
npm run setup

# 3) Воркеры (в разных терминалах)
WORKER_ID=1 npm run worker
WORKER_ID=2 npm run worker

# 4) Producer
npm run producer

# 5) Отправить задачу
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"type":"email","payload":{"to":"u@u","subject":"Hi"}}'
```
Web-UI RabbitMQ: **http://localhost:15672** (guest / guest).

---

# ⭐ Практика 28 — Подготовка к КР5 (итоговый проект)

## Цель
Спроектировать **итоговый веб-проект**, объединяющий все навыки курса.

## Общие требования
| Требование | Описание |
|---|---|
| **Backend** | Express + БД (SQL или NoSQL) |
| **Frontend** | React или Vue SPA |
| **Авторизация** | JWT + RBAC |
| **Контейнеризация** | `docker-compose.yml` — одной командой |
| **Тесты** | Coverage ≥ 50 % |
| **Документация** | `README.md` + `.env.example` |

## Шесть вариантов проекта
| № | Вариант | Демо в этом репо |
|---|---|---|
| 1 | Лендинг (PWA + SEO) | [`practice-29-landing/`](practice-29-landing/) |
| 2 | Социальная сеть (real-time) | [`practice-30-social/`](practice-30-social/) |
| 3 | E-commerce (Stripe + инвентарь) | каркас `practice-31-tasks-shop/` |
| 4 | Мессенджер (E2E + offline) | база — `practice-16-websocket-push/` |
| 5 | Менеджер задач (Kanban + collab) | [`practice-31-tasks-shop/`](practice-31-tasks-shop/) |
| 6 | AI-интеграция (OpenAI + RAG) | [`practice-32-ai/`](practice-32-ai/) |

Подробный чек-лист и шаблон README — внутри [`practice-28-kr5-final/README.md`](practice-28-kr5-final/README.md).

> 💡 За основу финального проекта удобно взять `practice-24-kr4-final/` — там уже есть React + Express + JWT + RBAC + PostgreSQL + Redis + Docker. Заменяешь модель `Car` на свою сущность и допиливаешь специфику варианта.

---

# ✅ Практика 29 — Лендинг (PWA + SEO)

## Цель
Сделать адаптивный лендинг-PWA с высоким Lighthouse-баллом, SEO-разметкой и работой без сети.

## Что реализовано
- Адаптивная вёрстка (mobile-first, `clamp`, `auto-fit`)
- SEO: `<title>`, `<meta description>`, canonical, Open Graph
- PWA: `manifest.json`, Service Worker (Cache First), иконки 192/512
- Offline-режим: после первой загрузки страница работает без интернета
- Плавная прокрутка к якорям

## Как запустить
```bash
cd practice-29-landing
mkdir icons && cp ../practice-17-push-reminders/icons/* icons/
npx serve .                          # http://localhost:3000
```

## Lighthouse
DevTools → Lighthouse → Mobile → Run audit. Цель — все категории > 90.

---

# ✅ Практика 30 — Социальная сеть (real-time)

## Цель
Сделать мини-социальную ленту: посты, лайки, комментарии. Все изменения мгновенно прилетают во все открытые вкладки через Socket.IO.

## Что реализовано
### Сервер (Express + Socket.IO)
| Метод | Путь | Описание |
|---|---|---|
| GET  | `/api/posts`              | Лента (свежие сверху) |
| POST | `/api/posts`              | Создать пост |
| POST | `/api/posts/:id/like`     | Лайк / снять лайк |
| POST | `/api/posts/:id/comments` | Добавить комментарий |

### Socket.IO события
- `post:created` — новый пост в ленте
- `post:liked` — изменился счётчик лайков
- `post:commented` — новый комментарий

### Клиент (ванильный JS)
- Поле «Я: …» — текущий пользователь
- Карточка поста: автор, дата, текст, ❤ счётчик, список комментариев, форма

## Как запустить
```bash
cd practice-30-social
npm install
npm start                            # http://localhost:3000
```

Открыть в **двух вкладках** — все изменения синхронизируются мгновенно.

---

# ✅ Практика 31 — Менеджер задач (Kanban + real-time)

## Цель
Сделать Kanban-доску с тремя колонками («📥 К выполнению» / «⚙️ В работе» / «✅ Готово»), drag-and-drop задач между колонками и real-time синхронизацией между всеми клиентами.

> Этот же каркас подходит для **варианта 3 КР5 (E-commerce)** — заменить задачи на товары, колонки на «Каталог / Корзина / Оплачено».

## Что реализовано
### Сервер
| Метод | Путь | Описание |
|---|---|---|
| GET    | `/api/board`    | Все задачи |
| POST   | `/api/tasks`    | Создать `{ title, status? }` |
| PATCH  | `/api/tasks/:id`| Обновить (`status` при DnD) |
| DELETE | `/api/tasks/:id`| Удалить |

### Socket.IO события
- `task:created`, `task:updated`, `task:deleted` — broadcast всем

### Клиент
- Нативный HTML5 DnD (`draggable`, `dragstart`, `dragover`, `drop`)
- Оптимистичное обновление: задача мгновенно «прыгает» в новую колонку
- Все вкладки синхронизируются

## Как запустить
```bash
cd practice-31-tasks-shop
npm install
npm start                            # http://localhost:3000
```

Открыть в двух вкладках — перетащи задачу в одной, во второй она тоже переедет.

---

# ✅ Практика 32 — AI-интеграция (потоковый чат + RAG)

## Цель
Сделать чат-приложение с потоковым ответом (SSE) и поиском по загруженным документам (мини-RAG).

## Что реализовано
### Сервер
| Метод | Путь | Описание |
|---|---|---|
| POST   | `/api/chat`              | SSE-стрим (`{ conversationId, message }`) |
| GET    | `/api/conversations/:id` | История диалога |
| POST   | `/api/documents`         | Загрузить документ для RAG |
| GET    | `/api/documents`         | Список загруженных документов |
| DELETE | `/api/documents/:id`     | Удалить документ |

### Два режима
- **Без `OPENAI_API_KEY`** — встроенный mock: стримит ответ по словам, узнаёт темы и подмешивает фрагменты из документов.
- **С `OPENAI_API_KEY`** — реальные потоковые ответы OpenAI Chat Completions.

### Мини-RAG
Наивный поиск по ключевым словам в загруженных документах. В реальном проекте → **pgvector** + эмбеддинги (`text-embedding-3-small`).

### Клиент
- Чат-интерфейс с пузырями user / assistant / context
- SSE-парсер событий (`data:`, `event: meta`, `event: done`)
- Загрузка `.txt`/`.md` для RAG

## Как запустить
```bash
cd practice-32-ai
npm install
npm start                            # mock-режим
OPENAI_API_KEY=sk-... npm start      # реальный OpenAI
```
**http://localhost:3000** — спросить про GraphQL, JWT, Docker и т.п.

---

## 🚀 Быстрый старт (все КР)

```bash
# КР1 — практика 6
cd practice-06-final/server && npm install && npm start
cd practice-06-final/client && npm install && npm start

# КР2 — практика 12
cd practice-12-final/server && npm install && npm start
cd practice-12-final/client && npm install && npm start

# КР3 — практика 17 (самое полное PWA: WebSocket + push + напоминания)
# VAPID-ключи генерируются автоматически на старте, если не заданы в .env
cd practice-17-push-reminders
npm install
npm start                            # http://localhost:3001

# КР4 — практика 24 (объединение всех 4 КР в один проект)
# React UI + JWT/RBAC + PWA + Socket.IO + Push + PG + Redis + 3 backend + Nginx
cd practice-24-kr4-final
docker compose up --build            # http://localhost:8080
# Демо-аккаунт: admin@cars.local / admin123 (создаётся автоматически)
# Swagger: http://localhost:8080/api-docs
# VAPID-ключи — генерируются на старте и кэшируются в Redis (общие для всех инстансов)

# Практика 25 — React-каталог с Vite, lazy loading и bundle analyzer
cd practice-25-vite
npm install
npm run dev                          # http://localhost:5173
npm run build                        # → dist/bundle-report.html

# Практика 26 — GraphQL/Apollo Server
cd practice-26-graphql && npm install && npm start   # Apollo Sandbox: http://localhost:4000

# Практика 27 — RabbitMQ (Producer + Workers + Retry + DLQ)
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
cd practice-27-rabbitmq && npm install && npm run setup
# В разных терминалах:
WORKER_ID=1 npm run worker
WORKER_ID=2 npm run worker
npm run producer                     # API: http://localhost:3000

# КР5 — выбрать вариант из практики 28, демо в 29-32
cd practice-29-landing  && npx serve .            # PWA-лендинг
cd practice-30-social   && npm install && npm start   # Социальная сеть
cd practice-31-tasks-shop && npm install && npm start # Kanban
cd practice-32-ai       && npm install && npm start   # AI-чат с RAG
```
