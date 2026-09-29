const db = require("../config/db");
const Notification = require("../models/Notification");
const socketService = require("../services/socketService");

async function isMember(conversationId, userId) {
  const [rows] = await db.execute("SELECT 1 FROM conversation_members WHERE conversation_id=? AND user_id=? LIMIT 1", [conversationId, userId]);
  return rows.length > 0;
}

exports.list = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT c.*,
        (SELECT content FROM messages m WHERE m.conversation_id=c.id ORDER BY m.created_at DESC LIMIT 1) AS last_message,
        (SELECT COUNT(*) FROM conversation_members cm2 WHERE cm2.conversation_id=c.id) AS members_count,
        CASE
          WHEN c.type='group' THEN COALESCE(c.name, 'Groupe')
          ELSE COALESCE((
            SELECT u.nom FROM conversation_members cm3
            JOIN users u ON u.id=cm3.user_id
            WHERE cm3.conversation_id=c.id AND cm3.user_id<>? LIMIT 1
          ), 'Discussion privée')
        END AS display_name,
        CASE
          WHEN c.type='private' THEN (
            SELECT u.photo FROM conversation_members cm4
            JOIN users u ON u.id=cm4.user_id
            WHERE cm4.conversation_id=c.id AND cm4.user_id<>? LIMIT 1
          )
          ELSE NULL
        END AS display_photo,
        CASE
          WHEN c.type='private' THEN (
            SELECT cm5.user_id FROM conversation_members cm5
            WHERE cm5.conversation_id=c.id AND cm5.user_id<>? LIMIT 1
          )
          ELSE NULL
        END AS other_user_id,
        (SELECT GROUP_CONCAT(cm6.user_id) FROM conversation_members cm6 WHERE cm6.conversation_id=c.id) AS member_ids
       FROM conversations c JOIN conversation_members cm ON cm.conversation_id=c.id
       WHERE cm.user_id=? ORDER BY COALESCE((SELECT MAX(m2.created_at) FROM messages m2 WHERE m2.conversation_id=c.id), c.created_at) DESC`, [req.user.id, req.user.id, req.user.id, req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
};

exports.create = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { type, name, memberIds = [] } = req.body;
    if (!["private","group"].includes(type)) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: "type doit etre private ou group." });
    }
    const unique = [...new Set([req.user.id, ...memberIds.map(Number)].filter(Boolean))];
    if (type === "private" && unique.length !== 2) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: "Une conversation privée doit contenir exactement 2 membres." });
    }
    if (type === "private") {
      const otherId = unique.find((id) => Number(id) !== Number(req.user.id));
      const [existing] = await connection.execute(
        `SELECT c.id FROM conversations c
         JOIN conversation_members a ON a.conversation_id=c.id AND a.user_id=?
         JOIN conversation_members b ON b.conversation_id=c.id AND b.user_id=?
         WHERE c.type='private' AND (SELECT COUNT(*) FROM conversation_members x WHERE x.conversation_id=c.id)=2
         LIMIT 1`, [req.user.id, otherId]
      );
      if (existing.length) {
        await connection.rollback();
        return res.status(200).json({ success: true, data: { id: existing[0].id, type: "private", existing: true } });
      }
    }
    const [r] = await connection.execute("INSERT INTO conversations (type, name, created_by) VALUES (?, ?, ?)", [type, type === "group" ? (name || "Nouveau groupe") : null, req.user.id]);
    for (const uid of unique) await connection.execute("INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?)", [r.insertId, uid]);
    await connection.commit();
    res.status(201).json({ success: true, data: { id: r.insertId, type, name: type === "group" ? (name || "Nouveau groupe") : null } });
  } catch (e) {
    await connection.rollback(); next(e);
  } finally { connection.release(); }
};

exports.messages = async (req, res, next) => {
  try {
    if (!(await isMember(req.params.id, req.user.id))) return res.status(403).json({ success: false, message: "Acces refuse." });
    const [rows] = await db.execute(
      `SELECT m.*, u.nom AS sender_name, u.photo AS sender_photo
       FROM messages m JOIN users u ON u.id=m.sender_id WHERE m.conversation_id=? ORDER BY m.created_at ASC LIMIT 500`, [req.params.id]
    );
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const conversationId = req.params.id;
    if (!(await isMember(conversationId, req.user.id))) return res.status(403).json({ success: false, message: "Acces refuse." });
    const content = String(req.body.content || "").trim();
    if (!content) return res.status(400).json({ success: false, message: "Le message est vide." });
    const [r] = await db.execute("INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)", [conversationId, req.user.id, content]);
    const message = { id: r.insertId, conversation_id: Number(conversationId), sender_id: req.user.id, sender_name: req.user.nom, sender_photo: req.user.photo, content, created_at: new Date().toISOString() };
    socketService.emitToConversation(conversationId, "message:new", message);
    const [members] = await db.execute("SELECT user_id FROM conversation_members WHERE conversation_id=? AND user_id<>?", [conversationId, req.user.id]);
    for (const m of members) {
      const n = await Notification.create({ userId: m.user_id, actorId: req.user.id, type: "message", conversationId: Number(conversationId), message: `${req.user.nom} vous a envoye un message.` });
      socketService.emitToUser(m.user_id, "notification:new", n);
    }
    res.status(201).json({ success: true, data: message });
  } catch (e) { next(e); }
};

exports.addMember = async (req, res, next) => {
  try {
    const [rows] = await db.execute("SELECT * FROM conversations WHERE id=? LIMIT 1", [req.params.id]);
    const c = rows[0];
    if (!c) return res.status(404).json({ success: false, message: "Conversation introuvable." });
    if (c.type !== "group" || c.created_by !== req.user.id) return res.status(403).json({ success: false, message: "Seul le createur du groupe peut ajouter des membres." });
    await db.execute("INSERT IGNORE INTO conversation_members (conversation_id, user_id) VALUES (?, ?)", [req.params.id, Number(req.body.userId)]);
    res.status(201).json({ success: true });
  } catch (e) { next(e); }
};
