// // models/Checkout.js
// const mongoose = require('mongoose');

// const checkoutSchema = new mongoose.Schema({
//   userId: {
//     type: String,
//   },
//   cartItems: [
//     {
//       quantity: Number,
//       productDetails: {
//         productId: String,
//         name: String,
//         price: Number,
//         color: String,
//         size: String,
//         shipping: Number,
//         ImgUrl: String,
//       },
//     },
//   ],
//   subtotal: {
//     type: Number,
//   },
//   shippingCost: {
//     type: Number,  },
//   grandTotal: {
//     type: Number,
//   },
//   coupon: {
//     type: String,
//   },
//   discount: {
//     type: Number,
//   },
// });

// const Checkout = mongoose.model('Checkout', checkoutSchema);
// module.exports = Checkout;
