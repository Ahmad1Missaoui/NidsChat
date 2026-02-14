# NIDS Chat

A modern real-time chat application with AI features, group chats, video/audio calls, and email verification.

## Features

- 🔐 **Authentication**: Email/password signup with verification, Google OAuth
- 💬 **Real-time Messaging**: WebSocket-based instant messaging
- 👥 **Group Chats**: Create and manage group conversations
- 📞 **Voice & Video Calls**: WebRTC-based calling system
- 🤖 **AI Chat**: Integrated AI assistant
- 📧 **Email Verification**: Secure account activation via email
- 🖼️ **Media Sharing**: Image and file uploads via Cloudinary
- 🔒 **Security**: Arcjet security layer, rate limiting
- 🌍 **Internationalization**: Multi-language support (i18next)

## Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Socket.io (real-time communication)
- JWT (authentication)
- Nodemailer (email verification)
- Resend (transactional emails)
- Cloudinary (media storage)
- Arcjet (security)

### Frontend
- React + Vite
- Zustand (state management)
- TailwindCSS (styling)
- Socket.io-client
- React Router
- i18next (internationalization)
- Lucide React (icons)

## Deployment on Railway

### Prerequisites
1. Create a [Railway](https://railway.app) account
2. Have a MongoDB database ready (MongoDB Atlas or Railway MongoDB)
3. Prepare your environment variables

### Backend Deployment

1. **Create a new project on Railway**
2. **Deploy from GitHub**:
   - Connect your GitHub repository
   - Set the root directory to `backend`
3. **Add environment variables**:
   ```env
   PORT=3000
   NODE_ENV=production
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secure_jwt_secret
   
   # Email (Nodemailer)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_gmail_app_password
   
   # Email (Resend - optional)
   RESEND_API_KEY=your_resend_api_key
   EMAIL_FROM=noreply@yourdomain.com
   EMAIL_FROM_NAME=NIDS Chat
   
   # Client URL (will be your frontend Railway URL)
   CLIENT_URL=https://your-frontend.up.railway.app
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   
   # Arcjet Security
   ARCJET_KEY=your_arcjet_key
   ARCJET_ENV=production
   
   # AI API
   AIMLAPI_API_KEY=your_aimlapi_key
   ```
4. **Deploy**: Railway will automatically detect Node.js and deploy

### Frontend Deployment

1. **Create another service in the same Railway project**
2. **Deploy from GitHub**:
   - Connect your GitHub repository
   - Set the root directory to `frontend`
3. **Add environment variables**:
   ```env
   VITE_API_URL=https://your-backend.up.railway.app
   ```
4. **Build settings**:
   - Build command: `npm install && npm run build`
   - Start command: `npm run preview`
   - Or use a static hosting service like Railway Static or Vercel for the frontend

### Post-Deployment

1. **Update CLIENT_URL**: After frontend is deployed, update the backend's `CLIENT_URL` environment variable with the actual frontend URL
2. **Update API URL**: Ensure frontend is pointing to the correct backend URL
3. **Test**: Verify all features work:
   - User signup & email verification
   - Login
   - Real-time messaging
   - File uploads
   - Video/audio calls
   - AI chat

## Local Development

### Backend
```bash
cd backend
npm install
# Create .env file with your variables
npm run dev
```

### Frontend
```bash
cd frontend
npm install
# Create .env file with VITE_API_URL
npm run dev
```

## Environment Variables Guide

### Required for Basic Functionality
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `CLIENT_URL`: Frontend URL for CORS

### Required for Email Features
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`: Gmail SMTP for verification emails

### Required for Media Uploads
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Cloudinary credentials

### Optional Features
- `RESEND_API_KEY`: Alternative email service
- `ARCJET_KEY`: Security and rate limiting
- `AIMLAPI_API_KEY`: AI chat functionality

## Support

For issues or questions, please create an issue in the GitHub repository.

## License

MIT
