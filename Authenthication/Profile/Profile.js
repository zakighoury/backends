// // routes/auth.js
// const express = require('express');
// const passport = require('./stragy/ProfileStragy');
// const User = require('../../User/UserModel');
// const router = express.Router();

// // ...

// // Add a new route for the user's profile
// router.get('/profile', passport.authenticate( { session: false }), (req, res, next) => {
//   // Find the user using the decoded token's payload
//   User.findById(req.user.id, (err, user) => {
//     if (err) {
//       return res.status(500).json({ message: 'An error occurred while retrieving the user.' });
//     }
//     if (!user) {
//       return res.status(404).json({ message: 'User not found.' });
//     }

//     // Send the user information back to the client
//     res.json({ message: 'JWT strategy test successful', user: user });
//   });
// });

// module.exports = router;