// Authentication and Authorization Utilities

/**
 * Checks if a user has any of the required roles
 * @param userRoles - Array of user roles
 * @param requiredRoles - Array of required roles
 * @returns boolean indicating if user has required role
 */
export function hasRequiredRole(userRoles: string[], requiredRoles: string[]): boolean {
  return requiredRoles.some(role => userRoles.includes(role));
}

/**
 * Checks if a user is an admin
 * @param userRoles - Array of user roles
 * @returns boolean indicating if user is admin
 */
export function isAdmin(userRoles: string[]): boolean {
  return userRoles.includes('ADMIN');
}

/**
 * Checks if a user is a manager or admin
 * @param userRoles - Array of user roles
 * @returns boolean indicating if user is manager or admin
 */
export function isManagerOrAdmin(userRoles: string[]): boolean {
  return hasRequiredRole(userRoles, ['ADMIN', 'MANAGER']);
}

/**
 * Checks if a user is an employee
 * @param userRoles - Array of user roles
 * @returns boolean indicating if user is employee
 */
export function isEmployee(userRoles: string[]): boolean {
  return userRoles.includes('EMPLOYEE');
}

/**
 * Gets the highest role from a list of roles
 * @param userRoles - Array of user roles
 * @returns the highest role (ADMIN > MANAGER > EMPLOYEE)
 */
export function getHighestRole(userRoles: string[]): string {
  if (userRoles.includes('ADMIN')) return 'ADMIN';
  if (userRoles.includes('MANAGER')) return 'MANAGER';
  if (userRoles.includes('EMPLOYEE')) return 'EMPLOYEE';
  return 'EMPLOYEE'; // Default fallback
}

/**
 * Checks if a user can access admin features
 * @param userRoles - Array of user roles
 * @returns boolean indicating if user can access admin features
 */
export function canAccessAdmin(userRoles: string[]): boolean {
  return isManagerOrAdmin(userRoles);
}

/**
 * Checks if a user can manage users
 * @param userRoles - Array of user roles
 * @returns boolean indicating if user can manage users
 */
export function canManageUsers(userRoles: string[]): boolean {
  return isManagerOrAdmin(userRoles);
}

/**
 * Checks if a user can manage attendance
 * @param userRoles - Array of user roles
 * @returns boolean indicating if user can manage attendance
 */
export function canManageAttendance(userRoles: string[]): boolean {
  return isManagerOrAdmin(userRoles);
}

/**
 * Checks if a user can manage leave requests
 * @param userRoles - Array of user roles
 * @returns boolean indicating if user can manage leave requests
 */
export function canManageLeaveRequests(userRoles: string[]): boolean {
  return isManagerOrAdmin(userRoles);
}
