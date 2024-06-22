const mongoose = require('mongoose');

// Define the Cart schema
const CartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CartItem' }],
  ImgUrl: String,
  category: String,
  subcategory: String,
  color: String,
  size: String,
  dressingStyle: String,
  title: String,
  name: String,
  price: Number,
  quantity: Number,
  description: String,
  brand: String,
  shipping: Number,
  rating: {
    type: Number,
    min: 1,  // Minimum rating value
    max: 5,  // Maximum rating value
  },
});
// Create the Cart model
const Cart = mongoose.model('Cart', CartSchema);

module.exports = Cart;
