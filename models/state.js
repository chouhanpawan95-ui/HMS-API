// models/state.js
const mongoose = require('mongoose');

const stateSchema = new mongoose.Schema({
  stateId: {
    type: String,
    unique: true,
    sparse: true
  },
  StateName: {
    type: String,
    required: true
  },
  StateCode: {
    type: String,
    required: true,
    maxlength: 10
  },
  FK_CountryId: {
    type: String,
    required: true
  },
  IsActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('State', stateSchema);
