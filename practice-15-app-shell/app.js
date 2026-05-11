const contentEl = document.getElementById('app-content');
const statusEl  = document.getElementById('status');
const tabs      = document.querySelectorAll('.tab');

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

// ── Динамическая загрузка контента App Shell ─────────────
async function loadContent(page) {
  try {
    const res = await fetch(`/content/${page}.html`);
    const html = await res.text();
    contentEl.innerHTML = html;
    if (page === 'home') initNotes();
  } catch (err) {
    contentEl.innerHTML = '<p class="empty">Ошибка загрузки страницы</p>';
    console.error(err);
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

// Стартовая страница
loadContent('home');

// ── Логика задач ─────────────────────────────────────────
function getNotes() {
  return JSON.parse(localStorage.getItem('car-notes') || '[]');
}
function saveNotes(notes) {
  localStorage.setItem('car-notes', JSON.stringify(notes));
}

function initNotes() {
  const form  = document.getElementById('note-form');
  const input = document.getElementById('note-input');
  const list  = document.getElementById('notes-list');
  const empty = document.getElementById('empty');

  function loadNotes() {
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
        loadNotes();
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
        loadNotes();
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
    const notes = getNotes();
    notes.unshift({ text, done: false });
    saveNotes(notes);
    input.value = '';
    loadNotes();
  });

  loadNotes();
}

// ── Регистрация Service Worker ───────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      console.log('SW зарегистрирован:', reg.scope);
    } catch (err) {
      console.error('Ошибка SW:', err);
    }
  });
}
