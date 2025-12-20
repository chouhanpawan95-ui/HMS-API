// models/receiptmaster.js
const mongoose = require('mongoose');

const ReceiptMasterSchema = new mongoose.Schema({
  receiptId: { type: String, unique: true, sparse: true }, // PK_ReceiptId
  fkBillingCompanyId: { type: String },
  fkBranchId: { type: String },
  fkFinyearId: { type: String },
  fkRegId: { type: String },
  fkDepositHeadId: { type: String },
  receiptNo: { type: String },
  paymentDate: { type: Date },
  paymentTime: { type: String },
  fkDoctorId: { type: String },
  fkCurrencyId: { type: String },
  currencyAmount: { type: Number },
  convertRatio: { type: Number },
  amountINR: { type: Number },
  fkPayTypeId: { type: String },
  chequeNo: { type: String },
  chequeDate: { type: Date },
  fkChqBankId: { type: String },
  refBankBranch: { type: String },
  fkClrBankId: { type: String },
  fkDepositTypeId: { type: String },
  clearingDate: { type: Date },
  isCleared: { type: Boolean, default: false },
  isCoPayment: { type: Boolean, default: false },
  fkPartyId: { type: String },
  fkCreatedById: { type: String },
  userRemarks: { type: String },
  isCancelled: { type: Boolean, default: false },
  fkCancelledById: { type: String },
  printCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  pkSynchId: { type: String },
  oldRegID: { type: String },
  oldAdvID: { type: String },
  oldFkBranchId: { type: String },
  counterName: { type: String },
  fkAppointmentID: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('ReceiptMaster', ReceiptMasterSchema);
