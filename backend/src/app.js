const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const memoryRoutes = require("./routes/memoryRoutes");
const creationRoutes = require("./routes/creationRoutes");
const socialRoutes = require("./routes/socialRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const publicRoutes = require("./routes/publicRoutes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((v) => v.trim()).filter(Boolean)
  : [];

app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || !allowedOrigins.length || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Origine CORS non autorisée: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json({ limit: "3mb" }));
app.use(express.urlencoded({ extended: true, limit: "3mb" }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 80,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, message: "Trop de tentatives. Réessayez dans quelques minutes." },
});
app.use("/api/auth", authLimiter);

app.use("/uploads", express.static(path.join(__dirname, "uploads"), { maxAge: "1h", immutable: false }));
app.get("/api/health", (req, res) => res.json({ success: true, message: "RE:START API fonctionne" }));
app.use("/api/public", publicRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/memories", memoryRoutes);
app.use("/api", creationRoutes);
app.use("/api", socialRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/conversations", conversationRoutes);
app.use((req, res) => res.status(404).json({ success: false, message: "Route introuvable." }));
app.use(errorHandler);
module.exports = app;
