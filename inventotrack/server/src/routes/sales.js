const router = require('express').Router();
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const { protect } = require('../middleware/auth');
router.use(protect);

// Checkout: body { items: [{ productId, quantity }] }
// Stock is decremented atomically per item; if any item fails, earlier changes are rolled back.
router.post('/checkout', async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || !items.length) return res.status(400).json({ message: 'Cart is empty' });

  const done = [];
  try {
    const lines = [];
    for (const { productId, quantity } of items) {
      const qty = Math.floor(Number(quantity));
      if (!(qty > 0)) throw new Error('Invalid quantity');
      const p = await Product.findOneAndUpdate(
        { _id: productId, quantity: { $gte: qty } }, { $inc: { quantity: -qty } }, { new: true });
      if (!p) throw new Error('Not enough stock for one of the items');
      done.push({ productId, qty });
      lines.push({ product: p._id, name: p.name, price: p.price, quantity: qty });
    }
    const total = lines.reduce((s, l) => s + l.price * l.quantity, 0);
    const sale = await Sale.create({ items: lines, total, soldBy: req.user._id });
    res.status(201).json(sale);
  } catch (e) {
    await Promise.all(done.map((d) => Product.updateOne({ _id: d.productId }, { $inc: { quantity: d.qty } })));
    res.status(400).json({ message: e.message });
  }
});

router.get('/', async (_req, res) =>
  res.json(await Sale.find().sort('-createdAt').limit(50).populate('soldBy', 'name').lean()));

module.exports = router;
