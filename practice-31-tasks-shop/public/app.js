const socket = io();
const tasks  = new Map();

function render() {
  document.querySelectorAll('.col__list').forEach(list => (list.innerHTML = ''));
  for (const t of tasks.values()) {
    const col = document.querySelector(`.col[data-status="${t.status}"] .col__list`);
    if (col) col.appendChild(card(t));
  }
}

function card(t) {
  const el = document.createElement('div');
  el.className = 'task';
  el.draggable = true;
  el.dataset.id = t.id;
  el.innerHTML = `<span class="task__title"></span><button title="Удалить">✕</button>`;
  el.querySelector('.task__title').textContent = t.title;

  el.addEventListener('dragstart', () => el.classList.add('dragging'));
  el.addEventListener('dragend',   () => el.classList.remove('dragging'));
  el.querySelector('button').addEventListener('click', async () => {
    await fetch(`/api/tasks/${t.id}`, { method: 'DELETE' });
  });
  return el;
}

document.querySelectorAll('.col').forEach(col => {
  col.addEventListener('dragover', (e) => {
    e.preventDefault();
    col.classList.add('over');
  });
  col.addEventListener('dragleave', () => col.classList.remove('over'));
  col.addEventListener('drop', async (e) => {
    e.preventDefault();
    col.classList.remove('over');
    const dragging = document.querySelector('.task.dragging');
    if (!dragging) return;
    const id = dragging.dataset.id;
    const status = col.dataset.status;
    const task = tasks.get(id);
    if (!task || task.status === status) return;
    // Оптимистичное обновление
    task.status = status;
    render();
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
  });
});

document.getElementById('new-task').addEventListener('submit', async (e) => {
  e.preventDefault();
  const titleEl = document.getElementById('title');
  const title   = titleEl.value.trim();
  if (!title) return;
  await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  });
  titleEl.value = '';
});

socket.on('task:created', (t) => { tasks.set(t.id, t); render(); });
socket.on('task:updated', (t) => { tasks.set(t.id, t); render(); });
socket.on('task:deleted', ({ id }) => { tasks.delete(id); render(); });

(async () => {
  const { tasks: list } = await fetch('/api/board').then(r => r.json());
  list.forEach(t => tasks.set(t.id, t));
  render();
})();
