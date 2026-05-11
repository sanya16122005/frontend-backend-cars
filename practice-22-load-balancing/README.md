# Практика 22 — Балансировка нагрузки (Nginx + HAProxy)

Поднимаем три идентичных backend-инстанса cars-API и распределяем нагрузку между ними двумя способами: **Nginx** и **HAProxy**.

## Структура
```
practice-22-load-balancing/
├── backend/
│   ├── package.json
│   └── server.js          # отдаёт {server: "cars-3001", host, port, ...}
├── nginx/nginx.conf       # upstream + Round Robin + max_fails/fail_timeout
├── haproxy/haproxy.cfg    # frontend/backend + httpchk + roundrobin
├── start-backends.ps1     # Windows: 3 окна PowerShell
└── start-backends.sh      # Linux/WSL: один процесс с тремя &
```

## Топология
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

## 1. Запуск трёх backend-инстансов
```bash
cd practice-22-load-balancing/backend
npm install
```

Затем поднять все три:
```powershell
# Windows
.\start-backends.ps1
```
```bash
# Linux/WSL
chmod +x start-backends.sh
./start-backends.sh
```

Проверка инстансов напрямую:
```bash
curl http://localhost:3001/   # → {"server":"cars-3001",...}
curl http://localhost:3002/
curl http://localhost:3003/
```

## 2. Nginx как балансировщик

Запуск Nginx с конфигом:
```bash
# Linux / WSL
nginx -c $(pwd)/nginx/nginx.conf -p $(pwd)/nginx
```

Проверка:
```bash
curl http://localhost:8080/        # повторите 4–6 раз
# server поочерёдно: cars-3001, cars-3002, cars-3001 …
```

### Отказоустойчивость
В конфиге:
```
server 127.0.0.1:3001 max_fails=2 fail_timeout=30s;
server 127.0.0.1:3002 max_fails=2 fail_timeout=30s;
server 127.0.0.1:3003 backup;
```
Останавливаем `cars-3001` (Ctrl+C в его окне) и снова стучимся в `:8080` — Nginx после двух фейлов исключает его на 30 секунд, трафик идёт только на `cars-3002`. Если упадут оба основных — подключится `cars-3003`.

## 3. HAProxy как балансировщик

```bash
haproxy -f haproxy/haproxy.cfg
```

Проверка:
```bash
curl http://localhost:8090/        # round-robin между cars-3001/3002
```

`option httpchk GET /health` — health check каждые 5 секунд. Если backend трижды подряд возвращает не-2xx, помечается down.

## 4. Что протестировать
- Round Robin распределяет запросы поровну.
- При падении одного инстанса трафик идёт на оставшиеся.
- При падении основных — подключается backup (cars-3003).
- HAProxy автоматически вернёт инстанс в строй по `rise 2` (двум подряд успешным health-check'ам).
