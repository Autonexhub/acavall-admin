-- Rename center_therapist table to entity_therapist
RENAME TABLE center_therapist TO entity_therapist;

-- Rename columns in entity_therapist table
ALTER TABLE entity_therapist
  CHANGE COLUMN center_id entity_id INT(10) UNSIGNED NOT NULL;

-- Drop existing foreign keys (ignore errors if they don't exist)
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ANSI';
ALTER TABLE entity_therapist DROP FOREIGN KEY center_therapist_center_id_fk;
ALTER TABLE entity_therapist DROP FOREIGN KEY center_therapist_therapist_id_fk;
SET SQL_MODE=@OLD_SQL_MODE;

-- Add new foreign key constraints
ALTER TABLE entity_therapist
  ADD CONSTRAINT entity_therapist_entity_id_fk
    FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE,
  ADD CONSTRAINT entity_therapist_therapist_id_fk
    FOREIGN KEY (therapist_id) REFERENCES therapists(id) ON DELETE CASCADE;
