import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import routes from './routes/routes.js';
import { notFound, errorHandler } from './middleware/error.js';

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure DB is connected on incoming requests (works for both standalone & Vercel serverless)
app.use(async (req, res, next) => {
  // Let health/info endpoints reply immediately even if DB is connecting
  if (
    req.path === '/' ||
    req.path === '/api' ||
    req.path === '/health' ||
    req.path === '/api/health'
  ) {
    return next();
  }
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error(`DB connection failed on ${req.method} ${req.originalUrl}:`, err.message);
    res.status(503).json({
      error: 'Database Connection Error',
      message: err.message || 'Database connection failed. Please check MONGODB_URI in Vercel environment variables.',
    });
  }
});

// Robust CORS: Allow any origin (including frontend deployed separately on Vercel, localhost, etc.)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow any requesting origin
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);
app.options('*', cors());

app.use(express.json());
app.use(morgan('dev'));

// Static uploads directory (supports both /uploads and /api/uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Health & Info endpoints
const apiInfo = (req, res) => {
  res.json({
    message: '🌾 Welcome to AgriConnect API',
    status: 'online',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      products: '/api/products',
      equipment: '/api/equipment',
      orders: '/api/orders',
      rentals: '/api/rentals',
      posts: '/api/posts',
      fertilizers: '/api/fertilizers',
      schemes: '/api/schemes',
      chat: '/api/chat',
      admin: '/api/admin',
      'agri-doctors': '/api/agri-doctors',
    },
    timestamp: new Date().toISOString(),
  });
};

app.get('/', apiInfo);
app.get('/api', apiInfo);
app.get('/health', (req, res) => res.json({ status: 'ok', message: 'AgriConnect API is running smoothly' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'AgriConnect API is running smoothly' }));

// Main API routes
// Mounted under BOTH /api and / so endpoints ALWAYS work whether the client includes /api or not
app.use('/api', routes);
app.use('/', routes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Listen when run as a standalone server (not on Vercel serverless)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🌾 API running on port ${PORT}`));
}

export default app;
