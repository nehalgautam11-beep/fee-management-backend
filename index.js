require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const studentRoutes = require("./routes/studentRoutes");
const authRoutes = require("./routes/authRoutes");
const reportRoutes = require("./routes/reportRoutes");
const logRoutes = require("./routes/logRoutes");
const extraFeeRoutes = require("./routes/extraFeeRoutes");
let dbReady = false;


const app = express();

/* =======================
   BASIC SECURITY
======================= */
app.use(helmet());

/* =======================
   CORS (ALLOW ALL LOCALHOST PORTS)
======================= */
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

/* =======================
   BODY PARSERS (VERY IMPORTANT: BEFORE RATE LIMIT)
======================= */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* =======================
   RATE LIMITING (AFTER BODY PARSER)
======================= */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100
});

app.use(limiter);

app.use((req, res, next) => {
  if (!dbReady) {
    return res.status(503).json({
      message: "Database not ready. Please retry in a moment.",
    });
  }
  next();
});


/* =======================
   ROUTES
======================= */
app.use("/auth", authRoutes);
app.use("/students", studentRoutes);
app.use("/reports", reportRoutes);
app.use("/logs", logRoutes);
app.use("/extra-fees", extraFeeRoutes);

/* =======================
   HEALTH CHECKS
======================= */
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Global Innovative School ERP API",
    version: "1.0.0",
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/* =======================
   404 HANDLER
======================= */
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/* =======================
   GLOBAL ERROR HANDLER
======================= */
app.use((err, req, res, next) => {
  console.error("🔥 GLOBAL ERROR:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

/* =======================
   MONGODB CONNECTION
======================= */
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: "school_erp_db",
  })
  .then(() => {
    dbReady = true;
    console.log("✅ MongoDB Connected Successfully");
  })

  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

mongoose.connection.on("connected", () => {
  console.log("🟢 MongoDB connected / reconnected");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB error:", err);
});

mongoose.connection.on("disconnected", () => {
  dbReady = false;
  console.warn("⚠️ MongoDB disconnected");
});


/* =======================
   SERVER
======================= */
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
});

/* =======================
   GRACEFUL SHUTDOWN
======================= */
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down...");
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log("MongoDB connection closed");
      process.exit(0);
    });
  });
});

module.exports = app;
