const { Sequelize } = require('sequelize');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pgEnabled = !!connectionString;
if (!connectionString) {
  console.warn('Warning: DATABASE_URL is not set. PostgreSQL will not connect.');
}

let sequelize = null;
if (pgEnabled) {
  sequelize = new Sequelize(connectionString, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    dialectOptions: {
      // Render.com requires SSL but with rejectUnauthorized false
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    },
    define: {
      underscored: false,
      freezeTableName: false
    }
  });
}

async function testConnection() {
  if (!pgEnabled) {
    console.log('Postgres disabled: skipping testConnection (DATABASE_URL not set)');
    return;
  }

  try {
    await sequelize.authenticate();
    console.log('Postgres connection has been established successfully.');
  } catch (err) {
    console.error('Unable to connect to Postgres:', err.message);
    throw err;
  }
}

module.exports = { sequelize, testConnection, pgEnabled };
