const mongoose = require('mongoose');
module.exports = mongoose.model('Supplier', new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  email: String, phone: String,
}, { timestamps: true }));
