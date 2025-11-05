// models/patient.js
const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  addressLine: { type: String },
  country: { type: String },
  stateName: { type: String },
  district: { type: String },
  cityName: { type: String },
  email: { type: String },
  phoneR: { type: String },
  mobileNo: { type: String },
  emergencyNo: { type: String },
  personName: { type: String },
  faxNo: { type: String }
}, { _id: false });

const CurrentAddressSchema = new mongoose.Schema({
  sameAsPermanent: { type: Boolean, default: false },
  addressLine: { type: String },
  country: { type: String },
  stateName: { type: String },
  district: { type: String },
  cityOrVillage: { type: String }
}, { _id: false });

const OtherInfoSchema = new mongoose.Schema({
  groupName: { type: String },
  maritalStatus: { type: String },
  bloodGroup: { type: String }, // Bl. Group
  language: { type: String },
  religion: { type: String },
  occupation: { type: String },
  source: { type: String },
  adharCard: { type: String }, // Aadhaar
  passportNo: { type: String },
  isBPL: { type: Boolean, default: false },
  isTribal: { type: Boolean, default: false },
  isDisable: { type: Boolean, default: false },
  isVIP: { type: Boolean, default: false },
  remarks: { type: String }
}, { _id: false });

const PatientSchema = new mongoose.Schema({
  patientId: { type: String, required: true, unique: true, index: true }, // Patient ID
  branch: { type: String },
  branchSelect: { type: String }, // e.g. Ernakulam visible in form (optional)
  oldNo: { type: String },

  title: { type: String }, // Mr./Mrs.
  firstName: { type: String },
  lastName: { type: String },
  s_o: { type: String }, // S/o
  dateTime: { type: Date }, // Date & Time (admission/entry)
  dateOfBirth: { type: Date },
  ageYMD: { type: String }, // Age (Y/M/D) as string or you can compute it
  sex: { type: String, enum: ['M', 'F', 'O', null] },
  nationality: { type: String },

  permanentAddress: { type: AddressSchema, default: {} },
  currentAddress: { type: CurrentAddressSchema, default: {} },

  otherInfo: { type: OtherInfoSchema, default: {} },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save updatedAt
PatientSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Patient', PatientSchema);
