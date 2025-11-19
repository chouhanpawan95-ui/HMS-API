// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

/* --------------------------------------------
   CORS MIDDLEWARE (SAFE)
--------------------------------------------- */
app.use(cors({
  origin: '*'
}));

// ❌ REMOVE THIS — it crashes Render
// app.options('*', cors());

/* --------------------------------------------
   BODY PARSER
--------------------------------------------- */
app.use(express.json({ limit: '5mb' }));

/* --------------------------------------------
   MONGODB CONNECTION
--------------------------------------------- */
const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hmsdb';
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

/* --------------------------------------------
   ROUTES IMPORT
--------------------------------------------- */
const registrationRoutes = require('./routes/registrationRoutes');
const patientRoutes = require('./routes/patientRoutes');
const authRoutes = require('./routes/authRoutes');
const engineerVisitRoutes = require('./routes/engineerVisitRoutes');

/* --------------------------------------------
   ROUTE MOUNT
--------------------------------------------- */
app.use('/api/registrations', registrationRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/engineer-visits', engineerVisitRoutes);

/* --------------------------------------------
   ERROR HANDLER
--------------------------------------------- */
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

/* --------------------------------------------
   START SERVER
--------------------------------------------- */
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error('Server failed to start due to DB connection error.');
    process.exit(1);
  }
})();
