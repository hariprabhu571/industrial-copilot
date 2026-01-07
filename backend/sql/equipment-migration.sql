-- Phase 29: Equipment Management Migration Script
-- Apply equipment management schema and data to existing database

-- ============================================================================
-- MIGRATION: Add Equipment Management to Industrial AI Copilot
-- ============================================================================

-- Check if equipment tables already exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'equipment_categories') THEN
        RAISE NOTICE 'Applying Equipment Management Schema...';
        
        -- Apply equipment schema
        \i equipment-schema.sql
        
        RAISE NOTICE 'Equipment Management Schema Applied Successfully';
    ELSE
        RAISE NOTICE 'Equipment Management Schema Already Exists';
    END IF;
END $$;

-- Check if sample data exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM equipment_categories LIMIT 1) THEN
        RAISE NOTICE 'Loading Equipment Sample Data...';
        
        -- Apply sample data
        \i equipment-sample-data.sql
        
        RAISE NOTICE 'Equipment Sample Data Loaded Successfully';
    ELSE
        RAISE NOTICE 'Equipment Sample Data Already Exists';
    END IF;
END $$;

-- Verify migration
DO $$
DECLARE
    equipment_count INTEGER;
    user_count INTEGER;
    maintenance_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO equipment_count FROM equipment;
    SELECT COUNT(*) INTO user_count FROM users WHERE equipment_role IS NOT NULL;
    SELECT COUNT(*) INTO maintenance_count FROM maintenance_records;
    
    RAISE NOTICE 'Migration Verification:';
    RAISE NOTICE '- Equipment Records: %', equipment_count;
    RAISE NOTICE '- Users with Equipment Roles: %', user_count;
    RAISE NOTICE '- Maintenance Records: %', maintenance_count;
    
    IF equipment_count > 0 AND user_count > 0 AND maintenance_count > 0 THEN
        RAISE NOTICE 'Equipment Management Migration SUCCESSFUL';
    ELSE
        RAISE WARNING 'Equipment Management Migration may have ISSUES';
    END IF;
END $$;