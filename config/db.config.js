const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URL, {
      w: "majority",
      serverSelectionTimeoutMS: 15000, // Increase timeout to 15 seconds
      socketTimeoutMS: 45000, // Increase socket timeout
      connectTimeoutMS: 15000, // Increase connection timeout
      maxPoolSize: 10, // For serverless, keep pool size modest
      minPoolSize: 0,
    });
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  }
};

const getConnection = () => mongoose.connection;

module.exports = { connectDB, getConnection };
