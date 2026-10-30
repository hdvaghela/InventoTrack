const router = require('express').Router();
const Supplier = require('../models/Supplier');
const SupplierOrder = require('../models/SupplierOrder');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');
router.use(protect);

router.get('/', async (_req, res) => res.json(await Supplier.find().sort('name').lean()));
router.post('/', authorize('admin', 'manager'), async (req, res) => {
  try { res.status(201).json(await Supplier.create(req.body)); }
  catch (e) { res.status(400).json({ message: e.message }); }
});

// ---- Supplier orders ----
router.get('/orders', async (_req, res) =>
  res.json(await SupplierOrder.find().sort('-createdAt').limit(100)
    .populate('supplier', 'name').populate('product', 'name sku').lean()));

router.post('/orders', authorize('admin', 'manager'), async (req, res) => {
  try {
    const order = await SupplierOrder.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(order);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// Receiving an order adds the quantity to stock
router.patch('/orders/:id/receive', authorize('admin', 'manager'), async (req, res) => {
  const order = await SupplierOrder.findOneAndUpdate(
    { _id: req.params.id, status: 'pending' }, { status: 'received' }, { new: true });
  if (!order) return res.status(400).json({ message: 'Order is not pending' });
  await Product.updateOne({ _id: order.product }, { $inc: { quantity: order.quantity } });
  res.json(order);
});

router.patch('/orders/:id/cancel', authorize('admin', 'manager'), async (req, res) => {
  const order = await SupplierOrder.findOneAndUpdate(
    { _id: req.params.id, status: 'pending' }, { status: 'cancelled' }, { new: true });
  order ? res.json(order) : res.status(400).json({ message: 'Order is not pending' });
});

module.exports = router;
