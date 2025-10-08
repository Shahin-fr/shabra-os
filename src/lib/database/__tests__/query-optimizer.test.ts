import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QueryOptimizer, DatabasePerformanceMonitor } from '../query-optimizer';

// Mock Prisma client
const mockPrisma = {
  $queryRaw: vi.fn(),
  $disconnect: vi.fn(),
};

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('QueryOptimizer', () => {
  describe('getUserSelect', () => {
    it('should return optimized user select fields', () => {
      const result = QueryOptimizer.getUserSelect();

      expect(result).toEqual({
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        isActive: true,
        roles: true,
        createdAt: true,
      });
    });
  });

  describe('getTaskSelect', () => {
    it('should return optimized task select fields', () => {
      const result = QueryOptimizer.getTaskSelect();

      expect(result).toEqual({
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
        assignedTo: true,
        projectId: true,
      });
    });
  });

  describe('getStorySelect', () => {
    it('should return optimized story select fields', () => {
      const result = QueryOptimizer.getStorySelect();

      expect(result).toEqual({
        id: true,
        title: true,
        content: true,
        day: true,
        status: true,
        order: true,
        createdAt: true,
        updatedAt: true,
        authorId: true,
        projectId: true,
        storyTypeId: true,
      });
    });
  });

  describe('getMeetingSelect', () => {
    it('should return optimized meeting select fields', () => {
      const result = QueryOptimizer.getMeetingSelect();

      expect(result).toEqual({
        id: true,
        title: true,
        startTime: true,
        endTime: true,
        type: true,
        status: true,
        notes: true,
        createdAt: true,
        creatorId: true,
      });
    });
  });

  describe('createOptimizedWhere', () => {
    it('should create optimized where clause with all filters', () => {
      const baseWhere = { projectId: 'test-project' };
      const filters = {
        search: 'test query',
        searchFields: ['title', 'content'],
        dateRange: {
          startDate: '2023-01-01',
          endDate: '2023-12-31',
          field: 'createdAt',
        },
        status: 'active',
        validStatuses: ['active', 'inactive'],
        userId: 'user-123',
        projectId: 'project-456',
      };

      const result = QueryOptimizer.createOptimizedWhere(baseWhere, filters);

      expect(result).toEqual({
        projectId: 'project-456',
        OR: [
          {
            title: {
              contains: 'test query',
              mode: 'insensitive',
            },
          },
          {
            content: {
              contains: 'test query',
              mode: 'insensitive',
            },
          },
        ],
        createdAt: {
          gte: new Date('2023-01-01'),
          lte: new Date('2023-12-31'),
        },
        status: 'active',
        userId: 'user-123',
      });
    });

    it('should handle minimal filters', () => {
      const baseWhere = { projectId: 'test-project' };
      const filters = {};

      const result = QueryOptimizer.createOptimizedWhere(baseWhere, filters);

      expect(result).toEqual({ projectId: 'test-project' });
    });
  });
});

describe('DatabasePerformanceMonitor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('monitorQueryPerformance', () => {
    it('should monitor query performance and return result with timing', async () => {
      const mockQuery = vi.fn().mockResolvedValue('test result');
      const queryName = 'test query';

      const result = await DatabasePerformanceMonitor.monitorQueryPerformance(
        queryName,
        mockQuery
      );

      expect(result).toEqual({
        result: 'test result',
        performance: {
          duration: expect.any(Number),
          timestamp: expect.any(String),
        },
      });

      expect(mockQuery).toHaveBeenCalledOnce();
    });

    it('should log slow queries', async () => {
      const mockQuery = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve('slow result'), 1100))
      );
      const queryName = 'slow query';

      await DatabasePerformanceMonitor.monitorQueryPerformance(queryName, mockQuery);

      // Wait for the query to complete
      await new Promise(resolve => setTimeout(resolve, 1200));

      expect(mockQuery).toHaveBeenCalledOnce();
    });

    it('should handle query errors', async () => {
      const mockQuery = vi.fn().mockRejectedValue(new Error('Query failed'));
      const queryName = 'failing query';

      await expect(
        DatabasePerformanceMonitor.monitorQueryPerformance(queryName, mockQuery)
      ).rejects.toThrow('Query failed');

      expect(mockQuery).toHaveBeenCalledOnce();
    });
  });

  describe('getPerformanceStats', () => {
    it('should return performance statistics', async () => {
      const mockStats = [
        { tablename: 'users', attname: 'id', n_distinct: 100 },
        { tablename: 'tasks', attname: 'status', n_distinct: 3 },
      ];

      mockPrisma.$queryRaw.mockResolvedValue(mockStats);

      const result = await DatabasePerformanceMonitor.getPerformanceStats();

      expect(result).toEqual(mockStats);
      expect(mockPrisma.$queryRaw).toHaveBeenCalledWith(expect.any(String));
    });

    it('should handle errors gracefully', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('Database error'));

      const result = await DatabasePerformanceMonitor.getPerformanceStats();

      expect(result).toEqual([]);
    });
  });
});
