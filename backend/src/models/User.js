const db = require("../config/db");

async function findByEmail(email) {
  const [rows] = await db.execute("SELECT * FROM users WHERE email = ? LIMIT 1", [String(email || "").trim().toLowerCase()]);
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await db.execute("SELECT * FROM users WHERE id = ? LIMIT 1", [id]);
  return rows[0] || null;
}

async function findPublicById(id) {
  const [rows] = await db.execute(
    `SELECT id, nom, email, sexe, photo, bio, date_naissance, date_creation, email_verified, oauth_provider, last_seen_at
     FROM users WHERE id = ? LIMIT 1`,
    [id],
  );
  return rows[0] || null;
}

async function create({ nom, email, passwordHash, sexe, dateNaissance, emailVerified = false, oauthProvider = null, oauthProviderId = null, photo = null }) {
  const [result] = await db.execute(
    `INSERT INTO users (nom, email, password_hash, sexe, date_naissance, email_verified, oauth_provider, oauth_provider_id, photo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [nom, String(email).trim().toLowerCase(), passwordHash, sexe || "autre", dateNaissance || null, emailVerified ? 1 : 0, oauthProvider, oauthProviderId, photo],
  );
  return findPublicById(result.insertId);
}

async function updateProfile(id, { nom, bio, sexe, dateNaissance }) {
  await db.execute(
    `UPDATE users SET
      nom = COALESCE(NULLIF(?, ''), nom),
      bio = ?,
      sexe = COALESCE(?, sexe),
      date_naissance = COALESCE(?, date_naissance)
     WHERE id = ?`,
    [nom == null ? null : String(nom).trim(), bio == null ? null : String(bio).trim().slice(0, 500), sexe || null, dateNaissance || null, id],
  );
  return findPublicById(id);
}

async function updatePhoto(id, photo) {
  await db.execute("UPDATE users SET photo=? WHERE id=?", [photo, id]);
  return findPublicById(id);
}

async function search(q) {
  const like = `%${q}%`;
  const [rows] = await db.execute(
    `SELECT id, nom, email, photo, bio, last_seen_at
     FROM users WHERE is_active=1 AND (nom LIKE ? OR email LIKE ?) ORDER BY nom LIMIT 30`,
    [like, like],
  );
  return rows;
}

async function setEmailVerification(id, tokenHash, expiresAt) {
  await db.execute(
    "UPDATE users SET verification_token_hash=?, verification_expires_at=?, email_verified=0 WHERE id=?",
    [tokenHash, expiresAt, id],
  );
}

async function verifyEmailByHash(tokenHash) {
  const [rows] = await db.execute(
    `SELECT id FROM users WHERE verification_token_hash=? AND verification_expires_at > NOW() LIMIT 1`,
    [tokenHash],
  );
  if (!rows.length) return null;
  const id = rows[0].id;
  await db.execute(
    "UPDATE users SET email_verified=1, verification_token_hash=NULL, verification_expires_at=NULL WHERE id=?",
    [id],
  );
  return findPublicById(id);
}

async function setResetToken(id, tokenHash, expiresAt) {
  await db.execute("UPDATE users SET reset_token_hash=?, reset_expires_at=? WHERE id=?", [tokenHash, expiresAt, id]);
}

async function resetPasswordByHash(tokenHash, passwordHash) {
  const [rows] = await db.execute(
    `SELECT id FROM users WHERE reset_token_hash=? AND reset_expires_at > NOW() LIMIT 1`,
    [tokenHash],
  );
  if (!rows.length) return null;
  const id = rows[0].id;
  await db.execute(
    `UPDATE users SET password_hash=?, reset_token_hash=NULL, reset_expires_at=NULL, email_verified=1, token_version=token_version+1 WHERE id=?`,
    [passwordHash, id],
  );
  return findPublicById(id);
}

async function findByOAuth(provider, providerId) {
  const [rows] = await db.execute(
    "SELECT * FROM users WHERE oauth_provider=? AND oauth_provider_id=? LIMIT 1",
    [provider, String(providerId)],
  );
  return rows[0] || null;
}

async function linkOAuth(id, provider, providerId, photo = null) {
  await db.execute(
    `UPDATE users SET oauth_provider=?, oauth_provider_id=?, email_verified=1, photo=COALESCE(photo, ?) WHERE id=?`,
    [provider, String(providerId), photo, id],
  );
  return findPublicById(id);
}

async function touchLastSeen(id) {
  await db.execute("UPDATE users SET last_seen_at=NOW() WHERE id=?", [id]);
}

module.exports = {
  findByEmail,
  findById,
  findPublicById,
  create,
  updateProfile,
  updatePhoto,
  search,
  setEmailVerification,
  verifyEmailByHash,
  setResetToken,
  resetPasswordByHash,
  findByOAuth,
  linkOAuth,
  touchLastSeen,
};
