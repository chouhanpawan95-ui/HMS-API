// models/userauthtypemaster.js
const mongoose = require('mongoose');

const userauthtypemasterSchema = new mongoose.Schema({
  PK_AuthTypeId: {
    type: String,
    unique: true,
    sparse: true
  },
  AuthType: {
    type: String,
    required: true
  },
  IsActive: {
    type: Boolean,
    default: true
  },
  PK_SynchId: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('UserAuthTypeMaster', userauthtypemasterSchema);