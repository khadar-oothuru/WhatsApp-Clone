import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import messageRoutes from './routes/messages.js';
import { authenticateToken } from './middleware/auth.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());


app.get('/', (req, res) => {
  res.send('Welcome to the WhatsApp Clone API');
});
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/messages', authenticateToken, messageRoutes);

// Socket.io connection handling
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Handle user joining
  socket.on('user-online', (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.userId = userId;
    
    // Broadcast online status
    io.emit('users-online', Array.from(onlineUsers.keys()));
  });

  // Handle sending messages
  socket.on('send-message', async (data) => {
    const { recipientId, message } = data;
    const recipientSocketId = onlineUsers.get(recipientId);
    
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('receive-message', {
        senderId: socket.userId,
        message,
        timestamp: new Date()
      });
    }
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    const { recipientId } = data;
    const recipientSocketId = onlineUsers.get(recipientId);
    
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('user-typing', {
        userId: socket.userId
      });
    }
  });

  socket.on('stop-typing', (data) => {
    const { recipientId } = data;
    const recipientSocketId = onlineUsers.get(recipientId);
    
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('user-stop-typing', {
        userId: socket.userId
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit('users-online', Array.from(onlineUsers.keys()));
    }
    console.log('Client disconnected:', socket.id);
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Start server
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Frontend should run on http://localhost:5173`);
      console.log(`Backend API running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
    console.error('Please make sure MongoDB is running or update MONGODB_URI in .env file');
    console.error('You can:');
    console.error('1. Install and start MongoDB locally');
    console.error('2. Use MongoDB Atlas (cloud database)');
    console.error('3. Use Docker: docker run -d -p 27017:27017 --name mongodb mongo');
    process.exit(1);
  });

export { io };
