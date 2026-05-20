# Практика 31 — Менеджер задач (Kanban + real-time)

## Цель
Сделать Kanban-доску с тремя колонками («📥 К выполнению» → «⚙️ В работе» → «✅ Готово»), drag-and-drop задач между колонками и real-time синхронизацией между всеми клиентами.

> Этот же каркас подходит для **варианта 3 КР5 (E-commerce)** — заменить задачи на товары, колонки на «Каталог / Корзина / История заказов», PATCH `/status` → POST `/checkout`.

## Что реализовано

### Сервер
| Метод | Путь | Описание |
|---|---|---|
| GET    | `/api/board`        | Все задачи |
| POST   | `/api/tasks`        | Создать `{ title, status? }` |
| PATCH  | `/api/tasks/:id`    | Обновить (заголовок или статус) |
| DELETE | `/api/tasks/:id`    | Удалить |

### Socket.IO события (broadcast)
| Событие | Когда |
|---|---|
| `task:created` | Новая задача |
| `task:updated` | Перемещение между колонками / изменение заголовка |
| `task:deleted` | Удаление |

### Клиент
- Drag-n-drop через нативный HTML5 API (`draggable`, `dragstart`, `dragover`, `drop`).
- Оптимистичное обновление: задача мгновенно «прыгает» в новую колонку, потом сервер подтверждает.
- Все вкладки на одной странице синхронизируются.

## Файлы
| Файл | Назначение |
|---|---|
| `server.js`          | Express + Socket.IO + in-memory доска |
| `public/index.html`  | Каркас доски |
| `public/style.css`   | Тёмная тема, grid 3 колонок |
| `public/app.js`      | DnD + REST вызовы + socket-подписки |

## Как запустить
```bash
cd practice-31-tasks-shop
npm install
npm start
```
Открыть **http://localhost:3000** в двух вкладках — перетащи задачу в одной, во второй она тоже переедет.

## Что добавить для КР5 (вариант 5)
- JWT + RBAC (`owner` / `editor` / `viewer`)
- PostgreSQL для проектов и задач
- История изменений + undo (паттерн Command)
- Несколько Kanban-досок, шеринг по ссылке
- Drag-n-drop через `react-beautiful-dnd` или `dnd-kit`

База — `practice-24-kr4-final/`.
