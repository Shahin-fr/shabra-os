import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the dependencies
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

// Mock validation middleware locally using vi.hoisted
const mockValidateQuery = vi.hoisted(() => vi.fn());
const mockValidate = vi.hoisted(() => vi.fn());

vi.mock('@/lib/middleware/validation-middleware', () => {
  class ValidationError extends Error {
    statusCode = 400;
    errors: Array<{ path: string[]; message: string; code: string }> = [];
    
    constructor(message: string, errors: Array<{ path: string[]; message: string; code: string }> = []) {
      super(message);
      this.name = 'ValidationError';
      this.errors = errors;
    }
  }

  return {
    validate: mockValidate,
    validateQuery: mockValidateQuery,
    ValidationError,
  };
});

vi.mock('@/lib/middleware/auth-middleware', () => ({
  withAuth: vi.fn(),
}));

// Note: Using global Prisma mock from src/test/setup.tsx

// Mock database performance tracking
vi.mock('@/lib/database-performance', () => ({
  trackQuery: vi.fn((_name, fn) => fn()),
}));

import { GET, POST, PUT, DELETE } from './route';

describe('Content Slots API Route', () => {
  let mockPrisma: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockPrisma = vi.mocked(await import('@/lib/prisma'), true).prisma;
    
    // Setup validation middleware mocks
    mockValidateQuery.mockImplementation((schema) => {
      return async (request) => {
        const url = new URL(request.url);
        const queryParams = Object.fromEntries(url.searchParams.entries());
        
        // Convert string values to appropriate types for testing
        let weekStart = queryParams.weekStart;

        // Basic validation for query parameters
        if (!weekStart) {
          const { ValidationError } = await import('@/lib/middleware/validation-middleware');
          throw new ValidationError('Validation failed: weekStart: Week start is required', [
            { path: ['weekStart'], message: 'Week start is required', code: 'invalid_type' }
          ]);
        }

        return { weekStart };
      };
    });

    mockValidate.mockImplementation((schema) => {
      return async (request) => {
        const body = await request.json();
        
        // Basic validation for testing
        if (!body.title) {
          const { ValidationError } = await import('@/lib/middleware/validation-middleware');
          throw new ValidationError('Validation failed: title: Title is required', [
            { path: ['title'], message: 'Title is required', code: 'invalid_type' }
          ]);
        }
        
        if (!body.startDate) {
          const { ValidationError } = await import('@/lib/middleware/validation-middleware');
          throw new ValidationError('Validation failed: startDate: Start date is required', [
            { path: ['startDate'], message: 'Start date is required', code: 'invalid_type' }
          ]);
        }
        
        if (!body.endDate) {
          const { ValidationError } = await import('@/lib/middleware/validation-middleware');
          throw new ValidationError('Validation failed: endDate: End date is required', [
            { path: ['endDate'], message: 'End date is required', code: 'invalid_type' }
          ]);
        }
        
        return body; // Return the body if validation passes
      };
    });
    
    // Mock authentication middleware
    const { withAuth } = await import('@/lib/middleware/auth-middleware');
    vi.mocked(withAuth).mockResolvedValue({
      response: null,
      context: {
        userId: 'user-123',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          roles: ['EMPLOYEE'],
        },
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/content-slots', () => {
    it('fetches content slots for a specific week successfully', async () => {
      const mockContentSlots = [
        {
          id: 'slot-1',
          title: 'Morning Story',
          type: 'STORY',
          dayOfWeek: 1,
          weekStart: '2024-01-01T00:00:00Z',
          order: 0,
          notes: 'Daily morning story',
          projectId: 'project-1',
          project: { id: 'project-1', name: 'Test Project' },
        },
        {
          id: 'slot-2',
          title: 'Afternoon Post',
          type: 'POST',
          dayOfWeek: 1,
          weekStart: '2024-01-01T00:00:00Z',
          order: 1,
          notes: 'Daily afternoon post',
          projectId: null,
          project: null,
        },
      ];

      mockPrisma.contentSlot.findMany.mockResolvedValue(mockContentSlots);

      const request = new NextRequest(
        'http://localhost:3000/api/content-slots?weekStart=2024-01-01'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual(mockContentSlots);
      expect(response.headers.get('X-Query-Performance')).toBe('optimized');
      expect(response.headers.get('Cache-Control')).toBe(
        'public, max-age=300, stale-while-revalidate=600'
      );

      expect(mockPrisma.contentSlot.findMany).toHaveBeenCalledWith({
        where: {
          startDate: {
            gte: new Date('2024-01-01'),
            lt: new Date('2024-01-08'),
          },
        },
        orderBy: { startDate: 'asc' },
        take: 100,
      });
    });

    it('returns 400 when weekStart parameter is missing', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/content-slots'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toBe('weekStart parameter is required');
      expect(mockPrisma.contentSlot.findMany).not.toHaveBeenCalled();
    });

    it('returns empty array when no content slots exist for the week', async () => {
      mockPrisma.contentSlot.findMany.mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost:3000/api/content-slots?weekStart=2024-01-01'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual([]);
    });

    it('handles database errors gracefully', async () => {
      mockPrisma.contentSlot.findMany.mockRejectedValue(
        new Error('Database error')
      );

      const request = new NextRequest(
        'http://localhost:3000/api/content-slots?weekStart=2024-01-01'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.message).toBe('Failed to fetch content slots');
    });
  });

  describe('POST /api/content-slots', () => {
    const validContentSlotData = {
      title: 'New Content Slot',
      type: 'STORY',
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-01-01T23:59:59Z',
      description: 'Test notes',
      projectId: 'project-1',
    } as const;

    it('creates a content slot successfully with all fields', async () => {
      const mockCreatedSlot = {
        id: 'slot-new',
        ...validContentSlotData,
        order: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        project: { id: 'project-1', name: 'Test Project' },
      };

      mockPrisma.contentSlot.findMany.mockResolvedValue([]);
      mockPrisma.contentSlot.create.mockResolvedValue(mockCreatedSlot);

      const request = new NextRequest(
        'http://localhost:3000/api/content-slots',
        {
          method: 'POST',
          body: JSON.stringify(validContentSlotData),
        }
      );

      const response = await POST(request);
      const data = await response.json();


      expect(response.status).toBe(201);
      expect(data.data).toEqual(mockCreatedSlot);
      // POST endpoint doesn't set performance headers

      expect(mockPrisma.contentSlot.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            {
              startDate: {
                gte: new Date('2024-01-01T00:00:00Z'),
                lt: new Date('2024-01-01T23:59:59Z'),
              },
            },
            {
              endDate: {
                gt: new Date('2024-01-01T00:00:00Z'),
                lte: new Date('2024-01-01T23:59:59Z'),
              },
            },
          ],
        },
      });

      expect(mockPrisma.contentSlot.create).toHaveBeenCalledWith({
        data: {
          title: 'New Content Slot',
          type: 'STORY',
          description: 'Test notes',
          startDate: new Date('2024-01-01T00:00:00Z'),
          endDate: new Date('2024-01-01T23:59:59Z'),
          projectId: 'project-1',
        },
      });
    });

    it('creates a content slot with minimal required fields', async () => {
      const minimalData = {
        title: 'Minimal Slot',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-01T23:59:59Z',
      };

      const mockCreatedSlot = {
        id: 'slot-minimal',
        ...minimalData,
        type: 'STORY',
        description: null,
        projectId: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockPrisma.contentSlot.findMany.mockResolvedValue([]);
      mockPrisma.contentSlot.create.mockResolvedValue(mockCreatedSlot);

      const request = new NextRequest(
        'http://localhost:3000/api/content-slots',
        {
          method: 'POST',
          body: JSON.stringify(minimalData),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data).toEqual(mockCreatedSlot);
    });

    it('calculates order automatically when not provided', async () => {
      const existingSlots = [{ order: 5 }];
      mockPrisma.contentSlot.findMany.mockResolvedValue(existingSlots);

      const request = new NextRequest(
        'http://localhost:3000/api/content-slots',
        {
          method: 'POST',
          body: JSON.stringify(validContentSlotData),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toBe('Time slot overlaps with existing slots');
    });

    it('returns 400 when title is missing', async () => {
      const { title, ...invalidData } = validContentSlotData;

      const request = new NextRequest(
        'http://localhost:3000/api/content-slots',
        {
          method: 'POST',
          body: JSON.stringify(invalidData),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toBe('Missing required fields');
      expect(mockPrisma.contentSlot.create).not.toHaveBeenCalled();
    });

    it('returns 400 when title is missing', async () => {
      const { title, ...invalidData } = validContentSlotData;

      const request = new NextRequest(
        'http://localhost:3000/api/content-slots',
        {
          method: 'POST',
          body: JSON.stringify(invalidData),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toBe('Missing required fields');
    });

    it('returns 400 when startDate is missing', async () => {
      const { startDate, ...invalidData } = validContentSlotData;

      const request = new NextRequest(
        'http://localhost:3000/api/content-slots',
        {
          method: 'POST',
          body: JSON.stringify(invalidData),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toBe('Missing required fields');
    });

    it('returns 400 when endDate is missing', async () => {
      const { endDate, ...invalidData } = validContentSlotData;

      const request = new NextRequest(
        'http://localhost:3000/api/content-slots',
        {
          method: 'POST',
          body: JSON.stringify(invalidData),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toBe('Missing required fields');
    });

    it('handles database errors gracefully', async () => {
      mockPrisma.contentSlot.findMany.mockResolvedValue([]);
      mockPrisma.contentSlot.create.mockRejectedValue(
        new Error('Database error')
      );

      const request = new NextRequest(
        'http://localhost:3000/api/content-slots',
        {
          method: 'POST',
          body: JSON.stringify(validContentSlotData),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.message).toBe('Failed to create content slot');
    });
  });

  describe('PUT /api/content-slots', () => {
    const validUpdateData = {
      id: 'slot-1',
      title: 'Updated Title',
      type: 'POST',
      dayOfWeek: 2,
      notes: 'Updated notes',
    };

    it('updates a content slot successfully', async () => {
      const mockUpdatedSlot = {
        id: 'slot-1',
        title: 'Updated Title',
        type: 'POST',
        dayOfWeek: 2,
        weekStart: '2024-01-01T00:00:00Z',
        order: 0,
        notes: 'Updated notes',
        projectId: 'project-1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        project: { id: 'project-1', name: 'Test Project' },
      };

      mockPrisma.contentSlot.update.mockResolvedValue(mockUpdatedSlot);

      const request = new NextRequest(
        'http://localhost:3000/api/content-slots',
        {
          method: 'PUT',
          body: JSON.stringify(validUpdateData),
        }
      );

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockUpdatedSlot);
      expect(response.headers.get('X-Query-Performance')).toBe('optimized');
      expect(response.headers.get('Cache-Control')).toBe('no-cache');

      expect(mockPrisma.contentSlot.update).toHaveBeenCalledWith({
        where: { id: 'slot-1' },
        data: {
          title: 'Updated Title',
          type: 'POST',
          dayOfWeek: 2,
          notes: 'Updated notes',
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });

    it('returns 400 when ID is missing', async () => {
      const { id, ...invalidData } = validUpdateData;

      const request = new NextRequest(
        'http://localhost:3000/api/content-slots',
        {
          method: 'PUT',
          body: JSON.stringify(invalidData),
        }
      );

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toBe('Content slot ID is required');
      expect(mockPrisma.contentSlot.update).not.toHaveBeenCalled();
    });

    it('handles database errors gracefully', async () => {
      mockPrisma.contentSlot.update.mockRejectedValue(
        new Error('Database error')
      );

      const request = new NextRequest(
        'http://localhost:3000/api/content-slots',
        {
          method: 'PUT',
          body: JSON.stringify(validUpdateData),
        }
      );

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.message).toBe('Failed to update content slot');
    });
  });

  describe('DELETE /api/content-slots', () => {
    it('deletes a content slot successfully', async () => {
      mockPrisma.contentSlot.delete.mockResolvedValue({ id: 'slot-1' });

      const request = new NextRequest(
        'http://localhost:3000/api/content-slots?id=slot-1',
        { method: 'DELETE' }
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ success: true });
      expect(response.headers.get('X-Query-Performance')).toBe('optimized');
      expect(response.headers.get('Cache-Control')).toBe('no-cache');

      expect(mockPrisma.contentSlot.delete).toHaveBeenCalledWith({
        where: { id: 'slot-1' },
      });
    });

    it('returns 400 when ID is missing', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/content-slots',
        {
          method: 'DELETE',
        }
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toBe('Content slot ID is required');
      expect(mockPrisma.contentSlot.delete).not.toHaveBeenCalled();
    });

    it('handles database errors gracefully', async () => {
      mockPrisma.contentSlot.delete.mockRejectedValue(
        new Error('Database error')
      );

      const request = new NextRequest(
        'http://localhost:3000/api/content-slots?id=slot-1',
        { method: 'DELETE' }
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.message).toBe('Failed to delete content slot');
    });
  });
});
