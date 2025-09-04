import type { Session } from 'next-auth';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import {
  hasRole,
  isAdminOrManager,
  isAdmin,
  isManager,
  isEmployee,
  getUserPrivilegeLevel,
  canPerformAction,
} from './auth-utils';

describe('Authentication Utilities', () => {
  // Helper function to create valid session objects
  const createMockSession = (userData: any): Session =>
    ({
      user: userData,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
    }) as Session;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('hasRole', () => {
    it('returns false when session is null', () => {
      const result = hasRole(null, ['ADMIN']);
      expect(result).toBe(false);
    });

    it('returns false when session has no user', () => {
      const session = createMockSession({});
      const result = hasRole(session, ['ADMIN']);
      expect(result).toBe(false);
    });

    it('returns false when user has no roles', () => {
      const session = createMockSession({});
      const result = hasRole(session, ['ADMIN']);
      expect(result).toBe(false);
    });

    it('returns true when user has one of the required roles', () => {
      const session = createMockSession({ roles: ['MANAGER', 'EMPLOYEE'] });

      const result = hasRole(session, ['ADMIN', 'MANAGER']);
      expect(result).toBe(true);
    });

    it('returns false when user has none of the required roles', () => {
      const session = createMockSession({ roles: ['EMPLOYEE'] });

      const result = hasRole(session, ['ADMIN', 'MANAGER']);
      expect(result).toBe(false);
    });

    it('handles single role requirement', () => {
      const session = createMockSession({ roles: ['ADMIN'] });

      const result = hasRole(session, ['ADMIN']);
      expect(result).toBe(true);
    });

    it('handles empty roles array', () => {
      const session = createMockSession({ roles: [] });

      const result = hasRole(session, ['ADMIN']);
      expect(result).toBe(false);
    });
  });

  describe('isAdminOrManager', () => {
    it('returns true for admin user', () => {
      const session = createMockSession({ roles: ['ADMIN'] });

      const result = isAdminOrManager(session);
      expect(result).toBe(true);
    });

    it('returns true for manager user', () => {
      const session = createMockSession({ roles: ['MANAGER'] });

      const result = isAdminOrManager(session);
      expect(result).toBe(true);
    });

    it('returns true for user with both admin and manager roles', () => {
      const session = createMockSession({ roles: ['ADMIN', 'MANAGER'] });

      const result = isAdminOrManager(session);
      expect(result).toBe(true);
    });

    it('returns false for employee user', () => {
      const session = createMockSession({ roles: ['EMPLOYEE'] });

      const result = isAdminOrManager(session);
      expect(result).toBe(false);
    });

    it('returns false for user with no roles', () => {
      const session = createMockSession({ roles: [] });

      const result = isAdminOrManager(session);
      expect(result).toBe(false);
    });

    it('returns false for null session', () => {
      const result = isAdminOrManager(null);
      expect(result).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('returns true for admin user', () => {
      const session = createMockSession({ roles: ['ADMIN'] });

      const result = isAdmin(session);
      expect(result).toBe(true);
    });

    it('returns false for manager user', () => {
      const session = createMockSession({ roles: ['MANAGER'] });

      const result = isAdmin(session);
      expect(result).toBe(false);
    });

    it('returns false for employee user', () => {
      const session = createMockSession({ roles: ['EMPLOYEE'] });

      const result = isAdmin(session);
      expect(result).toBe(false);
    });

    it('returns false for user with multiple roles including admin', () => {
      const session = createMockSession({ roles: ['ADMIN', 'MANAGER'] });

      const result = isAdmin(session);
      expect(result).toBe(true);
    });

    it('returns false for null session', () => {
      const result = isAdmin(null);
      expect(result).toBe(false);
    });
  });

  describe('isManager', () => {
    it('returns true for manager user', () => {
      const session = createMockSession({ roles: ['MANAGER'] });

      const result = isManager(session);
      expect(result).toBe(true);
    });

    it('returns false for admin user', () => {
      const session = createMockSession({ roles: ['ADMIN'] });

      const result = isManager(session);
      expect(result).toBe(false);
    });

    it('returns false for employee user', () => {
      const session = createMockSession({ roles: ['EMPLOYEE'] });

      const result = isManager(session);
      expect(result).toBe(false);
    });

    it('returns true for user with multiple roles including manager', () => {
      const session = createMockSession({ roles: ['ADMIN', 'MANAGER'] });

      const result = isManager(session);
      expect(result).toBe(true);
    });

    it('returns false for null session', () => {
      const result = isManager(null);
      expect(result).toBe(false);
    });
  });

  describe('isEmployee', () => {
    it('returns true for employee user', () => {
      const session = createMockSession({ roles: ['EMPLOYEE'] });

      const result = isEmployee(session);
      expect(result).toBe(true);
    });

    it('returns false for admin user', () => {
      const session = createMockSession({ roles: ['ADMIN'] });

      const result = isEmployee(session);
      expect(result).toBe(false);
    });

    it('returns false for manager user', () => {
      const session = createMockSession({ roles: ['MANAGER'] });

      const result = isEmployee(session);
      expect(result).toBe(false);
    });

    it('returns true for user with multiple roles including employee', () => {
      const session = createMockSession({ roles: ['ADMIN', 'EMPLOYEE'] });

      const result = isEmployee(session);
      expect(result).toBe(true);
    });

    it('returns false for null session', () => {
      const result = isEmployee(null);
      expect(result).toBe(false);
    });
  });

  describe('getUserPrivilegeLevel', () => {
    it('returns ADMIN for admin user', () => {
      const session = {
        user: { roles: ['ADMIN'] },
      } as Session;

      const result = getUserPrivilegeLevel(session);
      expect(result).toBe('ADMIN');
    });

    it('returns MANAGER for manager user', () => {
      const session = createMockSession({ roles: ['MANAGER'] });

      const result = getUserPrivilegeLevel(session);
      expect(result).toBe('MANAGER');
    });

    it('returns EMPLOYEE for employee user', () => {
      const session = createMockSession({ roles: ['EMPLOYEE'] });

      const result = getUserPrivilegeLevel(session);
      expect(result).toBe('EMPLOYEE');
    });

    it('returns ADMIN when user has multiple roles including admin', () => {
      const session = createMockSession({
        roles: ['MANAGER', 'ADMIN', 'EMPLOYEE'],
      });

      const result = getUserPrivilegeLevel(session);
      expect(result).toBe('ADMIN');
    });

    it('returns MANAGER when user has manager and employee roles', () => {
      const session = createMockSession({ roles: ['MANAGER', 'EMPLOYEE'] });

      const result = getUserPrivilegeLevel(session);
      expect(result).toBe('MANAGER');
    });

    it('returns NONE for user with no roles', () => {
      const session = createMockSession({ roles: [] });

      const result = getUserPrivilegeLevel(session);
      expect(result).toBe('NONE');
    });

    it('returns NONE for null session', () => {
      const result = getUserPrivilegeLevel(null);
      expect(result).toBe('NONE');
    });

    it('returns NONE for session with no user', () => {
      const session = {} as Session;
      const result = getUserPrivilegeLevel(session);
      expect(result).toBe('NONE');
    });
  });

  describe('canPerformAction', () => {
    it('allows admin to perform any action', () => {
      const session = createMockSession({ roles: ['ADMIN'] });

      expect(canPerformAction(session, 'ADMIN')).toBe(true);
      expect(canPerformAction(session, 'MANAGER')).toBe(true);
      expect(canPerformAction(session, 'EMPLOYEE')).toBe(true);
    });

    it('allows manager to perform manager and employee actions', () => {
      const session = createMockSession({ roles: ['MANAGER'] });

      expect(canPerformAction(session, 'ADMIN')).toBe(false);
      expect(canPerformAction(session, 'MANAGER')).toBe(true);
      expect(canPerformAction(session, 'EMPLOYEE')).toBe(true);
    });

    it('allows employee to perform only employee actions', () => {
      const session = createMockSession({ roles: ['EMPLOYEE'] });

      expect(canPerformAction(session, 'ADMIN')).toBe(false);
      expect(canPerformAction(session, 'MANAGER')).toBe(false);
      expect(canPerformAction(session, 'EMPLOYEE')).toBe(true);
    });

    it('denies access for user with no roles', () => {
      const session = createMockSession({ roles: [] });

      expect(canPerformAction(session, 'ADMIN')).toBe(false);
      expect(canPerformAction(session, 'MANAGER')).toBe(false);
      expect(canPerformAction(session, 'EMPLOYEE')).toBe(false);
    });

    it('denies access for null session', () => {
      expect(canPerformAction(null, 'ADMIN')).toBe(false);
      expect(canPerformAction(null, 'MANAGER')).toBe(false);
      expect(canPerformAction(null, 'EMPLOYEE')).toBe(false);
    });

    it('handles privilege hierarchy correctly', () => {
      const adminSession = createMockSession({ roles: ['ADMIN'] });
      const managerSession = createMockSession({ roles: ['MANAGER'] });
      const employeeSession = createMockSession({ roles: ['EMPLOYEE'] });

      // Test privilege hierarchy
      expect(canPerformAction(adminSession, 'MANAGER')).toBe(true);
      expect(canPerformAction(adminSession, 'EMPLOYEE')).toBe(true);

      expect(canPerformAction(managerSession, 'ADMIN')).toBe(false);
      expect(canPerformAction(managerSession, 'EMPLOYEE')).toBe(true);

      expect(canPerformAction(employeeSession, 'ADMIN')).toBe(false);
      expect(canPerformAction(employeeSession, 'MANAGER')).toBe(false);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles undefined roles gracefully', () => {
      const session = {
        user: { roles: undefined },
      } as any;

      expect(hasRole(session, ['ADMIN'])).toBe(false);
      expect(isAdminOrManager(session)).toBe(false);
      expect(getUserPrivilegeLevel(session)).toBe('NONE');
    });

    it('handles null roles gracefully', () => {
      const session = {
        user: { roles: null },
      } as any;

      expect(hasRole(session, ['ADMIN'])).toBe(false);
      expect(isAdminOrManager(session)).toBe(false);
      expect(getUserPrivilegeLevel(session)).toBe('NONE');
    });

    it('handles malformed session objects', () => {
      const malformedSession = {
        user: null,
      } as any;

      expect(hasRole(malformedSession, ['ADMIN'])).toBe(false);
      expect(isAdminOrManager(malformedSession)).toBe(false);
      expect(getUserPrivilegeLevel(malformedSession)).toBe('NONE');
    });

    it('handles empty string roles', () => {
      const session = createMockSession({ roles: ['', 'ADMIN', ''] });

      expect(hasRole(session, ['ADMIN'])).toBe(true);
      expect(hasRole(session, ['MANAGER'])).toBe(false);
    });

    it('handles case-sensitive role matching', () => {
      const session = createMockSession({ roles: ['admin'] }); // lowercase

      expect(hasRole(session, ['ADMIN'])).toBe(false); // uppercase
      expect(hasRole(session, ['admin'])).toBe(true); // lowercase
    });
  });
});
