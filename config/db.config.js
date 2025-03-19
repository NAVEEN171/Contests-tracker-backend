const mongoose = require("mongoose");
require("dotenv").config();

// Cache the connection object (not just the connection instance)
let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection) {
    console.log("Using cached connection");
    return cachedConnection;
  }

  try {
    // Explicitly create a new connection instead of using default
    const conn = await mongoose.createConnection(process.env.MONGO_DB_URL, {
      serverSelectionTimeoutMS: 30000, // 30 seconds (more conservative)
      socketTimeoutMS: 60000, // 60 seconds
      maxPoolSize: 10, // Recommended for production
      minPoolSize: 2,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false, // Critical for preventing buffering issues
    });

    console.log("MongoDB Connected");

    // Cache the entire connection object
    cachedConnection = conn;

    // Add error handling for connection drops
    conn.on("error", (err) => {
      console.error("MongoDB connection error:", err);
      cachedConnection = null; // Reset cache on error
    });

    return conn;
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
    cachedConnection = null; // Ensure cache is cleared on failure
    throw err; // Propagate error for proper handling
  }
};

const getConnection = async () => {
  if (!cachedConnection) {
    cachedConnection = await connectDB();
  }

  if (cachedConnection.readyState !== 1) {
    console.log("Reconnecting...");
    cachedConnection = null;
    cachedConnection = await connectDB();
  }

  return cachedConnection;
};

module.exports = {
  connectDB,
  getConnection,
};
