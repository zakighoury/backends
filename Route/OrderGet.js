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



// router.post('/orders', async (req, res) => {
//   const newOrder = {
//     id: `order_${uuidv4()}`,
//     ...req.body,
//     created: new Date()
//   };

//   try {
//     const createdOrder = await Order.create(newOrder);
//     res.status(200).json(createdOrder);
//   } catch (error) {
//     console.error('Error creating order:', error);
//     res.status(500).json({ message: 'Error creating order' });
//   }
// });
// // Update payment intent
// router.put("/payment-intents/:id", async (req, res) => {
//   const { id } = req.params;
//   const { amount, currency, status } = req.body;

//   try {
//     const updatedIntent = await stripe.paymentIntents.update(id, {
//       amount: amount * 100, // converting to cents
//       currency: currency,
//       metadata: { status: status }, // assuming status is a custom metadata
//     });

//     res.json({ paymentIntent: updatedIntent });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

module.exports = router;
