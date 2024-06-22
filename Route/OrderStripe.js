
const express = require("express");
const bodyParser = require("body-parser");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const Order = require("../Authenthication/Model/OrderModal");
const PendingOrder = require("../Authenthication/Model/PendingOrder");

// Middleware to parse JSON bodies
router.use(bodyParser.json());

const endpointSecret = "whsec_d2967b8f2dd4bf87ead55523875cbc8fcf5edcb4f89187ac4641cbe5f741b8eb";

// Create Stripe checkout session
router.post("/create-checkout-session", async (req, res) => {
  const { userId, cartItems } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: cartItems.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            description: item.description,
            images: [item.ImgUrl],
          },
          unit_amount: item.price * 100, // Convert to cents
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
      metadata: {
        userId: userId,
      },

    });
    const OrderObj = {
      userId,
      cartItems,
      sessionId: session.id,
    }
    const pendingOrd = await new PendingOrder(OrderObj).save()
    console.log("🚀 ~ router.post ~ session:", session)
    res.json({ id: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook endpoint to handle Stripe events
router.post(
  "/webhook",
  async (req, res) => {

    const event = req.body;
    console.log("🚀 ~ event:", event)

    try {
      switch (event.type) {
        case "payment_intent.succeeded":
          const session = event.data.object;

          const pendingOrder = await PendingOrder.find({ sessionId: session.id })

          const OrderObj = {
            userId: pendingOrder.userId,
            cartItems: pendingOrder.cartItems,
            paymentStatus: "succeed"
          }

          // const order = await new Order(OrderObj).save()
          // console.log("🚀 ~ order:", order)


          break;

        case "payment_intent.payment_failed":
          const paymentFailure = event.data.object;
          console.log(`PaymentIntent failed: ${paymentFailure.id}`);
          const session2 = event.data.object;
          console.log(`Checkout session was successful: ${session.id}`);


          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
      }
    } catch (error) {

    }

    res.json({ received: true });
  }
);

module.exports = router;
