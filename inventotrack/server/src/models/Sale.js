const mongoose = require('mongoose');
const s = new mongoose.Schema({
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String, price: Number, quantity: { type: Number, min: 1 },
  }],
  total: { type: Number, required: true },
  soldBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
s.index({ createdAt: -1 });
s.index({ 'items.product': 1 });
module.exports = mongoose.model('Sale', s);
