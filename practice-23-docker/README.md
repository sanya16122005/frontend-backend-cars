# Практика 23 — Контейнеризация (Docker + Docker Compose)

Стек из трёх backend-контейнеров cars-API и Nginx-балансировщика, всё разворачивается одной командой `docker compose up`.

## Структура
```
practice-23-docker/
├── backend/
│   ├── Dockerfile           # FROM node:18-alpine, COPY package*, npm install, COPY . .
│   ├── .dockerignore
│   ├── package.json
│   └── server.js            # отдаёт server, host, port, /api/cars, /health
├── nginx/
│   └── nginx.conf           # upstream → cars-backend-1/2/3 (по именам сервисов)
└── docker-compose.yml       # 3 backend + nginx + сеть cars-net
```

## Топология
```
   host:8080
       │
       ▼
┌───────────────┐
│ nginx (alpine)│
└──────┬────────┘
       │ Round Robin
       ├──→ cars-backend-1:3000
       ├──→ cars-backend-2:3000
       └──→ cars-backend-3:3000 (backup)

Все контейнеры в общей bridge-сети cars-net.
Внутренние порты НЕ пробрасываются — снаружи доступен только Nginx.
```

## Запуск
```bash
cd practice-23-docker
docker compose up --build
```

В логах появится:
```
cars-backend-1  | [cars-backend-1] listening on 3000
cars-backend-2  | [cars-backend-2] listening on 3000
cars-backend-3  | [cars-backend-3] listening on 3000
nginx           | ...
```

## Проверка балансировки
```bash
curl http://localhost:8080/
curl http://localhost:8080/
curl http://localhost:8080/
```
Поле `server` будет чередоваться: `cars-backend-1`, `cars-backend-2`, …

## Проверка отказоустойчивости
```bash
# Останавливаем один backend
docker compose stop cars-backend-1

# Запросы продолжают идти, но только на cars-backend-2
curl http://localhost:8080/

# Поднимаем обратно
docker compose start cars-backend-1
```

## Полезные команды
```bash
docker compose ps                 # запущенные контейнеры
docker compose logs -f nginx      # логи Nginx в реальном времени
docker compose exec cars-backend-1 sh   # зайти внутрь контейнера
docker compose down               # остановить и удалить контейнеры
docker compose down -v            # + удалить тома (если бы они были)
```

## Что показывает практика
- `Dockerfile` для Node.js: кэш слоёв через раздельный COPY `package*.json` и кода.
- Сеть `cars-net` — backend'ы общаются по DNS-именам сервисов (`cars-backend-1`).
- `depends_on` гарантирует порядок старта.
- Только Nginx торчит наружу через `ports: 8080:80`, остальные сервисы изолированы.
