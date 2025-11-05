const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load .env (safe to call multiple times)
dotenv.config();

/**
 * Connect to MongoDB using MONGO_URI from env.
 * Throws on failure so callers can decide how to handle a failed connection.
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    const err = new Error('MONGO_URI is not set in environment. Set MONGO_URI to your MongoDB connection string or start local MongoDB.');
    // attach a helpful property for programmatic checks
    err.code = 'MISSING_MONGO_URI';
    throw err;
  }

  // Mask credentials for logging
  const masked = uri.replace(/(mongodb(?:\+srv)?:\/\/)([^:@\/]+)(:[^@\/]+)?@/, '$1****:****@');

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB connected (${masked})`);
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message || error);
    // Re-throw to allow the app to handle process lifecycle (exit, retry, etc.)
    throw error;
  }
};

module.exports = connectDB;
