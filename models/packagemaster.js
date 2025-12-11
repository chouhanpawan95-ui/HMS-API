const mongoose = require('mongoose');

const packageMasterSchema = new mongoose.Schema({
  packageId: { type: String, unique: true, sparse: true },
  PK_PackageId: { type: Number },
  PackageName: { type: String, required: true },
  PackageCodeNo: { type: String },
  PackageAmount: { type: Number, default: 0 },
  IsGlobal: { type: Boolean, default: false },
  ValidFrom: { type: Date },
  Validupto: { type: Date },
  IsActive: { type: Boolean, default: true },
  PK_SynchId: { type: Number },
  PackageGroup: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('PackageMaster', packageMasterSchema);
