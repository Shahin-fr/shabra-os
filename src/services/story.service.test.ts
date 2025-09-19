import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StoryService } from './story.service';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { DatabasePerformanceMonitor } from '@/lib/database/query-optimizer';
import { StoryQueryOptimizer } from '@/lib/database/query-optimizer';

// Unmock StoryService for this test file
vi.unmock('@/services/story.service');

// Mock Prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: {
    story: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    project: {
      findFirst: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock database performance monitor
vi.mock('@/lib/database/query-optimizer', () => ({
  DatabasePerformanceMonitor: {
    monitorQueryPerformance: vi.fn(),
  },
  StoryQueryOptimizer: {
    getStoriesByDay: vi.fn(),
  },
}));

describe('StoryService', () => {
  const mockPrisma = vi.mocked(prisma);
  const mockLogger = vi.mocked(logger);
  const mockDatabasePerformanceMonitor = vi.mocked(DatabasePerformanceMonitor);
  const mockStoryQueryOptimizer = vi.mocked(StoryQueryOptimizer);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getStoriesByDay', () => {
    it('should return stories for a valid date', async () => {
      // Arrange
      const day = '2024-01-15';
      const mockStories = [
        {
          id: '1',
          title: 'Test Story 1',
          day: '2024-01-15',
          order: 1,
        },
        {
          id: '2',
          title: 'Test Story 2',
          day: '2024-01-15',
          order: 2,
        },
      ];

      mockDatabasePerformanceMonitor.monitorQueryPerformance.mockResolvedValue({
        result: mockStories,
        duration: 100,
        memoryUsage: 1024,
      });

      // Act
      const result = await StoryService.getStoriesByDay(day);

      // Assert
      expect(mockDatabasePerformanceMonitor.monitorQueryPerformance).toHaveBeenCalledWith(
        'getStoriesByDay',
        expect.any(Function)
      );
      // The StoryQueryOptimizer.getStoriesByDay is called within the monitorQueryPerformance callback
      // We can't directly test it since it's wrapped in the performance monitor
      expect(result).toEqual(mockStories);
    });

    it('should throw error for invalid date format', async () => {
      // Arrange
      const invalidDay = 'invalid-date';

      // Act & Assert
      await expect(StoryService.getStoriesByDay(invalidDay)).rejects.toThrow(
        'Invalid date format. Expected YYYY-MM-DD'
      );
    });
  });

  describe('getStoryById', () => {
    it('should return story with related data for valid ID', async () => {
      // Arrange
      const storyId = 'story-123';
      const mockStory = {
        id: storyId,
        title: 'Test Story',
        content: 'Test content',
        storyType: {
          id: 'type-1',
          name: 'Test Type',
          icon: 'test-icon',
        },
        storyIdea: {
          id: 'idea-1',
          title: 'Test Idea',
          description: 'Test description',
        },
        author: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
        },
      };

      mockPrisma.story.findUnique.mockResolvedValue(mockStory);

      // Act
      const result = await StoryService.getStoryById(storyId);

      // Assert
      expect(mockPrisma.story.findUnique).toHaveBeenCalledWith({
        where: { id: storyId },
        include: {
          storyType: {
            select: {
              id: true,
              name: true,
              icon: true,
            },
          },
          storyIdea: {
            select: {
              id: true,
              title: true,
              description: true,
              category: true,
              storyType: true,
            },
          },
          author: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      expect(result).toEqual(mockStory);
    });

    it('should throw error when story not found', async () => {
      // Arrange
      const storyId = 'non-existent-id';
      mockPrisma.story.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(StoryService.getStoryById(storyId)).rejects.toThrow('Story not found');
    });
  });

  describe('createStory', () => {
    it('should create story with valid data', async () => {
      // Arrange
      const storyData = {
        title: 'New Story',
        notes: 'Test notes',
        day: '2024-01-15',
        order: 1,
        projectId: 'cmf5o9m110001u35cldria860',
        storyTypeId: 'cmf5o9m110001u35cldria861',
        authorId: 'cmf5o9m110001u35cldria862',
      };

      const mockCreatedStory = {
        id: 'new-story-id',
        ...storyData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.project.findFirst.mockResolvedValue({ id: 'cmf5o9m110001u35cldria860' });
      mockDatabasePerformanceMonitor.monitorQueryPerformance.mockImplementation(async (name, callback) => {
        // Mock the prisma.$transaction call within the callback
        mockPrisma.$transaction.mockImplementation(async (txCallback) => {
          const mockTx = {
            story: {
              create: vi.fn().mockResolvedValue(mockCreatedStory),
            },
            project: {
              update: vi.fn().mockResolvedValue({}),
            },
          };
          return await txCallback(mockTx);
        });
        const result = await callback();
        return { result };
      });

      // Act
      const result = await StoryService.createStory(storyData);

      // Assert
      expect(mockPrisma.project.findFirst).toHaveBeenCalled();
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(result).toEqual(mockCreatedStory);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Story created successfully',
        expect.objectContaining({
          storyId: 'new-story-id',
          authorId: 'cmf5o9m110001u35cldria862',
          operation: 'StoryService.createStory',
        })
      );
    });

    it('should handle old project ID conversion', async () => {
      // Arrange
      const storyData = {
        title: 'New Story',
        day: '2024-01-15',
        order: 1,
        projectId: 'cmf5o9m110001u35cldria860', // Old project ID
        storyTypeId: 'cmf5o9m110001u35cldria861',
        authorId: 'cmf5o9m110001u35cldria862',
      };

      const mockFirstProject = { id: 'new-project-id' };
      mockPrisma.project.findFirst.mockResolvedValue(mockFirstProject);
      mockDatabasePerformanceMonitor.monitorQueryPerformance.mockImplementation(async (name, callback) => {
        const mockTx = {
          story: {
            create: vi.fn().mockResolvedValue({ id: 'new-story-id' }),
          },
        };
        const result = await callback();
        return { result };
      });

      // Act
      await StoryService.createStory(storyData);

      // Assert
      expect(mockPrisma.project.findFirst).toHaveBeenCalled();
    });
  });

  describe('updateStory', () => {
    it('should update story with valid data', async () => {
      // Arrange
      const storyId = 'story-123';
      const updateData = {
        title: 'Updated Story',
        notes: 'Updated notes',
      };

      const mockUpdatedStory = {
        id: storyId,
        title: 'Updated Story',
        notes: 'Updated notes',
        updatedAt: new Date(),
      };

      mockPrisma.story.findUnique.mockResolvedValue({ id: storyId });
      mockPrisma.story.update.mockResolvedValue(mockUpdatedStory);

      // Act
      const result = await StoryService.updateStory(storyId, updateData);

      // Assert
      expect(mockPrisma.story.findUnique).toHaveBeenCalledWith({
        where: { id: storyId },
      });
      expect(mockPrisma.story.update).toHaveBeenCalledWith({
        where: { id: storyId },
        data: {
          title: 'Updated Story',
          notes: 'Updated notes',
        },
        include: {
          storyType: {
            select: {
              id: true,
              name: true,
              icon: true,
            },
          },
          storyIdea: {
            select: {
              id: true,
              title: true,
              description: true,
              category: true,
              storyType: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      expect(result).toEqual(mockUpdatedStory);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Story updated successfully',
        expect.objectContaining({
          storyId,
          operation: 'StoryService.updateStory',
        })
      );
    });

    it('should throw error when story not found for update', async () => {
      // Arrange
      const storyId = 'non-existent-id';
      const updateData = { title: 'Updated Story' };

      mockPrisma.story.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(StoryService.updateStory(storyId, updateData)).rejects.toThrow(
        'Story not found'
      );
    });
  });

  describe('deleteStory', () => {
    it('should delete story with valid ID', async () => {
      // Arrange
      const storyId = 'story-123';
      const mockExistingStory = { id: storyId };

      mockPrisma.story.findUnique.mockResolvedValue(mockExistingStory);
      mockPrisma.story.delete.mockResolvedValue(mockExistingStory);

      // Act
      const result = await StoryService.deleteStory(storyId);

      // Assert
      expect(mockPrisma.story.findUnique).toHaveBeenCalledWith({
        where: { id: storyId },
      });
      expect(mockPrisma.story.delete).toHaveBeenCalledWith({
        where: { id: storyId },
      });
      expect(result).toEqual({
        success: true,
        deletedId: storyId,
      });
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Story deleted successfully',
        expect.objectContaining({
          storyId,
          operation: 'StoryService.deleteStory',
        })
      );
    });

    it('should throw error when story not found for deletion', async () => {
      // Arrange
      const storyId = 'non-existent-id';
      mockPrisma.story.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(StoryService.deleteStory(storyId)).rejects.toThrow('Story not found');
    });
  });

  describe('reorderStories', () => {
    it('should reorder stories successfully', async () => {
      // Arrange
      const storyIds = ['story-1', 'story-2', 'story-3'];
      const mockExistingStories = [
        { id: 'story-1' },
        { id: 'story-2' },
        { id: 'story-3' },
      ];

      const mockUpdatedStories = [
        { id: 'story-1', order: 1 },
        { id: 'story-2', order: 2 },
        { id: 'story-3', order: 3 },
      ];

      mockPrisma.story.findMany.mockResolvedValue(mockExistingStories);
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          story: {
            update: vi.fn().mockImplementation(({ where, data }) => ({
              id: where.id,
              order: data.order,
            })),
          },
        });
      });

      // Act
      const result = await StoryService.reorderStories(storyIds);

      // Assert
      expect(mockPrisma.story.findMany).toHaveBeenCalledWith({
        where: {
          id: { in: storyIds },
        },
        select: { id: true },
      });
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Stories reordered successfully',
        expect.objectContaining({
          storyCount: 3,
          operation: 'StoryService.reorderStories',
        })
      );
    });

    it('should throw error when some stories not found', async () => {
      // Arrange
      const storyIds = ['story-1', 'story-2', 'story-3'];
      const mockExistingStories = [{ id: 'story-1' }]; // Only one story found

      mockPrisma.story.findMany.mockResolvedValue(mockExistingStories);

      // Act & Assert
      await expect(StoryService.reorderStories(storyIds)).rejects.toThrow(
        'Some stories not found'
      );
    });
  });
});
