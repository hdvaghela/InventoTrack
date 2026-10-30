require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Supplier = require('./models/Supplier');
const Product = require('./models/Product');
const Sale = require('./models/Sale');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User, Supplier, Product, Sale].map((m) => m.deleteMany({})));
  const admin = await User.create({ name: 'Admin', email: 'admin@inventotrack.com', password: 'admin123', role: 'admin' });
  await User.create({ name: 'Manager', email: 'manager@inventotrack.com', password: 'manager123', role: 'manager' });
  await User.create({ name: 'Staff', email: 'staff@inventotrack.com', password: 'staff123', role: 'staff' });
  const sup = await Supplier.insertMany([
    { name: 'Northwind Wholesale', email: 'orders@northwind.test' },
    { name: 'Bright Goods Co.', email: 'sales@brightgoods.test' },
  ]);
  const cats = ['Grocery', 'Stationery', 'Electronics', 'Home'];
  const products = [];
  for (let i = 1; i <= 40; i++) {
    products.push({
      name: `${cats[i % 4]} Item ${i}`, sku: `SKU-${1000 + i}`, category: cats[i % 4],
      price: +(5 + Math.random() * 95).toFixed(2), quantity: Math.floor(Math.random() * 80),
      reorderLevel: 15, supplier: sup[i % 2]._id,
    });
  }
  const created = await Product.insertMany(products);
  const sales = [];
  for (let d = 0; d < 30; d++) {
    for (let k = 0; k < 1 + (d % 3); k++) {
      const p = created[(d * 3 + k) % created.length];
      const qty = 1 + (k % 4);
      sales.push({ items: [{ product: p._id, name: p.name, price: p.price, quantity: qty }],
        total: p.price * qty, soldBy: admin._id, createdAt: new Date(Date.now() - d * 864e5) });
    }
  }
  await Sale.insertMany(sales);
  console.log('Seeded. Login: admin@inventotrack.com / admin123');
  process.exit(0);
})();
