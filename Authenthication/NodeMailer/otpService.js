// otpUtils.js
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

const generateOTPToken = (otp, userId) => {
    return jwt.sign({ otp, userId }, JWT_SECRET, { expiresIn: "10m" }); // OTP expires in 10 minutes
};

const verifyOTPToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

module.exports = {
    generateOTP,
    generateOTPToken,
    verifyOTPToken,
};
