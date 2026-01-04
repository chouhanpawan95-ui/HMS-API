const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/pgdb');

const ReceiptAdjustmentDetail = sequelize.define('ReceiptAdjustmentDetail', {
  tranId: { type: DataTypes.STRING, unique: true },
  fkReceiptId: { type: DataTypes.STRING, allowNull: false },
  fkAdjustedBillId: { type: DataTypes.STRING },
  adjustedAmount: { type: DataTypes.FLOAT, defaultValue: 0 },
  amountTDS: { type: DataTypes.FLOAT, defaultValue: 0 },
  amountDiscount: { type: DataTypes.FLOAT, defaultValue: 0 },
  amountDisAllow: { type: DataTypes.FLOAT, defaultValue: 0 },
  amountST: { type: DataTypes.FLOAT, defaultValue: 0 },
  fkAdjustedById: { type: DataTypes.STRING },
  adjustedDatetime: { type: DataTypes.DATE }
}, { tableName: 'receiptadjustmentdetails', timestamps: true });

module.exports = ReceiptAdjustmentDetail;