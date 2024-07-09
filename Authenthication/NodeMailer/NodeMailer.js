const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../Model/UserModel");
const transporter = require("./transporter");
const { generateOTP, generateOTPToken, verifyOTPToken } = require("./otpService");

const JWT_SECRET = process.env.JWT_SECRET; // Ensure you set this in your .env file

// Endpoint for initiating password reset
router.post("/api/reset-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate OTP
    const otp = generateOTP();
    console.log(otp); // Log OTP for testing purposes, remove in production

    // Generate a token with the OTP and user ID
    const otpToken = generateOTPToken(otp, user._id, JWT_SECRET);

    // Send OTP via email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "OTP sent to your email", userId: user._id, otpToken });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/reset-password/verify-otp", async (req, res) => {
  const { userId, otpToken, otp } = req.body;

  try {
    // Verify OTP token
    const decoded = verifyOTPToken(otpToken, JWT_SECRET);
    if (!decoded || decoded.userId !== userId || decoded.otp !== otp) {
      return res.status(401).json({ success: false, message: "Invalid or expired OTP" });
    }

    // Find user by userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Generate a token for resetting password
    const resetToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ success: true, message: "OTP verified", token: resetToken });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/reset-password/new-password", async (req, res) => {
  const { newPassword, token } = req.body;

  try {
    // Verify and decode the reset token
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    // Find user by userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update user's password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Error:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ success: false, message: "Token has expired" });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
