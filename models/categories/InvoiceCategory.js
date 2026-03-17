// const mongoose = require('mongoose');

// const invoiceCategorySchema = new mongoose.Schema({
//   categoryName: { type: String, required: true },
//   // prefix: { type: String, required: true },
//   rangeStart: { type: Number, required: true },
//   rangeEnd: { type: Number, required: true },
//   companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
//   financialYear: String,
// }, { timestamps: true });

// module.exports = mongoose.model('InvoiceCategory', invoiceCategorySchema);


const mongoose = require('mongoose');

const invoiceCategorySchema = new mongoose.Schema({
  categoryName: { 
    type: String, 
    required: true 
  },

  prefix: { 
    type: String 
  },

  rangeStart: { 
    type: Number, 
    required: true 
  },

  rangeEnd: { 
    type: Number, 
    required: true 
  },

  companyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Company',
    required: true
  },

  financialYearStart: {
    type: Date,
  },

  financialYearEnd: {
    type: Date,
  }

}, { timestamps: true });

module.exports = mongoose.model('InvoiceCategory', invoiceCategorySchema);