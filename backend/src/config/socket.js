const jwt = require("jsonwebtoken");
const db = require("./db");
const socketService = require("../services/socketService");

function configureSocket(io) {
  socketService.setIO(io);

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Token manquant."));
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      if (payload.kind && payload.kind !== "session") return next(new Error("Token invalide."));
      const [rows] = await db.execute(
        "SELECT id, token_version FROM users WHERE id=? AND is_active=1 LIMIT 1",
        [payload.id],
      );
      if (!rows.length || Number(payload.ver || 0) !== Number(rows[0].token_version || 0)) {
        return next(new Error("Session invalide ou révoquée."));
      }
      socket.user = { id: Number(rows[0].id) };
      next();
    } catch (error) { next(new Error("Token invalide.")); }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id;
    socket.join(`user:${userId}`);
    const count = socketService.addOnline(userId);
    if (count === 1) socketService.broadcastPresence(userId, true);
    socket.emit("presence:list", { userIds: socketService.getOnlineIds() });
    db.execute("UPDATE users SET last_seen_at=NOW() WHERE id=?", [userId]).catch(() => {});

    socket.on("presence:get", (ack) => ack?.({ success: true, userIds: socketService.getOnlineIds() }));

    socket.on("conversation:join", async ({ conversationId }, ack) => {
      try {
        const [rows] = await db.execute(
          "SELECT 1 FROM conversation_members WHERE conversation_id = ? AND user_id = ? LIMIT 1",
          [conversationId, userId],
        );
        if (!rows.length) return ack?.({ success: false, message: "Accès refusé." });
        socket.join(`conversation:${conversationId}`);
        ack?.({ success: true });
      } catch (error) { ack?.({ success: false, message: error.message }); }
    });

    socket.on("conversation:leave", ({ conversationId }) => socket.leave(`conversation:${conversationId}`));
    socket.on("typing:start", ({ conversationId }) => socket.to(`conversation:${conversationId}`).emit("typing:start", { conversationId: Number(conversationId), userId }));
    socket.on("typing:stop", ({ conversationId }) => socket.to(`conversation:${conversationId}`).emit("typing:stop", { conversationId: Number(conversationId), userId }));

    socket.on("disconnect", () => {
      const remaining = socketService.removeOnline(userId);
      db.execute("UPDATE users SET last_seen_at=NOW() WHERE id=?", [userId]).catch(() => {});
      if (remaining === 0) socketService.broadcastPresence(userId, false);
    });
  });
}

module.exports = configureSocket;
