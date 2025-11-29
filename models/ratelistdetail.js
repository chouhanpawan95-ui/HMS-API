const mongoose = require('mongoose');

const rateListDetailSchema = new mongoose.Schema({
  rlDetailId: { type: String, unique: true, sparse: true },
  FK_RateListId: { type: String, required: true },
  FK_ServiceId: { type: String, required: true },
  RateGeneral: { type: Number },
  RateSemiPrivate: { type: Number },
  RatePrivate: { type: Number },
  RateSemiDelux: { type: Number },
  RateDelux: { type: Number },
  Discount: { type: Number, default: 0 },
  MaxDiscountLimit: { type: Number },
  ServiceCharge: { type: Number, default: 0 },
  IsActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('RateListDetail', rateListDetailSchema);
