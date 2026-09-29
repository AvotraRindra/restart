-- RE:START / Memories - schéma complet Backend V2
-- Pour une NOUVELLE base locale. Ce script réinitialise les tables de l'application.
-- Si vous avez déjà des données importantes, faites une sauvegarde avant de l'importer.

CREATE DATABASE IF NOT EXISTS restart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE restart;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversation_members;
DROP TABLE IF EXISTS conversations;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS comment_reactions;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS reactions;
DROP TABLE IF EXISTS comic_panels;
DROP TABLE IF EXISTS video_scenes;
DROP TABLE IF EXISTS book_pages;
DROP TABLE IF EXISTS comic_characters;
DROP TABLE IF EXISTS memory_attachments;
DROP TABLE IF EXISTS memory_photos;
DROP TABLE IF EXISTS memories;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  sexe ENUM('homme','femme','autre') NULL,
  photo VARCHAR(500) NULL,
  bio VARCHAR(500) NULL,
  date_naissance DATE NULL,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verification_token_hash VARCHAR(64) NULL,
  verification_expires_at DATETIME NULL,
  reset_token_hash VARCHAR(64) NULL,
  reset_expires_at DATETIME NULL,
  oauth_provider VARCHAR(30) NULL,
  oauth_provider_id VARCHAR(190) NULL,
  last_seen_at DATETIME NULL,
  token_version INT UNSIGNED NOT NULL DEFAULT 0,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE KEY uq_oauth_provider (oauth_provider, oauth_provider_id)
) ENGINE=InnoDB;

CREATE TABLE memories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  owner_id BIGINT UNSIGNED NOT NULL,
  memory_type ENUM('livre','video','bd') NOT NULL,
  emotion ENUM('joyeux','triste','colere','peur','surprise','nostalgique','calme','autre') NOT NULL DEFAULT 'autre',
  title VARCHAR(180) NOT NULL,
  text_content LONGTEXT NULL,
  audio_url VARCHAR(500) NULL,
  transcription_status ENUM('none','pending','completed','failed') NOT NULL DEFAULT 'none',
  memory_date DATE NULL,
  memory_time TIME NULL,
  location VARCHAR(255) NULL,
  access_level ENUM('private','public') NOT NULL DEFAULT 'private',
  generation_status ENUM('pending','generating','completed','failed') NOT NULL DEFAULT 'pending',
  generated_title VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_memory_owner FOREIGN KEY(owner_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_memories_owner(owner_id),
  INDEX idx_memories_access(access_level),
  INDEX idx_memories_date(memory_date)
) ENGINE=InnoDB;

CREATE TABLE memory_photos (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  memory_id BIGINT UNSIGNED NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_memory_photo FOREIGN KEY(memory_id) REFERENCES memories(id) ON DELETE CASCADE,
  INDEX idx_memory_photos(memory_id, sort_order)
) ENGINE=InnoDB;


CREATE TABLE memory_attachments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  memory_id BIGINT UNSIGNED NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(120) NOT NULL,
  category ENUM('image','video','audio','document','other') NOT NULL DEFAULT 'other',
  size_bytes BIGINT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_memory_attachment FOREIGN KEY(memory_id) REFERENCES memories(id) ON DELETE CASCADE,
  INDEX idx_memory_attachments(memory_id)
) ENGINE=InnoDB;

