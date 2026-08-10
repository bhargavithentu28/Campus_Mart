import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Import REST Routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import collegeRoutes from './routes/collegeRoutes';
import departmentRoutes from './routes/departmentRoutes';
import categoryRoutes from './routes/categoryRoutes';
import productRoutes from './routes/productRoutes';
import wishlistRoutes from './routes/wishlistRoutes';
import reviewRoutes from './routes/reviewRoutes';
import reportRoutes from './routes/reportRoutes';
import notificationRoutes from './routes/notificationRoutes';
import searchRoutes from './routes/searchRoutes';
import uploadRoutes from './routes/uploadRoutes';
import chatRoutes from './routes/chatRoutes';
import adminRoutes from './routes/adminRoutes';

import { validateEnv } from './config/env';

dotenv.config();
validateEnv();

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const PORT = process.env.PORT || 5000;

const io = new Server(server, {
  cors: {
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Security & Global Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// REST API v1 Core Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/colleges', collegeRoutes);
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/chats', chatRoutes);
app.use('/api/v1/admin', adminRoutes);

// Health Checks
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'CampusMart REST API v1 Core Services',
    timestamp: new Date()
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'CampusMart REST API v1 Core Services',
    timestamp: new Date()
  });
});

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'CampusMart REST API v1 Core Services',
    timestamp: new Date()
  });
});

// Socket.io Real-time Gateway
const onlineUsers = new Map<string, string>(); // userId -> socketId

io.on('connection', (socket: Socket) => {
  console.log(`📡 Socket connected: ${socket.id}`);

  socket.on('register_user', (userId: string) => {
    if (userId) {
      onlineUsers.set(userId, socket.id);
      console.log(`👤 Student ${userId} registered online.`);
      io.emit('online_users_list', Array.from(onlineUsers.keys()));
    }
  });

  socket.on('join_chat', (chatId: string) => {
    socket.join(chatId);
    console.log(`💬 Socket ${socket.id} joined room: ${chatId}`);
  });

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
    socket.to(data.chatId).emit('message_received', data);
  });

  socket.on('typing', (data: { chatId: string; userId: string; isTyping: boolean }) => {
    socket.to(data.chatId).emit('typing_status', data);
  });

  socket.on('read_messages', (data: { chatId: string; userId: string }) => {
    socket.to(data.chatId).emit('messages_read', data);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
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

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server
async function startServer() {
  const portNumber = Number(PORT) || 5000;
  server.listen(portNumber, '0.0.0.0', () => {
    console.log('\x1b[35m%s\x1b[0m', `🚀 ==========================================`);
    console.log('\x1b[35m%s\x1b[0m', `🚀 CAMPUSMART API SERVER RUNNING ON PORT ${portNumber} (0.0.0.0)`);
    console.log('\x1b[35m%s\x1b[0m', `🚀 CORE SERVICES & REPOSITORIES ACTIVE`);
    console.log('\x1b[35m%s\x1b[0m', `🚀 ==========================================`);
  });
}

startServer();
