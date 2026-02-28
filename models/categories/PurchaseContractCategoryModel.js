const mongoose = require('mongoose');

const purchaseContractCategorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
    trim: true
  },
  rangeFrom: {
    type: Number,
    required: true,
    min: 1,
    
  },
  rangeTo: {
    type: Number,
    required: true,
    min: 1,
   
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  financialYear: String,
});

// Validate that rangeTo is greater than or equal to rangeFrom
purchaseContractCategorySchema.pre('save', function(next) {
  if (this.rangeTo < this.rangeFrom) {
    const error = new Error('Range To must be greater than or equal to Range From');
    return next(error);
  }
  this.updatedAt = new Date();
  next();
});

// Create indexes for better performance
purchaseContractCategorySchema.index({ categoryName: 1 });
purchaseContractCategorySchema.index({ isActive: 1 });

module.exports = mongoose.model('PurchaseContractCategory', purchaseContractCategorySchema);