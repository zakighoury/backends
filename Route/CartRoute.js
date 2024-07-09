const express = require("express");
const router = express.Router();
const multer = require("multer");
const Cart = require("../Authenthication/Model/CartModel");
const CartItem = require("../Authenthication/Model/CartItemModel");
const Order = require("../Authenthication/Model/OrderModal");
const cloudinary = require("cloudinary").v2;
const { v4: uuidv4 } = require("uuid");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

cloudinary.config({
  cloud_name: "dzn3h2a8s",
  api_key: "231785248897111",
  api_secret: "a78V1evJKqo6HkBVMZja-O7UA6w",
});

const upload = multer({ storage });

router.post("/api/cart", upload.single("ImgUrl"), async (req, res) => {
  const {
    category,
    subcategory,
    color,
    size,
    dressingStyle,
    title,
    name,
    price,
    quantity,
    description,
    brand,
    shipping,
    rating,
  } = req.body;

  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    console.log("Cloudinary result:", result);

    const newItem = new Cart({
      ImgUrl: result.secure_url,
      category,
      subcategory,
      color,
      size,
      dressingStyle,
      title,
      name,
      price,
      quantity,
      description,
      brand,
      shipping,
      rating,
    });

    await newItem.save();
    res.status(201).json({ message: "Item added to cart successfully" });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/api/cart", async (req, res) => {
  try {
    const cartItems = await Cart.find();
    res.json(cartItems);
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({ message: "Server Error" });
  }
});
router.get("/api/cart/:id", async (req, res) => {
  try {
    const cartItem = await Cart.findById(req.params.id); // Changed variable name to cartItem
    if (!cartItem) {
      return res.status(404).send("Product not found");
    }
    res.json(cartItem);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});
router.post("/cart/add", async (req, res) => {
  try {
    const { userId, productDetails, quantity } = req.body;

    // Create a new cart item
    const newCartItem = new CartItem({
      userId,
      productDetails,
      quantity,
    });

    // Save the new cart item to the database
    await newCartItem.save();
    // console.log(newCartItem, "CartitemNew")
    res.status(200).json({ message: "Item added to cart successfully!" });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res
      .status(500)
      .json({ message: "Error adding item to cart. Please try again." });
  }
});

router.get("/Cart/items/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const cartItems = await CartItem.find({ userId }).populate({
      path: "Cart",
      strictPopulate: false,
    });
    // console.log("Cart items:", cartItems);
    res.json({ items: cartItems });
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).send("Server Error");
  }
});

router.delete("/cart/items/:userId/:itemId", async (req, res) => {
  try {
    await CartItem.deleteOne({
      userId: req.params.userId,
      _id: req.params.itemId,
    });
    res.json({ message: "Item deleted successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.put("/api/cart/:id", async (req, res) => {
  const { id } = req.params;
  const { name, price, quantity,color,size,category,subcategory } = req.body;

  try {
    const updatedItem = await Cart.findByIdAndUpdate(
      id,
      { name, price, quantity,color,size,category,subcategory },
      { new: true }
    );
    res.json(updatedItem);
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Delete an item from the cart
router.delete("/api/cart/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await Cart.findByIdAndDelete(id);
    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// router.post("/api/orders", async (req, res) => {
//   try {
//     const {
//       userId,
//       cartItems,
//       subtotal,
//       shippingCost,
//       grandTotal,
//       coupon,
//       discount,
//       billingDetails,
//       shippingAddress,
//       shippingMethod,
//       paymentMethod,
//       orderStatus,
//       paymentDetails,
//     } = req.body;
//     const orderNumber = uuidv4();
//     const newOrder = new Order({
//       userId,
//       cartItems,
//       subtotal,
//       shippingCost,
//       grandTotal,
//       coupon,
//       discount,
//       billingDetails,
//       shippingAddress,
//       shippingMethod,
//       paymentMethod,
//       orderNumber,
//       orderStatus,
//       paymentDetails,
//     });
//     newOrder.calculateEstimatedDeliveryDate();
//     await newOrder.save();
//     console.log(newOrder);
//     res.status(200).json({ message: "Order placed successfully!" });
//   } catch (error) {
//     console.error("Error placing order:", error);
//     res
//       .status(500)
//       .json({ message: "Failed to place order. Please try again." });
//   }
// });
router.get("/api/orders/all", async (req, res) => {
  try {
    const orders = await Order.find();
    if (!orders) {
      return res
        .status(404)
        .json({ message: "No orders found for this user." });
    }
    res.status(200).json({ orders, message: "Orders fetched successfully!" });
    console.log(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router.put('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedOrder = await Order.findByIdAndUpdate(id, updateData, { new: true });
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error });
  }
});
router.get("/api/orders/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const orders = await Order.find({ userId });
    if (!orders) {
      return res
        .status(404)
        .json({ message: "No orders found for this user." });
    }
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router.route("/api/orders/:userId/:orderId").get(async (req, res) => {
  try {
    const { userId, orderId } = req.params;
    // Find the order by orderId and ensure it belongs to the userId
    const order = await Order.findOne({ _id: orderId, userId: userId });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
    console.log(order);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
router.delete("/api/orders/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    await Order.findByIdAndDelete(orderId);
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete order", error });
  }
});
router.delete("/:orderId/products/:productId", async (req, res) => {
  const { orderId, productId } = req.params;

  try {
    // Find the order by ID
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Filter out the product with the specified productId
    order.cartItems = order.cartItems.filter(
      (item) => item._id.toString() !== productId
    );

    // Save the updated order
    await order.save();

    res
      .status(200)
      .json({ message: "Product removed from order successfully", order });
  } catch (error) {
    console.error("Error removing product from order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
module.exports = router;
