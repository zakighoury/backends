const Wishlist = require('../Authenthication/Model/Wishlist');

// Add item to wishlist
exports.addToWishlist = async (req, res) => {
  const { userId, itemId } = req.body;

  try {
    // Check if item already exists in the wishlist
    const existingItem = await Wishlist.findOne({ userId, itemId });
    if (existingItem) {
      return res.status(400).json({ message: 'Item already in wishlist' });
    }

    const wishlistItem = new Wishlist({ userId, itemId });
    await wishlistItem.save();

    res.status(200).json({ message: 'Item added to wishlist' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Remove item from wishlist
exports.removeFromWishlist = async (req, res) => {
  const { userId, itemId } = req.body;

  try {
    await Wishlist.findOneAndDelete({ userId, itemId });

    res.status(200).json({ message: 'Item removed from wishlist' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get wishlist items for a user
exports.getWishlist = async (req, res) => {
  const { userId } = req.params;

  try {
    const wishlist = await Wishlist.find({ userId }).populate('itemId');
    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
// controllers/wishlistController.js

// Add item to wishlist
exports.addToWishlist = async (req, res) => {
  const { userId, itemId } = req.body;

  try {
    // Check if item already exists in the wishlist
    const existingItem = await Wishlist.findOne({ userId, itemId });
    if (existingItem) {
      return res.status(400).json({ message: 'Item already in wishlist' });
    }

    const wishlistItem = new Wishlist({ userId, itemId });
    await wishlistItem.save();

    res.status(200).json({ message: 'Item added to wishlist' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Remove item from wishlist
exports.removeFromWishlist = async (req, res) => {
  const { userId, itemId } = req.body;

  try {
    await Wishlist.findOneAndDelete({ userId, itemId });

    res.status(200).json({ message: 'Item removed from wishlist' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get wishlist items for a user
exports.getWishlist = async (req, res) => {
  const { userId } = req.params;

  try {
    const wishlist = await Wishlist.find({ userId }).populate('itemId');
    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
