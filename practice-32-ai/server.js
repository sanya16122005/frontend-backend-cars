// AI-чат с потоковым ответом (Server-Sent Events).
// Если задан OPENAI_API_KEY — используем реальный API.
// Иначе — встроенный mock: стримит ответ слово-за-словом + наивный поиск по
// загруженным документам (мини-RAG).

const express = require('express');
const path    = require('path');
const { nanoid } = require('nanoid');

const app = express();
app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const USE_REAL_OPENAI = !!process.env.OPENAI_API_KEY;
const OPENAI_MODEL    = process.env.OPENAI_MODEL || 'gpt-4o-mini';

// ───── In-memory: документы + история диалогов ──────────
const documents     = [];                   // [{ id, name, text }]
const conversations = new Map();            // id → [{ role, content }]

// ───── REST: документы (RAG) ────────────────────────────
app.post('/api/documents', (req, res) => {
  const { name, text } = req.body || {};
  if (!name || !text) return res.status(400).json({ error: 'name, text required' });
  const doc = { id: nanoid(8), name, text: String(text) };
  documents.push(doc);
  res.status(201).json({ id: doc.id, name: doc.name, chars: doc.text.length });
});

app.get('/api/documents', (_req, res) => {
  res.json(documents.map(d => ({ id: d.id, name: d.name, chars: d.text.length })));
});

app.delete('/api/documents/:id', (req, res) => {
  const idx = documents.findIndex(d => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  documents.splice(idx, 1);
  res.status(204).end();
});

// Наивный поиск релевантных фрагментов по ключевым словам.
// В реальном RAG здесь будут эмбеддинги + векторный поиск (pgvector).
function retrieve(query, topK = 2) {
  if (!documents.length) return [];
  const words = query.toLowerCase().split(/\W+/).filter(w => w.length > 3);
  const scored = documents.map(d => {
    const txt = d.text.toLowerCase();
    const score = words.reduce((s, w) => s + (txt.includes(w) ? 1 : 0), 0);
    return { doc: d, score };
  }).filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
  return scored.map(x => ({ name: x.doc.name, snippet: x.doc.text.slice(0, 400) }));
}

// ───── REST: история диалогов ───────────────────────────
app.get('/api/conversations/:id', (req, res) => {
  res.json(conversations.get(req.params.id) || []);
});

// ───── SSE-стрим: /api/chat ─────────────────────────────
app.post('/api/chat', async (req, res) => {
  const { conversationId, message } = req.body || {};
  if (!message) return res.status(400).json({ error: 'message required' });

  const convId = conversationId || nanoid(8);
  const history = conversations.get(convId) || [];
  history.push({ role: 'user', content: message });

  const context = retrieve(message);

  // SSE заголовки
  res.setHeader('Content-Type',  'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection',    'keep-alive');
  res.flushHeaders?.();

  res.write(`event: meta\ndata: ${JSON.stringify({ conversationId: convId, context })}\n\n`);

  let full = '';
  function send(token) {
    full += token;
    res.write(`data: ${JSON.stringify({ token })}\n\n`);
  }

  try {
    if (USE_REAL_OPENAI) {
      // Реальный OpenAI streaming
      const ragPrompt = context.length
        ? `Используй контекст из документов при ответе:\n${context.map(c => `[${c.name}]\n${c.snippet}`).join('\n\n')}\n\n`
        : '';
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type':  'application/json'
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          stream: true,
          messages: [
            { role: 'system', content: 'Ты — помощник студента по веб-разработке. Отвечай по-русски.' },
            { role: 'user',   content: ragPrompt + message }
          ]
        })
      });
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop();
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          try {
            const token = JSON.parse(data)?.choices?.[0]?.delta?.content;
            if (token) send(token);
          } catch {}
        }
      }
    } else {
      // Mock-streaming — складываем ответ из шаблонов
      const reply = makeMockReply(message, context);
      for (const word of reply.split(/(\s+)/)) {
        await new Promise(r => setTimeout(r, 40));
        send(word);
      }
    }

    history.push({ role: 'assistant', content: full });
    conversations.set(convId, history);
    res.write(`event: done\ndata: ${JSON.stringify({ conversationId: convId })}\n\n`);
  } catch (err) {
    res.write(`event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`);
  } finally {
    res.end();
  }
});

function makeMockReply(message, context) {
  const m = message.toLowerCase();
  const parts = [];
  if (context.length) {
    parts.push(`По загруженным документам нашёл следующее: ${context.map(c => `«${c.name}»`).join(', ')}.`);
  }
  if (m.includes('graphql'))       parts.push('GraphQL — язык запросов, в котором клиент сам описывает нужные поля. Используется один эндпоинт, обычно /graphql.');
  else if (m.includes('rabbit'))   parts.push('RabbitMQ — брокер сообщений по протоколу AMQP. Producer публикует в Exchange, тот маршрутизирует в Queue, Consumer обрабатывает.');
  else if (m.includes('jwt'))      parts.push('JWT состоит из header, payload и signature. Подпись защищает от подделки, payload содержит sub, role, exp.');
  else if (m.includes('docker'))   parts.push('Docker упаковывает приложение в изолированный контейнер. docker compose описывает стек декларативно.');
  else                              parts.push('Это интересный вопрос! Загляни в README соответствующей практики — там есть теория и пример кода.');
  parts.push(' Если нужно подробнее — уточни тему.');
  return parts.join(' ');
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🤖 AI Chat: http://localhost:${PORT}  (real OpenAI: ${USE_REAL_OPENAI})`);
});
