-- Add beneficiary details fields to projects table
-- Allows tracking gender breakdown and average age of beneficiaries

ALTER TABLE projects
ADD COLUMN beneficiaries_female INT UNSIGNED DEFAULT 0 AFTER beneficiaries,
ADD COLUMN beneficiaries_male INT UNSIGNED DEFAULT 0 AFTER beneficiaries_female,
ADD COLUMN average_age DECIMAL(4,1) NULL AFTER beneficiaries_male;

-- Update existing projects to distribute beneficiaries evenly (optional, can be adjusted manually)
-- This is just to avoid NULL values, actual data should be entered by users

SELECT 'Migration 010 completed - Added beneficiary details fields!' as status;
