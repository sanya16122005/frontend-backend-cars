const contentEl  = document.getElementById('app-content');
const statusEl   = document.getElementById('status');
const tabs       = document.querySelectorAll('.tab');
const enableBtn  = document.getElementById('enable-push');
const disableBtn = document.getElementById('disable-push');
const toastHost  = document.getElementById('toast-host');

const socket = io();

// ── Статус сети ──────────────────────────────────────────
function updateStatus() {
  if (navigator.onLine) {
    statusEl.textContent = '🟢 Онлайн';
    statusEl.className = 'status status--online';
  } else {
    statusEl.textContent = '🔴 Офлайн';
    statusEl.className = 'status status--offline';
  }
}
window.addEventListener('online', updateStatus);
window.addEventListener('offline', updateStatus);
updateStatus();

// ── Тосты ────────────────────────────────────────────────
function showToast(text) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = text;
  toastHost.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

// ── App Shell ────────────────────────────────────────────
async function loadContent(page) {
  try {
    const res = await fetch(`/content/${page}.html`);
    contentEl.innerHTML = await res.text();
    if (page === 'home') initNotes();
  } catch (err) {
    contentEl.innerHTML = '<p class="empty">Ошибка загрузки страницы</p>';
  }
}
function setActiveTab(page) {
  tabs.forEach(t => t.classList.toggle('tab--active', t.dataset.page === page));
}
tabs.forEach(t => {
  t.addEventListener('click', () => {
    const page = t.dataset.page;
    setActiveTab(page);
    loadContent(page);
  });
});
loadContent('home');

// ── Задачи ───────────────────────────────────────────────
function getNotes() { return JSON.parse(localStorage.getItem('car-notes') || '[]'); }
function saveNotes(arr) { localStorage.setItem('car-notes', JSON.stringify(arr)); }

function initNotes() {
  const form  = document.getElementById('note-form');
  const input = document.getElementById('note-input');
  const list  = document.getElementById('notes-list');
  const empty = document.getElementById('empty');

  function render() {
    const notes = getNotes();
    list.innerHTML = '';
    if (!notes.length) { empty.style.display = 'block'; return; }
    empty.style.display = 'none';

    notes.forEach((note, i) => {
      const li = document.createElement('li');
      li.className = 'list__item' + (note.done ? ' done' : '');

      const check = document.createElement('input');
      check.type = 'checkbox';
      check.className = 'list__check';
      check.checked = note.done;
      check.addEventListener('change', () => {
        const arr = getNotes();
        arr[i].done = !arr[i].done;
        saveNotes(arr);
        render();
      });

      const span = document.createElement('span');
      span.className = 'list__text';
      span.textContent = note.text;

      const del = document.createElement('button');
      del.className = 'btn btn--danger';
      del.textContent = '✕';
      del.addEventListener('click', () => {
        const arr = getNotes();
        arr.splice(i, 1);
        saveNotes(arr);
        render();
      });

      li.appendChild(check);
      li.appendChild(span);
      li.appendChild(del);
      list.appendChild(li);
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    const id = Date.now();
    const notes = getNotes();
    notes.unshift({ id, text, done: false });
    saveNotes(notes);
    input.value = '';
    render();
    socket.emit('newCarTask', { id, text, timestamp: id });
  });

  render();
}

// ── Получение событий от других вкладок/клиентов ─────────
socket.on('carTaskAdded', (task) => {
  showToast(`🚗 Новая задача: ${task.text}`);
});

// ── Push-подписки ────────────────────────────────────────
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

async function subscribeToPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
  const reg = await navigator.serviceWorker.ready;
  const { key } = await fetch('/api/vapid-public-key').then(r => r.json());

  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(key)
  });

  await fetch('/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sub)
  });
  console.log('Push subscription saved');
}

async function unsubscribeFromPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;
  await fetch('/unsubscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint: sub.endpoint })
  });
  await sub.unsubscribe();
}

// ── Регистрация SW и кнопки уведомлений ──────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      console.log('SW зарегистрирован:', reg.scope);

      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        enableBtn.style.display = 'none';
        disableBtn.style.display = 'inline-block';
      }

      enableBtn.addEventListener('click', async () => {
        if (Notification.permission === 'denied') {
          alert('Уведомления запрещены в настройках браузера');
          return;
        }
        if (Notification.permission === 'default') {
          const p = await Notification.requestPermission();
          if (p !== 'granted') return;
        }
        await subscribeToPush();
        enableBtn.style.display = 'none';
        disableBtn.style.display = 'inline-block';
      });

      disableBtn.addEventListener('click', async () => {
        await unsubscribeFromPush();
        disableBtn.style.display = 'none';
        enableBtn.style.display = 'inline-block';
      });
    } catch (err) {
      console.error('Ошибка SW:', err);
    }
  });
}
