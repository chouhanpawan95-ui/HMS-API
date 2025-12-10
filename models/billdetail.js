const mongoose = require('mongoose');

const billDetailSchema = new mongoose.Schema({
  PK_BillDetailId: { type: String, unique: true, sparse: true },
  FK_BillId: { type: String, required: true },
  FK_ServiceId: { type: String, required: true },
  Rate: { type: Number, default: 0 },
  Unit: { type: Number, default: 1 },
  Amount: { type: Number, default: 0 },
  Discount: { type: Number, default: 0 },
  ServiceCharges: { type: Number, default: 0 },
  NetAmt: { type: Number, default: 0 },
  FK_PackageId: { type: String },
  IsPerformed: { type: Boolean, default: false },
  Remarks: { type: String },
  PK_SynchId: { type: Number },
  Received: { type: Boolean, default: false },
  FK_BillableServiceTranID: { type: String },
  FK_DoctorID: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('BillDetail', billDetailSchema);
