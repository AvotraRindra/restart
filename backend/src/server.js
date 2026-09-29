require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const db = require("./config/db");
const configureSocket = require("./config/socket");

async function start() {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET manquante dans .env");
  await db.query("SELECT 1");
  console.log("MySQL connecte.");
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",").map(v => v.trim()) : "*",
      credentials: true,
    },
  });
  configureSocket(io);
  const port = Number(process.env.PORT || 5000);
  server.listen(port, "0.0.0.0", () => console.log(`RE:START API + Socket.IO : http://localhost:${port}`));
}

start().catch((error) => {
  console.error("Impossible de demarrer RE:START :");
  console.error(error);
  process.exit(1);
});
