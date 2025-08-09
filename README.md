# WhatsApp Clone - Modern Real-time Messaging App

A production-ready, full-stack WhatsApp clone built with cutting-edge technologies. Experience authentic WhatsApp-like messaging with modern React hooks, real-time Socket.IO communication, and a pixel-perfect UI that rivals the original WhatsApp Web.

## ✨ Key Highlights

- 🚀 **Built with React 19** - Latest React features with modern hooks and functional components
- ⚡ **Vite 7.x** - Lightning-fast development and optimized production builds
- 🎨 **TailwindCSS 4.x** - Authentic WhatsApp UI with custom color palette and responsive design
- 🔄 **Real-time Socket.IO** - Instant messaging with WebSocket connections
- 📱 **Mobile-First Design** - Fully responsive interface that works perfectly on all devices
- 🔐 **Secure Authentication** - JWT-based auth with bcryptjs password hashing
- 🗄️ **MongoDB Integration** - Robust data persistence with Mongoose ODM
- 🎯 **Modern Architecture** - ES6 modules, async/await, and clean code patterns

## 🚀 Features

### 💬 Core Messaging
- **Real-time messaging** with instant delivery and Socket.IO integration
- **Message status indicators** - Sent, delivered, read status with authentic WhatsApp checkmarks
- **Typing indicators** - See when someone is typing in real-time
- **User presence** - Online/offline status with last seen timestamps
- **Conversation threads** - Organized chat history with proper message threading
- **Message search** - Find messages quickly with real-time search functionality
- **Message reactions** - Emoji reactions and interaction features

### 🎨 User Interface & Experience
- **Authentic WhatsApp Design** - Pixel-perfect recreation of WhatsApp Web interface
- **Dark & Light Themes** - Beautiful themes with smooth transitions
- **Responsive Layout** - Seamless experience across desktop, tablet, and mobile
- **Smooth Animations** - Framer Motion powered transitions and micro-interactions
- **Emoji Picker** - Comprehensive emoji support with picker integration
- **Message Bubbles** - Authentic chat bubble design with proper alignment
- **Profile Management** - User profiles with avatar upload and status messages

### 🔧 Advanced Features
- **Multiple Message Selection** - Bulk operations for deleting and forwarding messages
- **Message Forwarding** - Share messages between conversations
- **Reply to Messages** - Contextual message replies with threading
- **File Attachments** - Support for images, documents, and media files
- **Keyboard Shortcuts** - Power user features with hotkey support
- **Message Drafts** - Auto-save message drafts across sessions
- **Contact Search** - Find and connect with users efficiently

### 🛠️ Developer Features
- **Custom React Hooks** - `useSocket`, `useAuth`, `useAPI`, `useNavigation` hooks
- **Context API State Management** - Clean state management with React Context
- **Error Boundaries** - Robust error handling and fallback UI components
- **API Service Layer** - Organized service modules for different functionalities
- **Real-time Events** - Socket.IO event handling with proper cleanup
- **Optimized Performance** - Lazy loading, memoization, and efficient re-renders

## 📁 Project Architecture

```
whatsapp-clone/
├── backend/                     # Node.js Express Server
│   ├── models/                  # MongoDB Data Models
│   │   ├── User.js             # User profiles and authentication
│   │   ├── Message.js          # Message schema with all types
│   │   ├── Conversation.js     # Chat conversation management
│   │   ├── MessageStatus.js    # Message delivery tracking
│   │   └── WebhookPayload.js   # External webhook handling
│   ├── routes/                  # API Route Handlers
│   │   ├── auth.js             # Authentication endpoints
│   │   ├── users.js            # User management APIs
│   │   ├── messages.js         # Messaging functionality
│   │   └── webhooks.js         # External integrations
│   ├── middleware/              # Express Middleware
│   │   └── auth.js             # JWT authentication middleware
│   ├── utils/                   # Utility Functions
│   │   └── webhookProcessor.js # Message processing utilities
│   └── server.js               # Main server with Socket.IO setup
├── frontend/                    # React Application
│   ├── src/
│   │   ├── components/         # React Components
│   │   │   ├── ChatArea.jsx    # Main chat interface
│   │   │   ├── Sidebar.jsx     # Conversation sidebar
│   │   │   ├── Message.jsx     # Individual message component
│   │   │   ├── Avatar.jsx      # User avatar component
│   │   │   └── ...            # Additional UI components
│   │   ├── context/            # React Context Providers
│   │   │   ├── AuthContext.jsx # Authentication state management
│   │   │   └── SocketContext.jsx # Socket.IO connection management
│   │   ├── hooks/              # Custom React Hooks
│   │   │   ├── useAPI.js       # API interaction hook
│   │   │   └── useNavigation.js # Navigation utilities
│   │   ├── services/           # API Service Layer
│   │   │   ├── authService.js   # Authentication services
│   │   │   ├── messageService.js # Message operations
│   │   │   ├── userService.js   # User management
│   │   │   └── apiService.js    # Base API client
│   │   ├── pages/              # Page Components
│   │   │   ├── Login.jsx       # Login page
│   │   │   ├── Register.jsx    # Registration page
│   │   │   ├── Chat.jsx        # Main chat page
│   │   │   └── Profile.jsx     # User profile page
│   │   ├── routes/             # React Router Setup
│   │   │   └── AppRoutes.jsx   # Route configuration
│   │   └── utils/              # Frontend Utilities
│   │       ├── helpers.js      # General helper functions
│   │       └── errorHandler.js # Error handling utilities
│   └── public/                 # Static Assets
├── package.json               # Project dependencies
└── README.md                 # This file
```

