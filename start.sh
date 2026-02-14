#!/bin/sh
set -e

echo "🚀 Starting nginx..."
nginx -g "daemon off;" &

echo "⏳ Waiting for nginx to start..."
sleep 2

echo "🚀 Starting backend server..."
cd /app/backend && exec node src/server.js
