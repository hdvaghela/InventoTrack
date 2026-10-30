const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sku: { type: String, required: true, unique: true, uppercase: true },
  category: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 0, default: 0 },
  reorderLevel: { type: Number, default: 10 },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
}, { timestamps: true });

// Indexes that back the common dashboard queries (filter, search, low-stock, join)
productSchema.index({ category: 1, quantity: 1 });
productSchema.index({ name: 'text', sku: 'text' });
productSchema.index({ supplier: 1 });
productSchema.index({ quantity: 1, reorderLevel: 1 });
module.exports = mongoose.model('Product', productSchema);
