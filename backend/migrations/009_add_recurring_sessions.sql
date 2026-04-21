-- Add recurring sessions support
-- This migration adds fields to support Google Calendar-style recurring events

ALTER TABLE sessions
  ADD COLUMN is_recurring TINYINT(1) DEFAULT 0 AFTER created_by,
  ADD COLUMN recurring_group_id VARCHAR(36) NULL AFTER is_recurring,
  ADD COLUMN recurrence_rule JSON NULL AFTER recurring_group_id,
  ADD COLUMN recurrence_exception TINYINT(1) DEFAULT 0 AFTER recurrence_rule;

-- Add index for better query performance on recurring sessions
CREATE INDEX idx_recurring_group ON sessions(recurring_group_id);
CREATE INDEX idx_is_recurring ON sessions(is_recurring);

-- Comments for clarity
ALTER TABLE sessions
  MODIFY COLUMN is_recurring TINYINT(1) DEFAULT 0 COMMENT 'Whether this session is part of a recurring series',
  MODIFY COLUMN recurring_group_id VARCHAR(36) NULL COMMENT 'UUID to group recurring sessions together',
  MODIFY COLUMN recurrence_rule JSON NULL COMMENT 'Stores the recurrence pattern (frequency, interval, days, end date)',
  MODIFY COLUMN recurrence_exception TINYINT(1) DEFAULT 0 COMMENT 'Whether this instance was modified from the series';

/*
recurrence_rule JSON structure:
{
  "frequency": "daily|weekly|monthly",
  "interval": 1,              // every X days/weeks/months
  "daysOfWeek": [1,3,5],      // for weekly: 0=Sunday, 1=Monday, etc.
  "endType": "never|date|count",
  "endDate": "2024-12-31",    // if endType is "date"
  "endCount": 10              // if endType is "count"
}
*/
