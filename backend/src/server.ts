import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database.js';
import authRoutes from './routes/auth.routes.js';
import meetingRoutes from './routes/meeting.routes.js';
import adminRoutes from './routes/admin.routes.js';
import externalRoutes from './routes/external.routes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import path from 'path';

// Load environment variables
dotenv.config();

// Fix DNS resolution issues by forcing Google DNS
import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
  console.log('✅ Applied DNS Fix: Forced Google DNS');
} catch (e) {
  console.error('❌ Failed to apply DNS fix:', e);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration - Allow multiple origins for development
const allowedOrigins = [
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://192.168.140.36:8080',
  'http://192.168.92.1:8080',
  'http://192.168.175.1:8080',
  'https://teams.microsoft.com',
  'https://meet.google.com',
  'https://zoom.us',
  'https://app.zoom.us',
  process.env.CORS_ORIGIN,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Allow chrome-extension:// origins (for browser extensions)
      if (origin.startsWith('chrome-extension://')) {
        return callback(null, true);
      }

      // Check if origin is in allowed list or matches localhost pattern
      if (allowedOrigins.includes(origin) || origin.match(/^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+):\d+$/)) {
        callback(null, true);
      } else {
        console.error('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Compression
app.use(compression());

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing
app.use(express.json({ limit: '5gb' }));
app.use(express.urlencoded({ extended: true, limit: '5gb' }));

// Serve uploads statically to allow playback of locally saved files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'MeetingMind API',
    version: '1.0.0',
    status: 'running',
    message: 'Welcome to MeetingMind API',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      meetings: '/api/meetings',
      admin: '/api/admin',
      external: '/api/external',
    },
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/external', externalRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:8080'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

startServer();
