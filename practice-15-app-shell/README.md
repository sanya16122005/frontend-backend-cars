# Практика 15 — HTTPS + App Shell

PWA «Авто-задачи» с архитектурой **App Shell**: каркас (шапка, табы, футер) грузится мгновенно из кэша, а контент страниц (`home.html`, `about.html`) подгружается динамически через `fetch`.

## Структура
```
practice-15-app-shell/
├── content/
│   ├── home.html      # форма + список задач
│   └── about.html     # страница «О приложении»
├── icons/             # иконки PWA
├── index.html         # каркас (App Shell)
├── app.js             # навигация, логика задач, регистрация SW
├── manifest.json      # PWA-манифест
├── sw.js              # Service Worker: Cache First + Network First
└── style.css
```

## Стратегии кэширования
- **Cache First** — для статики (`/`, `index.html`, `style.css`, `app.js`, иконки) → кэш `car-shell-v1`
- **Network First** — для `/content/*.html` → кэш `car-dynamic-v1`, фолбек на `home.html` при отсутствии сети

## Запуск по HTTPS (для проверки SW и PWA-фич)

### Генерация локального сертификата через mkcert
```powershell
choco install mkcert
mkcert -install
mkcert localhost 127.0.0.1 ::1
```
В папке появятся `localhost.pem` и `localhost-key.pem`.

### Запуск http-server с HTTPS
```bash
npm install -g http-server
http-server practice-15-app-shell --ssl --cert localhost.pem --key localhost-key.pem -p 3000
```

Открыть https://localhost:3000 — в адресной строке появится замок, во вкладке DevTools → Security → статус **Secure**.

## Что проверить
1. DevTools → Application → Service Workers — SW активен
2. DevTools → Application → Cache Storage — два кэша: `car-shell-v1` (статика) и `car-dynamic-v1` (контент)
3. Добавить несколько задач — сохраняются в `localStorage`
4. Network → Throttling → Slow 3G + перезагрузка → каркас появляется мгновенно, контент чуть позже
5. Offline → перезагрузка → приложение полностью загружается из кэша, задачи на месте
