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

// Ensure DB is connected on every request (works for both standalone & Vercel serverless)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB connection failed:', err.message);
    res.status(503).json({ message: 'Database connection failed. Please try again.' });
  }
});

// CORS — allow all Vercel preview URLs, localhost, and the configured CLIENT_URL
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed =
        !origin ||
        !process.env.CLIENT_URL ||
        process.env.CLIENT_URL === '*' ||
        origin.includes('vercel.app') ||
        origin.includes('localhost') ||
        origin === process.env.CLIENT_URL;
      callback(null, allowed ? true : new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan('dev'));

// Serve locally uploaded files (fallback when Cloudinary is not configured)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Health & Root ────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
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
});

app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', message: 'AgriConnect API is running smoothly' })
);

// ─── Main API Routes (only under /api prefix) ─────────────────────────────────
app.use('/api', routes);

// ─── Error Handlers ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// Listen when running as standalone server (not on Vercel)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🌾 AgriConnect API running on port ${PORT}`));
}

export default app;
