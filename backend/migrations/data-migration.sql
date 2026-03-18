-- Data Migration Script
-- Date: 2026-03-13
-- Description: Update existing data to use new schema

-- 1. Assign sessions without project_id to the first active project
SET @default_project_id = (SELECT id FROM projects WHERE is_active = 1 ORDER BY id LIMIT 1);

UPDATE sessions
SET project_id = @default_project_id
WHERE project_id IS NULL AND @default_project_id IS NOT NULL;

-- Show results
SELECT
    CONCAT('✅ Updated ', COUNT(*), ' sessions with default project') as result
FROM sessions
WHERE project_id = @default_project_id;

-- 2. Verify all sessions now have a project
SELECT
    CASE
        WHEN COUNT(*) = 0 THEN '✅ All sessions have project_id assigned'
        ELSE CONCAT('⚠️  Warning: ', COUNT(*), ' sessions still without project_id')
    END as verification
FROM sessions
WHERE project_id IS NULL;

-- 3. Show statistics
SELECT
    '📊 Database Statistics' as info,
    (SELECT COUNT(*) FROM sessions) as total_sessions,
    (SELECT COUNT(*) FROM sessions WHERE project_id IS NOT NULL) as sessions_with_project,
    (SELECT COUNT(*) FROM therapists) as total_staff,
    (SELECT COUNT(*) FROM entity_therapist) as staff_entity_assignments,
    (SELECT COUNT(*) FROM entities) as total_entities,
    (SELECT COUNT(*) FROM projects WHERE is_active = 1) as active_projects;

SELECT '✅ Data migration completed successfully!' as status;
