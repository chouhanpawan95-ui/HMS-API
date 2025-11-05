const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner:{ type: String, required: true },
  country: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  phone: { type: String},
  pincode:{type:String},
  email: { type: String},
  // Store uploaded files as binary Buffer in MongoDB (or store URLs/paths as String instead)
 imageupload: {
    filename: String,
    path: String,
    mimetype: String,
  },
  documentupload: {
    filename: String,
    path: String,
    mimetype: String,
  },
  projectType: { type: String },
  projectDetails: { type: String },
  address: { type: String },
  ploatArea: { type: String },
  ploatdimensions: { type: String },
  ploatfacing: { type: String },
  constCostsqft: { type: String },
  evc: { type: String },
  budget: { type: String },
  registrationDate: { type: Date, default: Date.now },
  approxStartDate: { type: Date },
  approxCompleteDate: { type: Date },
  isstarted: { type: Boolean, default: false }
});

module.exports = mongoose.model('Registration', registrationSchema);
