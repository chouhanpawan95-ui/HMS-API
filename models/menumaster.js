// models/menumaster.js
const mongoose = require('mongoose');

const menumasterSchema = new mongoose.Schema({
  PK_MenuId: {
    type: String,
    unique: true,
    sparse: true
  },
  MenuName: {
    type: String,
    required: true
  },
  MenuGroup: {
    type: String
  },
  MenuLink: {
    type: String
  },
  MenuIndex: {
    type: Number,
    default: 0
  },
  ShowType: {
    type: String
  },
  MenuDetailName: {
    type: String
  },
  IsActive: {
    type: Boolean,
    default: true
  },
  PK_SynchId: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('MenuMaster', menumasterSchema);