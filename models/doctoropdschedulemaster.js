// models/doctoropdschedulemaster.js
const mongoose = require('mongoose');

const DoctorOpdScheduleMasterSchema = new mongoose.Schema({
  scheduleId: { type: String, required: true, unique: true, index: true }, // PK_ScheduleId
  fkBranchId: { type: String },
  fkScheduleTypeId: { type: String },
  scheduleDate: { type: Date },
  fkDoctorId: { type: String },
  fromApptTime: { type: String },
  toApptTime: { type: String },
  intervalMinuit: { type: Number },
  maxLimitSlot: { type: Number },
  isActive: { type: Boolean, default: true },
  pkSynchId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('DoctorOpdScheduleMaster', DoctorOpdScheduleMasterSchema);
