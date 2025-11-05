const mongoose = require('mongoose');

const engineerVisitSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registration',
    required: true
  },
  engineerName: { 
    type: String, 
    required: true 
  },
  engineerComment: { 
    type: String, 
    required: true 
  },
  visitStartTime: { 
    type: Date, 
    required: true 
  },
  visitEndTime: { 
    type: Date, 
    required: true 
  },
  visitDate: { 
    type: Date, 
    default: Date.now 
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'cancelled'],
    default: 'completed'
  },
  photos: [{
    filename: String,
    path: String,
    mimetype: String
  }]
});

module.exports = mongoose.model('EngineerVisit', engineerVisitSchema);