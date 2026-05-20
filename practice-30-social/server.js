// Мини-социальная сеть: посты, лайки, комментарии + Socket.IO real-time.
// Данные в памяти, чтобы держать пример компактным.

const express  = require('express');
const http     = require('http');
const path     = require('path');
const { Server: SocketIOServer } = require('socket.io');
const { nanoid } = require('nanoid');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: '*' } });

// ───── In-memory storage ─────────────────────────────────
const posts = [
  { id: 'p1', author: 'admin', text: 'Привет, это первый пост!', createdAt: Date.now() - 3600000, likes: new Set(['user1']), comments: [] }
];

// helper — нельзя сериализовать Set в JSON
function serializePost(p) {
  return { ...p, likes: [...p.likes], likesCount: p.likes.size };
}

// ───── REST ──────────────────────────────────────────────
app.get('/api/posts', (_req, res) => {
  res.json(posts.map(serializePost).sort((a, b) => b.createdAt - a.createdAt));
});

app.post('/api/posts', (req, res) => {
  const { author, text } = req.body || {};
  if (!author || !text) return res.status(400).json({ error: 'author, text required' });
  const post = {
    id: nanoid(8),
    author,
    text: String(text).slice(0, 500),
    createdAt: Date.now(),
    likes: new Set(),
    comments: []
  };
  posts.unshift(post);
  io.emit('post:created', serializePost(post));
  res.status(201).json(serializePost(post));
});

app.post('/api/posts/:id/like', (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'Not found' });
  const { user } = req.body || {};
  if (!user) return res.status(400).json({ error: 'user required' });

  if (post.likes.has(user)) post.likes.delete(user);
  else post.likes.add(user);

  io.emit('post:liked', { id: post.id, user, likesCount: post.likes.size });
  res.json(serializePost(post));
});

app.post('/api/posts/:id/comments', (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'Not found' });
  const { author, text } = req.body || {};
  if (!author || !text) return res.status(400).json({ error: 'author, text required' });

  const comment = { id: nanoid(8), author, text: String(text).slice(0, 200), createdAt: Date.now() };
  post.comments.push(comment);
  io.emit('post:commented', { postId: post.id, comment });
  res.status(201).json(comment);
});

// ───── Socket.IO ─────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('Подключён:', socket.id);
  socket.on('disconnect', () => console.log('Отключён:', socket.id));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`💬 Social: http://localhost:${PORT}`));
