-- Migration script to update projects table schema
-- Run this script to add missing fields and update existing data

-- Step 1: Add new columns if they don't exist
DO $$ 
BEGIN
    -- Add accessLevel column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'accesslevel') THEN
        ALTER TABLE projects ADD COLUMN "accessLevel" TEXT DEFAULT 'PRIVATE';
    END IF;
    
    -- Add startDate column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'startdate') THEN
        ALTER TABLE projects ADD COLUMN "startDate" TIMESTAMP;
    END IF;
    
    -- Add endDate column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'enddate') THEN
        ALTER TABLE projects ADD COLUMN "endDate" TIMESTAMP;
    END IF;
END $$;

-- Step 2: Update existing projects with default values
UPDATE projects 
SET 
    "startDate" = COALESCE("startDate", "createdAt"),
    "accessLevel" = COALESCE("accessLevel", 'PRIVATE')
WHERE "startDate" IS NULL OR "accessLevel" IS NULL;

-- Step 3: Update status values to uppercase if they're lowercase
UPDATE projects 
SET status = UPPER(status) 
WHERE status IN ('active', 'completed', 'paused', 'cancelled');

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_accesslevel ON projects("accessLevel");
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- Step 5: Verify the migration
SELECT 
    COUNT(*) as total_projects,
    COUNT(CASE WHEN "startDate" IS NOT NULL THEN 1 END) as projects_with_start_date,
    COUNT(CASE WHEN "accessLevel" IS NOT NULL THEN 1 END) as projects_with_access_level,
    COUNT(CASE WHEN status IN ('ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED') THEN 1 END) as projects_with_valid_status
FROM projects;
