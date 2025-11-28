// models/service.js
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  serviceId: {
    type: String,
    unique: true,
    sparse: true
  },
  ServiceName: {
    type: String,
    required: true
  },
  ServiceCode: {
    type: String,
    maxlength: 50
  },
  ServiceDescription: {
    type: String
  },
  IsActive: {
    type: Boolean,
    default: true
  },
  InvestigationType: {
    type: String
  },
  ServiceTime: {
    type: String
  },
  CPTCode: {
    type: String
  },
  HSNNO: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
