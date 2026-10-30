const router = require('express').Router();
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const SupplierOrder = require('../models/SupplierOrder');
const { protect } = require('../middleware/auth');
router.use(protect);

router.get('/', async (_req, res) => {
  const since = new Date(Date.now() - 30 * 864e5);
  const [stock, lowStock, trend, top, pendingOrders] = await Promise.all([
    Product.aggregate([{ $group: { _id: null, products: { $sum: 1 }, units: { $sum: '$quantity' },
      value: { $sum: { $multiply: ['$price', '$quantity'] } } } }]),
    Product.find({ $expr: { $lte: ['$quantity', '$reorderLevel'] } })
      .select('name sku quantity reorderLevel').sort('quantity').limit(8).lean(),
    Sale.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } }]),
    Sale.aggregate([
      { $match: { createdAt: { $gte: since } } }, { $unwind: '$items' },
      { $group: { _id: '$items.name', units: { $sum: '$items.quantity' } } },
      { $sort: { units: -1 } }, { $limit: 5 }]),
    SupplierOrder.countDocuments({ status: 'pending' }),
  ]);
  res.json({
    totals: stock[0] || { products: 0, units: 0, value: 0 },
    lowStock, pendingOrders,
    trend: trend.map((t) => ({ date: t._id, revenue: t.revenue, orders: t.orders })),
    top: top.map((t) => ({ name: t._id, units: t.units })),
  });
});

module.exports = router;
