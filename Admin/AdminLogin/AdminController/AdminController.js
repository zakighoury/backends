const express = require('express');
const Admin = require('../AdminModel/Admin');
const router = express.Router();
function checkAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied' });
  }
}
router.get('/admin', checkAdmin, (req, res) => {
  res.send('Admin panel');
});

router.post('/login', async (req, res) => {
  try {
    const admin = await Admin.findOne({ username: req.body.username });
    if (!admin) {
      throw new Error('Invalid username');
    }

    if (admin.password !== req.body.password) {
      throw new Error('Invalid password');
    }

    res.status(200).json({ message: 'Login successful', role: admin.role });
  } catch (error) {
    res.status(403).json({ error: error.message });
  }
});
module.exports = router;
