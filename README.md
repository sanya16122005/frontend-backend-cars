# 🚗 Frontend & Backend — Cars (Практики 1–12)

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

## 🚀 Быстрый старт

```bash
# КР1 — практика 6
cd practice-06-final/server && npm install && npm start
cd practice-06-final/client && npm install && npm start

# КР2 — практика 12
cd practice-12-final/server && npm install && npm start
cd practice-12-final/client && npm install && npm start
```
