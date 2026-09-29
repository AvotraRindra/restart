const db = require("../config/db");

async function create(data) {
  const [result] = await db.execute(
    `INSERT INTO memories
    (owner_id, memory_type, emotion, title, text_content, audio_url, transcription_status, memory_date, memory_time, location, access_level)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.ownerId, data.memoryType, data.emotion, data.title, data.textContent || null, data.audioUrl || null,
     data.transcriptionStatus || "none", data.date || null, data.time || null, data.location || null, data.access || "private"]
  );
  return findById(result.insertId);
}
async function findById(id) {
  const [rows] = await db.execute(
    `SELECT m.*, u.nom AS owner_name, u.photo AS owner_photo
     FROM memories m JOIN users u ON u.id = m.owner_id WHERE m.id = ? LIMIT 1`, [id]
  );
  return rows[0] || null;
}
async function mine(ownerId) {
  const [rows] = await db.execute("SELECT * FROM memories WHERE owner_id = ? ORDER BY created_at DESC", [ownerId]);
  return rows;
}
async function shared() {
  const [rows] = await db.execute(
    `SELECT m.*, u.nom AS owner_name, u.photo AS owner_photo,
      (SELECT COUNT(*) FROM reactions r WHERE r.memory_id = m.id) AS reactions_count,
      (SELECT COUNT(*) FROM comments c WHERE c.memory_id = m.id) AS comments_count
     FROM memories m JOIN users u ON u.id = m.owner_id
     WHERE m.access_level = 'public' ORDER BY m.created_at DESC`
  );
  return rows;
}
async function updateAccess(id, ownerId, access) {
  const [r] = await db.execute("UPDATE memories SET access_level = ? WHERE id = ? AND owner_id = ?", [access, id, ownerId]);
  return r.affectedRows > 0;
}
async function remove(id, ownerId) {
  const [r] = await db.execute("DELETE FROM memories WHERE id = ? AND owner_id = ?", [id, ownerId]);
  return r.affectedRows > 0;
}
async function addPhotos(memoryId, urls) {
  for (let i = 0; i < urls.length; i++) {
    await db.execute("INSERT INTO memory_photos (memory_id, image_url, sort_order) VALUES (?, ?, ?)", [memoryId, urls[i], i]);
  }
}
async function photos(memoryId) {
  const [rows] = await db.execute("SELECT * FROM memory_photos WHERE memory_id = ? ORDER BY sort_order, id", [memoryId]);
  return rows;
}
async function addCharacter(memoryId, name, imageUrl) {
  const [r] = await db.execute("INSERT INTO comic_characters (memory_id, name, image_url) VALUES (?, ?, ?)", [memoryId, name, imageUrl]);
  return r.insertId;
}
async function characters(memoryId) {
  const [rows] = await db.execute("SELECT * FROM comic_characters WHERE memory_id = ? ORDER BY id", [memoryId]);
  return rows;
}
async function setGenerationStatus(id, status, generatedTitle = null) {
  await db.execute("UPDATE memories SET generation_status = ?, generated_title = COALESCE(?, generated_title) WHERE id = ?", [status, generatedTitle, id]);
}
module.exports = { create, findById, mine, shared, updateAccess, remove, addPhotos, photos, addCharacter, characters, setGenerationStatus };
