import { useEffect, useState } from 'react';

export function useToasts() {
  const [toasts, setToasts] = useState([]);

  function push(text) {
    const id = Date.now() + Math.random();
    setToasts(arr => [...arr, { id, text }]);
    setTimeout(() => setToasts(arr => arr.filter(t => t.id !== id)), 3500);
  }

  return { toasts, push };
}

export function ToastHost({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-host">
      {toasts.map(t => <div key={t.id} className="toast">{t.text}</div>)}
    </div>
  );
}
