import { vi } from 'vitest';
import { createMockUser, createMockSession, createMockCredentials, createTestUsers } from './factory';

/**
 * Authentication Mock Configuration
 * 
 * Centralized auth mocking with different user roles and scenarios.
 */

export const createAuthMock = (overrides: Partial<any> = {}) => {
  const defaultSession = createMockSession(overrides);
  
  return {
    auth: vi.fn().mockResolvedValue(defaultSession),
    withAuth: vi.fn().mockImplementation((request, options) => {
      const role = options?.requiredPrivilegeLevel === 'MANAGER' ? 'MANAGER' : 'EMPLOYEE';
      return Promise.resolve({
        response: null,
        context: {
          userId: defaultSession.user.id,
          user: {
            ...defaultSession.user,
            role: role,
          },
        },
      });
    }),
  };
};

// Environment mock helpers
export const createMockEnv = () => ({
  NEXTAUTH_SECRET: 'test-secret-key',
  NODE_ENV: 'development',
});

// bcrypt mock helpers
export const createBcryptMock = () => ({
  compare: vi.fn().mockResolvedValue(true),
  hash: vi.fn().mockResolvedValue('hashed-password'),
});

// NextAuth mock helpers
export const createNextAuthMock = () => ({
  default: vi.fn(() => ({
    handlers: {},
    auth: {
      authorize: vi.fn(),
      callbacks: {
        jwt: vi.fn(),
        session: vi.fn(),
      },
    },
    signIn: vi.fn(),
    signOut: vi.fn(),
  })),
});

// Global auth mock
export const mockAuth = createAuthMock();

// Common test scenarios
export const authTestScenarios = {
  validUser: () => createTestUsers.admin(),
  invalidUser: () => null,
  inactiveUser: () => createTestUsers.inactive(),
  noRolesUser: () => createTestUsers.noRoles(),
  validCredentials: () => createMockCredentials(),
  invalidCredentials: () => createMockCredentials({ password: 'wrong-password' }),
};
