const mongoose = require("mongoose");

// Define the user schema
const userSchema = new mongoose.Schema({
  avatar: {
    type: String,
    default:
      "https://cdn0.iconfinder.com/data/icons/3d-items/512/Accountavatarperson.png",
  },
  username: String,
  email: String,
  password: String,
  token: String,
  role: {
    type: String,
    default: "user",
    enum: ["user", "admin"],
  },
  status: { type: String, default: "active", enum: ["active", "inactive","suspended"] },
  token: { type: String },
  refreshToken: { type: String },
  resetOtp: { type: String },
  
});

// Create the User model
const User = mongoose.model("User", userSchema);

module.exports = User;
