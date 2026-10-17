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

// Attempt initial DB connection
connectDB().catch((err) => {
  console.error('Initial MongoDB connection error:', err.message);
});

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure DB connection for serverless/cold-start invocations
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// CORS configured to work with local dev and Vercel domains
app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        !process.env.CLIENT_URL ||
        process.env.CLIENT_URL === '*' ||
        origin.includes('vercel.app') ||
        origin.includes('localhost') ||
        origin === process.env.CLIENT_URL
      ) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan('dev'));

// Static uploads directory (for backwards compatibility with existing local uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Main API routes
app.use('/api', routes);

// Health check and root endpoints
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
      admin: '/api/admin'
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', message: 'AgriConnect API is running smoothly' })
);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Listen when run as a standalone server (not on Vercel serverless)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`API running on port ${PORT}`));
}

export default app;
