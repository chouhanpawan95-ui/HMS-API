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
  FK_CountryId: { type: String, required: true },
  StateCode: {
    type: String,
    maxlength: 10
  },
  IsActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('State', stateSchema);
