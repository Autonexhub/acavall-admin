-- Add additional fields to therapists table
-- Migration: 006_add_therapist_additional_fields.sql

-- Add new fields for documentation and compliance
ALTER TABLE therapists
ADD COLUMN dni VARCHAR(20) NULL AFTER phone,
ADD COLUMN social_security_number VARCHAR(50) NULL AFTER dni,
ADD COLUMN account_number VARCHAR(50) NULL AFTER social_security_number,
ADD COLUMN fiscal_address TEXT NULL AFTER account_number,
ADD COLUMN notes TEXT NULL AFTER fiscal_address,
ADD COLUMN has_dni_photo BOOLEAN DEFAULT FALSE AFTER notes,
ADD COLUMN has_certificate_delitos BOOLEAN DEFAULT FALSE AFTER has_dni_photo;
