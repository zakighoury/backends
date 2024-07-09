const express = require("express");
const bodyParser = require("body-parser");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const Order = require("../Authenthication/Model/OrderModal");
const PendingOrder = require("../Authenthication/Model/PendingOrder");

// Middleware to parse JSON bodies
router.use(bodyParser.json());

// Create Stripe checkout session
router.post("/create-checkout-session", async (req, res) => {
  const { userId, email, cartItems, shippingAddress } = req.body;

  try {
    // Create products and prices dynamically on Stripe
    const lineItems = await Promise.all(
      cartItems.map(async (item) => {
        const product = await stripe.products.create({
          name: item.name,
          description: item.description,
          images: [item.ImgUrl],
        });

        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: item.price * 100, // Convert to cents
          currency: "usd",
        });

        return {
          price: price.id,
          quantity: item.quantity,
        };
      })
    );

    // Check if coupon already exists
    let couponList = await stripe.coupons.list({ limit: 1 });
    let coupon = couponList.data.length
      ? couponList.data[0]
      : await stripe.coupons.create({
        percent_off: 20,
        max_redemptions: 50,
      });

    // Check if promotion code already exists
    let promotionCodeList = await stripe.promotionCodes.list({ limit: 1 });
    let promotionCode = promotionCodeList.data.length
      ? promotionCodeList.data[0]
      : await stripe.promotionCodes.create({
        coupon: coupon.id,
        max_redemptions: 20,
      });

    // Create or retrieve a Stripe customer
    let customer = await stripe.customers.list({ email, limit: 1 });
    customer = customer.data.length
      ? customer.data[0]
      : await stripe.customers.create({ email });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
      customer: customer.id,
      allow_promotion_codes: true,
      shipping_address_collection: { allowed_countries: ["US", "CA"] },
    });
    const OrderObj = {
      userId,
      cartItems: cartItems.map((item) => ({
        productDetails: {
          name: item.name,
          price: item.price,
          ImgUrl: item.ImgUrl,
        },
        quantity: item.quantity,
        amount: cartItems.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        ),
      })),
      sessionId: session.id,
      customerId: customer.id,
    };

    await new PendingOrder(OrderObj).save();
    console.log("Session created:", OrderObj);
    res.json({ id: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: error.message });
  }
});
router.post(
  "/webhookk",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    let event = req.body;
    try {
      switch (event.type) {
        case "charge.updated": {
          const session = event.data.object;

          // Find the pending order
          const pendingOrder = await PendingOrder.findOne({
            customerId: session.customer,
          });

          if (pendingOrder) {
            const amount = pendingOrder.cartItems.reduce(
              (total, item) => total + item.productDetails.price * item.quantity,
              0
            );
            const OrderObj = {
              customerId:session.customer,
              userId:pendingOrder.userId,
              cartItems: pendingOrder.cartItems,
              amount: amount,
              paymentStatus: "succeeded",
              payment: {
                cardType: session.payment_method_details.card.brand,
                brand: session.payment_method_details.type,
                last4: session.payment_method_details.card.last4,
                exp_month: session.payment_method_details.card.exp_month,
                exp_year: session.payment_method_details.card.exp_year,
                country: session.payment_method_details.card.country,
                imageUrl:
                  session.payment_method_details.card.brand === "visa"
                    ? "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/1200px-Visa_Inc._logo.svg.png"
                    : session.payment_method_details.card.brand === "mastercard"
                      ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSoPXuA0BFfgjEKfl2QnL4YN8CIUIDrL6EO0A&s"
                      : session.payment_method_details.card.brand === "jcb"
                        ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBjpvE0FBfXQKB2dX6kZmgj_QqIhAAb31VuA&s"
                        : session.payment_method_details.card.brand === "discover"
                          ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0GK-orUHwcn2GCeV6Gx19x5kP7wtYPz16Pw&s"
                          : session.payment_method_details.card.brand === "amex"
                            ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNwk3UTLDWMD1ztUBVvUcgqgLpD8NOVJPiig&s"
                            : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQN1evlHq4awm4ad_JIY1u3ibleMP6QtLI4-g&s",
              },
              shipping_address: {
                address_line_1: session.shipping.address.line1,
                address_line_2: session.shipping.address.line2,
                city: session.shipping.address.city,
                state: session.shipping.address.state,
                country: session.shipping.address.country,
                pincode: session.shipping.address.postal_code,
                phone: session.shipping.phone,
              },
              billing_address: {
                address_line_1: session.billing_details.address.line1,
                address_line_2: session.billing_details.address.line2,
                city: session.billing_details.address.city,
                state: session.billing_details.address.state,
                country: session.billing_details.address.country,
                pincode: session.billing_details.address.postal_code,
                phone: session.billing_details.phone,
                email: session.billing_details.email,
                name: session.billing_details.name,
              },
            };

            const order = await new Order(OrderObj).save();
            console.log("🚀 Order saved:", order);
          } else {
            console.log("Pending order not found", session.id);
          }
          break;
        }

        default:
          console.log(`Unhandled event type ${event.type}`);
      }
    } catch (error) {
      console.error(`Webhook handler failed: ${error}`);
      return res.status(500).json({ error: "Webhook handler failed" });
    }

    res.json({ received: true });
  }
);

router.get("/pending-orders", async (req, res) => {
  try {
    const Pending = await PendingOrder.find({ orderStatus: "Order Placed" });
    res.json({ Pending });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
});
module.exports = router;
