-- Migration: Add phone column to users table
-- Date: 2026-04-23

ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50) NULL AFTER email;
