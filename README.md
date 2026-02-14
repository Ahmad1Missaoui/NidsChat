NIDS Chat

NIDS Chat is a modern, real-time messaging platform designed for secure communication, collaboration, and intelligent interaction.
It combines real-time chat, group collaboration, WebRTC calling, and AI-powered features into a single scalable application.

✨ Overview

NIDS Chat provides a next-generation messaging experience with:

⚡ Real-time communication

🤖 AI-powered assistance

📞 Voice & video calling

<<<<<<< HEAD
## Deployment on Railway (Monorepo)

This project is configured as a **monorepo** - both backend and frontend deploy from the same GitHub repository as separate Railway services.

### 📋 Prerequisites

1. **GitHub Repository**: Push your code to GitHub
2. **Railway Account**: Sign up at [Railway](https://railway.app)
3. **MongoDB Database**: MongoDB Atlas or Railway MongoDB addon
4. **External Services** (optional):
   - Cloudinary account (for image uploads)
   - Gmail App Password (for email verification)
   - Arcjet API key (for security)
   - AIMLAPI key (for AI chat)

### 🚀 Quick Deploy

#### Step 1: Create Railway Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your **NidsChat repository**

#### Step 2: Deploy Backend Service

1. **After connecting GitHub**, Railway creates a service
2. **Configure Backend**:
   - Go to **Settings** tab
   - Find **Service Settings** section
   - Set **Root Directory** to: `backend`
   - Click **Save**

3. **Add Environment Variables**:
   - Go to **Variables** tab
   - Click **"New Variable"** or **"Raw Editor"**
   - Add the following:

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
   CLIENT_URL=https://your-frontend-url.up.railway.app
   
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

4. **Deploy**:
   - Railway will automatically build and deploy
   - Wait for deployment to complete
   - **Copy the Backend URL** (e.g., `https://nidschat-backend-production.up.railway.app`)

#### Step 3: Deploy Frontend Service

1. **In the same Railway project**:
   - Click **"+ New"** button
   - Select **"GitHub Repo"**
   - Choose the **same NidsChat repository**

2. **Configure Frontend**:
   - Go to **Settings** tab
   - Set **Root Directory** to: `frontend`
   - Click **Save**

3. **Add Environment Variable**:
   - Go to **Variables** tab
   - Add:

   ```env
   VITE_API_URL=https://your-backend-url-from-step-2.up.railway.app
   ```

4. **Deploy**:
   - Railway will automatically build and deploy
   - Wait for deployment to complete
   - **Copy the Frontend URL** (e.g., `https://nidschat.up.railway.app`)

#### Step 4: Update Backend CLIENT_URL

1. **Go back to Backend service**
2. **Variables** tab
3. **Update** `CLIENT_URL` with the actual Frontend URL from Step 3
4. **Save** - Railway will redeploy automatically

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

### 📁 Monorepo Configuration

This project includes Railway configuration files:

- **`railway.json`** (root): Global Railway settings
- **`backend/railway.toml`**: Backend-specific build/deploy config
- **`frontend/railway.toml`**: Frontend-specific build/deploy config

These files ensure Railway uses **NIXPACKS** builder and proper commands for each service.

### 🛠️ Troubleshooting

**Problem**: "Could not determine how to build"
- **Solution**: Make sure **Root Directory** is set correctly (`backend` or `frontend`)

**Problem**: Backend can't connect to Frontend (CORS errors)
- **Solution**: Verify `CLIENT_URL` in backend matches the actual frontend URL

**Problem**: Frontend can't reach Backend (Network errors)
- **Solution**: Verify `VITE_API_URL` in frontend matches the actual backend URL

**Problem**: Environment variables not working
- **Solution**: After adding/changing variables, Railway auto-redeploys. Wait for completion.

### 💡 Tips

- Use Railway's **MongoDB addon** for easy database setup
- Enable **PR Deploys** in settings for preview deployments
- Check **Deployment Logs** if build fails
- Both services are in **one project** but billed separately based on usage
=======
👥 Group collaboration

🔒 Secure authentication & protection

Built with modern web technologies and designed for scalability and performance.

🧩 Core Features
🔐 Authentication & Security

Email/password signup with verification

JWT-based authentication

Arcjet protection & rate limiting

💬 Real-Time Messaging
>>>>>>> 1a6bcafe0eb6f73788e0c598248e0cbac1a3bd48

WebSocket-powered instant messaging

Message delivery & read status

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
