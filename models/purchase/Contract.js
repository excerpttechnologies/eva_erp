const mongoose = require('mongoose');

const ContractItemSchema = new mongoose.Schema({
  materialId: String,
  description: String,
  qty: Number,
  baseUnit: String,
  orderUnit: String,
  unit: String,
  vendorId: String,
  vendorName: String,
  materialgroup: String,
  deliveryDate: Date,
  price: Number
});

const ContractSchema = new mongoose.Schema({
  contractNumber: { type: String, required: true },
  indentId: String,
  categoryId: String,
  contractCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseContractCategory', required: true },
  vendor: String,
  vendorName: String,
  contractReference: String,
  cnNo: String,
  validityFDate: Date,
  validityTDate: Date,
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  financialYear: String,
  note: String,
  location: String,
  buyerGroup: String,
  totalPrice: { type: Number, default: 0 },
  items: [ContractItemSchema],
  contractGenType: { type: String, enum: ['internal', 'external'], default: 'internal' }
}, { timestamps: true });

// Drop the old index and create a compound unique index
// First, drop the existing index (run this once in your database)
// db.contracts.dropIndex("contractNumber_1")

// Then use this compound index
ContractSchema.index({ contractNumber: 1, contractCategoryId: 1 }, { unique: true });

module.exports = mongoose.model('Contract', ContractSchema);