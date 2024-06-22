
const mongoose = require('mongoose');
const { route } = require('../AdminController/AdminController');

const adminSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: {
    type: String, default: "admin", enum: ["admin", "user"]
  }
});
const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
