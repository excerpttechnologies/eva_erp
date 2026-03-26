const mongoose = require('mongoose');

const billingCategorySchema = new mongoose.Schema({
  categoryName: { type: String, required: true },
  prefix: { type: String, default: '' },
  rangeStart: { type: Number, required: true },
  rangeEnd: { type: Number, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  financialYear: { type: String, deault: ''}
}, { timestamps: true });

module.exports = mongoose.model('BillingCategory', billingCategorySchema);
