# Практика 25 — Инструменты сборки (Vite)

React-приложение «Cars Catalog» с настроенным **Vite**, ленивой загрузкой страниц и анализатором бандла.

## Структура
```
practice-25-vite/
├── index.html
├── package.json
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
└── public/
```

## Что показано
- **Vite** в качестве dev-сервера и production-сборщика (Rollup под капотом).
- **Маршруты** через `react-router-dom`: `/`, `/catalog`, `/about`.
- **Code splitting**: `Catalog` и `About` подгружаются динамически через `React.lazy + Suspense`.
- **Ручные чанки**: `react-vendor`, `router` в `vite.config.js → rollupOptions.output.manualChunks`.
- **Анализатор бандла**: `rollup-plugin-visualizer` → `dist/bundle-report.html` после `npm run build`.

## Запуск
```bash
cd practice-25-vite
npm install

# dev-сервер
npm run dev          # http://localhost:5173

# production-сборка
npm run build        # → dist/  + dist/bundle-report.html
npm run preview      # локальный просмотр собранной версии
```

## Bundle report
После `npm run build`:
```
dist/
├── assets/
│   ├── react-vendor-[hash].js     # react + react-dom
│   ├── router-[hash].js           # react-router-dom
│   ├── Catalog-[hash].js          # lazy chunk
│   ├── About-[hash].js            # lazy chunk
│   ├── index-[hash].js            # main bundle (Home + App)
│   └── index-[hash].css
├── bundle-report.html             # 🔍 интерактивная карта бандла
└── index.html
```

Открыть `dist/bundle-report.html` — увидеть treemap размеров каждого чанка с gzip/brotli оценками.

## Проверка lazy loading
1. `npm run dev`, открыть DevTools → Network.
2. На главной не грузятся `Catalog-*.js` и `About-*.js`.
3. Кликнуть «Каталог» — в Network появится запрос `Catalog-*.js`.
4. Кликнуть «О нас» — запрос `About-*.js`.

## Tree-shaking
Vite по умолчанию использует tree-shaking в production-режиме. `CarCard` импортируется в `Catalog.jsx`, но если его не использовать — он не попадёт в итоговый бандл.