CREATE TABLE comic_characters (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  memory_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(120) NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_comic_character_memory FOREIGN KEY(memory_id) REFERENCES memories(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE book_pages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  memory_id BIGINT UNSIGNED NOT NULL,
  page_number INT NOT NULL,
  title VARCHAR(255) NULL,
  content LONGTEXT NOT NULL,
  image_prompt TEXT NULL,
  image_url VARCHAR(500) NULL,
  CONSTRAINT fk_book_page_memory FOREIGN KEY(memory_id) REFERENCES memories(id) ON DELETE CASCADE,
  UNIQUE KEY uq_book_page(memory_id,page_number)
) ENGINE=InnoDB;

CREATE TABLE video_scenes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  memory_id BIGINT UNSIGNED NOT NULL,
  scene_number INT NOT NULL,
  duration_seconds INT NOT NULL DEFAULT 5,
  narration TEXT NULL,
  image_prompt TEXT NULL,
  image_url VARCHAR(500) NULL,
  video_url VARCHAR(500) NULL,
  CONSTRAINT fk_video_scene_memory FOREIGN KEY(memory_id) REFERENCES memories(id) ON DELETE CASCADE,
  UNIQUE KEY uq_video_scene(memory_id,scene_number)
) ENGINE=InnoDB;

CREATE TABLE comic_panels (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  memory_id BIGINT UNSIGNED NOT NULL,
  panel_number INT NOT NULL,
  narration TEXT NULL,
  dialogue TEXT NULL,
  image_prompt TEXT NULL,
  image_url VARCHAR(500) NULL,
  CONSTRAINT fk_comic_panel_memory FOREIGN KEY(memory_id) REFERENCES memories(id) ON DELETE CASCADE,
  UNIQUE KEY uq_comic_panel(memory_id,panel_number)
) ENGINE=InnoDB;

CREATE TABLE reactions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  memory_id BIGINT UNSIGNED NOT NULL,
  type ENUM('like','love','support','wow','sad') NOT NULL DEFAULT 'like',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_memory_reaction(user_id,memory_id),
  CONSTRAINT fk_reaction_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_reaction_memory FOREIGN KEY(memory_id) REFERENCES memories(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE comments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  memory_id BIGINT UNSIGNED NOT NULL,
  parent_comment_id BIGINT UNSIGNED NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_comment_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_comment_memory FOREIGN KEY(memory_id) REFERENCES memories(id) ON DELETE CASCADE,
  CONSTRAINT fk_comment_parent FOREIGN KEY(parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE comment_reactions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  comment_id BIGINT UNSIGNED NOT NULL,
  type ENUM('like','love','support','wow','sad') NOT NULL DEFAULT 'like',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_comment_reaction(user_id,comment_id),
  CONSTRAINT fk_comment_reaction_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_comment_reaction_comment FOREIGN KEY(comment_id) REFERENCES comments(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE conversations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  type ENUM('private','group') NOT NULL,
  name VARCHAR(150) NULL,
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_conversation_creator FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE conversation_members (
  conversation_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  role ENUM('admin','member') NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(conversation_id,user_id),
  CONSTRAINT fk_member_conversation FOREIGN KEY(conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  CONSTRAINT fk_member_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE messages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  conversation_id BIGINT UNSIGNED NOT NULL,
  sender_id BIGINT UNSIGNED NOT NULL,
  content TEXT NOT NULL,
  attachment_url VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_message_conversation FOREIGN KEY(conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  CONSTRAINT fk_message_sender FOREIGN KEY(sender_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_messages_conversation(conversation_id,created_at)
) ENGINE=InnoDB;

CREATE TABLE notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  actor_id BIGINT UNSIGNED NULL,
  type ENUM('memory_reaction','memory_comment','comment_reply','comment_reaction','message') NOT NULL,
  memory_id BIGINT UNSIGNED NULL,
  comment_id BIGINT UNSIGNED NULL,
  conversation_id BIGINT UNSIGNED NULL,
  message VARCHAR(255) NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notification_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_notification_actor FOREIGN KEY(actor_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_notification_memory FOREIGN KEY(memory_id) REFERENCES memories(id) ON DELETE SET NULL,
  CONSTRAINT fk_notification_comment FOREIGN KEY(comment_id) REFERENCES comments(id) ON DELETE SET NULL,
  CONSTRAINT fk_notification_conversation FOREIGN KEY(conversation_id) REFERENCES conversations(id) ON DELETE SET NULL,
  INDEX idx_notifications_user(user_id,is_read,created_at)
) ENGINE=InnoDB;
