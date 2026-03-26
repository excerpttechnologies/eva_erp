// const mongoose = require('mongoose');

// const callSchema = new mongoose.Schema({
//   callType: {
//     type: String,
//     required: true,
//     enum: ['Inbound', 'Outbound', 'Missed', 'Voicemail']
//   },
//   purpose: {
//     type: String,
//     required: true,
//     enum: ['Sales', 'Support', 'Follow-up', 'Demo', 'Meeting', 'Consultation', 'Other']
//   },
//   outcome: {
//     type: String,
//     required: true,
//     enum: ['Successful', 'No Answer', 'Busy', 'Follow-up Required', 'Completed', 'Cancelled', 'Rescheduled']
//   },
//   description: {
//     type: String,
//     trim: true,
//     default: ''
//   },
//   companyId: {
//     type: String,
//     required: true
//   },
//   financialYear: {
//     type: String,
//     required: true
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   }
// }, {
//   timestamps: true
// });

// callSchema.index({ companyId: 1, financialYear: 1 });

// module.exports = mongoose.model('Call', callSchema);









const mongoose = require('mongoose');

const callSchema = new mongoose.Schema({
  callType: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    required: true
  },
  outcome: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  companyId: {
    type: String,
    required: true
  },
  financialYear: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});



module.exports = mongoose.model('Call', callSchema);