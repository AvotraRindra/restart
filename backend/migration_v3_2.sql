-- RE:START V3.2 - migration non destructive pour Hodifly
USE leboot_restart;

CREATE TABLE IF NOT EXISTS message_attachments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  message_id BIGINT UNSIGNED NOT NULL,
  stored_name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(120) NOT NULL,
  size_bytes BIGINT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_message_attachments(message_id),
  CONSTRAINT fk_message_attachment_message FOREIGN KEY(message_id) REFERENCES messages(id) ON DELETE CASCADE
) ENGINE=InnoDB;
