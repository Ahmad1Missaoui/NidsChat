import express from 'express';
import dotenv from 'dotenv';
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

dotenv.config();


const __dirname = Path.resolve();

const PORT =ENV.PORT  || 3000;


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin
      if (!origin) return callback(null, true);
      
      // Allow localhost and ngrok URLs
      const allowedOrigins = [
        ENV.CLIENT_URL,
        'http://localhost:5173',
        'http://localhost:3000',
      ];
      
      // Allow all ngrok URLs for testing
      if (origin.includes('ngrok') || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else if (ENV.NODE_ENV === 'production') {
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

server.listen(PORT, () => { 
    console.log('Server is running on port '+PORT)
    connectDB();
});