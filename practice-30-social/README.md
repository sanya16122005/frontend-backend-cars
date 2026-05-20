# Практика 30 — Социальная сеть / форум

## Цель
Сделать мини-социальную ленту: создание постов, лайки, комментарии, **real-time** обновление между всеми вкладками через Socket.IO.

## Что реализовано
### Сервер (Express + Socket.IO)
| Метод | Путь | Описание |
|---|---|---|
| GET  | `/api/posts`                  | Лента, сортировка от свежих к старым |
| POST | `/api/posts`                  | Создать пост `{ author, text }` |
| POST | `/api/posts/:id/like`         | Лайк / снять лайк (`{ user }`) |
| POST | `/api/posts/:id/comments`     | Комментарий `{ author, text }` |

### Socket.IO события (broadcast всем)
| Событие | Payload |
|---|---|
| `post:created`   | `{ id, author, text, … }` |
| `post:liked`     | `{ id, user, likesCount }` |
| `post:commented` | `{ postId, comment }` |

### Клиент (ванильный JS)
- Поле «Я: …» — имя текущего пользователя (для лайков и комментариев).
- Форма создания поста.
- Карточка поста: автор, дата, текст, кнопка ❤ с счётчиком, список комментариев, форма комментария.
- Все изменения мгновенно прилетают во все открытые вкладки.

## Файлы
| Файл | Назначение |
|---|---|
| `server.js`         | Express + Socket.IO + in-memory storage |
| `public/index.html` | Каркас ленты |
| `public/style.css`  | Тёмная тема |
| `public/app.js`     | Логика + socket-подписки |

## Как запустить
```bash
cd practice-30-social
npm install
npm start
```
Открыть **http://localhost:3000** в двух вкладках — изменения в одной мгновенно появляются в другой.

## Что добавить для КР5 (вариант 2)
- JWT + RBAC (роли `user`, `admin`)
- PostgreSQL вместо in-memory массива
- Redis-кэш ленты
- Infinite scroll
- Docker Compose

Базу можно взять из `practice-24-kr4-final/`.
