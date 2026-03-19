// models/branchmaster.js
const mongoose = require('mongoose');

const branchmasterSchema = new mongoose.Schema({
  PK_BranchId: {
    type: String,
    unique: true,
    sparse: true
  },
  BranchName: {
    type: String,
    required: true
  },
  BranchCode: {
    type: String
  },
  Address: {
    type: String
  },
  ContactPerson: {
    type: String
  },
  ContactNo: {
    type: String
  },
  EmailAddress: {
    type: String
  },
  FaxNo: {
    type: String
  },
  Line1: {
    type: String
  },
  Line2: {
    type: String
  },
  Line3: {
    type: String
  },
  Line4: {
    type: String
  },
  DLNO: {
    type: String
  },
  TINNO: {
    type: String
  },
  ImageLogo: {
    type: String
  },
  IsActive: {
    type: Boolean,
    default: true
  },
  PK_SynchId: {
    type: String
  },
  IsNabhLogo: {
    type: Boolean,
    default: false
  },
  IsHeaderImage: {
    type: Boolean,
    default: false
  },
  HeaderImageHeight: {
    type: Number
  },
  HeaderImageWidth: {
    type: Number
  },
  GSTNo: {
    type: String
  },
  fk_stateId: {
    type: String
  },
  PANNo: {
    type: String
  },
  isCentralOpticStore: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('BranchMaster', branchmasterSchema);