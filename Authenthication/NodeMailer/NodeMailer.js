const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../Model/UserModel");
const transporter = require("./transporter");

const JWT_SECRET = process.env.JWT_SECRET; // Ensure you set this in your .env file

// Endpoint for initiating password reset
router.post("/reset-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a token with a short expiration time
    const token = jwt.sign({ email, userId: user._id }, JWT_SECRET, { expiresIn: "1h" });

    // Create reset link
    const resetLink = `http://localhost:3000/reset-password/verify-token/${user._id}/${token}`;
    console.log(resetLink);

    // Send reset link via email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Link",
      text: `Click the following link to reset your password: ${resetLink}`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Password reset link sent to your email" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Endpoint for verifying token and resetting password
router.post("/reset-password/verify-token/:userId/:token", async (req, res) => {
  const { userId, token } = req.params;
  const { newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.userId !== userId) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log(hashedPassword);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Error:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Token has expired" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
