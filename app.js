const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const registrationRoutes = require('./routes/registrationRoutes');
const authRoutes = require('./routes/authRoutes');
const engineerVisitRoutes = require('./routes/engineerVisitRoutes');
const patientRoutes = require('./routes/patientRoutes');
const billmasterRoutes = require('./routes/billmasterRoutes');

const app = express();

// CORS: allow all origins
app.use(cors({ origin: '*' }));
// Preflight handler
app.options('*', cors());

app.use(bodyParser.json());

// Base route
app.use('/api/registrations', registrationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/engineer-visits', engineerVisitRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/billmasters', billmasterRoutes);

module.exports = app;
