const mongoose = require('mongoose');

const partymasterSchema = new mongoose.Schema({
  partyId: { type: String, unique: true, sparse: true },
  PK_PartyId: { type: Number },
  PartyName: { type: String, required: true },
  ShortName: { type: String },
  PartyType: { type: String },
  StartDate: { type: Date },
  EndDate: { type: Date },
  CorporateAddress: { type: String },
  AddressTo: { type: String },
  FK_CityId: { type: String },
  ContactPerson: { type: String },
  ContactNoMob: { type: String },
  ContactNoOffice1: { type: String },
  ContactNoOffice2: { type: String },
  EmailId: { type: String },
  FK_RateListId: { type: String },
  Remarks: { type: String },
  A: { type: String },
  B: { type: String },
  C: { type: String },
  D: { type: String },
  E: { type: String },
  IsActive: { type: Boolean, default: true },
  PK_SynchId: { type: Number },
  F: { type: String },
  G: { type: String },
  H: { type: String },
  FK_ReviewConsultationID: { type: String },
  FreeDays: { type: Number },
  NoofVisit: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('PartyMaster', partymasterSchema);
