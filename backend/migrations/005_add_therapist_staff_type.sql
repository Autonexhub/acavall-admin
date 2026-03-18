-- Add staff_type field to therapists table
-- Migration: 005_add_therapist_staff_type.sql

-- Add staff_type column
ALTER TABLE therapists
ADD COLUMN staff_type ENUM('personal_laboral', 'personal_apoyo', 'personal_voluntariado')
DEFAULT 'personal_laboral'
AFTER specialty;

-- Set default for existing therapists
UPDATE therapists SET staff_type = 'personal_laboral' WHERE staff_type IS NULL;

-- Make the field NOT NULL
ALTER TABLE therapists
MODIFY COLUMN staff_type ENUM('personal_laboral', 'personal_apoyo', 'personal_voluntariado')
DEFAULT 'personal_laboral' NOT NULL;
