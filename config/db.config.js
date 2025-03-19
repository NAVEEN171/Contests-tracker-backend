const mongoose = require("mongoose");
require("dotenv").config();

let cachedConnection = null;

const connectDB = async () => {
  // If there is already a cached connection and it's active, reuse it
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log("Using existing connection");
    return cachedConnection;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_DB_URL, {
      bufferCommands: true, // Enable command buffering
      serverSelectionTimeoutMS: 30000, // Timeout for server selection
      socketTimeoutMS: 60000, // Timeout for socket operations
      maxPoolSize: 10, // Maximum number of connections in the pool
      minPoolSize: 2, // Minimum number of connections in the pool
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB Connected");
    cachedConnection = conn.connection; // Cache the connection object
    return cachedConnection;
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
    throw err; // Propagate error for proper handling
  }
};

const getConnection = async () => {
  // Check if there is an existing cached connection and it's active
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log("Using cached connection");
    return cachedConnection;
  }

  console.log("Creating new connection");
  return await connectDB(); // Establish a new connection if needed
};

module.exports = {
  connectDB,
  getConnection,
};
