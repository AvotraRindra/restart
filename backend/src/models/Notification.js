const db = require("../config/db");
async function create(data) {
  const [r] = await db.execute(
    `INSERT INTO notifications (user_id, actor_id, type, memory_id, comment_id, conversation_id, message)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [data.userId, data.actorId || null, data.type, data.memoryId || null, data.commentId || null, data.conversationId || null, data.message]
  );
  const [rows] = await db.execute(
    "SELECT n.*, u.nom AS actor_name, u.photo AS actor_photo FROM notifications n LEFT JOIN users u ON u.id=n.actor_id WHERE n.id=?", [r.insertId]
  );
  return rows[0];
}
async function list(userId) {
  const [rows] = await db.execute(
    "SELECT n.*, u.nom AS actor_name, u.photo AS actor_photo FROM notifications n LEFT JOIN users u ON u.id=n.actor_id WHERE n.user_id=? ORDER BY n.created_at DESC LIMIT 100",
    [userId]
  );
  return rows;
}
async function markRead(id, userId) {
  const [r] = await db.execute("UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?", [id, userId]);
  return r.affectedRows > 0;
}
async function markAllRead(userId) {
  const [r] = await db.execute("UPDATE notifications SET is_read=1 WHERE user_id=? AND is_read=0", [userId]);
  return r.affectedRows;
}
module.exports = { create, list, markRead, markAllRead };
