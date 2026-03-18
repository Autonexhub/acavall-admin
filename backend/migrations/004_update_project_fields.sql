-- Update project type and add funding_type field
-- Migration: 004_update_project_fields.sql

-- Step 1: Add new funding_type column
ALTER TABLE projects
ADD COLUMN funding_type ENUM('public_subsidy', 'private_subsidy', 'financiacion_propia')
DEFAULT 'private_subsidy'
AFTER type;

-- Step 2: Migrate existing type data to funding_type
UPDATE projects
SET funding_type = type;

-- Step 3: Update the type column to use new activity-based categories
-- First set all to a temporary valid value
UPDATE projects SET type = 'private_subsidy';

-- Modify the ENUM column to use the new values
ALTER TABLE projects
MODIFY COLUMN type ENUM('ocio', 'educacion', 'terapia', 'voluntariado', 'formacion', 'otros')
DEFAULT 'terapia' NOT NULL;

-- Step 4: Set default type for all existing projects
UPDATE projects SET type = 'terapia';
