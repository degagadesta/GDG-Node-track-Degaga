const express = require("express");
const cors = require("cors");

const userRoutes = require("./routes/userRoutes"); 
const productRoutes = require("./routes/productRoutes"); 

const app = express(); 


app.use(cors()); 
app.use(express.json()); 


app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);


app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "success", message: "Server is running" });
});


app.use((req, res, next) => {
  res.status(404).json({ status: "fail", message: "Route not found" });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
