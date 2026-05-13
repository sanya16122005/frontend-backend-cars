# ─── Stage 1: build React + Vite ──────────────────────
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ─── Stage 2: nginx со встроенным фронтом + LB ────────
FROM nginx:alpine

# Собранный фронт
COPY --from=builder /app/dist /usr/share/nginx/html

# Конфиг подмонтируется через volume в docker-compose
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
