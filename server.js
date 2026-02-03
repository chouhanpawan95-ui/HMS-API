// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const { sequelize, testConnection } = require('./config/pgdb');
const { initPgModels } = require('./models/pg');

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
const doctorOpdScheduleRoutes = require('./routes/doctoropdschedulemasterRoutes');
const doctorOpdScheduleTimeDetailRoutes = require('./routes/doctoropdscheduletimedetailRoutes');
const serviceCategoryMasterRoutes = require('./routes/servicecategorymasterRoutes');
const serviceDepartmentMasterRoutes = require('./routes/servicedepartmentmasterRoutes');
const billDetailRoutes = require('./routes/billdetailRoutes');
const billMasterRoutes = require('./routes/billmasterRoutes');
const partyMasterRoutes = require('./routes/partymasterRoutes');
const packageMasterRoutes = require('./routes/packagemasterRoutes');
const packageDetailRoutes = require('./routes/packagedetailRoutes');
const opdVisitRoutes = require('./routes/opdvisitmasterRoutes');
const receiptMasterRoutes = require('./routes/receiptmasterRoutes');
const receiptAdjustmentDetailRoutes = require('./routes/receiptadjustmentdetailRoutes');
const receiptRefundDetailRoutes = require('./routes/receiptrefunddetailRoutes');
const opdAppointmentRoutes = require('./routes/opdappointmentRoutes');
const opdAppointmentBlockDetailRoutes = require('./routes/opdappointmentblockdetailRoutes');
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
app.use('/api/doctoropdschedulemaster', doctorOpdScheduleRoutes);
app.use('/api/doctoropdscheduletimedetail', doctorOpdScheduleTimeDetailRoutes);
app.use('/api/servicecategorymaster', serviceCategoryMasterRoutes);
app.use('/api/servicedepartmentmaster', serviceDepartmentMasterRoutes);
app.use('/api/billdetails', billDetailRoutes);
app.use('/api/billmasters', billMasterRoutes);
app.use('/api/partymaster', partyMasterRoutes);
app.use('/api/packagemaster', packageMasterRoutes);
app.use('/api/packagedetail', packageDetailRoutes);
app.use('/api/opdvisits', opdVisitRoutes);
app.use('/api/opdappointments', opdAppointmentRoutes);
app.use('/api/opdappointmentblockdetail', opdAppointmentBlockDetailRoutes);
app.use('/api/receiptmasters', receiptMasterRoutes);
app.use('/api/receiptadjustmentdetail', receiptAdjustmentDetailRoutes);
app.use('/api/receiptrefunddetail', receiptRefundDetailRoutes);
app.use('/api/usermasters', require('./routes/usermasterRoutes'));
// Basic Auth Model
const User = require('./models/user');

// Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Start Server
const PORT = process.env.PORT || 5000;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectWithRetry(attempts = 5, initialDelay = 2000) {
  let delay = initialDelay;
  let lastError = null;
  for (let i = 1; i <= attempts; i++) {
    try {
      await testConnection();
      console.log('✅ Postgres connection established.');
      return;
    } catch (err) {
      lastError = err;
      console.error(`Postgres connection attempt ${i}/${attempts} failed:`, err.code || err.message);
      if (i < attempts) {
        console.log(`Retrying in ${delay} ms...`);
        await wait(delay);
        delay *= 2; // exponential backoff
      }
    }
  }
  // All attempts failed
  throw lastError;
}

// Connect to DB and Start Server
(async () => {
  try {
    await connectDB();
    try {

      await connectWithRetry(5, 2000);

      

    } catch (pgErr) {

      console.warn('??  Postgres connection failed, but starting server anyway');

    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Server failed to start due to DB connection error:', err && err.stack ? err.stack : err);
    process.exit(1);
  }
})();
