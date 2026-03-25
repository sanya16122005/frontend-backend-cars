const form     = document.getElementById('note-form');
const input    = document.getElementById('note-input');
const list     = document.getElementById('notes-list');
const empty    = document.getElementById('empty');
const statusEl = document.getElementById('status');

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

// ── Работа с задачами ────────────────────────────────────
function getNotes() {
  return JSON.parse(localStorage.getItem('car-notes') || '[]');
}

function saveNotes(notes) {
  localStorage.setItem('car-notes', JSON.stringify(notes));
}

function loadNotes() {
  const notes = getNotes();
  list.innerHTML = '';

  if (!notes.length) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  notes.forEach((note, i) => {
    const li = document.createElement('li');
    li.className = 'list__item' + (note.done ? ' done' : '');

    // Чекбокс
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'list__check';
    checkbox.checked = note.done;
    checkbox.addEventListener('change', () => toggleNote(i));

    // Текст
    const span = document.createElement('span');
    span.className = 'list__text';
    span.textContent = note.text;

    // Кнопка удаления
    const del = document.createElement('button');
    del.className = 'btn btn--danger';
    del.textContent = '✕';
    del.addEventListener('click', () => deleteNote(i));

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(del);
    list.appendChild(li);
  });
}

function addNote(text) {
  const notes = getNotes();
  notes.unshift({ text, done: false });
  saveNotes(notes);
  loadNotes();
}

function deleteNote(index) {
  const notes = getNotes();
  notes.splice(index, 1);
  saveNotes(notes);
  loadNotes();
}

function toggleNote(index) {
  const notes = getNotes();
  notes[index].done = !notes[index].done;
  saveNotes(notes);
  loadNotes();
}

// ── Форма ────────────────────────────────────────────────
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (text) {
    addNote(text);
    input.value = '';
  }
});

// ── Первый рендер ────────────────────────────────────────
loadNotes();

// ── Регистрация Service Worker ───────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      console.log('SW зарегистрирован:', reg.scope);
    } catch (err) {
      console.error('Ошибка регистрации SW:', err);
    }
  });
}
