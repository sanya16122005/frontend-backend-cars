import { useEffect, useState } from 'react';
import api from '../api/client.js';

function urlBase64ToUint8Array(base64) {
  const padding = '='.repeat((4 - base64.length % 4) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export default function PushToggle() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const ok = 'serviceWorker' in navigator && 'PushManager' in window;
    setSupported(ok);
    if (!ok) return;
    (async () => {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setSubscribed(!!sub);
    })();
  }, []);

  if (!supported) return null;

  async function enable() {
    setBusy(true);
    try {
      if (Notification.permission === 'denied') { alert('Уведомления запрещены в настройках браузера'); return; }
      if (Notification.permission === 'default') {
        const p = await Notification.requestPermission();
        if (p !== 'granted') return;
      }
      const reg = await navigator.serviceWorker.ready;
      const { data: { key } } = await api.get('/push/vapid-public-key');
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key)
      });
      await api.post('/push/subscribe', sub);
      setSubscribed(true);
    } finally { setBusy(false); }
  }

  async function disable() {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await api.post('/push/unsubscribe', { endpoint: sub.endpoint });
        await sub.unsubscribe();
      }
      setSubscribed(false);
    } finally { setBusy(false); }
  }

  return subscribed ? (
    <button className="btn btn--danger" disabled={busy} onClick={disable}>🔕 Откл.</button>
  ) : (
    <button className="btn btn--success" disabled={busy} onClick={enable}>🔔 Уведомления</button>
  );
}
