const express = require("express");
const bodyParser = require("body-parser");
const app = express();
require("dotenv").config();
const cors = require("cors");
app.use(bodyParser.json());
const apiRoutes = require("./routes/api");
const { getConnection, connectDB } = require("./config/db.config");

app.use(cors());

app.get("/", (req, res) => {
  res.json("deployed succesfully");
});

app.use("/api", apiRoutes);

const connection = connectDB();

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
