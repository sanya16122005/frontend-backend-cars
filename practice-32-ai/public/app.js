const chat   = document.getElementById('chat');
const form   = document.getElementById('form');
const input  = document.getElementById('message');
const submit = form.querySelector('button');

const uploadBtn   = document.getElementById('upload-btn');
const uploadInput = document.getElementById('upload-input');
const docsInfo    = document.getElementById('docs-info');

let conversationId = null;

function bubble(role, text = '') {
  const el = document.createElement('div');
  el.className = `bubble ${role}`;
  el.textContent = text;
  chat.appendChild(el);
  chat.scrollTop = chat.scrollHeight;
  return el;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = input.value.trim();
  if (!message) return;

  bubble('user', message);
  input.value = '';
  submit.disabled = true;

  const aiEl = bubble('assistant', '');

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, message })
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const events = buf.split('\n\n');
      buf = events.pop();
      for (const ev of events) {
        const data = ev.split('\n').find(l => l.startsWith('data: '))?.slice(6);
        const type = ev.split('\n').find(l => l.startsWith('event: '))?.slice(7) || 'message';
        if (!data) continue;
        try {
          const obj = JSON.parse(data);
          if (type === 'meta') {
            conversationId = obj.conversationId;
            if (obj.context?.length) {
              const ctx = bubble('context', '📚 Контекст: ' + obj.context.map(c => c.name).join(', '));
              chat.insertBefore(ctx, aiEl);
            }
          } else if (obj.token) {
            aiEl.textContent += obj.token;
            chat.scrollTop = chat.scrollHeight;
          } else if (obj.error) {
            aiEl.textContent = '⚠️ ' + obj.error;
          }
        } catch {}
      }
    }
  } finally {
    submit.disabled = false;
    input.focus();
  }
});

uploadBtn.addEventListener('click', () => uploadInput.click());
uploadInput.addEventListener('change', async () => {
  const file = uploadInput.files?.[0];
  if (!file) return;
  const text = await file.text();
  await fetch('/api/documents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: file.name, text })
  });
  uploadInput.value = '';
  refreshDocs();
});

async function refreshDocs() {
  const list = await fetch('/api/documents').then(r => r.json());
  docsInfo.textContent = `Документы: ${list.length}`;
}
refreshDocs();