## 🛠️ Technology Stack

### Backend Technologies
- **Node.js 18+** - Modern JavaScript runtime with ES6 modules
- **Express.js 5.x** - Fast, unopinionated web framework
- **MongoDB** - NoSQL database for flexible data storage
- **Mongoose ODM** - Object document modeling with schema validation
- **Socket.IO 4.8+** - Real-time bidirectional event-based communication
- **JWT (JSON Web Tokens)** - Secure authentication and session management
- **bcryptjs** - Password hashing and security
- **Axios** - HTTP client for external API requests
- **dotenv** - Environment variable management
- **CORS** - Cross-origin resource sharing configuration

### Frontend Technologies
- **React 19** - Latest React with concurrent features and modern hooks
- **Vite 7.x** - Next-generation frontend build tool with HMR
- **TailwindCSS 4.x** - Utility-first CSS framework with custom design system
- **React Router DOM 7.x** - Declarative routing for React applications
- **Socket.IO Client** - Real-time communication client library
- **Framer Motion** - Production-ready motion library for React
- **React Context API** - Built-in state management solution
- **React Icons** - Popular icon libraries as React components
- **Emoji Picker React** - Comprehensive emoji picker component
- **React Hotkeys Hook** - Keyboard shortcut handling
- **date-fns** - Modern JavaScript date utility library
- **clsx** - Conditional className utility
- **Axios** - Promise-based HTTP client

### Development Tools
- **ESLint** - Code linting and style enforcement
- **Nodemon** - Development server with auto-restart
- **React Hot Reload** - Instant feedback during development
- **Environment Variables** - Secure configuration management
- **Git** - Version control system
- **VS Code** - Recommended development environment

### Database & Storage
- **MongoDB Atlas** - Cloud-hosted MongoDB (production ready)
- **MongoDB Compass** - GUI for MongoDB database management
- **Mongoose Schema Validation** - Data integrity and validation
- **Database Indexing** - Optimized query performance
- **GridFS** - File storage for large media files

## 🚦 Getting Started

