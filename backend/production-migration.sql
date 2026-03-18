-- Production Database Migration
-- Migrates from centers to entities architecture

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- ============================================
-- 1. Create entities table
-- ============================================

CREATE TABLE IF NOT EXISTS `entities` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `color` varchar(7) DEFAULT '#3B82F6',
  `contact_person` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `cif_nif` varchar(50) DEFAULT NULL,
  `fiscal_address` text DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `province` varchar(100) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. Migrate centers to entities
-- ============================================

INSERT INTO entities (name, color, contact_person, city, notes, is_active, created_at, updated_at)
SELECT
  c.name,
  COALESCE(c.color, '#3B82F6'),
  c.responsible,
  c.address,
  CONCAT_WS('\n',
    IF(c.schedule IS NOT NULL AND c.schedule != '', CONCAT('Horario: ', c.schedule), NULL),
    IF(c.frequency IS NOT NULL AND c.frequency != '', CONCAT('Frecuencia: ', c.frequency), NULL)
  ),
  c.is_active,
  c.created_at,
  c.updated_at
FROM centers c
WHERE NOT EXISTS (
  SELECT 1 FROM entities e WHERE e.name = c.name
);

-- ============================================
-- 3. Add entity_id to sessions
-- ============================================

-- Check if column exists before adding
SET @dbname = DATABASE();
SET @tablename = 'sessions';
SET @columnname = 'entity_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT(10) UNSIGNED NULL AFTER id')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- ============================================
-- 4. Migrate session data
-- ============================================

UPDATE sessions s
JOIN centers c ON s.center_id = c.id
JOIN entities e ON c.name = e.name
SET s.entity_id = e.id
WHERE s.entity_id IS NULL AND s.center_id IS NOT NULL;

-- ============================================
-- 5. Make entity_id NOT NULL and add foreign key
-- ============================================

ALTER TABLE sessions MODIFY COLUMN entity_id INT(10) UNSIGNED NOT NULL;

-- Drop foreign key if exists
SET @constraint_name = (
  SELECT CONSTRAINT_NAME
  FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
  WHERE TABLE_NAME = 'sessions'
  AND COLUMN_NAME = 'entity_id'
  AND CONSTRAINT_SCHEMA = DATABASE()
  LIMIT 1
);

SET @drop_fk = IF(@constraint_name IS NOT NULL,
  CONCAT('ALTER TABLE sessions DROP FOREIGN KEY ', @constraint_name),
  'SELECT 1'
);
PREPARE stmt FROM @drop_fk;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key
ALTER TABLE sessions
ADD CONSTRAINT `sessions_entity_id_fk`
FOREIGN KEY (`entity_id`) REFERENCES `entities`(`id`) ON DELETE RESTRICT;

-- ============================================
-- 6. Create projects table if not exists
-- ============================================

CREATE TABLE IF NOT EXISTS `projects` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `num_sessions` int(11) DEFAULT 0,
  `beneficiaries` int(11) DEFAULT 0,
  `amount` decimal(10,2) DEFAULT 0.00,
  `type` enum('grant','own_funding') DEFAULT 'own_funding',
  `budget_link` varchar(500) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. Create project_entities table
-- ============================================

DROP TABLE IF EXISTS project_centers;

CREATE TABLE IF NOT EXISTS `project_entities` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `project_id` int(10) UNSIGNED NOT NULL,
  `entity_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_project_entity` (`project_id`,`entity_id`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_entity_id` (`entity_id`),
  CONSTRAINT `project_entities_project_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
  CONSTRAINT `project_entities_entity_fk` FOREIGN KEY (`entity_id`) REFERENCES `entities`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. Create work_history table for staff
-- ============================================

CREATE TABLE IF NOT EXISTS `work_history` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `therapist_id` int(10) UNSIGNED NOT NULL,
  `entity_id` int(10) UNSIGNED NOT NULL,
  `role` varchar(255) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_therapist_id` (`therapist_id`),
  KEY `idx_entity_id` (`entity_id`),
  CONSTRAINT `work_history_therapist_fk` FOREIGN KEY (`therapist_id`) REFERENCES `therapists`(`id`) ON DELETE CASCADE,
  CONSTRAINT `work_history_entity_fk` FOREIGN KEY (`entity_id`) REFERENCES `entities`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9. Drop old center_id column from sessions
-- ============================================

SET @columnname = 'center_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = 'sessions')
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  CONCAT('ALTER TABLE sessions DROP COLUMN ', @columnname),
  'SELECT 1'
));
PREPARE alterIfExists FROM @preparedStatement;
EXECUTE alterIfExists;
DEALLOCATE PREPARE alterIfExists;

COMMIT;

-- ============================================
-- Verification
-- ============================================

SELECT 'Migration completed!' as status;
SELECT COUNT(*) as total_entities FROM entities;
SELECT COUNT(*) as total_sessions FROM sessions;
SELECT COUNT(*) as sessions_with_entities FROM sessions WHERE entity_id IS NOT NULL;
