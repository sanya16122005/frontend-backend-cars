const test = require('node:test');
const assert = require('node:assert');
const http = require('http');
const express = require('express');

// Семплируем моки базы данных
const mockDb = {
  tasks: [
    { id: 1, title: 'Замена масла', status: 'todo', car_model: 'BMW X5', price_estimate: 8500, assignee_id: null },
    { id: 2, title: 'Диагностика тормозов', status: 'in-progress', car_model: 'Toyota', price_estimate: 3200, assignee_id: 'm1' }
  ],
  users: [
    { id: 'admin-id', email: 'admin@cars.local', role: 'admin' },
    { id: 'm1', email: 'mechanic@cars.local', role: 'seller' },
    { id: 'u1', email: 'driver@cars.local', role: 'user' }
  ]
};

// Заменяем оригинальные модули моками для тестирования
const mockPgPool = {
  query: async (queryText, params) => {
    if (queryText.includes('SELECT t.*') && queryText.includes('WHERE t.id = $1')) {
      const id = params[0];
      const task = mockDb.tasks.find(t => t.id === Number(id));
      return { rows: task ? [task] : [] };
    }
    if (queryText.includes('SELECT * FROM cars') || queryText.includes('SELECT t.*')) {
      return { rows: mockDb.tasks };
    }
    if (queryText.includes('SELECT COUNT')) {
      return { rows: [{ n: 1 }] };
    }
    if (queryText.includes('INSERT INTO tasks')) {
      const newTask = {
        id: mockDb.tasks.length + 1,
        title: params[0],
        description: params[1],
        status: params[2],
        car_model: params[3],
        price_estimate: params[4],
        assignee_id: params[5],
        created_at: new Date(),
        updated_at: new Date()
      };
      mockDb.tasks.push(newTask);
      return { rows: [newTask] };
    }
    if (queryText.includes('UPDATE tasks')) {
      const id = params[params.length - 1];
      const task = mockDb.tasks.find(t => t.id === Number(id));
      if (!task) return { rows: [] };
      task.status = params[0]; // обновляем статус
      return { rows: [task] };
    }
    if (queryText.includes('DELETE FROM tasks')) {
      const id = params[0];
      const count = mockDb.tasks.length;
      mockDb.tasks = mockDb.tasks.filter(t => t.id !== Number(id));
      return { rowCount: count - mockDb.tasks.length };
    }
    return { rows: [] };
  }
};

// Мокаем зависимости
require('./db').pool = mockPgPool;
const redisMock = {
  cacheGet: async () => null,
  cacheSet: async () => true,
  cacheDel: async () => true
};
Object.assign(require('./redis'), redisMock);

const pushMock = {
  sendPushToAll: () => true
};
Object.assign(require('./push'), pushMock);

// Мокаем authMiddleware и roleMiddleware для тестирования
const authModule = require('./auth');
authModule.authMiddleware = (req, res, next) => {
  req.user = { id: 'admin-id', email: 'admin@cars.local', role: 'admin' };
  req.serverId = 'test-server';
  next();
};
authModule.roleMiddleware = () => (req, res, next) => next();

// Настраиваем тестовый роутер (после переопределения middleware!)
const tasksRoutes = require('./routes/tasks');
const app = express();
app.use(express.json());

app.use('/api/tasks', tasksRoutes(() => ({ emit: () => true })));

// Запуск тестового сервера на динамическом порту
let server;
let baseUrl;

test.before(() => {
  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(() => {
  return new Promise((resolve) => {
    server.close(resolve);
  });
});

// ────── ТЕСТЫ ──────

test('Kanban API Tasks Route - GET /api/tasks', async () => {
  const res = await fetch(`${baseUrl}/api/tasks`);
  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.source, 'server');
  assert.ok(Array.isArray(body.data));
  assert.strictEqual(body.data.length, 2);
});

test('Kanban API Tasks Route - POST /api/tasks', async (t) => {
  await t.test('должен успешно создавать новую задачу', async () => {
    const payload = {
      title: 'Новая задача авто',
      car_model: 'Lada Vesta',
      price_estimate: 2200,
      status: 'todo'
    };
    const res = await fetch(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.title, 'Новая задача авто');
    assert.strictEqual(body.car_model, 'Lada Vesta');
  });

  await t.test('должен возвращать ошибку 400 при отсутствии обязательных полей', async () => {
    const payload = { title: 'Нет авто' };
    const res = await fetch(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    assert.strictEqual(res.status, 400);
  });
});

test('Kanban API Tasks Route - PATCH /api/tasks/:id', async (t) => {
  await t.test('должен успешно обновлять статус задачи (Drag-n-Drop)', async () => {
    const payload = { status: 'done' };
    const res = await fetch(`${baseUrl}/api/tasks/1`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.status, 'done');
  });
});

test('Kanban API Tasks Route - DELETE /api/tasks/:id', async () => {
  const res = await fetch(`${baseUrl}/api/tasks/2`, {
    method: 'DELETE'
  });
  assert.strictEqual(res.status, 204);
});
