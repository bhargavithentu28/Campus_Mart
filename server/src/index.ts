import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, isMockDB } from './config/db';

// Import Routes
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import chatRoutes from './routes/chatRoutes';
import adminRoutes from './routes/adminRoutes';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // For development, allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    database: isMockDB ? 'MOCK_IN_MEMORY' : 'MONGODB_CONNECTED',
    timestamp: new Date()
  });
});

// Socket.io Real-time Gateway
const onlineUsers = new Map<string, string>(); // userId -> socketId

io.on('connection', (socket: Socket) => {
  console.log(`📡 Socket connected: ${socket.id}`);

  // Register online status
  socket.on('register_user', (userId: string) => {
    if (userId) {
      onlineUsers.set(userId, socket.id);
      console.log(`👤 Student ${userId} registered online.`);
      io.emit('online_users_list', Array.from(onlineUsers.keys()));
    }
  });

  // Join a Chat Room
  socket.on('join_chat', (chatId: string) => {
    socket.join(chatId);
    console.log(`💬 Socket ${socket.id} joined room: ${chatId}`);
  });

  // Real-time Chat message forwarding
  socket.on('send_message', (data: {
    chatId: string;
    senderId: string;
    text: string;
    image?: string;
    file?: string;
    createdAt?: string;
    _id?: string;
  }) => {
    console.log(`✉️ Message in ${data.chatId} from ${data.senderId}`);
    
    // Broadcast message to everyone in the room (including sender to sync screens if needed, or other client only)
    socket.to(data.chatId).emit('message_received', data);
    
    // Send separate push alert/notification to recipient if offline
    // In mock, we log or emit system event
  });

  // Typing Indicator
  socket.on('typing', (data: { chatId: string; userId: string; isTyping: boolean }) => {
    socket.to(data.chatId).emit('typing_status', data);
  });

  // Mark Messages as Seen
  socket.on('read_messages', (data: { chatId: string; userId: string }) => {
    socket.to(data.chatId).emit('messages_read', data);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
    
    // Find and remove user from online list
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`👤 Student ${userId} marked offline.`);
        break;
      }
    }
    io.emit('online_users_list', Array.from(onlineUsers.keys()));
  });
});

// Connect Database and Start Server
async function startServer() {
  await connectDB();
  
  server.listen(PORT, () => {
    console.log('\x1b[35m%s\x1b[0m', `🚀 ==========================================`);
    console.log('\x1b[35m%s\x1b[0m', `🚀 CAMPUSMART BACKEND SERVER RUNNING ON PORT ${PORT}`);
    console.log('\x1b[35m%s\x1b[0m', `🚀 MODE: ${isMockDB ? 'MOCK SYSTEM' : 'MONGODB ATLAS'}`);
    console.log('\x1b[35m%s\x1b[0m', `🚀 ==========================================`);
  });
}

startServer();
