// models/doctoropdscheduletimedetail.js
const mongoose = require('mongoose');

const DoctorOpdScheduleTimeDetailSchema = new mongoose.Schema({
  tranId: { type: String, unique: true, sparse: true }, // PK_TranID
  fkBranchId: { type: String },
  fkScheduleId: { type: String, required: true },
  fkDoctorId: { type: String },
  scheduleDate: { type: Date },
  timeInterval: { type: Number },
  slotLimit: { type: Number },
  apptTime: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('DoctorOpdScheduleTimeDetail', DoctorOpdScheduleTimeDetailSchema);
