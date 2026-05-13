FROM node:18-alpine

WORKDIR /app

# Сначала зависимости (кэшируется отдельно)
COPY package*.json ./
RUN npm install --omit=dev

# Затем код приложения
COPY . .

EXPOSE 3000
CMD ["node", "src/server.js"]
