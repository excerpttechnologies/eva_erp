// const mongoose = require('mongoose');

// const sourceSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     trim: true
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
//    default: null,
//     r
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   }
// }, {
//   timestamps: true
// });

// // Create compound index for efficient querying
// sourceSchema.index({ companyId: 1, financialYear: 1 });

// module.exports = mongoose.model('Source', sourceSchema);equired: true














const mongoose = require('mongoose');

const sourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    trim: true,
    default: ''
  },

  companyId: {
    type: String,
    required: true
  },

  // ✅ FIXED (MOST IMPORTANT)
  financialYear: {
    type: String,
    default: null   // ✅ NOT required
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true
});

// ✅ Index (optional but good)
sourceSchema.index({ companyId: 1, financialYear: 1 });

module.exports = mongoose.model('Source', sourceSchema);