-- Production Deployment Migration
-- Date: 2026-03-13
-- Description: Entity migration, project fields, and schema updates

-- 1. Add project_id to sessions table (if not exists)
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'sessions'
    AND COLUMN_NAME = 'project_id'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE sessions ADD COLUMN project_id INT(10) UNSIGNED NULL AFTER entity_id',
    'SELECT "Column project_id already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key constraint for project_id
SET @fk_exists = (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'sessions'
    AND CONSTRAINT_NAME = 'sessions_project_id_fk'
);

SET @sql = IF(@fk_exists = 0,
    'ALTER TABLE sessions ADD CONSTRAINT sessions_project_id_fk FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE RESTRICT',
    'SELECT "Foreign key already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Update project type enum to use new values
ALTER TABLE projects MODIFY COLUMN type ENUM('public_subsidy', 'private_subsidy', 'grant', 'own_funding') DEFAULT 'private_subsidy';

-- Migrate old type values to new ones
UPDATE projects SET type = 'private_subsidy' WHERE type = 'own_funding';
UPDATE projects SET type = 'public_subsidy' WHERE type = 'grant';

-- Remove old enum values
ALTER TABLE projects MODIFY COLUMN type ENUM('public_subsidy', 'private_subsidy') DEFAULT 'private_subsidy';

-- 3. Add budget_number to projects (if not exists)
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'projects'
    AND COLUMN_NAME = 'budget_number'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE projects ADD COLUMN budget_number VARCHAR(100) NULL AFTER amount',
    'SELECT "Column budget_number already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. Ensure entity_therapist table exists (should already exist)
CREATE TABLE IF NOT EXISTS entity_therapist (
    entity_id INT(10) UNSIGNED NOT NULL,
    therapist_id INT(10) UNSIGNED NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (entity_id, therapist_id),
    FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE,
    FOREIGN KEY (therapist_id) REFERENCES therapists(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Ensure staff_work_history table exists
CREATE TABLE IF NOT EXISTS staff_work_history (
    id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    therapist_id INT(10) UNSIGNED NOT NULL,
    entity_id INT(10) UNSIGNED NOT NULL,
    role VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (therapist_id) REFERENCES therapists(id) ON DELETE CASCADE,
    FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT '✅ Production migration completed successfully!' AS status;
