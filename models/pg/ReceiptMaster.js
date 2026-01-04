const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/pgdb');

const ReceiptMaster = sequelize.define('ReceiptMaster', {
  receiptId: { type: DataTypes.STRING, unique: true },
  fkBillingCompanyId: { type: DataTypes.STRING },
  fkBranchId: { type: DataTypes.STRING },
  fkFinyearId: { type: DataTypes.STRING },
  fkRegId: { type: DataTypes.STRING },
  fkDepositHeadId: { type: DataTypes.STRING },
  receiptNo: { type: DataTypes.STRING },
  paymentDate: { type: DataTypes.DATE },
  paymentTime: { type: DataTypes.STRING },
  fkDoctorId: { type: DataTypes.STRING },
  fkCurrencyId: { type: DataTypes.STRING },
  currencyAmount: { type: DataTypes.FLOAT },
  convertRatio: { type: DataTypes.FLOAT },
  amountINR: { type: DataTypes.FLOAT },
  fkPayTypeId: { type: DataTypes.STRING },
  chequeNo: { type: DataTypes.STRING },
  chequeDate: { type: DataTypes.DATE },
  fkChqBankId: { type: DataTypes.STRING },
  refBankBranch: { type: DataTypes.STRING },
  fkClrBankId: { type: DataTypes.STRING },
  fkDepositTypeId: { type: DataTypes.STRING },
  clearingDate: { type: DataTypes.DATE },
  isCleared: { type: DataTypes.BOOLEAN, defaultValue: false },
  isCoPayment: { type: DataTypes.BOOLEAN, defaultValue: false },
  fkPartyId: { type: DataTypes.STRING },
  fkCreatedById: { type: DataTypes.STRING },
  userRemarks: { type: DataTypes.TEXT },
  isCancelled: { type: DataTypes.BOOLEAN, defaultValue: false },
  fkCancelledById: { type: DataTypes.STRING },
  printCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  pkSynchId: { type: DataTypes.STRING },
  oldRegID: { type: DataTypes.STRING },
  oldAdvID: { type: DataTypes.STRING },
  oldFkBranchId: { type: DataTypes.STRING },
  counterName: { type: DataTypes.STRING },
  fkAppointmentID: { type: DataTypes.STRING }
}, { tableName: 'receiptmasters', timestamps: true });

module.exports = ReceiptMaster;