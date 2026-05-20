// Kanban-доска: 3 колонки (todo / in-progress / done),
// drag-n-drop задач, real-time синхронизация между всеми клиентами.

const express  = require('express');
const http     = require('http');
const path     = require('path');
const { Server: SocketIOServer } = require('socket.io');
const { nanoid } = require('nanoid');

const app    = express();
const server = http.createServer(app);
const io     = new SocketIOServer(server, { cors: { origin: '*' } });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ───── In-memory board ───────────────────────────────────
const COLUMNS = ['todo', 'in-progress', 'done'];

const board = {
  tasks: [
    { id: 't1', title: 'Купить кофе',          status: 'todo' },
    { id: 't2', title: 'Сверстать главный экран', status: 'in-progress' },
    { id: 't3', title: 'Зарегистрировать домен',  status: 'done' }
  ]
};

// ───── REST ──────────────────────────────────────────────
app.get('/api/board', (_req, res) => res.json(board));

app.post('/api/tasks', (req, res) => {
  const { title, status = 'todo' } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title required' });
  if (!COLUMNS.includes(status)) return res.status(400).json({ error: 'invalid status' });
  const task = { id: nanoid(8), title: String(title).slice(0, 120), status };
  board.tasks.push(task);
  io.emit('task:created', task);
  res.status(201).json(task);
});

app.patch('/api/tasks/:id', (req, res) => {
  const task = board.tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Not found' });
  const { title, status } = req.body || {};
  if (title  !== undefined) task.title  = String(title).slice(0, 120);
  if (status !== undefined) {
    if (!COLUMNS.includes(status)) return res.status(400).json({ error: 'invalid status' });
    task.status = status;
  }
  io.emit('task:updated', task);
  res.json(task);
});

app.delete('/api/tasks/:id', (req, res) => {
  const idx = board.tasks.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const [removed] = board.tasks.splice(idx, 1);
  io.emit('task:deleted', { id: removed.id });
  res.status(204).end();
});

// ───── Socket.IO ─────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('Подключён:', socket.id);
  socket.on('disconnect', () => console.log('Отключён:', socket.id));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`📝 Kanban: http://localhost:${PORT}`));
