// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

// Middleware
const allowedOrigins = [
  "http://localhost:3000",
  "https://hms-front-0mb7.onrender.com"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));


// Generic preflight handler
//app.options('*', cors());

app.use(express.json({ limit: '5mb' }));

// MongoDB Connection
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

// Route Imports
const registrationRoutes = require('./routes/registrationRoutes');
const patientRoutes = require('./routes/patientRoutes');
const authRoutes = require('./routes/authRoutes');
const engineerVisitRoutes = require('./routes/engineerVisitRoutes');
const countryRoutes=require('./routes/countryRoutes');
const stateRoutes = require('./routes/stateRoutes');
const cityRoutes = require('./routes/cityRoutes');
const districtRoutes = require('./routes/districtRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const rateListMasterRoutes = require('./routes/ratelistmasterRoutes');
const rateListDetailRoutes = require('./routes/ratelistdetailRoutes');
const serviceCategoryMasterRoutes = require('./routes/servicecategorymasterRoutes');
const serviceDepartmentMasterRoutes = require('./routes/servicedepartmentmasterRoutes');
// Mount Routes
app.use('/api/registrations', registrationRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/engineer-visits', engineerVisitRoutes);
app.use('/api/country',countryRoutes);
app.use('/api/state', stateRoutes);
app.use('/api/city', cityRoutes);
app.use('/api/district', districtRoutes);
app.use('/api/service', serviceRoutes);
app.use('/api/ratelistmaster', rateListMasterRoutes);
app.use('/api/ratelistdetail', rateListDetailRoutes);
app.use('/api/servicecategorymaster', serviceCategoryMasterRoutes);
app.use('/api/servicedepartmentmaster', serviceDepartmentMasterRoutes);
// Basic Auth Model
const User = require('./models/user');

// Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Start Server
const PORT = process.env.PORT || 5000;

// Connect to DB and Start Server
(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Server failed to start due to DB connection error.');
    process.exit(1);
  }
})();