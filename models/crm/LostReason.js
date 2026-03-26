const mongoose = require('mongoose');

const lostReasonSchema = new mongoose.Schema({
  reason: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Price', 'Competition', 'Timeline', 'Budget', 'Feature', 'Service', 'Other']
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  companyId: {
    type: String,
    required: false
  },
  financialYear: {
    type: String,
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

lostReasonSchema.index({ companyId: 1, financialYear: 1 });

module.exports = mongoose.model('LostReason', lostReasonSchema);