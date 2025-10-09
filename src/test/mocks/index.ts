/**
 * Centralized Mock Exports
 * 
 * Single entry point for all test mocks.
 * This follows the YAGNI principle - simple, direct, and effective.
 */

// Core factories
export * from './factory';

// Specific mock configurations
export { mockPrisma, createPrismaMockWithDefaults } from './prisma';
export { mockAuth, createAuthMock, createMockEnv, createBcryptMock, createNextAuthMock, authTestScenarios } from './auth';
export { mockStoryService, mockProjectService, createStoryServiceMock, createProjectServiceMock } from './services';

// Re-export commonly used utilities
export { vi } from 'vitest';