### Prerequisites
- **Node.js 18+** (Latest LTS recommended) - [Download](https://nodejs.org/)
- **MongoDB** (Local or Atlas) - [Installation Guide](https://docs.mongodb.com/manual/installation/)
- **Git** - [Download](https://git-scm.com/downloads)
- **Code Editor** (VS Code recommended) - [Download](https://code.visualstudio.com/)

### 1. Clone Repository and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/khadar-oothuru/WhatsApp-Clone.git
cd WhatsApp-Clone

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies  
cd ../frontend
npm install
```

### 2. Environment Setup

#### Backend Configuration (backend/.env)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/whatsapp-clone

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key-minimum-32-characters
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development

# Optional: External integrations (leave empty for basic functionality)
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=
WHATSAPP_BUSINESS_ACCOUNT_ID=
```

#### Frontend Configuration (frontend/.env)
```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

# App Information
VITE_APP_NAME=WhatsApp Clone
VITE_APP_VERSION=2.0.0
VITE_APP_DESCRIPTION=Modern WhatsApp Clone with Real-time Messaging

# Development
VITE_DEV_MODE=true
```

### 3. Database Setup

Choose one of the following options:

#### Option A: Local MongoDB
```bash
# Install MongoDB Community Edition
# Windows: Download installer from mongodb.com
# macOS: brew install mongodb/brew/mongodb-community
# Linux: sudo apt-get install mongodb

# Start MongoDB
mongod --dbpath /data/db
```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get connection string and update `MONGODB_URI` in backend/.env

#### Option C: Docker MongoDB
```bash
docker run -d --name mongodb -p 27017:27017 -v mongodb_data:/data/db mongo:latest
```

### 4. Run the Application

#### Development Mode (Recommended)
```bash
# Terminal 1: Start backend server (with hot reload)
cd backend
npm run dev
# ✓ Server running on http://localhost:5000

# Terminal 2: Start frontend dev server
cd frontend  
npm run dev
# ✓ Frontend running on http://localhost:5173
```

#### Production Mode
```bash
# Build frontend
cd frontend
npm run build
npm run preview

# Start backend
cd ../backend
npm start
```

### 5. Access the Application

- **Main App**: http://localhost:5173
- **API Server**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

### 6. Create Your First Account

1. Open http://localhost:5173
2. Click "Register" to create a new account
3. Fill in username, email, and password
4. Login and start chatting!

## 🎯 Custom React Hooks

This application showcases modern React development with custom hooks:

### `useAuth()` Hook
```javascript
// Authentication state management
const { user, login, logout, register, isAuthenticated, loading } = useAuth();
```

### `useSocket()` Hook  
```javascript
// Real-time Socket.IO communication
const { 
  sendMessage, 
  onReceiveMessage, 
  startTyping, 
  stopTyping, 
  isConnected 
} = useSocket();
```

### `useAPI()` Hook
```javascript
// API request management with loading states
const { data, loading, error, request } = useAPI();
```

### `useNavigation()` Hook
```javascript
// Enhanced navigation with state management  
const { navigateToChat, goBack, currentPath } = useNavigation();
```

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration with email/username/password
- `POST /api/auth/login` - User login with credentials  
- `POST /api/auth/logout` - User logout and token invalidation

### User Management
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/profile` - Update user profile information
- `GET /api/users/` - Get all users (excluding current user)
- `GET /api/users/search/:query` - Search users by name/phone/email
- `GET /api/users/phone/:phoneNumber` - Find user by phone number

### Messaging System
- `GET /api/messages/conversations` - Get user conversations with last messages
- `GET /api/messages/:userId` - Get message history with specific user
- `POST /api/messages` - Send new message
- `PUT /api/messages/:messageId` - Update/edit existing message
- `DELETE /api/messages/:messageId` - Delete message
- `GET /api/messages/search` - Search messages with query parameters

### External Integrations
- `POST /api/webhooks/external` - Handle external service webhooks
- `GET /api/webhooks/stats` - Get webhook processing statistics
- `POST /api/webhooks/reprocess/:id` - Reprocess failed webhook

## 🔄 Real-time Socket Events

### Standard Chat Events
- `user-online` - User comes online and joins socket room
- `send-message` - Send message to specific user via Socket.IO
- `receive-message` - Receive new message in real-time
- `typing` / `stop-typing` - Typing indicators
- `users-online` - Get list of currently online users
- `message-read` - Message read confirmation

### Connection Management
- `connect` - Socket connection established
- `disconnect` - Socket disconnection with cleanup
- `reconnect` - Automatic reconnection after connection loss
- `connect_error` - Connection error handling

## 🔧 Database Schema

### User Model
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  profilePicture: String,
  status: String,
  lastSeen: Date,
  isOnline: Boolean,
  wa_id: String,
  phone_number: String,
  profile: {
    name: String
  }
}
```

### Message Model  
```javascript
{
  sender: ObjectId (ref: User),
  recipient: ObjectId (ref: User),
  conversation: ObjectId (ref: Conversation),
  content: String,
  type: String, // text, image, video, audio, document
  mediaUrl: String,
  status: String, // sent, delivered, read, failed
  readAt: Date,
  deliveredAt: Date,
  edited: Boolean
}
```

### Conversation Model
```javascript
{
  participants: [ObjectId] (ref: User),
  lastMessage: ObjectId (ref: Message),
  lastMessageAt: Date,
  isActive: Boolean,
  unreadCount: Map,
  isArchived: Map,
  isPinned: Map,
  isMuted: Map
}
```

## 🧪 Testing & Development

### Run Tests
```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend  
npm test

# Lint code quality
npm run lint
```

### Development Scripts
```bash
# Backend development with hot reload
cd backend
npm run dev

# Frontend development server
cd frontend
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🚀 Deployment

### Vercel Deployment (Recommended)

#### Backend Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy backend (from backend directory)
cd backend
vercel --prod
```

Configure these environment variables in Vercel dashboard:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Secure JWT secret key
- `NODE_ENV=production`

#### Frontend Deployment
```bash
# Update environment variables in frontend/.env
VITE_API_URL=https://your-backend.vercel.app/api
VITE_SOCKET_URL=https://your-backend.vercel.app

# Deploy frontend (from frontend directory)
cd frontend
vercel --prod
```

That's it! Your WhatsApp clone will be live on Vercel with automatic HTTPS and global CDN.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support & Contact

### Get Help
- 📧 **Email**: khadaroothuru@gmail.com
- 🐙 **GitHub Issues**: [Create an issue](https://github.com/khadar-oothuru/WhatsApp-Clone/issues)
- 📖 **Documentation**: Check this README and code comments

### Connect with the Developer
- 🐙 **GitHub**: [@khadar-oothuru](https://github.com/khadar-oothuru)
- 💼 **LinkedIn**: [Connect with me](https://linkedin.com/in/khadar-oothuru)
- 🌐 **Portfolio**: [View my projects](https://khadaroothuru-portfolio.vercel.app/)

---

**Built with ❤️ by [Khadar Oothuru](https://github.com/khadar-oothuru)**

*A modern, production-ready WhatsApp clone showcasing the latest in React, Node.js, and real-time web technologies.*
