const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../../Model/UserModel');
const { generateToken, generateRefreshToken } = require('../passport-config'); // Import your token functions

const verifyRefreshToken = (req, res, next) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(403).json({ message: "Refresh token is required" });
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }

        const user = await User.findById(decoded.id);
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }

        req.user = user;
        next();
    });
};

router.post('/refresh-token', verifyRefreshToken, (req, res) => {
    const user = req.user;
    const newToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.token = newToken;
    user.refreshToken = newRefreshToken;
    console.log(token, 'token');
    console.log(newRefreshToken, 'refreshtoken');

    user.save();
    console.log(user, "user")
    res.json({ token: newToken, refreshToken: newRefreshToken });
});

module.exports = router;
