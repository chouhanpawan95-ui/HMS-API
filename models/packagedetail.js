const mongoose = require('mongoose');

const packageDetailSchema = new mongoose.Schema({
  pkgDetailId: { type: String, unique: true, sparse: true },
  PK_PackageDetailId: { type: Number },
  FK_PackageId: { type: String, required: true },
  FK_ServiceId: { type: String, required: true },
  RateGeneral: { type: Number, default: 0 },
  RateSemiPrivate: { type: Number, default: 0 },
  RatePrivate: { type: Number, default: 0 },
  RateSemiDelux: { type: Number, default: 0 },
  RateDelux: { type: Number, default: 0 },
  Discount: { type: Number, default: 0 },
  ServiceCharge: { type: Number, default: 0 },
  IsActive: { type: Boolean, default: true },
  PK_SynchId: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('PackageDetail', packageDetailSchema);
