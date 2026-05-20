const socket = io();
const feed   = document.getElementById('feed');
const meEl   = document.getElementById('me');
const form   = document.getElementById('new-post');
const text   = document.getElementById('text');

const posts = new Map();

function render() {
  feed.innerHTML = '';
  [...posts.values()]
    .sort((a, b) => b.createdAt - a.createdAt)
    .forEach(p => feed.appendChild(card(p)));
}

function card(p) {
  const me = meEl.value.trim();
  const liked = p.likes.includes(me);
  const el = document.createElement('article');
  el.className = 'post';
  el.dataset.id = p.id;
  el.innerHTML = `
    <div>
      <span class="post__author">@${p.author}</span>
      <span class="post__date">${new Date(p.createdAt).toLocaleString('ru-RU')}</span>
    </div>
    <p class="post__text"></p>
    <div class="post__actions">
      <button class="like ${liked ? 'active' : ''}">❤ ${p.likesCount}</button>
    </div>
    <div class="comments">
      ${p.comments.map(c =>
        `<div class="comment"><span class="comment__author">@${c.author}</span>: ${escapeHtml(c.text)}</div>`
      ).join('')}
      <form class="comment-form">
        <input placeholder="Комментарий…" required />
        <button>+</button>
      </form>
    </div>
  `;
  el.querySelector('.post__text').textContent = p.text;
  el.querySelector('.like').addEventListener('click', async () => {
    await fetch(`/api/posts/${p.id}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: meEl.value.trim() })
    });
  });
  el.querySelector('.comment-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = e.target.querySelector('input');
    const value = input.value.trim();
    if (!value) return;
    await fetch(`/api/posts/${p.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author: meEl.value.trim(), text: value })
    });
    input.value = '';
  });
  return el;
}

function escapeHtml(s) {
  return String(s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
}

async function load() {
  const res = await fetch('/api/posts');
  const list = await res.json();
  posts.clear();
  list.forEach(p => posts.set(p.id, p));
  render();
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const author = meEl.value.trim();
  if (!author || !text.value.trim()) return;
  await fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ author, text: text.value })
  });
  text.value = '';
});

socket.on('post:created', (p) => { posts.set(p.id, p); render(); });
socket.on('post:liked',   ({ id, user, likesCount }) => {
  const p = posts.get(id);
  if (!p) return;
  p.likesCount = likesCount;
  if (p.likes.includes(user)) p.likes = p.likes.filter(u => u !== user);
  else p.likes.push(user);
  render();
});
socket.on('post:commented', ({ postId, comment }) => {
  const p = posts.get(postId);
  if (!p) return;
  p.comments.push(comment);
  render();
});

load();
