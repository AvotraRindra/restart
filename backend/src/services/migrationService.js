const db = require("../config/db");


async function hasTable(table) {
  const [rows] = await db.execute(
    `SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? LIMIT 1`,
    [table],
  );
  return rows.length > 0;
}

async function hasColumn(table, column) {
  const [rows] = await db.execute(
    `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? AND COLUMN_NAME=? LIMIT 1`,
    [table, column],
  );
  return rows.length > 0;
}

async function addColumn(table, column, definition) {
  if (await hasColumn(table, column)) return false;
  await db.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
  return true;
}

async function ensureV3Schema() {
  if (String(process.env.AUTO_MIGRATE || "true").toLowerCase() === "false") return;

  const addedVerification = await addColumn("users", "email_verified", "BOOLEAN NOT NULL DEFAULT FALSE AFTER date_naissance");
  await addColumn("users", "bio", "VARCHAR(500) NULL AFTER photo");
  await addColumn("users", "verification_token_hash", "VARCHAR(64) NULL AFTER email_verified");
  await addColumn("users", "verification_expires_at", "DATETIME NULL AFTER verification_token_hash");
  await addColumn("users", "reset_token_hash", "VARCHAR(64) NULL AFTER verification_expires_at");
  await addColumn("users", "reset_expires_at", "DATETIME NULL AFTER reset_token_hash");
  await addColumn("users", "oauth_provider", "VARCHAR(30) NULL AFTER reset_expires_at");
  await addColumn("users", "oauth_provider_id", "VARCHAR(190) NULL AFTER oauth_provider");
  await addColumn("users", "last_seen_at", "DATETIME NULL AFTER oauth_provider_id");
  await addColumn("users", "token_version", "INT UNSIGNED NOT NULL DEFAULT 0 AFTER last_seen_at");
  await addColumn("users", "updated_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER date_creation");

  // V3 rattache les notifications de messages à leur conversation afin que le clic
  // puisse ouvrir directement la discussion. Cette colonne n'existait pas dans
  // certaines bases V2.
  if (await hasTable("notifications")) {
    await addColumn("notifications", "conversation_id", "BIGINT UNSIGNED NULL AFTER comment_id");
  }

  if (addedVerification) {
    // Les comptes qui existaient avant V3 sont considérés comme déjà validés.
    await db.query("UPDATE users SET email_verified=TRUE");
  }

  await db.query(`CREATE TABLE IF NOT EXISTS memory_attachments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    memory_id BIGINT UNSIGNED NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(120) NOT NULL,
    category ENUM('image','video','audio','document','other') NOT NULL DEFAULT 'other',
    size_bytes BIGINT UNSIGNED NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_memory_attachments(memory_id)
  ) ENGINE=InnoDB`);


  await db.query(`CREATE TABLE IF NOT EXISTS message_attachments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    message_id BIGINT UNSIGNED NOT NULL,
    stored_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(120) NOT NULL,
    size_bytes BIGINT UNSIGNED NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_message_attachments(message_id)
  ) ENGINE=InnoDB`);

  console.log("Schéma RE:START V3.2 vérifié.");
}

module.exports = { ensureV3Schema };
