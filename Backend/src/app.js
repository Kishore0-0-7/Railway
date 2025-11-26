const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

const adminRoutes = require("./routes/adminRoutes.js");
const workerRoutes = require("./routes/workerRoutes.js");
const workerBookingsRoutes = require("./routes/workerBookingsRoutes.js");
const bookingRoutes = require("./routes/bookingRoutes.js");
//const settingsRoutes = require("./routes/settingsRoutes.js");
const settingRoutes = require("./routes/settingRoutes.js");

const app = express();
const BODY_LIMIT = process.env.REQUEST_BODY_LIMIT || "5mb";

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:8080",
      "http://localhost:8081",
      "http://localhost:3000",
      "https://railway.artechnology.pro",
      "*",
    ],
    credentials: true,
  })
);
// Allow larger payloads for settings updates while keeping a configurable ceiling.
app.use(express.json({ limit: BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: BODY_LIMIT }));
app.use(cookieParser());
app.set("trust proxy", 1);

// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/admin", adminRoutes);
app.use("/api/worker", workerRoutes);
app.use("/api/bookings", workerBookingsRoutes);
app.use("/api/analytics", bookingRoutes);
//app.use("/api/settings", settingsRoutes);
app.use("/api/setting", settingRoutes);
app.use("/api/settings", settingRoutes);

module.exports = app;
