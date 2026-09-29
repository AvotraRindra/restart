const jwt = require("jsonwebtoken");
const db = require("../config/db");

module.exports = async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Token manquant." });
    }
    const token = header.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await db.execute(
      `SELECT id, nom, email, photo FROM users WHERE id = ? AND is_active = 1 LIMIT 1`,
      [payload.id]
    );
    if (!rows.length) {
      return res.status(401).json({ success: false, message: "Utilisateur introuvable." });
    }
    req.user = rows[0];
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Token invalide ou expire." });
  }
};
