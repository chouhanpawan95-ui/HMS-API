// models/ipdregdetail.js
const mongoose = require('mongoose');

const IpdRegDetailSchema = new mongoose.Schema({
  PK_TranID: { type: String, required: true, unique: true, index: true },
  FK_IPDID: { type: String, required: true },
  FK_BedID: { type: String },
  FromDate: { type: Date },
  FromTime: { type: String },
  ToDate: { type: Date },
  ToTime: { type: String },
  FK_CreatedByID: { type: String },
  EntryDateTime: { type: Date, default: Date.now },
  FK_BillingBedID: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

IpdRegDetailSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('IpdRegDetail', IpdRegDetailSchema);
