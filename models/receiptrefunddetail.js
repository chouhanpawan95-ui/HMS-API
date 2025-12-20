// models/receiptrefunddetail.js
const mongoose = require('mongoose');

const ReceiptRefundDetailSchema = new mongoose.Schema({
  refundId: { type: String, unique: true, sparse: true }, // PK_RefundId
  fkReceiptId: { type: String },
  fkBillId: { type: String },
  fkBranchId: { type: String },
  refundType: { type: String },
  refundDate: { type: Date },
  refundTime: { type: String },
  fkApprovedById: { type: String },
  refundReason: { type: String },
  fkPayTypeId: { type: String },
  fkCurrencyId: { type: String },
  currencyAmount: { type: Number },
  convertRatio: { type: Number },
  refundAmount: { type: Number },
  chequeNo: { type: String },
  chequeDate: { type: Date },
  chequeDeliveredDate: { type: Date },
  fkDeliveredById: { type: String },
  chequeClearedDate: { type: Date },
  isCleared: { type: Boolean, default: false },
  fkChqBankId: { type: String },
  fkCreatedById: { type: String },
  counterName: { type: String },
  isActive: { type: Boolean, default: true },
  pkSynchId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('ReceiptRefundDetail', ReceiptRefundDetailSchema);
