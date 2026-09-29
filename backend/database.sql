CREATE DATABASE IF NOT EXISTS restart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE restart;

CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  sexe ENUM('homme','femme','autre') NULL,
  photo VARCHAR(500) NULL,
  date_naissance DATE NULL,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE memories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  owner_id BIGINT UNSIGNED NOT NULL,
  emotion ENUM('joyeux','triste','colere','peur','surprise','nostalgique','calme','autre') NOT NULL,
  title VARCHAR(180) NULL,
  text_content TEXT NULL,
  audio_url VARCHAR(500) NULL,
  memory_date DATE NOT NULL,
  memory_time TIME NULL,
  location VARCHAR(255) NULL,
  access_level ENUM('private','public') NOT NULL DEFAULT 'private',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_memory_owner FOREIGN KEY(owner_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_memories_owner(owner_id),
  INDEX idx_memories_access(access_level),
  INDEX idx_memories_date(memory_date)
);

CREATE TABLE memory_media (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  memory_id BIGINT UNSIGNED NOT NULL,
  url VARCHAR(500) NOT NULL,
  media_type ENUM('image','video') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(memory_id) REFERENCES memories(id) ON DELETE CASCADE
);

CREATE TABLE reactions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  memory_id BIGINT UNSIGNED NOT NULL,
  reaction_type ENUM('like','love','support','wow','sad') NOT NULL DEFAULT 'like',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_memory_reaction(user_id,memory_id),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(memory_id) REFERENCES memories(id) ON DELETE CASCADE
);

CREATE TABLE comments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  memory_id BIGINT UNSIGNED NOT NULL,
  parent_comment_id BIGINT UNSIGNED NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(memory_id) REFERENCES memories(id) ON DELETE CASCADE,
  FOREIGN KEY(parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE
);

CREATE TABLE comment_reactions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  comment_id BIGINT UNSIGNED NOT NULL,
  reaction_type ENUM('like','love','support','wow','sad') NOT NULL DEFAULT 'like',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_comment_reaction(user_id,comment_id),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(comment_id) REFERENCES comments(id) ON DELETE CASCADE
);

CREATE TABLE notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  actor_id BIGINT UNSIGNED NULL,
  type ENUM('memory_reaction','memory_comment','comment_reply','comment_reaction','message') NOT NULL,
  memory_id BIGINT UNSIGNED NULL,
  comment_id BIGINT UNSIGNED NULL,
  content VARCHAR(255) NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(actor_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY(memory_id) REFERENCES memories(id) ON DELETE CASCADE,
  FOREIGN KEY(comment_id) REFERENCES comments(id) ON DELETE CASCADE,
  INDEX idx_notifications_user(user_id,is_read,created_at)
);

CREATE TABLE conversations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  type ENUM('private','group') NOT NULL,
  name VARCHAR(150) NULL,
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE conversation_members (
  conversation_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  role ENUM('admin','member') DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(conversation_id,user_id),
  FOREIGN KEY(conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE messages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  conversation_id BIGINT UNSIGNED NOT NULL,
  sender_id BIGINT UNSIGNED NOT NULL,
  content TEXT NULL,
  attachment_url VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY(sender_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_messages_conversation(conversation_id,created_at)
);

ALTER TABLE memories
ADD COLUMN memory_type ENUM('livre', 'video', 'bd')
NOT NULL DEFAULT 'livre'
AFTER owner_id;

ALTER TABLE memories
ADD COLUMN generation_status
ENUM('pending', 'generating', 'completed', 'failed')
NOT NULL DEFAULT 'pending';