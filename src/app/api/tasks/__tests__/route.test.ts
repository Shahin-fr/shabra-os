import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '../route';

// Mock dependencies
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/middleware/auth-middleware', () => ({
  withAuth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    task: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

vi.mock('@/lib/database/pagination', () => ({
  parsePaginationParams: vi.fn(),
  executePaginatedQuery: vi.fn(),
}));

vi.mock('@/lib/database/query-optimizer', () => ({
  DatabasePerformanceMonitor: {
    monitorQueryPerformance: vi.fn(),
  },
}));

vi.mock('@/types', () => ({
  ApiResponseBuilder: {
    success: vi.fn(),
    unauthorized: vi.fn(),
  },
  entityToDTO: vi.fn(),
}));

import { auth } from '@/auth';
import { withAuth } from '@/lib/middleware/auth-middleware';
import { prisma } from '@/lib/prisma';
import { parsePaginationParams, executePaginatedQuery } from '@/lib/database/pagination';
import { DatabasePerformanceMonitor } from '@/lib/database/query-optimizer';
import { ApiResponseBuilder, entityToDTO } from '@/types';

describe('Tasks API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/tasks', () => {
    it('should return tasks with pagination for authenticated user', async () => {
      // Mock authentication
      const mockSession = {
        user: {
          id: 'user-123',
          roles: ['EMPLOYEE'],
        },
      };
      vi.mocked(auth).mockResolvedValue(mockSession);
      vi.mocked(withAuth).mockResolvedValue({ response: null, context: { userId: 'user-123' } });

      // Mock pagination
      const mockPaginationParams = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc' as const,
      };
      vi.mocked(parsePaginationParams).mockReturnValue(mockPaginationParams);

      // Mock paginated query result
      const mockQueryResult = {
        data: [
          {
            id: 'task-1',
            title: 'Test Task',
            status: 'Todo',
            priority: 'MEDIUM',
            assignedTo: 'user-123',
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };
      vi.mocked(executePaginatedQuery).mockResolvedValue(mockQueryResult);

      // Mock performance monitoring
      vi.mocked(DatabasePerformanceMonitor.monitorQueryPerformance).mockResolvedValue({
        result: mockQueryResult,
        performance: { duration: 100, timestamp: '2023-01-01T00:00:00Z' },
      });

      // Mock DTO transformation
      vi.mocked(entityToDTO).mockReturnValue({
        id: 'task-1',
        title: 'Test Task',
        status: 'Todo',
        priority: 'MEDIUM',
      });

      // Mock API response
      const mockResponse = new Response(JSON.stringify({ success: true }));
      vi.mocked(ApiResponseBuilder.success).mockReturnValue(mockResponse);

      // Create request
      const request = new NextRequest('http://localhost:3000/api/tasks?page=1&limit=10');

      // Execute
      const response = await GET(request);

      // Assertions
      expect(withAuth).toHaveBeenCalledWith(request);
      expect(parsePaginationParams).toHaveBeenCalled();
      expect(executePaginatedQuery).toHaveBeenCalledWith(
        prisma.task,
        mockPaginationParams,
        { assignedTo: 'user-123' },
        expect.any(Object)
      );
      expect(DatabasePerformanceMonitor.monitorQueryPerformance).toHaveBeenCalled();
      expect(ApiResponseBuilder.success).toHaveBeenCalledWith(
        {
          data: expect.any(Array),
          pagination: expect.any(Object),
        },
        'Tasks retrieved successfully'
      );
    });

    it('should return unauthorized for unauthenticated user', async () => {
      // Mock authentication failure
      vi.mocked(withAuth).mockResolvedValue({ 
        response: new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }),
        context: null 
      });

      const request = new NextRequest('http://localhost:3000/api/tasks');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it('should filter tasks by project for managers', async () => {
      // Mock manager session
      const mockSession = {
        user: {
          id: 'manager-123',
          roles: ['MANAGER'],
        },
      };
      vi.mocked(auth).mockResolvedValue(mockSession);
      vi.mocked(withAuth).mockResolvedValue({ response: null, context: { userId: 'manager-123' } });

      // Mock pagination
      const mockPaginationParams = {
        page: 1,
        limit: 10,
      };
      vi.mocked(parsePaginationParams).mockReturnValue(mockPaginationParams);

      // Mock query result
      const mockQueryResult = {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
      vi.mocked(executePaginatedQuery).mockResolvedValue(mockQueryResult);
      vi.mocked(DatabasePerformanceMonitor.monitorQueryPerformance).mockResolvedValue({
        result: mockQueryResult,
        performance: { duration: 50, timestamp: '2023-01-01T00:00:00Z' },
      });

      const mockResponse = new Response(JSON.stringify({ success: true }));
      vi.mocked(ApiResponseBuilder.success).mockReturnValue(mockResponse);

      // Create request with project filter
      const request = new NextRequest('http://localhost:3000/api/tasks?projectId=project-123');

      await GET(request);

      // Should filter by createdBy for managers
      expect(executePaginatedQuery).toHaveBeenCalledWith(
        prisma.task,
        mockPaginationParams,
        { projectId: 'project-123', createdBy: 'manager-123' },
        expect.any(Object)
      );
    });

    it('should handle query errors gracefully', async () => {
      // Mock authentication
      const mockSession = {
        user: {
          id: 'user-123',
          roles: ['EMPLOYEE'],
        },
      };
      vi.mocked(auth).mockResolvedValue(mockSession);
      vi.mocked(withAuth).mockResolvedValue({ response: null, context: { userId: 'user-123' } });

      // Mock pagination
      vi.mocked(parsePaginationParams).mockReturnValue({
        page: 1,
        limit: 10,
      });

      // Mock query error
      vi.mocked(executePaginatedQuery).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/tasks');
      
      // Should not throw, but handle error gracefully
      await expect(GET(request)).resolves.toBeDefined();
    });
  });
});
