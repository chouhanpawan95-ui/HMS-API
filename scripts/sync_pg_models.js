require('dotenv').config();
const { sequelize, pgEnabled } = require('../config/pgdb');
const { initPgModels } = require('../models/pg');

(async () => {
  try {
    if (!pgEnabled) {
      console.error('Postgres not enabled (DATABASE_URL missing). Aborting sync.');
      process.exit(1);
    }

    await sequelize.authenticate();
    console.log('Connected to Postgres, running model sync (alter)...');

    // Use alter so existing data is preserved where possible
    await sequelize.sync({ alter: true });

    // Also run any init hooks from models/pg
    await initPgModels();

    console.log('Model sync completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Model sync failed:', err.message || err);
    process.exit(1);
  }
})();