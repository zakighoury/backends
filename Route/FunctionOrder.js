
// const fulfillOrder = async () => {
//   const { userId,sessionId,cartItems } = req.body;
//   const order = new Order({
//     userId: userId,
//     sessionId: sessionId,
//     paymentStatus: "succeeded",
//     cartItems: JSON.parse(cartItems),
//   });

//   try {
//     await order.save();
//     console.log(`Order ${session.id} saved successfully`);
//   } catch (err) {
//     console.error("Error saving order:", err);
//   }
// };

// module.exports = fulfillOrder;
