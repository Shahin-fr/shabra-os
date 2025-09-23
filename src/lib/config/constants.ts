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

export const DEFAULT_ADMIN_EMAIL = 'admin@shabra.com';
export const DEFAULT_ADMIN_PASSWORD = 'admin-password-123';

export const DEFAULT_MANAGER_EMAIL = 'manager@shabra.com';
export const DEFAULT_MANAGER_PASSWORD = 'manager-password-123';

export const DEFAULT_USER_EMAIL = 'user@shabra.com';
export const DEFAULT_USER_PASSWORD = 'user-password-123';

export const DEFAULT_TEST_EMAIL = 'test@shabra.com';
export const DEFAULT_TEST_PASSWORD = 'test-password-123';

/**
 * Default user data for seeding
 */
export const DEFAULT_ADMIN_USER = {
  email: DEFAULT_ADMIN_EMAIL,
  password: DEFAULT_ADMIN_PASSWORD,
  firstName: 'Admin',
  lastName: 'User',
  roles: 'ADMIN',
  isActive: true,
};

export const DEFAULT_MANAGER_USER = {
  email: DEFAULT_MANAGER_EMAIL,
  password: DEFAULT_MANAGER_PASSWORD,
  firstName: 'Manager',
  lastName: 'User',
  roles: 'MANAGER',
  isActive: true,
};

export const DEFAULT_EMPLOYEE_USER = {
  email: DEFAULT_USER_EMAIL,
  password: DEFAULT_USER_PASSWORD,
  firstName: 'Regular',
  lastName: 'User',
  roles: 'EMPLOYEE',
  isActive: true,
};

export const DEFAULT_TEST_USER = {
  email: DEFAULT_TEST_EMAIL,
  password: DEFAULT_TEST_PASSWORD,
  firstName: 'Test',
  lastName: 'User',
  roles: 'EMPLOYEE',
  isActive: true,
};
