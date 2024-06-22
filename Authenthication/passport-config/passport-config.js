// Import necessary modules
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../Model/UserModel'); // Assuming you have a User model

// Function to generate JWT token
function generateToken(user) {
    return jwt.sign(
        {
            id: user.id,
            role: user.role,
            username: user.username,
            email: user.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );
}

// Function to generate refresh token
function generateRefreshToken(user) {
    return jwt.sign(
        {
            id: user.id,
            role: user.role,
            username: user.username,
            email: user.email,
        },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
    );
}

// Local strategy for signup (username/password authentication)
passport.use(
    "signup",
    new LocalStrategy(
        {
            usernameField: "usernameOrEmail",
            passwordField: "password",
            passReqToCallback: true,
        },
        async (req, usernameOrEmail, password, done) => {
            try {
                const existingUser = await User.findOne({
                    $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
                });
                if (existingUser) {
                    return done(null, false, { message: "Username or email already in use" });
                }

                const hashedPassword = await bcrypt.hash(password, 10);

                const newUser = new User({
                    username: req.body.usernameOrEmail,
                    email: req.body.usernameOrEmail,
                    password: hashedPassword,
                    role: "user",
                });

                newUser.token = generateToken(newUser);
                newUser.refreshToken = generateRefreshToken(newUser);
                await newUser.save();

                return done(null, newUser);
            } catch (error) {
                return done(error);
            }
        }
    )
);

// Local strategy for login (username/password authentication)
passport.use(
    "login",
    new LocalStrategy(
        {
            usernameField: "usernameOrEmail",
            passwordField: "password",
        },
        async (usernameOrEmail, password, done) => {
            try {
                const user = await User.findOne({
                    $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
                });
                if (!user) {
                    return done(null, false, { message: "User not found" });
                }

                if (user.status === "inactive" || user.status === "suspended") {
                    return done(null, false, { message: "User is inactive or suspended" });
                }

                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return done(null, false, { message: "Incorrect password" });
                }

                const token = generateToken(user);
                const refreshToken = generateRefreshToken(user);
                user.token = token;
                user.refreshToken = refreshToken;
                await user.save();

                return done(null, user, { token, refreshToken });
            } catch (error) {
                return done(error);
            }
        }
    )
);

// JWT strategy for authentication
const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
};

passport.use(
    "jwt",
    new JWTStrategy(opts, async (jwt_payload, done) => {
        try {
            const user = await User.findById(jwt_payload.id);
            if (user && user.status !== "inactive" && user.status !== "suspended") {
                return done(null, user);
            } else {
                return done(null, false);
            }
        } catch (error) {
            return done(error, false);
        }
    })
);

// Serialize and deserialize user for session management
passport.serializeUser((user, cb) => {
    cb(null, user.id);
});

passport.deserializeUser(async (id, cb) => {
    try {
        const user = await User.findById(id);
        cb(null, user);
    } catch (err) {
        cb(err);
    }
});

module.exports = passport;
