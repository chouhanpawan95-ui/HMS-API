// models/receiptadjustmentdetail.js
const mongoose = require('mongoose');

const ReceiptAdjustmentDetailSchema = new mongoose.Schema({
  tranId: { type: String, unique: true, sparse: true }, // PK_TranId
  fkReceiptId: { type: String, required: true },
  fkAdjustedBillId: { type: String },
  adjustedAmount: { type: Number, default: 0 },
  amountTDS: { type: Number, default: 0 },
  amountDiscount: { type: Number, default: 0 },
  amountDisAllow: { type: Number, default: 0 },
  amountST: { type: Number, default: 0 },
  fkAdjustedById: { type: String },
  adjustedDatetime: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('ReceiptAdjustmentDetail', ReceiptAdjustmentDetailSchema);
