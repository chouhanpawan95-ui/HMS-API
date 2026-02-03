// models/ipdregmaster.js
const mongoose = require('mongoose');

const IpdRegMasterSchema = new mongoose.Schema({
  PK_IPDId: { type: String, required: true, unique: true, index: true },
  FK_BranchId: { type: String },
  FK_RegId: { type: String },
  ViaBooking: { type: String },
  FK_ConsId: { type: String },
  IPDAdmDate: { type: Date },
  IPDAdmTime: { type: String },
  AgeYear: { type: Number },
  AgeMonth: { type: Number },
  AgeDays: { type: Number },
  Gaurdian: { type: String },
  FK_ReferedById: { type: String },
  FK_ConsultantId: { type: String },
  MLC: { type: Boolean, default: false },
  IsDischarge: { type: Boolean, default: false },
  DOD: { type: Date },
  TOD: { type: String },
  FK_WardID: { type: String },
  FK_PartyId: { type: String },
  RateType: { type: String },
  Remarks: { type: String },
  PK_SynchId: { type: String },
  OLDIPDID: { type: String },
  IsOneEyed: { type: Boolean, default: false },
  FK_LocationId: { type: String },
  IPDType: { type: String },
  FK_ConsultantID2: { type: String },
  IsDischargeApproveByDr: { type: Boolean, default: false },
  IsDischargeApproveByAdmin: { type: Boolean, default: false },
  ManualIPNO: { type: String },
  FK_CreatedById: { type: String },
  FK_ModifiedById: { type: String },
  FK_CategoryId: { type: String },
  IPDNO: { type: String },
  surgerydate: { type: Date },
  Reason: { type: String },
  FK_UpgradeServiceID: { type: String },
  UpgradeAmount: { type: Number },
  IsOTConsentTaken: { type: Boolean, default: false },
  ClinicalApprovalComments: { type: String },
  FinancialApprovalComments: { type: String },
  Reinreason: { type: String },
  tokenNo: { type: String },
  Iscalled: { type: Boolean, default: false },
  FK_CalledByID: { type: String },
  Instruction: { type: String },
  NurseRemarks: { type: String },
  Billing: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

IpdRegMasterSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('IpdRegMaster', IpdRegMasterSchema);
