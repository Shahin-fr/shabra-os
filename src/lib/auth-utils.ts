import { Session } from 'next-auth';

/**
 * Check if user has any of the specified roles
 */
export function hasRole(
  session: Session | null,
  requiredRoles: string[]
): boolean {
  if (!session?.user?.roles) {
    return false;
  }

  return session.user.roles.some(role => requiredRoles.includes(role));
}

/**
 * Check if user has admin or manager role
 */
export function isAdminOrManager(session: Session | null): boolean {
  return hasRole(session, ['ADMIN', 'MANAGER']);
}

/**
 * Check if user is admin only
 */
export function isAdmin(session: Session | null): boolean {
  return hasRole(session, ['ADMIN']);
}

/**
 * Check if user is manager only
 */
export function isManager(session: Session | null): boolean {
  return hasRole(session, ['MANAGER']);
}

/**
 * Check if user is employee only
 */
export function isEmployee(session: Session | null): boolean {
  return hasRole(session, ['EMPLOYEE']);
}

/**
 * Get user's highest privilege level
 */
export function getUserPrivilegeLevel(
  session: Session | null
): 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'NONE' {
  if (!session?.user?.roles) {
    return 'NONE';
  }

  if (session.user.roles.includes('ADMIN')) {
    return 'ADMIN';
  }

  if (session.user.roles.includes('MANAGER')) {
    return 'MANAGER';
  }

  if (session.user.roles.includes('EMPLOYEE')) {
    return 'EMPLOYEE';
  }

  return 'NONE';
}

/**
 * Check if user can perform a specific action based on required privilege level
 */
export function canPerformAction(
  session: Session | null,
  requiredLevel: 'ADMIN' | 'MANAGER' | 'EMPLOYEE'
): boolean {
  const userLevel = getUserPrivilegeLevel(session);

  const privilegeHierarchy = {
    ADMIN: 3,
    MANAGER: 2,
    EMPLOYEE: 1,
    NONE: 0,
  };

  return privilegeHierarchy[userLevel] >= privilegeHierarchy[requiredLevel];
}
