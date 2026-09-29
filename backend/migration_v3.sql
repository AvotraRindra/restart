-- RE:START V3 - migration non destructive pour une base existante XAMPP/MariaDB.
-- Faites quand même une sauvegarde avant toute migration.
USE restart;

ALTER TABLE users ADD COLUMN IF NOT EXISTS bio VARCHAR(500) NULL AFTER photo;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE AFTER date_naissance;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token_hash VARCHAR(64) NULL AFTER email_verified;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_expires_at DATETIME NULL AFTER verification_token_hash;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_hash VARCHAR(64) NULL AFTER verification_expires_at;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_expires_at DATETIME NULL AFTER reset_token_hash;
ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_provider VARCHAR(30) NULL AFTER reset_expires_at;
ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_provider_id VARCHAR(190) NULL AFTER oauth_provider;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen_at DATETIME NULL AFTER oauth_provider_id;
ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version INT UNSIGNED NOT NULL DEFAULT 0 AFTER last_seen_at;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER date_creation;

-- Pour ne pas bloquer les comptes déjà créés avant l'ajout de la vérification e-mail.
UPDATE users SET email_verified = TRUE WHERE email_verified = FALSE AND date_creation IS NOT NULL;

-- Permet à une notification de message d'ouvrir directement la bonne discussion.
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS conversation_id BIGINT UNSIGNED NULL AFTER comment_id;

CREATE TABLE IF NOT EXISTS memory_attachments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  memory_id BIGINT UNSIGNED NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(120) NOT NULL,
  category ENUM('image','video','audio','document','other') NOT NULL DEFAULT 'other',
  size_bytes BIGINT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_memory_attachments(memory_id)
) ENGINE=InnoDB;
