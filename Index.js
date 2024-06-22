const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
require("dotenv").config();
const passport = require("./Authenthication/passport-config/passport-config");
const passportRoutes = require("./Authenthication/passport-config/Passport/Passport");
const OrderRoutes = require("./Route/OrderStripe");
const OrderGetRoutes = require("./Route/OrderGet");
const wishlistRouter = require("./Route/WishlistRoute");
const CartRouter = require("./Route/CartRoute");
const adminRouter = require("./Admin/AdminLogin/AdminController/AdminController");
const mailRouter = require("./Authenthication/NodeMailer/NodeMailer");
const refreshTokenRouter = require("./Authenthication/passport-config/RefreshToken/RefreshToken");
const connectToMongoDB = require("./DB/Database/db");
const cookieParser = require("cookie-parser");

const app = express();
const port = process.env.PORT || 5002;

app.use(
  session({
    secret: process.env.JWT_SECRET, // Add a secret key for session encryption
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser("secret"));
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Define your routes
app.use("/", mailRouter);
app.use("/admin", adminRouter);
app.use("/", passportRoutes);
app.use("/", CartRouter);
app.use("/", OrderRoutes);
app.use("/", OrderGetRoutes);
app.use("/api/wishlist", wishlistRouter);

// Connect to MongoDB and start server
connectToMongoDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
