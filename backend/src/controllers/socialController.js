const db = require("../config/db");
const Notification = require("../models/Notification");
const socketService = require("../services/socketService");

async function getMemory(id) {
  const [rows] = await db.execute("SELECT * FROM memories WHERE id = ? LIMIT 1", [id]);
  return rows[0] || null;
}
async function notify(data) {
  if (data.userId === data.actorId) return;
  const n = await Notification.create(data);
  socketService.emitToUser(data.userId, "notification:new", n);
}

exports.reactMemory = async (req, res, next) => {
  try {
    const memory = await getMemory(req.params.id);
    if (!memory || memory.access_level !== "public") return res.status(404).json({ success: false, message: "Souvenir public introuvable." });
    const type = req.body.type || "like";
    if (!["like","love","support","wow","sad"].includes(type)) return res.status(400).json({ success: false, message: "Type de reaction invalide." });
    const [existing] = await db.execute("SELECT * FROM reactions WHERE user_id=? AND memory_id=? LIMIT 1", [req.user.id, memory.id]);
    if (existing.length && existing[0].type === type) {
      await db.execute("DELETE FROM reactions WHERE user_id=? AND memory_id=?", [req.user.id, memory.id]);
      return res.json({ success: true, active: false });
    }
    await db.execute(
      `INSERT INTO reactions (user_id, memory_id, type) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE type=VALUES(type), created_at=CURRENT_TIMESTAMP`,
      [req.user.id, memory.id, type]
    );
    await notify({ userId: memory.owner_id, actorId: req.user.id, type: "memory_reaction", memoryId: memory.id, message: `${req.user.nom} a reagi a votre souvenir.` });
    res.json({ success: true, active: true, type });
  } catch (e) { next(e); }
};

exports.getComments = async (req, res, next) => {
  try {
    const memory = await getMemory(req.params.id);
    if (!memory || (memory.access_level !== "public" && memory.owner_id !== req.user.id)) return res.status(404).json({ success: false, message: "Souvenir introuvable." });
    const [rows] = await db.execute(
      `SELECT c.*, u.nom, u.photo,
       (SELECT COUNT(*) FROM comment_reactions cr WHERE cr.comment_id=c.id) AS reactions_count
       FROM comments c JOIN users u ON u.id=c.user_id WHERE c.memory_id=? ORDER BY c.created_at ASC`, [memory.id]
    );
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
};

exports.addComment = async (req, res, next) => {
  try {
    const memory = await getMemory(req.params.id);
    if (!memory || memory.access_level !== "public") return res.status(404).json({ success: false, message: "Souvenir public introuvable." });
    const content = String(req.body.content || "").trim();
    const parentId = req.body.parentId || null;
    if (!content) return res.status(400).json({ success: false, message: "Le commentaire est vide." });
    let parent = null;
    if (parentId) {
      const [rows] = await db.execute("SELECT * FROM comments WHERE id=? AND memory_id=? LIMIT 1", [parentId, memory.id]);
      parent = rows[0] || null;
      if (!parent) return res.status(400).json({ success: false, message: "Commentaire parent invalide." });
    }
    const [r] = await db.execute("INSERT INTO comments (user_id, memory_id, parent_comment_id, content) VALUES (?, ?, ?, ?)", [req.user.id, memory.id, parentId, content]);
    if (parent) {
      await notify({ userId: parent.user_id, actorId: req.user.id, type: "comment_reply", memoryId: memory.id, commentId: r.insertId, message: `${req.user.nom} a repondu a votre commentaire.` });
    } else {
      await notify({ userId: memory.owner_id, actorId: req.user.id, type: "memory_comment", memoryId: memory.id, commentId: r.insertId, message: `${req.user.nom} a commente votre souvenir.` });
    }
    res.status(201).json({ success: true, data: { id: r.insertId, content, parent_comment_id: parentId } });
  } catch (e) { next(e); }
};

exports.reactComment = async (req, res, next) => {
  try {
    const type = req.body.type || "like";
    if (!["like","love","support","wow","sad"].includes(type)) return res.status(400).json({ success: false, message: "Type de reaction invalide." });
    const [rows] = await db.execute(
      `SELECT c.*, m.access_level FROM comments c JOIN memories m ON m.id=c.memory_id WHERE c.id=? LIMIT 1`, [req.params.commentId]
    );
    const comment = rows[0];
    if (!comment || comment.access_level !== "public") return res.status(404).json({ success: false, message: "Commentaire introuvable." });
    const [existing] = await db.execute("SELECT * FROM comment_reactions WHERE user_id=? AND comment_id=? LIMIT 1", [req.user.id, comment.id]);
    if (existing.length && existing[0].type === type) {
      await db.execute("DELETE FROM comment_reactions WHERE user_id=? AND comment_id=?", [req.user.id, comment.id]);
      return res.json({ success: true, active: false });
    }
    await db.execute(
      `INSERT INTO comment_reactions (user_id, comment_id, type) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE type=VALUES(type), created_at=CURRENT_TIMESTAMP`, [req.user.id, comment.id, type]
    );
    await notify({ userId: comment.user_id, actorId: req.user.id, type: "comment_reaction", memoryId: comment.memory_id, commentId: comment.id, message: `${req.user.nom} a reagi a votre commentaire.` });
    res.json({ success: true, active: true, type });
  } catch (e) { next(e); }
};
