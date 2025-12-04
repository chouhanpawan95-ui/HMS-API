const mongoose = require('mongoose');

const serviceCategoryMasterSchema = new mongoose.Schema({
  categoryId: { type: String, unique: true, sparse: true },
  FK_DeptId: { type: String, required: true },
  CategoryName: { type: String, required: true },
  IsActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('ServiceCategoryMaster', serviceCategoryMasterSchema);
