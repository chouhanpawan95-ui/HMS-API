const mongoose = require('mongoose');

const rateListMasterSchema = new mongoose.Schema({
  rateListId: { type: String, unique: true, sparse: true },
  FK_BranchId: { type: String, required: true },
  RateListName: { type: String, required: true },
  StartDate: { type: Date },
  Validupto: { type: Date },
  IsActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('RateListMaster', rateListMasterSchema);
