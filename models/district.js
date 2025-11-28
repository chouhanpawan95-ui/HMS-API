// models/district.js
const mongoose = require('mongoose');

const districtSchema = new mongoose.Schema({
  districtId: {
    type: String,
    unique: true,
    sparse: true
  },
  DistrictName: {
    type: String,
    required: true
  },
  FK_StateId: {
    type: String,
    required: true
  },
  IsActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('District', districtSchema);
