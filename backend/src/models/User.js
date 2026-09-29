const db = require("../config/db");

async function findByEmail(email) {
  const [rows] = await db.execute("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);
  return rows[0] || null;
}
async function findPublicById(id) {
  const [rows] = await db.execute("SELECT id, nom, email, sexe, photo, date_naissance, date_creation FROM users WHERE id = ? LIMIT 1", [id]);
  return rows[0] || null;
}
async function create({ nom, email, passwordHash, sexe, dateNaissance }) {
  const [result] = await db.execute(
    "INSERT INTO users (nom, email, password_hash, sexe, date_naissance) VALUES (?, ?, ?, ?, ?)",
    [nom, email, passwordHash, sexe || "autre", dateNaissance || null]
  );
  return findPublicById(result.insertId);
}
async function search(q) {
  const like = `%${q}%`;
  const [rows] = await db.execute(
    "SELECT id, nom, email, photo FROM users WHERE nom LIKE ? OR email LIKE ? ORDER BY nom LIMIT 30",
    [like, like]
  );
  return rows;
}
module.exports = { findByEmail, findPublicById, create, search };
