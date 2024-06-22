// db.js (or any other file for database connection)

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const connectToMongoDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(error);
  }
};

module.exports = connectToMongoDB;
