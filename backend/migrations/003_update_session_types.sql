-- Update session type ENUM to use animal/environment categories
-- Migration: 003_update_session_types.sql

-- Step 1: Add a temporary column to hold the new values
ALTER TABLE sessions
ADD COLUMN type_new ENUM('perros', 'gatos', 'caballos', 'sin_animales', 'entorno_natural')
DEFAULT 'caballos' AFTER type;

-- Step 2: Map old values to new values
UPDATE sessions SET type_new = CASE
    WHEN type = 'regular' THEN 'caballos'
    WHEN type = 'festivo' THEN 'sin_animales'
    WHEN type = 'special' THEN 'entorno_natural'
    ELSE 'caballos'
END;

-- Step 3: Drop the old column
ALTER TABLE sessions DROP COLUMN type;

-- Step 4: Rename the new column to 'type'
ALTER TABLE sessions CHANGE COLUMN type_new type
ENUM('perros', 'gatos', 'caballos', 'sin_animales', 'entorno_natural')
DEFAULT 'caballos' NOT NULL;
