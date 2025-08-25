const express = require("express");
const session = require("express-session");
const mysql = require("mysql2");  // or "mysql" if you installed that
require("dotenv").config();

const app = express();

// 👉 Serve frontend files
app.use(express.static("public"));

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || "fallback_secret",
  resave: false,
  saveUninitialized: false
}));

// Default route (optional)
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html"); 
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ EasyMed server running on port ${PORT}`);
});
