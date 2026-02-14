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

🧩 Core Features
🔐 Authentication & Security

Email/password signup with verification

JWT-based authentication

Arcjet protection & rate limiting

💬 Real-Time Messaging

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
