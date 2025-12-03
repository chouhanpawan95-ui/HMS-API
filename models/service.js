// models/service.js
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  serviceId: {
    type: String,
    unique: true,
    sparse: true
  },
  FK_CategoryId:{
    type: Number,
     required: true
  },
  ServiceName: {
    type: String,
    required: true
  },
   FK_TestTypeId:{
    type: Number
  },
    IsOutSidePerform: {
    type: Boolean,
    required: false
  },
  ServiceCode: {
    type: String,
    maxlength: 50
  },
   CPTCode: {
    type: String,
    required: false
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
  },
   IsDoctorIDRequired: {
    type: Boolean
  },
    FK_SampleTypeId: {
    type: Number
  },
    FK_LabDepartmentID: {
    type: Number
  }
  
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
