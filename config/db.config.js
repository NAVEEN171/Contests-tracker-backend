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
      w: "majority",
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 15000,
      maxPoolSize: 10,
      minPoolSize: 0,
    });

    console.log("MongoDB Connected");
    cachedConnection = conn.connection;
    return cachedConnection;
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
    throw err;
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
