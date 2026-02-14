NIDS Chat

NIDS Chat is a modern, real-time messaging platform designed for secure communication, collaboration, and intelligent interaction.
It combines real-time chat, group collaboration, WebRTC calling, and AI-powered features into a single scalable application.

✨ Overview

NIDS Chat provides a next-generation messaging experience with:

⚡ Real-time communication

🤖 AI-powered assistance

📞 Voice & video calling

👥 Group collaboration

🔒 Secure authentication & protection

Built with modern web technologies and designed for scalability and performance.

## Deployment on Railway (Docker)

This project uses **Docker** for deployment. Both backend and frontend have their own Dockerfiles.

### ⚡ Deployment is now EASIER with Docker!

Railway will automatically detect the Dockerfiles and build your services correctly - no need to configure Root Directory manually!

---

### 📋 Prerequisites

1. **GitHub Repository**: Push your code to GitHub
2. **Railway Account**: Sign up at [Railway](https://railway.app)
3. **MongoDB Database**: MongoDB Atlas or Railway MongoDB addon
4. **External Services** (optional):
   - Cloudinary account (for image uploads)
   - Gmail App Password (for email verification)
   - Arcjet API key (for security)
   - AIMLAPI key (for AI chat)

### 🚀 Deploy Backend

#### Step 1: Create Railway Project & Deploy Backend

1. **Go to Railway Dashboard**: [railway.app/dashboard](https://railway.app/dashboard)
2. **Click "New Project"**
3. **Select "Deploy from GitHub repo"**
4. **Choose your NidsChat repository**

5. **Configure Backend Service**:
   - Railway will create a service automatically
   - Click on the service
   - Go to **Settings** → **Source**
   - Set **Root Directory**: `backend`
   - Go to **Settings** → **Deploy**
   - Railway will **auto-detect Dockerfile** ✅

6. **Add Environment Variables**:
   - Go to **Variables** tab
   - Add all variables (see below)

   ```env
   # Server
   PORT=3000
   NODE_ENV=production
   
   # Database
   MONGO_URI=your_mongodb_atlas_connection_string
   
   # Authentication
   JWT_SECRET=your_super_secure_random_string_here
   
   # Email Verification (Nodemailer)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_gmail_app_password
   
   # Email Service (Resend - Optional)
   RESEND_API_KEY=your_resend_api_key
   EMAIL_FROM=noreply@yourdomain.com
   EMAIL_FROM_NAME=NIDS Chat
   
   # Frontend URL (Update after frontend is deployed)
   CLIENT_URL=http://localhost:3000
   
   # Media Storage
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   
   # Security (Optional)
   ARCJET_KEY=your_arcjet_key
   ARCJET_ENV=production
   
   # AI Chat (Optional)
   AIMLAPI_API_KEY=your_aimlapi_key
   ```

7. **Deploy**:
   - Railway will build the Docker image automatically
   - Wait for deployment to complete (check **Deployments** tab)
   - **Copy the Backend URL** (e.g., `https://nidschat-backend-production.up.railway.app`)

### 🎨 Deploy Frontend

#### Step 2: Add Frontend Service

1. **In the same Railway project**:
   - Click **"+ New"** → **"GitHub Repo"**
   - Select the **same NidsChat repository**

2. **Configure Frontend Service**:
   - Click on the new service
   - Go to **Settings** → **Source**
   - Set **Root Directory**: `frontend`
   - Railway will **auto-detect Dockerfile** ✅

3. **Add Environment Variable**:
   - Go to **Variables** tab
   - Add:

   ```env
   VITE_API_URL=https://your-backend-url-from-step-1.up.railway.app
   ```

4. **Deploy**:
   - Railway builds the Docker image with nginx
   - Wait for deployment to complete
   - **Copy the Frontend URL** (e.g., `https://nidschat.up.railway.app`)

### 🔄 Final Step: Update Backend

1. **Go back to Backend service**
2. **Variables** tab
3. **Update `CLIENT_URL`** with your actual Frontend URL
4. **Save** - Railway will redeploy automatically

---

### ✅ What Docker Does

**Backend Dockerfile**:
- Uses Node.js 20 Alpine (lightweight)
- Installs production dependencies only
- Exposes port 3000
- Includes health check endpoint
- Runs `npm start`

**Frontend Dockerfile**:
- Multi-stage build (smaller image size)
- Stage 1: Builds React app with Vite
- Stage 2: Serves with nginx
- Includes nginx config for SPA routing
- Enables gzip compression
- Caches static assets
- Exposes port 80

### ✅ Verification

Test the following features:
- ✅ User signup with email verification
- ✅ Login/Logout
- ✅ Real-time messaging
- ✅ Image uploads
- ✅ Friend requests
- ✅ Group chats
- ✅ Voice/Video calls
- ✅ AI chat (if configured)

### 🔄 Auto-Deploy on Git Push

Once configured, both services will **automatically redeploy** when you push to GitHub:

```bash
git add .
git commit -m "Update features"
git push origin main
```

Railway detects changes and redeploys the affected service(s).

### 📁 Project Structure

This monorepo includes Docker configuration:

- **`backend/Dockerfile`**: Node.js 20 Alpine with production dependencies
- **`frontend/Dockerfile`**: Multi-stage build with nginx
- **`frontend/nginx.conf`**: SPA routing and optimization
- **`backend/.dockerignore`**: Build optimization for backend
- **`frontend/.dockerignore`**: Build optimization for frontend

Railway automatically detects Dockerfiles when Root Directory is set correctly.

### 🛠️ Troubleshooting

**Problem**: Docker build fails with "npm install" errors
- **Cause**: Missing dependencies or Node version mismatch
- **Solution**: 
  - Verify `package.json` has all dependencies
  - Backend uses Node.js 20 (matches Dockerfile)
  - Check Railway build logs for specific error

**Problem**: Backend health check fails
- **Cause**: `/health` endpoint not responding or wrong PORT
- **Solution**: 
  - Verify backend exposes `/health` endpoint
  - Set `PORT=3000` in Railway environment variables
  - Check backend logs for startup errors

**Problem**: Frontend shows blank page after deployment
- **Cause**: Incorrect `VITE_API_URL` or build errors
- **Solution**: 
  - Verify `VITE_API_URL` matches actual backend URL (include https://)
  - Check browser console for errors
  - Verify nginx is serving index.html correctly

**Problem**: Backend can't connect to Frontend (CORS errors)
- **Solution**: Verify `CLIENT_URL` in backend matches the actual frontend URL (no trailing slash)

**Problem**: Frontend can't reach Backend (Network errors)
- **Solution**: Verify `VITE_API_URL` in frontend matches the actual backend URL (include https://)

**Problem**: Environment variables not working
- **Solution**: 
  - Frontend: `VITE_` prefix is required for all environment variables
  - Backend: Railway auto-redeploys after variable changes
  - Wait for deployment to complete

**Problem**: Docker image too large or build timeout
- **Cause**: Extra files being copied
- **Solution**: 
  - Verify `.dockerignore` excludes `node_modules`, `.env`, logs
  - Backend uses `--production` flag for npm install
  - Frontend multi-stage build removes dev dependencies

**Problem**: nginx 404 errors on page refresh
- **Cause**: SPA routing not configured
- **Solution**: 
  - Verify `frontend/nginx.conf` is being copied in Dockerfile
  - Check nginx config has `try_files $uri $uri/ /index.html`
  - Railway should show nginx serving from port 80

### 💡 Tips

- **Root Directory**: Railway auto-detects Dockerfile when set to `backend` or `frontend`
- **Auto-Deploy**: Push to GitHub triggers automatic rebuild and redeploy
- **Logs**: Check Railway deployment logs for build errors, runtime logs for app errors
- **MongoDB**: Use Railway's MongoDB addon or MongoDB Atlas
- **Environment**: Set all `VITE_*` variables BEFORE building frontend (build-time variables)
- **Health Checks**: Backend Dockerfile includes health check on `/health` endpoint
- **Image Size**: Frontend multi-stage build = smaller image = faster deploys
- Both services in **one project** but billed separately based on usage

---

## 🧩 Core Features

### 🔐 Authentication & Security

- Email/password signup with verification
- JWT-based authentication
- Arcjet protection & rate limiting

### 💬 Real-Time Messaging

- WebSocket-powered instant messaging
- Message delivery & read status

Emoji reactions & attachments

Typing indicators

👥 Group Conversations

Create & manage groups

Group member roles & permissions

Real-time group updates

📞 Voice & Video Calls

WebRTC peer-to-peer calls

Audio & video communication

Real-time call signaling via Socket.io

🤖 AI Assistant

AI chat assistant integration

Smart message assistance

Future-ready for summarization & smart replies

🖼️ Media & File Sharing

Image and file uploads

Cloud storage via Cloudinary

Secure file handling

🌍 Internationalization

Multi-language support using i18next

🛠️ Tech Stack
Backend

Node.js + Express

MongoDB + Mongoose

Socket.io (real-time communication)

JWT (authentication)

Nodemailer & Resen (emails)

Cloudinary (media storage)

Arcjet (security & rate limiting)

Frontend

React + Vite

Zustand (state management)

TailwindCSS (modern UI styling)

Socket.io-client

React Router

i18next (internationalization)

Lucide React (icons)

🏗️ System Architecture
Client (React)
     │
     ▼
Socket.io  ←→  Express API
     │
     ▼
MongoDB Database
     │
     ├── Cloudinary (Media Storage)
     ├── Email Services
     └── AI Services


💻 Local Development   
  Backend:
      cd backend
      npm install
      npm run dev



  Frontend:
     cd frontend
     npm install
     npm run dev

⚙️ Environment Variables
         PORT=3000
         MONGO_URI=your_mongodb_connection_string
         JWT_SECRET=your_secret_key
         CLIENT_URL=http://localhost:5173
         
         SMTP_HOST=smtp.gmail.com
         SMTP_PORT=587
         SMTP_USER=your_email
         SMTP_PASS=your_app_password
         
         RESEND_API_KEY=your_resend_key
         
         CLOUDINARY_CLOUD_NAME=your_name
         CLOUDINARY_API_KEY=your_key
         CLOUDINARY_API_SECRET=your_secret
         
         ARCJET_KEY=your_arcjet_key
         AIMLAPI_API_KEY=your_ai_key



🔒 Security Considerations

      JWT authentication & protected routes
      
      Rate limiting & Arcjet protection
      
      File upload validation
      
      Environment variable protection
      
      Secure API endpoints



🧠 Future Enhancements
      AI conversation summarization
      
      Smart reply suggestions
      
      End-to-End Encryption (E2EE)
      
      Push notifications
      
      Mobile application
      
      AI moderation for groups

🤝 Contributing

      Contributions are welcome!
      
      Fork the repository
      
      Create a feature branch
      
      Commit your changes
      
      Submit a Pull Request


👨‍💻 Author   =  > Ahmed Missaoui

⭐ Why NIDS Chat?
    NIDS Chat is more than a messaging app — it is a modern communication platform combining real-time technologies, AI intelligence, and scalable architecture.
