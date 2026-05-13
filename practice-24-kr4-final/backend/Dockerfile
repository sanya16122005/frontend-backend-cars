FROM node:20-alpine

WORKDIR /app

# Большой таймаут npm + меньше шума в логах
RUN npm config set fetch-timeout 600000 \
 && npm config set fetch-retries 5 \
 && npm config set audit false \
 && npm config set fund false

# Сначала зависимости (кэшируется отдельно)
COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps --no-audit --no-fund

# Затем код приложения
COPY . .

EXPOSE 3000
CMD ["node", "src/server.js"]
