# Практика 29 — Лендинг (PWA + SEO)

## Цель
Сделать адаптивный лендинг-PWA для «Cars Academy» — образовательного курса. Цель — высокий Lighthouse-балл, корректная SEO-разметка и работа без сети.

## Что реализовано
- **Адаптивная вёрстка** (mobile-first, `clamp()`, `auto-fit`)
- **SEO**: `<title>`, `<meta name="description">`, `<link rel="canonical">`, Open Graph
- **PWA**: `manifest.json`, иконки 192/512, Service Worker (Cache First)
- **Offline-режим** — после первой загрузки страница открывается без интернета
- **Плавная прокрутка** к секциям через якорные ссылки

## Файлы
| Файл | Назначение |
|---|---|
| `index.html`   | Семантическая вёрстка: hero, секции, footer |
| `styles.css`   | Тёмная тема, grid, CSS-переменные |
| `app.js`       | Регистрация SW + smooth scroll |
| `sw.js`        | Service Worker (Cache First с fallback на /index.html) |
| `manifest.json`| PWA-манифест |

## Как запустить
```bash
cd practice-29-landing
# Скопировать иконки от практики 14/17 (или сгенерировать свои)
mkdir icons
cp ../practice-17-push-reminders/icons/* icons/

# Любой статический сервер (для SW нужен http://, не file://)
npx serve .
```
Открыть **http://localhost:3000**.

## Как проверить Lighthouse
1. Открыть DevTools → **Lighthouse** → Mobile.
2. Запустить аудит.
3. Цель — все категории > 90:
   - **Performance** — нет блокирующих ресурсов, defer-скрипты
   - **Accessibility** — семантика, `lang`, контраст
   - **Best Practices** — HTTPS (для prod), валидный HTML
   - **SEO** — meta, canonical, alt у изображений
   - **PWA** — манифест + SW + offline

## Как проверить offline
1. Открыть страницу — SW зарегистрируется и закэширует ассеты.
2. DevTools → **Application → Service Workers** — статус `activated`.
3. Включить **Offline** в той же вкладке.
4. Reload — страница полностью загружается из кэша.
