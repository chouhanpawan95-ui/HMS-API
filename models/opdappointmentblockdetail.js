// models/opdappointmentblockdetail.js
const mongoose = require('mongoose');

const OpdAppointmentBlockDetailSchema = new mongoose.Schema({
  tranId: { type: String, unique: true, sparse: true }, // PK_TranId
  fkBranchId: { type: String },
  fkDoctorId: { type: String },
  apptDate: { type: Date },
  apptTime: { type: String },
  fkCreatedById: { type: String },
  entryDatetime: { type: Date },
  isActive: { type: Boolean, default: true },
  pkSynchId: { type: String },
  blockReason: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('OpdAppointmentBlockDetail', OpdAppointmentBlockDetailSchema);
