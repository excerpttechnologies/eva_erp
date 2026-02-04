const mongoose = require('mongoose');

const billingCategorySchema = new mongoose.Schema({
  categoryName: { type: String, required: true },
  // prefix: { type: String, required: true },
  rangeStart: { type: Number, required: true },
  rangeEnd: { type: Number, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  financialYear: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('BillingCategory', billingCategorySchema);
