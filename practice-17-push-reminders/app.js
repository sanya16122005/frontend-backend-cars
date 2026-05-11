const contentEl  = document.getElementById('app-content');
const statusEl   = document.getElementById('status');
const tabs       = document.querySelectorAll('.tab');
const enableBtn  = document.getElementById('enable-push');
const disableBtn = document.getElementById('disable-push');
const toastHost  = document.getElementById('toast-host');

const socket = io();

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

function showToast(text) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = text;
  toastHost.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

async function loadContent(page) {
  try {
    const res = await fetch(`/content/${page}.html`);
    contentEl.innerHTML = await res.text();
    if (page === 'home') initNotes();
  } catch (e) {
    contentEl.innerHTML = '<p class="empty">Ошибка загрузки</p>';
  }
}
tabs.forEach(t => t.addEventListener('click', () => {
  tabs.forEach(x => x.classList.toggle('tab--active', x === t));
  loadContent(t.dataset.page);
}));
loadContent('home');

// ── Данные ───────────────────────────────────────────────
function getNotes() { return JSON.parse(localStorage.getItem('car-notes-v2') || '[]'); }
function saveNotes(arr) { localStorage.setItem('car-notes-v2', JSON.stringify(arr)); }

function initNotes() {
  const form  = document.getElementById('note-form');
  const input = document.getElementById('note-input');
  const rForm = document.getElementById('reminder-form');
  const rText = document.getElementById('reminder-text');
  const rTime = document.getElementById('reminder-time');
  const list  = document.getElementById('notes-list');
  const empty = document.getElementById('empty');

  function render() {
    const notes = getNotes();
    list.innerHTML = '';
    if (!notes.length) { empty.style.display = 'block'; return; }
    empty.style.display = 'none';

    notes.forEach((note) => {
      const li = document.createElement('li');
      li.className = 'list__item' + (note.done ? ' done' : '');

      const check = document.createElement('input');
      check.type = 'checkbox';
      check.className = 'list__check';
      check.checked = note.done;
      check.addEventListener('change', () => {
        const arr = getNotes();
        const idx = arr.findIndex(n => n.id === note.id);
        if (idx >= 0) { arr[idx].done = !arr[idx].done; saveNotes(arr); render(); }
      });

      const wrap = document.createElement('div');
      wrap.className = 'list__body';
      const span = document.createElement('span');
      span.className = 'list__text';
      span.textContent = note.text;
      wrap.appendChild(span);
      if (note.reminder) {
        const sub = document.createElement('span');
        sub.className = 'list__sub';
        const d = new Date(note.reminder);
        sub.textContent = `⏰ ${d.toLocaleString('ru-RU')}`;
        wrap.appendChild(sub);
      }

      const del = document.createElement('button');
      del.className = 'btn btn--danger';
      del.textContent = '✕';
      del.addEventListener('click', () => {
        const arr = getNotes().filter(n => n.id !== note.id);
        saveNotes(arr);
        render();
      });

      li.appendChild(check);
      li.appendChild(wrap);
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
    notes.unshift({ id, text, done: false, reminder: null });
    saveNotes(notes);
    input.value = '';
    render();
    socket.emit('newCarTask', { id, text, timestamp: id });
  });

  rForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = rText.value.trim();
    const time = rTime.value;
    if (!text || !time) return;
    const ts = new Date(time).getTime();
    if (ts <= Date.now()) {
      alert('Дата напоминания должна быть в будущем');
      return;
    }
    const id = Date.now();
    const notes = getNotes();
    notes.unshift({ id, text, done: false, reminder: ts });
    saveNotes(notes);
    rText.value = '';
    rTime.value = '';
    render();
    socket.emit('newReminder', { id, text, reminderTime: ts });
    showToast(`⏰ Напоминание запланировано на ${new Date(ts).toLocaleString('ru-RU')}`);
  });

  render();
}

socket.on('carTaskAdded', (task) => showToast(`🚗 Новая задача: ${task.text}`));
socket.on('reminderScheduled', (r) => console.log('reminder scheduled', r));
socket.on('reminderSnoozed',   (r) => showToast(`⏸ Отложено: ${new Date(r.reminderTime).toLocaleTimeString('ru-RU')}`));

// ── Push ─────────────────────────────────────────────────
function urlBase64ToUint8Array(s) {
  const padding = '='.repeat((4 - s.length % 4) % 4);
  const b64 = (s + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}
async function subscribeToPush() {
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
}
async function unsubscribeFromPush() {
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

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        enableBtn.style.display = 'none';
        disableBtn.style.display = 'inline-block';
      }
      enableBtn.addEventListener('click', async () => {
        if (Notification.permission === 'denied') { alert('Уведомления запрещены'); return; }
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
      console.error('SW ошибка:', err);
    }
  });
}
