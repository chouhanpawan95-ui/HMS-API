const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/pgdb');

const ReceiptRefundDetail = sequelize.define('ReceiptRefundDetail', {
  refundId: { type: DataTypes.STRING, unique: true },
  fkReceiptId: { type: DataTypes.STRING },
  fkBillId: { type: DataTypes.STRING },
  fkBranchId: { type: DataTypes.STRING },
  refundType: { type: DataTypes.STRING },
  refundDate: { type: DataTypes.DATE },
  refundTime: { type: DataTypes.STRING },
  fkApprovedById: { type: DataTypes.STRING },
  refundReason: { type: DataTypes.STRING },
  fkPayTypeId: { type: DataTypes.STRING },
  fkCurrencyId: { type: DataTypes.STRING },
  currencyAmount: { type: DataTypes.FLOAT },
  convertRatio: { type: DataTypes.FLOAT },
  refundAmount: { type: DataTypes.FLOAT },
  chequeNo: { type: DataTypes.STRING },
  chequeDate: { type: DataTypes.DATE },
  chequeDeliveredDate: { type: DataTypes.DATE },
  fkDeliveredById: { type: DataTypes.STRING },
  chequeClearedDate: { type: DataTypes.DATE },
  isCleared: { type: DataTypes.BOOLEAN, defaultValue: false },
  fkChqBankId: { type: DataTypes.STRING },
  fkCreatedById: { type: DataTypes.STRING },
  counterName: { type: DataTypes.STRING },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  pkSynchId: { type: DataTypes.STRING }
}, { tableName: 'receiptrefunddetails', timestamps: true });

module.exports = ReceiptRefundDetail;