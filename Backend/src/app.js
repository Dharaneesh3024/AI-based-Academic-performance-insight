const express=require("express");
const mongoose=require("mongoose");
const cors=require("cors");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const app = express();
app.use(cors());
app.use(express.json());
// Routes
app.use("/api/auth", authRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

module.exports = app;