#!/bin/sh

# Start nginx in background
nginx

# Start backend server
cd /app/backend && node src/server.js
