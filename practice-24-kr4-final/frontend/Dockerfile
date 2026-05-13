# ─── Stage 1: build React + Vite ──────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Большой таймаут для npm и игнор peer-dep конфликтов — фронт ставится надёжнее
RUN npm config set fetch-timeout 600000 \
 && npm config set fetch-retries 5 \
 && npm config set audit false \
 && npm config set fund false

COPY package*.json ./
RUN npm install --legacy-peer-deps --no-audit --no-fund

COPY . .
RUN npm run build

# ─── Stage 2: nginx со встроенным фронтом + LB ────────
FROM nginx:alpine

# Собранный фронт
COPY --from=builder /app/dist /usr/share/nginx/html

# Конфиг подмонтируется через volume в docker-compose
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
