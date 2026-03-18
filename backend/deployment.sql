-- Deployment Migration Script
-- Run this to update the database schema and migrate data

-- ============================================
-- 1. Ensure entities table has color column
-- ============================================

-- Add color column to entities (ignore if exists)
SET @dbname = DATABASE();
SET @tablename = "entities";
SET @columnname = "color";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 1",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname, " VARCHAR(7) DEFAULT '#3B82F6' AFTER name")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Update existing entities without color
UPDATE entities SET color = '#3B82F6' WHERE color IS NULL OR color = '';

-- ============================================
-- 2. Migrate sessions from center_id to entity_id
-- ============================================

-- Add entity_id column (ignore if exists)
SET @tablename = "sessions";
SET @columnname = "entity_id";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 1",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname, " INT UNSIGNED NULL AFTER id")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Migrate data: Map center_id to entity_id via matching names
UPDATE sessions s
JOIN centers c ON s.center_id = c.id
JOIN entities e ON c.name = e.name
SET s.entity_id = e.id
WHERE s.entity_id IS NULL AND s.center_id IS NOT NULL;

-- Make entity_id required after migration
ALTER TABLE sessions MODIFY COLUMN entity_id INT UNSIGNED NOT NULL;

-- Add foreign key constraint (drop first if exists)
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

ALTER TABLE sessions ADD CONSTRAINT sessions_entity_id_fk
  FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE RESTRICT;

-- Drop old center_id column (if exists)
SET @columnname = "center_id";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = 'sessions')
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  CONCAT("ALTER TABLE sessions DROP COLUMN ", @columnname),
  "SELECT 1"
));
PREPARE alterIfExists FROM @preparedStatement;
EXECUTE alterIfExists;
DEALLOCATE PREPARE alterIfExists;

-- ============================================
-- 3. Ensure project_entities table exists
-- ============================================

-- Drop old project_centers table if it exists
DROP TABLE IF EXISTS project_centers;

-- Create project_entities if not exists
CREATE TABLE IF NOT EXISTS project_entities (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id INT UNSIGNED NOT NULL,
  entity_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE,
  UNIQUE KEY unique_project_entity (project_id, entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. Migrate centers to entities (if not done)
-- ============================================

-- Insert centers as entities where they don't already exist
INSERT INTO entities (name, color, contact_person, city, notes, is_active, created_at, updated_at)
SELECT
  c.name,
  COALESCE(c.color, '#3B82F6'),
  c.responsible,
  c.address,
  CONCAT_WS('\n',
    IF(c.schedule IS NOT NULL, CONCAT('Horario: ', c.schedule), NULL),
    IF(c.frequency IS NOT NULL, CONCAT('Frecuencia: ', c.frequency), NULL)
  ),
  c.is_active,
  c.created_at,
  c.updated_at
FROM centers c
WHERE NOT EXISTS (
  SELECT 1 FROM entities e WHERE e.name = c.name
);

-- ============================================
-- 5. Verify migration
-- ============================================

-- Check for any sessions without entity_id (should be 0)
SELECT COUNT(*) as orphaned_sessions FROM sessions WHERE entity_id IS NULL;

-- Check entities count
SELECT COUNT(*) as total_entities FROM entities WHERE is_active = 1;

-- Check sessions count
SELECT COUNT(*) as total_sessions FROM sessions;

-- Done!
SELECT 'Migration completed successfully!' as status;
