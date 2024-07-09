// models/Order.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require("uuid");

const PendingOrderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    cartItems: { type: Array, required: true },
    customerId: { type: String, required: true },
});

const PendingOrder = mongoose.model('PendingOrders', PendingOrderSchema);

module.exports = PendingOrder;