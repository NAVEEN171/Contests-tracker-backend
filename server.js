const express = require("express");
const bodyParser = require("body-parser");
const app = express();
require("dotenv").config();
const cors = require("cors");
app.use(bodyParser.json());
const apiRoutes = require("./routes/api");
const { getConnection, connectDB } = require("./config/db.config");

app.use(
  cors({
    origin: ["http://localhost:5173", "https://contests-tracker-nu.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.json("deployed succesfully");
});

app.use("/api", apiRoutes);

// Connect to MongoDB before starting the server
const startServer = async () => {
  try {
    await connectDB(); // Await the connection to ensure it's established
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
};

startServer();

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
