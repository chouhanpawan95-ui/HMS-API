const mongoose = require('mongoose');

const WebsiteEnquiryschema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String},
  email: { type: String},
 subject: { type: String},
 message: { type: String},

});

module.exports = mongoose.model('WebsiteEnquiry', WebsiteEnquiryschema);
