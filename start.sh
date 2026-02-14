#!/bin/sh
set -e

echo "🔍 Environment Check:"
echo "PORT variable: ${PORT:-NOT_SET}"
echo "NODE_ENV: ${NODE_ENV:-NOT_SET}"
echo ""

echo "📂 Checking frontend files..."
ls -la /app/frontend/dist/ || echo "❌ Frontend dist folder not found!"
test -f /app/frontend/dist/index.html && echo "✅ index.html exists" || echo "❌ index.html missing!"
echo ""
echo "📋 Contents of /app/frontend/dist/:"
ls -lh /app/frontend/dist/

echo ""
echo "🔧 Configuring nginx to listen on PORT: ${PORT:-8080}..."
sed -i "s/PORT_PLACEHOLDER/${PORT:-8080}/g" /etc/nginx/http.d/default.conf

echo ""
echo "🔍 Checking directories permissions:"
ls -ld /app /app/frontend /app/frontend/dist

echo ""
echo "🔍 Checking nginx user:"
grep "nginx" /etc/passwd

echo "✅ Nginx configured to use port: ${PORT:-8080}"

echo ""
echo "🔍 Testing nginx config..."
nginx -t

echo ""
echo "📋 Nginx listen port:"
grep "listen" /etc/nginx/http.d/default.conf || echo "Could not find listen directive"

echo ""
echo "🚀 Starting backend on port 3000..."
cd /app/backend && node src/server.js &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

echo "⏳ Waiting for backend to start..."
sleep 3

echo "🚀 Starting nginx on port ${PORT:-8080}..."
nginx -g "daemon off;" &
NGINX_PID=$!
echo "Nginx PID: $NGINX_PID"

echo "⏳ Waiting for nginx to start..."
sleep 2

echo "✅ Both services started!"
echo "Backend PID: $BACKEND_PID"
echo "Nginx PID: $NGINX_PID"

echo ""
echo "🔍 Checking nginx is listening on port ${PORT:-8080}..."
netstat -tulpn 2>/dev/null | grep :${PORT:-8080} || echo "Checking ports..."
sleep 1

echo ""
echo "� Assets folder contents:"
ls -lh /app/frontend/dist/assets/ 2>/dev/null | head -20 || echo "No assets folder"

echo ""
echo "📄 First 15 lines of index.html:"
head -15 /app/frontend/dist/index.html

echo ""
echo "🔐 File permissions check:"
ls -la /app/frontend/dist/index.html

echo ""
echo "🔍 Testing nginx response..."
wget -O- http://127.0.0.1:${PORT:-8080}/ 2>&1 | head -30 || echo "⚠️  Could not reach nginx"

echo ""
echo "📋 Recent nginx error log:"
tail -20 /var/log/nginx/error.log 2>/dev/null || echo "No errors logged yet"

echo ""
echo "🎉 Container ready!"

# Keep container running
wait
