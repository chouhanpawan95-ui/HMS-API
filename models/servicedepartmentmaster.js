const mongoose = require('mongoose');

const serviceDepartmentMasterSchema = new mongoose.Schema({
  departmentId: { type: String, unique: true, sparse: true },
  DeptName: { type: String, required: true },
  IsActive: { type: Boolean, default: true },
  DeptType: { type: String },
  SeqNo: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('ServiceDepartmentMaster', serviceDepartmentMasterSchema);
