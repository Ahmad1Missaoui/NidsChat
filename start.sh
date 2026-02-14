#!/bin/sh
set -e

echo "� Checking frontend files..."
ls -la /app/frontend/dist/ || echo "❌ Frontend dist folder not found!"
test -f /app/frontend/dist/index.html && echo "✅ index.html exists" || echo "❌ index.html missing!"

echo "🔍 Testing nginx config..."
nginx -t

echo "🚀 Starting backend on port 3000..."
cd /app/backend && node src/server.js &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

echo "⏳ Waiting for backend to start..."
sleep 3

echo "🚀 Starting nginx on port 8080..."
nginx -g "daemon off;" &
NGINX_PID=$!
echo "Nginx PID: $NGINX_PID"

echo "⏳ Waiting for nginx to start..."
sleep 2

echo "✅ Both services started!"
echo "Backend PID: $BACKEND_PID"
echo "Nginx PID: $NGINX_PID"

# Keep container running
wait
