/**
 * Default Admin Credentials
 * 
 * This file serves as the single source of truth for default admin credentials
 * across the entire application. All seeding scripts, API routes, and configuration
 * files should import and use these constants instead of hardcoded strings.
 * 
 * IMPORTANT: These are DEFAULT credentials for development and seeding only.
 * In production, always use environment variables or secure credential management.
 */

const DEFAULT_ADMIN_EMAIL = 'admin@shabra.com';
const DEFAULT_ADMIN_PASSWORD = 'admin-password-123';

const DEFAULT_MANAGER_EMAIL = 'manager@shabra.com';
const DEFAULT_MANAGER_PASSWORD = 'manager-password-123';

const DEFAULT_USER_EMAIL = 'user@shabra.com';
const DEFAULT_USER_PASSWORD = 'user-password-123';

const DEFAULT_TEST_EMAIL = 'test@shabra.com';
const DEFAULT_TEST_PASSWORD = 'test-password-123';

/**
 * Default user data for seeding
 */
const DEFAULT_ADMIN_USER = {
  email: DEFAULT_ADMIN_EMAIL,
  password: DEFAULT_ADMIN_PASSWORD,
  firstName: 'Admin',
  lastName: 'User',
  roles: 'ADMIN',
  isActive: true,
};

const DEFAULT_MANAGER_USER = {
  email: DEFAULT_MANAGER_EMAIL,
  password: DEFAULT_MANAGER_PASSWORD,
  firstName: 'Manager',
  lastName: 'User',
  roles: 'MANAGER',
  isActive: true,
};

const DEFAULT_EMPLOYEE_USER = {
  email: DEFAULT_USER_EMAIL,
  password: DEFAULT_USER_PASSWORD,
  firstName: 'Regular',
  lastName: 'User',
  roles: 'EMPLOYEE',
  isActive: true,
};

const DEFAULT_TEST_USER = {
  email: DEFAULT_TEST_EMAIL,
  password: DEFAULT_TEST_PASSWORD,
  firstName: 'Test',
  lastName: 'User',
  roles: 'EMPLOYEE',
  isActive: true,
};

module.exports = {
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSWORD,
  DEFAULT_MANAGER_EMAIL,
  DEFAULT_MANAGER_PASSWORD,
  DEFAULT_USER_EMAIL,
  DEFAULT_USER_PASSWORD,
  DEFAULT_TEST_EMAIL,
  DEFAULT_TEST_PASSWORD,
  DEFAULT_ADMIN_USER,
  DEFAULT_MANAGER_USER,
  DEFAULT_EMPLOYEE_USER,
  DEFAULT_TEST_USER,
};

