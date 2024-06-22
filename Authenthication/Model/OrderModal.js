// models/Order.js
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  paymentStatus: { type: String, required: true },
  cartItems: { type: Array, required: true },
  orderStatus: {
    type: String,
    default: "Order Placed",
    enum: [
      "Order Placed",
      "InProgress",
      "Shipped",

    ]
  },
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
