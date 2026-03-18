-- Add project_id to sessions table
ALTER TABLE sessions
ADD COLUMN project_id INT(10) UNSIGNED NULL AFTER entity_id;

-- Add foreign key constraint
ALTER TABLE sessions
ADD CONSTRAINT sessions_project_id_fk
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE RESTRICT;

-- Update project type enum
ALTER TABLE projects
MODIFY COLUMN type ENUM('public_subsidy', 'private_subsidy') DEFAULT 'private_subsidy';

-- Add budget_number to projects
ALTER TABLE projects
ADD COLUMN budget_number VARCHAR(100) NULL AFTER amount;

-- Update existing projects to have new type values
UPDATE projects SET type = 'private_subsidy' WHERE type = 'own_funding';
UPDATE projects SET type = 'public_subsidy' WHERE type = 'grant';

SELECT 'Migration completed!' as status;
