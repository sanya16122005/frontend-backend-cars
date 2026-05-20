# ⭐ Практика 28 — Подготовка к КР5 (итоговый проект)

## Цель
Спроектировать **итоговый веб-проект**, который объединяет все навыки курса: фронтенд (React/Vue), бэкенд (Express), БД (SQL/NoSQL), аутентификация JWT + RBAC, контейнеризация Docker, тесты ≥ 50%, README + развёртывание одной командой.

## Общие требования к проекту
| Требование | Описание |
|---|---|
| **Backend** | Express API с подключённой БД (PostgreSQL или MongoDB) |
| **Frontend** | React или Vue SPA |
| **Авторизация** | JWT + RBAC |
| **Контейнеризация** | `docker-compose.yml` — стек запускается одной командой |
| **Контроль версий** | Git-репозиторий с осмысленными commit-сообщениями |
| **Документация** | `README.md` с описанием и инструкцией |
| **Тесты** | Покрытие ≥ 50 % |
| **Развёртывание** | VPS, облако или локально через `docker compose up` |

## Шесть вариантов проекта
| № | Вариант | Реализован в | Что нового |
|---|---|---|---|
| 1 | **Лендинг (PWA + SEO)** | [`practice-29-landing/`](../practice-29-landing/) | Vite, Service Worker, Lighthouse > 90 |
| 2 | **Социальная сеть** (real-time) | [`practice-30-social/`](../practice-30-social/) | Socket.IO, лента, лайки, комментарии |
| 3 | **E-commerce** (Stripe + инвентарь) | [`practice-31-tasks-shop/`](../practice-31-tasks-shop/) (магазин) | Корзина, заказы, мок-платежи |
| 4 | **Мессенджер** (E2E + offline) | можно сделать на основе практики 16 | TweetNaCl.js, indexed DB |
| 5 | **Менеджер задач** (Kanban + collab) | [`practice-31-tasks-shop/`](../practice-31-tasks-shop/) (Kanban) | Доска, drag-n-drop, real-time |
| 6 | **AI-интеграция** (OpenAI + RAG) | [`practice-32-ai/`](../practice-32-ai/) | Чат с потоковым ответом, история |

## Структура README.md для итогового проекта
```markdown
# Название проекта

## Описание
Краткое описание и функциональность.

## Стек технологий
- Frontend: React / Vue
- Backend: Node.js, Express
- БД: PostgreSQL / MongoDB
- Авторизация: JWT
- Контейнеризация: Docker, Docker Compose

## Запуск проекта
### Требования
- Docker и Docker Compose

### Шаги
1. `git clone <url>`
2. `cp .env.example .env`
3. `docker compose up --build`
4. Открыть в браузере: http://localhost:3000

## Переменные окружения
Описание всех ключей из `.env.example`.

## Запуск тестов
`npm test` или `npm run test:coverage`
```

## Чек-лист готовности проекта к сдаче
- [ ] Репозиторий **открытый** на GitHub/GitLab
- [ ] `README.md` с разделами выше
- [ ] `docker-compose.yml` — поднимает всё одной командой
- [ ] `.env.example` со всеми ключами (без секретов)
- [ ] Backend на Express, БД подключена
- [ ] Frontend SPA (React/Vue) собирается и работает
- [ ] JWT + RBAC: минимум 2 роли с разными правами
- [ ] Тесты — coverage ≥ 50 %
- [ ] Git-история с осмысленными commit-сообщениями
- [ ] Скриншоты работающего приложения

## Где взять каркас
Бери `practice-24-kr4-final/` (КР4) как базу: там уже есть React + Express + JWT + RBAC + PostgreSQL + Redis + Docker. Замени модель `Car` на свою (Post, Product, Task, Message, …) и допиши специфику варианта.

## Формат отчёта
В СДО → **Задания текущего контроля → Контрольная работа №5** прикрепить ссылку на репозиторий.
