// models/userauthtypemenupermissiondetail.js
const mongoose = require('mongoose');

const userauthtypemenupermissiondetailSchema = new mongoose.Schema({
  PK_UPMenuDetailId: {
    type: String,
    unique: true,
    sparse: true
  },
  FK_MenuId: {
    type: String,
    required: true
  },
  FK_AuthTypeId: {
    type: String,
    required: true
  },
  PK_SynchId: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('UserAuthTypeMenuPermissionDetail', userauthtypemenupermissiondetailSchema);