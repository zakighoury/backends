const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  userId: String,
  productDetails: {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart' },
    ImgUrl: String,
    category: String,
    subcategory: String,
    color: String,
    size: String,
    dressingStyle: String,
    title: String,
    name: String,
    price: Number,
    description: String,
    brand: String,
    shipping: Number,
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  quantity: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

const CartItem = mongoose.model('CartItem', CartItemSchema);
module.exports = CartItem;
