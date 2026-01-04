const { pgEnabled } = require('../../config/pgdb');

// If Postgres was explicitly requested but not configured, fail early with a helpful message.
const requestedPg = process.env.DB_MODE === 'pg' || process.env.USE_PG === 'true';
if (requestedPg && !pgEnabled) {
  throw new Error("DB_MODE is set to 'pg' (or USE_PG=true) but DATABASE_URL is not set. Please configure DATABASE_URL in .env or change DB_MODE to 'mongo'.");
}

let BillMaster = null;
let BillDetail = null;
let ReceiptMaster = null;
let ReceiptAdjustmentDetail = null;
let ReceiptRefundDetail = null;
let sequelize = null;

if (pgEnabled) {
  BillMaster = require('./BillMaster');
  BillDetail = require('./BillDetail');
  ReceiptMaster = require('./ReceiptMaster');
  ReceiptAdjustmentDetail = require('./ReceiptAdjustmentDetail');
  ReceiptRefundDetail = require('./ReceiptRefundDetail');
  sequelize = require('../../config/pgdb').sequelize;

  // Associations
  BillMaster.hasMany(BillDetail, { foreignKey: 'FK_BillId', sourceKey: 'billId' });
  BillDetail.belongsTo(BillMaster, { foreignKey: 'FK_BillId', targetKey: 'billId' });

  // Receipt associations
  ReceiptMaster.hasMany(ReceiptAdjustmentDetail, { foreignKey: 'fkReceiptId', sourceKey: 'receiptId' });
  ReceiptAdjustmentDetail.belongsTo(ReceiptMaster, { foreignKey: 'fkReceiptId', targetKey: 'receiptId' });

  ReceiptMaster.hasMany(ReceiptRefundDetail, { foreignKey: 'fkReceiptId', sourceKey: 'receiptId' });
  ReceiptRefundDetail.belongsTo(ReceiptMaster, { foreignKey: 'fkReceiptId', targetKey: 'receiptId' });
}

async function initPgModels() {
  if (!pgEnabled) {
    console.log('Postgres disabled: skipping model initialization');
    return;
  }

  if (process.env.DB_SYNC === 'true') {
    // Use with caution in production
    await sequelize.sync({ alter: true });
    console.log('Postgres models synced');
  }
}

module.exports = {
  BillMaster,
  BillDetail,
  ReceiptMaster,
  ReceiptAdjustmentDetail,
  ReceiptRefundDetail,
  initPgModels
};
