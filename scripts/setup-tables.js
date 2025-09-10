#!/usr/bin/env node

/**
 * Database Table Setup Script
 * Creates the necessary tables using SQL commands directly
 */

const { execSync } = require('child_process');

console.log('🔄 Setting up database tables...');

async function main() {
  try {
    // Create tables using SQL commands
    const createTablesSQL = `
-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "avatar" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "roles" TEXT NOT NULL DEFAULT 'EMPLOYEE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Create indexes for User table
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_isActive_idx" ON "User"("isActive");
CREATE INDEX IF NOT EXISTS "User_createdAt_idx" ON "User"("createdAt");
CREATE INDEX IF NOT EXISTS "User_firstName_lastName_idx" ON "User"("firstName", "lastName");

-- Create Project table
CREATE TABLE IF NOT EXISTS "Project" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "startDate" TIMESTAMP(3),
  "endDate" TIMESTAMP(3),
  "accessLevel" TEXT NOT NULL DEFAULT 'PRIVATE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- Create Task table
CREATE TABLE IF NOT EXISTS "Task" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "status" TEXT NOT NULL DEFAULT 'TODO',
  "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
  "dueDate" TIMESTAMP(3),
  "createdBy" TEXT NOT NULL,
  "assignedTo" TEXT,
  "projectId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- Create indexes for Task table
CREATE INDEX IF NOT EXISTS "Task_createdBy_idx" ON "Task"("createdBy");
CREATE INDEX IF NOT EXISTS "Task_assignedTo_idx" ON "Task"("assignedTo");
CREATE INDEX IF NOT EXISTS "Task_projectId_idx" ON "Task"("projectId");
CREATE INDEX IF NOT EXISTS "Task_status_idx" ON "Task"("status");
CREATE INDEX IF NOT EXISTS "Task_priority_idx" ON "Task"("priority");
CREATE INDEX IF NOT EXISTS "Task_dueDate_idx" ON "Task"("dueDate");
CREATE INDEX IF NOT EXISTS "Task_createdAt_idx" ON "Task"("createdAt");

-- Add foreign key constraints
ALTER TABLE "Task" ADD CONSTRAINT IF NOT EXISTS "Task_createdBy_fkey" 
  FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Task" ADD CONSTRAINT IF NOT EXISTS "Task_assignedTo_fkey" 
  FOREIGN KEY ("assignedTo") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Task" ADD CONSTRAINT IF NOT EXISTS "Task_projectId_fkey" 
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
`;

    // Execute the SQL commands
    console.log('🔄 Creating tables...');
    execSync(`docker exec postgres-shabra-final psql -U shabrauser -d shabra_os -c "${createTablesSQL}"`, { stdio: 'inherit' });

    console.log('✅ Database tables created successfully!');
    console.log('🎉 You can now run: npm run db:seed');

  } catch (error) {
    console.error('❌ Table creation failed:', error.message);
    process.exit(1);
  }
}

main();
