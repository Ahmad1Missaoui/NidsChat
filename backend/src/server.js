import express from 'express';
import authRoutes from './routes/auth.route.js';
import MessageRoutes from './routes/message.route.js';
import friendRoutes from './routes/friend.route.js';
import groupRoutes from './routes/group.route.js';
import userRoutes from './routes/user.route.js';
import aiRoutes from './routes/ai.route.js';
import callRoutes from './routes/call.route.js';
import Path from 'path';
import { connectDB } from './lib/db.js';
import { ENV } from './lib/env.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import {app,server } from './lib/socket.js';

const __dirname = Path.resolve();

// Backend runs on internal localhost port, nginx proxies to it
const PORT = Number(process.env.BACKEND_PORT || 3001);
const HOST = '127.0.0.1';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const normalizeOrigin = (value) => (value || '').trim().replace(/\/$/, '').toLowerCase();
const railwayPublicDomain = process.env.RAILWAY_PUBLIC_DOMAIN
  ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
  : null;

const allowedOrigins = [
  ENV.CLIENT_URL,
  process.env.CLIENT_URL,
  railwayPublicDomain,
  'https://nidschat-production.up.railway.app',
  'http://localhost:5173',
  'http://localhost:3000',
].map(normalizeOrigin).filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin
      if (!origin) return callback(null, true);

      const normalizedOrigin = normalizeOrigin(origin);

      // Allow all ngrok URLs for testing
      if (
        normalizedOrigin.includes('ngrok') ||
        allowedOrigins.includes(normalizedOrigin) ||
        (ENV.NODE_ENV === 'production' && normalizedOrigin.endsWith('.up.railway.app'))
      ) {
        callback(null, true);
      } else if (ENV.NODE_ENV === 'production') {
        console.log('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      } else {
        // Allow all in development
        callback(null, true);
      }
    },
    credentials: true,
}));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", MessageRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/calls", callRoutes);

// Health check endpoint for Railway/Docker
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

server.listen(PORT, HOST, () => { 
  console.log('Server is running on '+HOST+':'+PORT)
    connectDB();
});