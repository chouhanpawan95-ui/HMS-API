// models/country.js
const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
  countryId: {
    type: String,
    unique: true,
    sparse: true
  },
  CountryName: {
    type: String,
    required: true
  },
  CountryCode: {
    type: String,
    required: true,
    maxlength: 10
  },
  IsActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Country', countrySchema);
