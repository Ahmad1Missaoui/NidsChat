#!/bin/sh
set -e

echo "� Checking frontend files..."
ls -la /app/frontend/dist/ || echo "❌ Frontend dist folder not found!"
test -f /app/frontend/dist/index.html && echo "✅ index.html exists" || echo "❌ index.html missing!"
echo ""
echo "📋 Contents of /app/frontend/dist/:"
ls -lh /app/frontend/dist/

echo ""echo "🔍 Testing nginx config..."
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

echo ""
echo "🔍 Checking nginx is listening on port 8080..."
netstat -tulpn 2>/dev/null | grep :8080 || echo "Checking ports..."
sleep 1

echo ""
echo "🔍 Testing nginx response..."
wget -O- http://localhost:8080/ 2>&1 | head -20 || echo "Could not reach nginx"

# Keep container running
wait
