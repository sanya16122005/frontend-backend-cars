#!/usr/bin/env bash
# Запуск трёх инстансов cars-backend на портах 3001, 3002, 3003
set -e
cd "$(dirname "$0")/backend"

PORT=3001 SERVER_ID=cars-3001 node server.js &
PORT=3002 SERVER_ID=cars-3002 node server.js &
PORT=3003 SERVER_ID=cars-3003 node server.js &

wait
