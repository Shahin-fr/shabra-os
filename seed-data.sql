
-- Clear existing data
DELETE FROM "Task";
DELETE FROM "User";
DELETE FROM "Project";

-- Insert admin user
INSERT INTO "User" (id, email, "firstName", "lastName", password, roles, "isActive", "createdAt", "updatedAt")
VALUES ('admin-1758219579698', 'admin@shabra.com', 'Admin', 'User', '$2b$12$JSZMdv9rYUC4zwDa4jlg3.SSRZJptjNPZzoml/vUpopXg471ml3x2', 'ADMIN', true, NOW(), NOW());

-- Insert regular user
INSERT INTO "User" (id, email, "firstName", "lastName", password, roles, "isActive", "createdAt", "updatedAt")
VALUES ('user-1758219579698', 'user@shabra.com', 'Regular', 'User', '$2b$12$QV6wlRMbiXoeOMEQKBBqSuqEs4UCGXf9dHq4au9/W.SsEcToAW3Ii', 'EMPLOYEE', true, NOW(), NOW());

-- Insert manager user
INSERT INTO "User" (id, email, "firstName", "lastName", password, roles, "isActive", "createdAt", "updatedAt")
VALUES ('manager-1758219579698', 'manager@shabra.com', 'Manager', 'User', '$2b$12$SJveU9N9Uw.QjHtbQrE7FO45soLHWGOfLdBiuE5oBgjOIovWgoUqO', 'MANAGER', true, NOW(), NOW());

-- Insert sample project
INSERT INTO "Project" (id, name, description, status, "startDate", "accessLevel", "createdAt", "updatedAt")
VALUES ('project-1758219579698', 'Sample Project', 'A sample project for testing', 'ACTIVE', NOW(), 'PRIVATE', NOW(), NOW());

-- Insert sample tasks
INSERT INTO "Task" (id, title, description, status, "createdBy", "projectId", "createdAt", "updatedAt")
VALUES ('task1-1758219579698', 'Setup local development', 'Configure local development environment', 'Done', 'admin-1758219579698', 'project-1758219579698', NOW(), NOW());

INSERT INTO "Task" (id, title, description, status, "createdBy", "assignedTo", "projectId", "createdAt", "updatedAt")
VALUES ('task2-1758219579698', 'Test authentication', 'Test login functionality', 'InProgress', 'admin-1758219579698', 'user-1758219579698', 'project-1758219579698', NOW(), NOW());

INSERT INTO "Task" (id, title, description, status, "createdBy", "projectId", "createdAt", "updatedAt")
VALUES ('task3-1758219579698', 'Database seeding', 'Seed database with initial data', 'Done', 'admin-1758219579698', 'project-1758219579698', NOW(), NOW());
