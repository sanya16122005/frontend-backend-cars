# Практика 27 — RabbitMQ: Producer + Worker + Retry + DLQ

## Цель
Реализовать систему асинхронной обработки задач: Express API кладёт задачи в очередь RabbitMQ, несколько воркеров параллельно их обрабатывают, при ошибке — экспоненциальный retry, после исчерпания попыток — Dead Letter Queue.

## Архитектура
```
                 POST /tasks
client ─────────────────────────► Producer (Express :3000)
                                       │
                                       ▼  sendToQueue(persistent)
                              ┌──────────────────┐
                              │  tasks_queue     │ ← основная
                              └────────┬─────────┘
                                       │ consume(prefetch=1)
                          ┌────────────┼────────────┐
                          ▼            ▼            ▼
                    Worker 1     Worker 2     Worker 3
                          │
                          │ nack(requeue=false) после 3 retry
                          ▼
                  ┌────────────────┐
                  │  tasks_dlx     │  Dead Letter Exchange
                  └────────┬───────┘
                           ▼
                  ┌────────────────┐
                  │  tasks_dlq     │  Dead Letter Queue (ручной разбор)
                  └────────────────┘
```

## Что реализовано
| Файл | Назначение |
|---|---|
| `setup-queues.js` | Создаёт `tasks_queue`, `tasks_dlx` (Exchange), `tasks_dlq` |
| `producer.js`     | Express API c маршрутом `POST /tasks` — публикует задачи |
| `worker.js`       | Consumer: prefetch(1), retry (экспоненциальная задержка с джиттером), после 3 неудач → DLQ |

### Retry-логика
- В заголовке `x-retry-count` хранится номер попытки.
- При ошибке worker `ack`-ает текущее сообщение и **перепубликует** копию с инкрементом счётчика — после паузы `min(1000 * 2^n, 30000) + random()` мс.
- Когда `retryCount >= 3` — делается `nack(requeue=false)`, и RabbitMQ через DLX отправит сообщение в `tasks_dlq`.

### Имитация ошибок
Worker «случайно» валит ~60% задач с `type: "email"` — это нужно, чтобы увидеть в логах retry и доставку в DLQ.

## Как запустить

### 1) Поднять RabbitMQ
```bash
docker run -d --name rabbitmq \
  -p 5672:5672 -p 15672:15672 \
  rabbitmq:3-management
```
Web-UI: <http://localhost:15672> (guest / guest)

### 2) Установить зависимости и создать очереди
```bash
cd practice-27-rabbitmq
npm install
npm run setup
```

### 3) Запустить два воркера в разных терминалах
```bash
# Терминал 1
WORKER_ID=1 npm run worker

# Терминал 2
WORKER_ID=2 npm run worker
```

### 4) Запустить Producer в третьем терминале
```bash
npm run producer
```

### 5) Отправить задачи
```bash
# email — будет падать и уходить в retry
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"type":"email","payload":{"to":"u@u","subject":"Hi"}}'

# report — выполнится с первой попытки
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"type":"report","payload":{"period":"2026-Q1"}}'
```

Открыть RabbitMQ UI <http://localhost:15672> → **Queues** → видны `tasks_queue` и `tasks_dlq`. После ~3 повторов часть `email`-задач переедет в `tasks_dlq`.

## Полезное
- amqplib для Node.js: <https://amqp-node.github.io/amqplib/>
- Документация RabbitMQ: <https://www.rabbitmq.com/docs>
