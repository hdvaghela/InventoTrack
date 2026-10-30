const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const sign = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '7d' });
const pub = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password }); // always "staff"
    res.status(201).json({ token: sign(user), user: pub(user) });
  } catch (e) {
    res.status(400).json({ message: e.code === 11000 ? 'Email already registered' : e.message });
  }
});

router.post('/login', async (req, res) => {
  const user = await User.findOne({ email: (req.body.email || '').toLowerCase() }).select('+password');
  if (!user || !(await user.matches(req.body.password || '')))
    return res.status(401).json({ message: 'Wrong email or password' });
  res.json({ token: sign(user), user: pub(user) });
});

router.get('/me', protect, (req, res) => res.json({ user: pub(req.user) }));

router.get('/users', protect, authorize('admin'), async (_req, res) => res.json(await User.find().lean()));
router.patch('/users/:id/role', protect, authorize('admin'), async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true, runValidators: true });
  res.json(pub(user));
});

module.exports = router;
