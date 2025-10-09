import { vi } from 'vitest';
import { createMockUser, createMockProject, createMockTask, createMockStory, createMockSession, createTestUsers, createMockCredentials } from '../mocks';

/**
 * Test Helper Utilities
 * 
 * Simple utilities to make testing easier and more consistent.
 */

// Reset all mocks to clean state
export const resetAllMocks = () => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
};

// Setup mock authentication for tests
export const setupMockAuth = (sessionOverrides: Partial<any> = {}) => {
  const mockSession = createMockSession(sessionOverrides);
  vi.stubEnv('NEXTAUTH_SECRET', 'test-secret-key');
  vi.stubEnv('NODE_ENV', 'development');
  return mockSession;
};

// Create test data with common patterns
export const createTestData = {
  user: createMockUser,
  project: createMockProject,
  task: createMockTask,
  story: createMockStory,
  session: createMockSession,
  credentials: createMockCredentials,
  // Predefined user scenarios
  adminUser: createTestUsers.admin,
  managerUser: createTestUsers.manager,
  employeeUser: createTestUsers.employee,
  inactiveUser: createTestUsers.inactive,
  noRolesUser: createTestUsers.noRoles,
  
  activeProject: () => createMockProject({ status: 'ACTIVE' }),
  completedProject: () => createMockProject({ status: 'COMPLETED' }),
  
  pendingTask: () => createMockTask({ status: 'PENDING' }),
  completedTask: () => createMockTask({ status: 'COMPLETED' }),
  
  draftStory: () => createMockStory({ status: 'DRAFT' }),
  publishedStory: () => createMockStory({ status: 'PUBLISHED' }),
};

// Mock setup helpers

export const setupMockPrisma = (overrides: Record<string, any> = {}) => {
  const { mockPrisma } = require('../mocks');
  Object.keys(overrides).forEach(key => {
    if (mockPrisma[key]) {
      Object.assign(mockPrisma[key], overrides[key]);
    }
  });
};

// Common test patterns
export const expectMockCalledWith = (mockFn: any, expectedArgs: any) => {
  expect(mockFn).toHaveBeenCalledWith(expect.objectContaining(expectedArgs));
};

export const expectMockCalledTimes = (mockFn: any, times: number) => {
  expect(mockFn).toHaveBeenCalledTimes(times);
};
