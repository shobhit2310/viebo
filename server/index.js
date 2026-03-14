require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const matchRoutes = require('./routes/matches');
const chatRoutes = require('./routes/chat');
const dateRoutes = require('./routes/dates');
const eventFeaturesRoutes = require('./routes/eventFeatures');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/dates', dateRoutes);
app.use('/api/event-features', eventFeaturesRoutes);

// Socket.io for real-time chat
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('register', (userId) => {
    connectedUsers.set(userId, socket.id);
    // Join user-specific room for targeted notifications
    socket.join(`user-${userId}`);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  socket.on('join-chat', (matchId) => {
    socket.join(`chat-${matchId}`);
    console.log(`Socket ${socket.id} joined chat-${matchId}`);
  });

  // Typing indicators
  socket.on('typing-start', ({ matchId, userId, userName }) => {
    socket.to(`chat-${matchId}`).emit('user-typing', { userId, userName, isTyping: true });
  });

  socket.on('typing-stop', ({ matchId, userId }) => {
    socket.to(`chat-${matchId}`).emit('user-typing', { userId, isTyping: false });
  });

  socket.on('send-message', async (data) => {
    const { matchId, message, senderId, senderName, receiverId } = data;
    
    // Emit to chat room
    io.to(`chat-${matchId}`).emit('new-message', {
      matchId,
      message,
      senderId,
      senderName,
      timestamp: new Date().toISOString()
    });

    // Send notification to receiver if they're not in the chat
    if (receiverId) {
      io.to(`user-${receiverId}`).emit('new-message-notification', {
        matchId,
        senderName,
        preview: message.content?.substring(0, 50) || message.substring?.(0, 50) || 'New message'
      });
    }
  });

  socket.on('disconnect', () => {
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
