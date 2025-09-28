-- Create admin and employee users
-- Password: Password123 (hashed with bcryptjs)
INSERT INTO users (id, email, "firstName", "lastName", password, roles, "isActive", "createdAt", "updatedAt") 
VALUES 
  ('admin-1', 'admin@example.com', 'Admin', 'User', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4Qz8K2O', '{"ADMIN"}', true, NOW(), NOW()),
  ('employee-1', 'employee@example.com', 'Employee', 'User', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4Qz8K2O', '{"EMPLOYEE"}', true, NOW(), NOW());
