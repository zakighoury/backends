const mongoose = require('mongoose');
const { v4: uuidv4 } = require("uuid");

// Function to calculate estimated delivery date (e.g., 5 days from order date)
const calculateEstimatedDeliveryDate = () => {
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5); // Add 5 days to current date
  return deliveryDate;
};

const OrderSchema = new mongoose.Schema({
  customerId:{type:String,required:true},
  userId: { type: String, required: true },
  OrderNumber: { type: String, default: uuidv4() },
  cartItems: [
    {
      productDetails: {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        ImgUrl: { type: String },
      },
      quantity: { type: Number, required: true },
    }
  ],
  orderStatus: {
    type: String,
    default: "Order Placed",
    enum: [
      "Order Placed",
      "InProgress",
      "Shipped",
      "Delivered",
      "Cancelled",
    ]
  },
  payment: {
    cardType: {
      type: String,
      required: [true, "Payment method is required"],
    },
    brand: { type: String, required: [true, "Payment method is required"] },
    last4: { type: String, required: [true, "Payment method is required"] },
    country: { type: String, required: [true, "Payment method is required"] },
    imageUrl: {
      type: String,
      required: [true, "Payment method image is required"],
    },
  },
  amount: { type: Number, required: true },
  shipping_address: { type: Object, required: true },
  billing_address: { type: Object, required: true },
  paymentReceiptUrl: { type: String },
  orderDate: { type: Date, default: Date.now },
  estimatedDeliveryDate: { type: Date, default: calculateEstimatedDeliveryDate },
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
