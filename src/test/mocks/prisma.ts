import { vi } from 'vitest';
import { createPrismaMock, createMockUser, createMockProject, createMockTask, createMockStory } from './factory';

/**
 * Prisma Mock Configuration
 * 
 * Centralized Prisma mocking with sensible defaults and easy customization.
 */

export const createPrismaMockWithDefaults = () => {
  const mockPrisma = createPrismaMock();

  // User defaults
  mockPrisma.user.findUnique.mockResolvedValue(createMockUser());
  mockPrisma.user.findMany.mockResolvedValue([createMockUser()]);

  // Project defaults
  mockPrisma.project.findUnique.mockImplementation(async ({ where }) => {
    if (where.id === 'clh1234567890123456789013') {
      return createMockProject();
    }
    return null;
  });
  mockPrisma.project.findMany.mockResolvedValue([createMockProject()]);
  mockPrisma.project.update.mockResolvedValue(createMockProject({ updatedAt: new Date() }));

  // Task defaults
  mockPrisma.task.findMany.mockResolvedValue([createMockTask()]);
  mockPrisma.task.create.mockImplementation(async ({ data, include }) => {
    const mockTask = {
      id: 'new-task-id',
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: data.dueDate ? (data.dueDate instanceof Date ? data.dueDate.toISOString() : data.dueDate) : null,
    };

    // Add included relations if requested
    if (include) {
      if (include.creator) {
        mockTask.creator = createMockUser();
      }
      if (include.assignee) {
        mockTask.assignee = data.assignedTo ? createMockUser({ id: data.assignedTo }) : null;
      }
      if (include.project) {
        mockTask.project = data.projectId ? createMockProject({ id: data.projectId }) : null;
      }
    }

    return mockTask;
  });

  // Story defaults
  mockPrisma.story.findMany.mockResolvedValue([createMockStory()]);
  mockPrisma.story.findFirst.mockResolvedValue(createMockStory());
  mockPrisma.story.findUnique.mockImplementation(async ({ where }) => {
    if (where.id === 'story-123') {
      return createMockStory();
    }
    return null;
  });

  // Transaction mock - simple and effective
  mockPrisma.$transaction.mockImplementation(async (callback) => {
    // Create a transaction client that has all the same methods as the main client
    const txClient = {
      ...mockPrisma,
      // Ensure task.create is properly mocked in the transaction context
      task: {
        ...mockPrisma.task,
        create: mockPrisma.task.create,
      },
    };
    return await callback(txClient);
  });

  return mockPrisma;
};

// Global Prisma mock instance
export const mockPrisma = createPrismaMockWithDefaults();
