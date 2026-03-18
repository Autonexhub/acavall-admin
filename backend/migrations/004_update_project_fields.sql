-- Update project type and add funding_type field
-- Migration: 004_update_project_fields.sql

-- Step 1: Add new funding_type column
ALTER TABLE projects
ADD COLUMN funding_type ENUM('public_subsidy', 'private_subsidy', 'financiacion_propia')
DEFAULT 'private_subsidy' AFTER type;

-- Step 2: Copy existing type values to funding_type (they're currently funding types)
UPDATE projects SET funding_type = type;

-- Step 3: Add a temporary column for the new type values
ALTER TABLE projects
ADD COLUMN type_new ENUM('ocio', 'educacion', 'terapia', 'voluntariado', 'formacion', 'otros')
DEFAULT 'terapia' AFTER type;

-- Step 4: Set default type for all existing projects
UPDATE projects SET type_new = 'terapia';

-- Step 5: Drop the old type column
ALTER TABLE projects DROP COLUMN type;

-- Step 6: Rename type_new to type
ALTER TABLE projects CHANGE COLUMN type_new type
ENUM('ocio', 'educacion', 'terapia', 'voluntariado', 'formacion', 'otros')
DEFAULT 'terapia' NOT NULL AFTER id;
