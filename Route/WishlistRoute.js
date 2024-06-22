const express = require("express");
const router = express.Router();
const Wishlist = require("../Authenthication/Model/Wishlist"); // Adjust the path as necessary
const mongoose = require("mongoose");

// Route to add an item to the wishlist
router.post("/add", async (req, res) => {
  const { userId, itemId } = req.body;

  if (!userId || !itemId) {
    return res.status(400).json({ message: "Invalid userId or itemId" });
  }

  try {
    const existingWishlistItem = await Wishlist.findOne({
      userId: mongoose.Types.ObjectId(userId),
      itemId: mongoose.Types.ObjectId(itemId),
    });

    if (existingWishlistItem) {
      return res.status(400).json({ message: "Item already in wishlist" });
    }

    const wishlistItem = new Wishlist({
      _id: new mongoose.Types.ObjectId(),
      userId: mongoose.Types.ObjectId(userId),
      itemId: mongoose.Types.ObjectId(itemId),
      CartItem: [mongoose.Types.ObjectId(itemId)], // Assuming itemId refers to Cart item ID
    });

    await wishlistItem.save();
    res.status(200).json({ message: "Item added to wishlist", wishlistItem });
  } catch (error) {
    res.status(500).json({ message: "Error adding to wishlist", error });
  }
});

// Get wishlist items by user ID
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const wishlistItems = await Wishlist.find({ userId }).populate('CartItem');
    res.status(200).json(wishlistItems);
  } catch (error) {
    res.status(500).json({ message: "Error fetching wishlist", error });
  }
});

// Delete a wishlist item by item ID
router.delete('/remove/:wishlistId', async (req, res) => {
  const { wishlistId } = req.params;

  if (!wishlistId) {
    return res.status(400).json({ message: 'Invalid wishlistId' });
  }

  try {
    const wishlistItem = await Wishlist.findByIdAndDelete(wishlistId);
    if (!wishlistItem) {
      return res.status(404).json({ message: 'Item not found in wishlist' });
    }

    res.status(200).json({ message: 'Item removed from wishlist' });
  } catch (error) {
    console.log('Error removing item:', error);
    res.status(500).json({ message: 'Error removing from wishlist', error });
  }
});

module.exports = router;
