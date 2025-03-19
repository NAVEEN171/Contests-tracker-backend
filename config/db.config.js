const mongoose = require("mongoose");
require("dotenv").config();

let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log("Using existing connection");
    return cachedConnection;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000,
    });

    console.log("MongoDB Connected");
    cachedConnection = conn.connection;
    return cachedConnection;
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
  }
};

const getConnection = async () => {
  if (!cachedConnection || mongoose.connection.readyState !== 1) {
    await connectDB();
  }
  return cachedConnection || mongoose.connection;
};

module.exports = {
  connectDB,
  getConnection,
};
