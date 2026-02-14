#!/bin/sh
set -e

echo "� Checking frontend files..."
ls -la /app/frontend/dist/ || echo "❌ Frontend dist folder not found!"
test -f /app/frontend/dist/index.html && echo "✅ index.html exists" || echo "❌ index.html missing!"

echo "�🚀 Starting backend on port 3000..."
cd /app/backend && node src/server.js &

echo "⏳ Waiting for backend to start..."
sleep 3

echo "🚀 Starting nginx on port 8080..."
exec nginx -g "daemon off;"
