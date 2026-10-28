import mongoose from 'mongoose';

// Cache connection globally for serverless (Vercel) environments to prevent multiple connections
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  // If connection is already open and ready, reuse it immediately
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If a connection attempt is in-flight, await the same promise
  if (!cached.promise) {
    const uri = (process.env.MONGODB_URI || process.env.MONGO_URI || '').trim();
    if (!uri) {
      throw new Error(
        'MongoDB connection string is missing. Please set MONGODB_URI in your Vercel Project Settings > Environment Variables.'
      );
    }

    const opts = {
      bufferCommands: true, // Allow Mongoose to buffer model queries while connecting
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
    };

    mongoose.set('bufferCommands', true);

    cached.promise = mongoose
      .connect(uri, opts)
      .then(async (mongooseInstance) => {
        console.log('MongoDB connected successfully');
        // Ensure admin account exists with guaranteed password in DB
        try {
          const bcrypt = (await import('bcryptjs')).default;
          const User = mongoose.models.User || (await import('../models/User.js')).default;
          const adminEmail = (process.env.ADMIN_EMAIL || 'admin@agriconnect.com').toLowerCase().trim();
          const adminPass = process.env.ADMIN_PASSWORD || 'admin@123';
          const hashedPassword = await bcrypt.hash(adminPass, 12);
          await User.findOneAndUpdate(
            { email: adminEmail },
            {
              $set: {
                password: hashedPassword,
                role: 'admin',
                name: 'Platform Administrator',
                location: 'Chennai'
              }
            },
            { upsert: true, new: true }
          );
          console.log(`🛡️ Admin guaranteed in DB: ${adminEmail}`);
        } catch (adminErr) {
          console.warn('Admin ensure note:', adminErr.message);
        }
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null;
        console.error('MongoDB connection error:', err.message);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
};
