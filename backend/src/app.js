const express = require("express");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const memoryRoutes = require("./routes/memoryRoutes");
const creationRoutes = require("./routes/creationRoutes");
const socialRoutes = require("./routes/socialRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",").map(v => v.trim()) : "*",
  credentials: true,
}));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => res.json({ success: true, message: "RE:START API fonctionne" }));
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
