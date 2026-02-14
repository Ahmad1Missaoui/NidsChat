# Multi-stage build for both frontend and backend

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend Setup
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend

# Install build dependencies for canvas and native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev

COPY backend/package*.json ./
RUN npm install --production
COPY backend/ ./

# Stage 3: Production - Run Backend + Serve Frontend
FROM node:20-alpine
WORKDIR /app

# Install nginx and runtime dependencies for canvas
RUN apk add --no-cache \
    nginx \
    cairo \
    jpeg \
    pango \
    giflib \
    pixman

# Copy backend files
COPY --from=backend-builder /app/backend ./backend

# Copy frontend build
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Copy nginx config
RUN rm -rf /etc/nginx/http.d/*
COPY nginx-root.conf /etc/nginx/http.d/default.conf

# Create nginx directories
RUN mkdir -p /run/nginx /var/log/nginx

# Copy start script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Railway will provide PORT environment variable - nginx will use it dynamically
# No EXPOSE needed - Railway routes to the PORT env var automatically

# Health check (backend runs internally on 3000)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start both services
CMD ["/app/start.sh"]
