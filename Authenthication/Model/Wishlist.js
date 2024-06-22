const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WishlistSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  itemId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  CartItem: [
    {
      type: Schema.Types.ObjectId,
      ref: "Cart",
    },
  ],
});

const Wishlist = mongoose.model("Wishlist", WishlistSchema);
module.exports = Wishlist;
