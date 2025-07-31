import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import chatRoutes from './routes/chat.js';
import githubRoutes from './routes/github.js';
import healthRoutes from './routes/health.js';
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
// Railway provides PORT dynamically
const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api', rateLimiter);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Claude Codespace Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      chat: '/api/chat',
      github: '/api/github/*'
    },
    documentation: 'This is the backend API for Claude Codespace. Frontend should be deployed separately.'
  });
});

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/health', healthRoutes);

// Error handling
app.use(errorHandler);

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});