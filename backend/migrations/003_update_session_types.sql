-- Update session type ENUM to use animal/environment categories
-- Migration: 003_update_session_types.sql

-- First, update any existing data to map old types to new types
-- Default: regular -> caballos, festivo -> festivo (will be updated), special -> entorno_natural
UPDATE sessions SET type = 'special' WHERE type = 'festivo';

-- Modify the ENUM column to use the new values
ALTER TABLE sessions
MODIFY COLUMN type ENUM('perros', 'gatos', 'caballos', 'sin_animales', 'entorno_natural')
DEFAULT 'caballos' NOT NULL;

-- Update the temporary 'special' values to 'entorno_natural'
UPDATE sessions SET type = 'entorno_natural' WHERE type = 'special';

-- Update any NULL or default values to 'caballos'
UPDATE sessions SET type = 'caballos' WHERE type IS NULL;
