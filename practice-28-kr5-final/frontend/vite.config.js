import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// В контейнере фронт собирается в /usr/share/nginx/html
// Все запросы /api/* и /socket.io/* проксирует Nginx
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  server: {
    port: 5173,
    // dev-режим: проксируем API на backend localhost:3000 (если запущен напрямую)
    proxy: {
      '/api':       { target: 'http://localhost:3000', changeOrigin: true },
      '/socket.io': { target: 'http://localhost:3000', changeOrigin: true, ws: true }
    }
  }
});
