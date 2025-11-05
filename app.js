const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const registrationRoutes = require('./routes/registrationRoutes');
const authRoutes = require('./routes/authRoutes');
const engineerVisitRoutes = require('./routes/engineerVisitRoutes');
const patientRoutes = require('./routes/patientRoutes');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Base route
app.use('/api/registrations', registrationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/engineer-visits', engineerVisitRoutes);
app.use('/api/patients', patientRoutes);

module.exports = app;
