const router = require('express').Router();
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');
router.use(protect);

// GET /api/products?search=&category=&lowStock=true&page=1&limit=20
router.get('/', async (req, res) => {
  const { search, category, lowStock } = req.query;
  const page = Math.max(+req.query.page || 1, 1);
  const limit = Math.min(+req.query.limit || 20, 100);
  const filter = {};
  if (search) filter.$text = { $search: search };
  if (category) filter.category = category;
  if (lowStock === 'true') filter.$expr = { $lte: ['$quantity', '$reorderLevel'] };
  const [items, total] = await Promise.all([
    Product.find(filter).populate('supplier', 'name').sort({ updatedAt: -1 })
      .skip((page - 1) * limit).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});

router.get('/categories', async (_req, res) => res.json(await Product.distinct('category')));

router.post('/', authorize('admin', 'manager'), async (req, res) => {
  try { res.status(201).json(await Product.create(req.body)); }
  catch (e) { res.status(400).json({ message: e.code === 11000 ? 'SKU already exists' : e.message }); }
});

router.put('/:id', authorize('admin', 'manager'), async (req, res) => {
  const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  p ? res.json(p) : res.status(404).json({ message: 'Product not found' });
});

// Manual stock adjustment: body { delta: -3 }
router.patch('/:id/stock', authorize('admin', 'manager'), async (req, res) => {
  const delta = Number(req.body.delta);
  if (!Number.isFinite(delta)) return res.status(400).json({ message: 'delta must be a number' });
  const p = await Product.findOneAndUpdate(
    { _id: req.params.id, quantity: { $gte: delta < 0 ? -delta : 0 } },
    { $inc: { quantity: delta } }, { new: true });
  p ? res.json(p) : res.status(400).json({ message: 'Not enough stock for that change' });
});

router.delete('/:id', authorize('admin'), async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

module.exports = router;
