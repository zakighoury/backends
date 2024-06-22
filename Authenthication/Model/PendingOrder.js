// models/Order.js
const mongoose = require('mongoose');

const PendingOrderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    cartItems: { type: Array, required: true },
    sessionId: String,
});

const PendingOrder = mongoose.model('PendingOrders', PendingOrderSchema);

module.exports = PendingOrder;