#!/bin/sh
set -e

echo "🔍 Environment Check:"
echo "PORT variable: ${PORT:-NOT_SET}"
echo "NODE_ENV: ${NODE_ENV:-NOT_SET}"
echo ""

PUBLIC_PORT="${PORT:-8080}"
ALT_PUBLIC_PORT="3000"
BACKEND_PORT="3001"

echo "📂 Checking frontend files..."
ls -la /app/frontend/dist/ || echo "❌ Frontend dist folder not found!"
test -f /app/frontend/dist/index.html && echo "✅ index.html exists" || echo "❌ index.html missing!"
echo ""
echo "📋 Contents of /app/frontend/dist/:"
ls -lh /app/frontend/dist/

echo ""
echo "🔧 Configuring nginx ports (primary: ${PUBLIC_PORT}, alt: ${ALT_PUBLIC_PORT}) and backend port (${BACKEND_PORT})..."
sed -i "s/PORT_PLACEHOLDER/${PUBLIC_PORT}/g" /etc/nginx/http.d/default.conf
sed -i "s/ALT_PUBLIC_PORT_PLACEHOLDER/${ALT_PUBLIC_PORT}/g" /etc/nginx/http.d/default.conf
sed -i "s/BACKEND_PORT_PLACEHOLDER/${BACKEND_PORT}/g" /etc/nginx/http.d/default.conf

echo ""
echo "🔍 Checking directories permissions:"
ls -ld /app /app/frontend /app/frontend/dist

echo ""
echo "🔍 Checking nginx user:"
grep "nginx" /etc/passwd

echo "✅ Nginx configured (public: ${PUBLIC_PORT}/${ALT_PUBLIC_PORT}, backend: ${BACKEND_PORT})"

echo ""
echo "🔍 Testing nginx config..."
nginx -t

echo ""
echo "📋 Nginx listen port:"
grep "listen" /etc/nginx/http.d/default.conf || echo "Could not find listen directive"

echo ""
echo "🚀 Starting backend on internal port ${BACKEND_PORT}..."
cd /app/backend && BACKEND_PORT=${BACKEND_PORT} node src/server.js &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

echo "⏳ Waiting for backend to start..."
sleep 3

echo "🚀 Starting nginx on ports ${PUBLIC_PORT} and ${ALT_PUBLIC_PORT}..."
nginx -g "daemon off;" &
NGINX_PID=$!
echo "Nginx PID: $NGINX_PID"

echo "⏳ Waiting for nginx to start..."
sleep 2

echo "✅ Both services started!"
echo "Backend PID: $BACKEND_PID"
echo "Nginx PID: $NGINX_PID"

echo ""
echo "🔍 Checking nginx is listening on ports ${PUBLIC_PORT} and ${ALT_PUBLIC_PORT}..."
netstat -tulpn 2>/dev/null | grep -E ":${PUBLIC_PORT}|:${ALT_PUBLIC_PORT}" || echo "Checking ports..."
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
wget -O- http://127.0.0.1:${PUBLIC_PORT}/ 2>&1 | head -30 || echo "⚠️  Could not reach nginx on ${PUBLIC_PORT}"

echo ""
echo "📋 Recent nginx error log:"
tail -20 /var/log/nginx/error.log 2>/dev/null || echo "No errors logged yet"

echo ""
echo "🎉 Container ready!"

# Keep container running
wait
