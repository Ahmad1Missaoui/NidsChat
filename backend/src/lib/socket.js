import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      // Allow localhost and ngrok URLs in development
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
  },
});

// apply authentication middleware to all socket connections
io.use(socketAuthMiddleware);

// we will use this function to check if the user is online or not
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// this is for storig online users
const userSocketMap = {}; // {userId:socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.user.fullName);

  const userId = socket.userId;
  userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("typing", ({ to, isGroup }) => {
     if (isGroup) {
        socket.to(to).emit("typing", { from: userId, isGroup: true, groupId: to });
     } else {
        const receiverSocketId = userSocketMap[to];
        if (receiverSocketId) {
           io.to(receiverSocketId).emit("typing", { from: userId, isGroup: false });
        }
     }
  });

  socket.on("stopTyping", ({ to, isGroup }) => {
     if (isGroup) {
        socket.to(to).emit("stopTyping", { from: userId, isGroup: true, groupId: to });
     } else {
        const receiverSocketId = userSocketMap[to];
        if (receiverSocketId) {
           io.to(receiverSocketId).emit("stopTyping", { from: userId, isGroup: false });
        }
     }
  });

  socket.on("messageReaction", ({ messageId, receiverId, reaction }) => {
       const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("messageReaction", { messageId, reaction });
        }
  });

  socket.on("markMessagesAsRead", ({ senderId }) => {
      const senderSocketId = userSocketMap[senderId];
      if (senderSocketId) {
          io.to(senderSocketId).emit("messagesRead", { by: userId });
      }
  });

  // Call events
  socket.on("callUser", async ({ userToCall, signalData, from, name, callType }) => {
    const receiverSocketId = userSocketMap[userToCall];
    
    // Create call record in database
    const Call = (await import("../models/Call.js")).default;
    const call = new Call({
      caller: from,
      receiver: userToCall,
      callType: callType,
      status: "missed", // Default to missed, will be updated if answered
      startedAt: new Date()
    });
    await call.save();
    
    const callId = call._id.toString();
    
    // Send callId back to caller so they can track the call
    const callerSocketId = userSocketMap[from];
    if (callerSocketId) {
      io.to(callerSocketId).emit("callInitiated", { callId });
    }
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("incomingCall", {
        signal: signalData,
        from,
        name,
        callType,
        callId: callId,
      });
    }
  });

  socket.on("answerCall", async ({ signal, to, callId }) => {
    const callerSocketId = userSocketMap[to];
    
    // Update call status to answered
    if (callId) {
      const Call = (await import("../models/Call.js")).default;
      await Call.findByIdAndUpdate(callId, { status: "answered" });
    }
    
    if (callerSocketId) {
      io.to(callerSocketId).emit("callAccepted", { signal, callId });
    }
  });

  socket.on("rejectCall", async ({ to, callId }) => {
    const callerSocketId = userSocketMap[to];
    
    // Update call status to rejected
    if (callId) {
      const Call = (await import("../models/Call.js")).default;
      await Call.findByIdAndUpdate(callId, { 
        status: "rejected",
        endedAt: new Date()
      });
    }
    
    if (callerSocketId) {
      io.to(callerSocketId).emit("callRejected");
    }
  });

  socket.on("endCall", async ({ to, callId, duration }) => {
    const receiverSocketId = userSocketMap[to];
    
    // Update call with duration and end time
    if (callId && duration !== undefined) {
      const Call = (await import("../models/Call.js")).default;
      await Call.findByIdAndUpdate(callId, {
        duration: duration,
        endedAt: new Date()
      });
    }
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("callEnded");
    }
  });

  socket.on("missedCall", async ({ to, callType }) => {
    const receiverSocketId = userSocketMap[to];
    
    // Create a missed call message
    const Message = (await import("../models/Message.js")).default;
    const missedCallMessage = new Message({
      senderId: userId,
      receiverId: to,
      missedCall: true,
      callType: callType,
      text: `Missed ${callType} call`,
    });
    
    await missedCallMessage.save();
    
    // Emit to receiver if online
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", missedCallMessage);
    }
  });

  socket.on("iceCandidate", ({ candidate, to }) => {
    const receiverSocketId = userSocketMap[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("iceCandidate", { candidate });
    }
  });

  // with socket.on we listen for events from clients
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.user.fullName);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };