import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import xss from 'xss-clean';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { connectMySQL } from './config/mysqlDb.js';
import { errorHandler } from './middleware/errorHandler.js';
import { setupSocketIO } from './config/socket.js';
import { setupCronJobs } from './services/cronService.js';

// Routes
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import studentRoutes from './routes/student.js';
import facultyRoutes from './routes/faculty.js';
import hodRoutes from './routes/hod.js';
import advisorRoutes from './routes/advisor.js';
import parentRoutes from './routes/parent.js';
import attendanceRoutes from './routes/attendance.js';
import leaveRoutes from './routes/leave.js';
import notificationRoutes from './routes/notification.js';
import chatRoutes from './routes/chat.js';
import reportRoutes from './routes/report.js';
import aiRoutes from './routes/ai.js';
import dashboardRoutes from './routes/dashboard.js';
import settingsRoutes from './routes/settings.js';
import examRoutes from './routes/exam.js';
import smsAdminRoutes from './routes/smsAdminRoutes.js';
dotenv.config();

const app = express();
const httpServer = http.createServer(app);

// CORS & Origin Resolver
const getAllowedOrigins = () => {
  const envOrigins = (process.env.CLIENT_URL || '')
    .split(',')
    .map((url) => url.trim().replace(/\/+$/, ''))
    .filter(Boolean);
  return ['http://localhost:5173', 'http://localhost:3000', ...envOrigins];
};

const isAllowedOrigin = (origin) => {
  // Allow requests with no origin (e.g. mobile apps, curl, Postman, health check)
  if (!origin) return true;

  // Allow local development origins
  if (
    origin.startsWith('http://localhost:') ||
    origin.startsWith('http://127.0.0.1:') ||
    origin.startsWith('http://192.168.')
  ) {
    return true;
  }

  // Allow any Netlify domain (production or preview branch: *.netlify.app)
  if (/^https:\/\/[a-zA-Z0-9-_.]+\.netlify\.app$/.test(origin)) {
    return true;
  }

  const allowed = getAllowedOrigins();
  return allowed.includes(origin.replace(/\/+$/, ''));
};

// Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed for Socket.IO origin: ' + origin));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io accessible globally
app.set('io', io);
setupSocketIO(io);

// Security Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(xss());
app.use(hpp());
app.use(compression());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10000,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Auth rate limiter (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000, // Increased for easier testing
  message: { success: false, message: 'Too many login attempts, please try again later.' },
});

// CORS
app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy blocked access from origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// Logger
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Root Status & Health check endpoints
app.get('/', (req, res) => {
  res.json({
    name: 'SmartERP Attendance API',
    status: 'Running',
    version: '1.0.0',
    health: '/health',
    api: '/api/v1',
  });
});

app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString(), version: '1.0.0' }));

// API Routes
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/student', studentRoutes);
app.use('/api/v1/faculty', facultyRoutes);
app.use('/api/v1/hod', hodRoutes);
app.use('/api/v1/advisor', advisorRoutes);
app.use('/api/v1/parent', parentRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/leave', leaveRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/exam', examRoutes);
app.use('/api/v1/admin/sms', smsAdminRoutes);
// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await connectMySQL();
    setupCronJobs(io);
    httpServer.listen(PORT, () => {
      console.log(`\n🚀 SmartERP Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🌐 Client URL: ${process.env.CLIENT_URL}`);
      console.log(`📡 Socket.IO ready\n`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();

export { io };
