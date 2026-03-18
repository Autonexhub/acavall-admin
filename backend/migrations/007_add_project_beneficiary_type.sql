-- Add beneficiary_type field to projects table
-- Migration: 007_add_project_beneficiary_type.sql

-- Add beneficiary_type column
ALTER TABLE projects
ADD COLUMN beneficiary_type ENUM(
  'discapacidad_sensorial',
  'discapacidad_intelectual',
  'discapacidad_fisica_organica',
  'discapacidad_psicosocial',
  'personas_mayores',
  'mujeres_victimas_violencia',
  'menores_riesgo',
  'infancia_juventud',
  'cuidadores_familias',
  'otros'
) DEFAULT 'otros' AFTER funding_type;
