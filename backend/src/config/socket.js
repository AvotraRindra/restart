const jwt = require("jsonwebtoken");
const db = require("./db");
const socketService = require("../services/socketService");

function configureSocket(io) {
  socketService.setIO(io);

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Token manquant."));
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = { id: Number(payload.id) };
      next();
    } catch (error) {
      next(new Error("Token invalide."));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.user.id}`);

    socket.on("conversation:join", async ({ conversationId }, ack) => {
      try {
        const [rows] = await db.execute(
          `SELECT 1 FROM conversation_members WHERE conversation_id = ? AND user_id = ? LIMIT 1`,
          [conversationId, socket.user.id],
        );
        if (!rows.length)
          return ack?.({ success: false, message: "Acces refuse." });
        socket.join(`conversation:${conversationId}`);
        ack?.({ success: true });
      } catch (error) {
        ack?.({ success: false, message: error.message });
      }
    });

    socket.on("conversation:leave", ({ conversationId }) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on("typing:start", ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit("typing:start", {
        conversationId,
        userId: socket.user.id,
      });
    });

    socket.on("typing:stop", ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit("typing:stop", {
        conversationId,
        userId: socket.user.id,
      });
    });
  });
}

module.exports = configureSocket;
