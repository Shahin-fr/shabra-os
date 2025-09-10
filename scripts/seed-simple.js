#!/usr/bin/env node

/**
 * Simple Database Seeding Script
 * Uses SQL files to avoid command line parsing issues
 */

const { execSync } = require('child_process');
const bcrypt = require('bcryptjs');
const fs = require('fs');

console.log('🌱 Starting simple database seeding...');

async function main() {
  try {
    // Generate hashed passwords
    const adminPassword = await bcrypt.hash('admin-password-123', 12);
    const userPassword = await bcrypt.hash('user-password-123', 12);
    const managerPassword = await bcrypt.hash('manager-password-123', 12);

    // Create SQL file for seeding
    const seedSQL = `
-- Clear existing data
DELETE FROM "Task";
DELETE FROM "User";
DELETE FROM "Project";

-- Insert admin user
INSERT INTO "User" (id, email, "firstName", "lastName", password, roles, "isActive", "createdAt", "updatedAt")
VALUES ('admin-${Date.now()}', 'admin@shabra.com', 'Admin', 'User', '${adminPassword}', 'ADMIN', true, NOW(), NOW());

-- Insert regular user
INSERT INTO "User" (id, email, "firstName", "lastName", password, roles, "isActive", "createdAt", "updatedAt")
VALUES ('user-${Date.now()}', 'user@shabra.com', 'Regular', 'User', '${userPassword}', 'EMPLOYEE', true, NOW(), NOW());

-- Insert manager user
INSERT INTO "User" (id, email, "firstName", "lastName", password, roles, "isActive", "createdAt", "updatedAt")
VALUES ('manager-${Date.now()}', 'manager@shabra.com', 'Manager', 'User', '${managerPassword}', 'MANAGER', true, NOW(), NOW());

-- Insert sample project
INSERT INTO "Project" (id, name, description, status, "startDate", "accessLevel", "createdAt", "updatedAt")
VALUES ('project-${Date.now()}', 'Sample Project', 'A sample project for testing', 'ACTIVE', NOW(), 'PRIVATE', NOW(), NOW());

-- Insert sample tasks
INSERT INTO "Task" (id, title, description, status, "createdBy", "projectId", "createdAt", "updatedAt")
VALUES ('task1-${Date.now()}', 'Setup local development', 'Configure local development environment', 'Done', 'admin-${Date.now()}', 'project-${Date.now()}', NOW(), NOW());

INSERT INTO "Task" (id, title, description, status, "createdBy", "assignedTo", "projectId", "createdAt", "updatedAt")
VALUES ('task2-${Date.now()}', 'Test authentication', 'Test login functionality', 'InProgress', 'admin-${Date.now()}', 'user-${Date.now()}', 'project-${Date.now()}', NOW(), NOW());

INSERT INTO "Task" (id, title, description, status, "createdBy", "projectId", "createdAt", "updatedAt")
VALUES ('task3-${Date.now()}', 'Database seeding', 'Seed database with initial data', 'Done', 'admin-${Date.now()}', 'project-${Date.now()}', NOW(), NOW());
`;

    // Write the SQL file
    fs.writeFileSync('seed-data.sql', seedSQL);

    // Copy and execute the SQL file
    console.log('🔄 Seeding database...');
    execSync('docker cp seed-data.sql postgres-standard:/tmp/seed-data.sql', { stdio: 'inherit' });
    execSync('docker exec postgres-standard psql -U postgres -d shabra_os -f /tmp/seed-data.sql', { stdio: 'inherit' });

    console.log('✅ Database seeding completed!');
    console.log('\n📋 Login credentials:');
    console.log('   Admin: admin@shabra.com / admin-password-123');
    console.log('   Manager: manager@shabra.com / manager-password-123');
    console.log('   User: user@shabra.com / user-password-123');

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    // Clean up
    if (fs.existsSync('seed-data.sql')) {
      fs.unlinkSync('seed-data.sql');
    }
  }
}

main();
