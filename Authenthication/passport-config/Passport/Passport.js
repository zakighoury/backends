const express = require("express");
const router = express.Router();
const passport = require("../passport-config");
const User = require("../../Model/UserModel");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const path = require("path");
const fs = require("fs");
const { url } = require("inspector");

cloudinary.config({
  cloud_name: "dzn3h2a8s",
  api_key: "231785248897111",
  api_secret: "a78V1evJKqo6HkBVMZja-O7UA6w",
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });
// Route for user signup using local strategy
router.post("/signup", passport.authenticate("signup"), (req, res) => {
  res.json({ message: "Signup successful", user: req.user });
});

// Route for user login using local strategy
router.post("/login", passport.authenticate("login"), (req, res) => {
  res.json({ message: "Login successful", user: req.user });
});

router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // This route is protected by JWT authentication
    res.json({ message: "JWT get strategy test successful", user: req.user });
  }
);

router.post("/profile", (req, res) => {
  const user = req.body.user;
  res.json({ message: "JWT post strategy test successful", user });
  console.log(user);
});

router.get("/logout", (req, res) => {
  req.logout();
  res.json({ message: "Logout successful" });
});
router.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).send(err.message);
  }
});
router.delete("/api/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Endpoint to edit a user
router.put("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(user);
  } catch (err) {
    res.status(500).send(err.message);
  }
});
router.patch("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.body.status) {
      user.status = req.body.status;
    }

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Update profile route
router.put(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const updates = req.body;
      Object.keys(updates).forEach((key) => {
        user[key] = updates[key];
      });

      await user.save();
      res.json({ message: "Profile updated successfully", user });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.post(
  "/upload-avatar",
  passport.authenticate("jwt", { session: false }),
  upload.single("avatar"),
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const result = await cloudinary.uploader.upload(req.file.path);
      user.avatar = result.secure_url;
      await user.save();
      console.log(user);
      // Remove the file from the server after uploading to Cloudinary
      // fs.unlinkSync(req.file.path);
      res.status(200).json({ message: "Avatar uploaded successfully", url: result.secure_url });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
