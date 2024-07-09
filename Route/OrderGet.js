const express = require("express");
const bodyParser = require("body-parser");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../Authenthication/Model/OrderModal");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

async function retrieveProductData(productId) {
  try {
    const product = await stripe.products.retrieve(productId);
    return product;
  } catch (error) {
    console.error(`Error retrieving product ${productId}:`, error);
    return null;
  }
}

// Retrieve payment intents
router.get("/payment-intents", async (req, res) => {
  try {
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 8, // Limit to 8 payment intents
    });
    const detailedIntents = await Promise.all(
      paymentIntents.data.map(async (intent) => {
        if (intent.payment_method) {
          try {
            const paymentMethod = await stripe.paymentMethods.retrieve(intent.payment_method);
            const charges = await stripe.charges.list({
              payment_intent: intent.id,
              limit: 1
            });

            const receiptUrl = charges.data[0]?.receipt_url || null;

            // Retrieve product data from metadata
            const metadata = charges.data[0]?.metadata;

            return {
              ...intent,
              payment_method_details: paymentMethod,
              receipt_url: receiptUrl,
            };
          } catch (error) {
            console.error(`Error retrieving payment method ${intent.payment_method}:`, error);
            return intent;
          }
        } else {
          return intent;
        }
      })
    );

    res.json({ paymentIntents: detailedIntents });
    console.log(detailedIntents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
