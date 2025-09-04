import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    contentSlot: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

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
      expect(data).toEqual(mockContentSlots);
      expect(response.headers.get('X-Query-Performance')).toBe('optimized');
      expect(response.headers.get('Cache-Control')).toBe(
        'public, max-age=300, stale-while-revalidate=600'
      );

      expect(mockPrisma.contentSlot.findMany).toHaveBeenCalledWith({
        where: {
          weekStart: new Date('2024-01-01'),
        },
        orderBy: [{ dayOfWeek: 'asc' }, { order: 'asc' }],
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
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
      expect(data.error).toBe('weekStart parameter is required');
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
      expect(data).toEqual([]);
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
      expect(data.error).toBe('Failed to fetch content slots');
    });
  });

  describe('POST /api/content-slots', () => {
    const validContentSlotData = {
      title: 'New Content Slot',
      type: 'STORY',
      dayOfWeek: 1,
      weekStart: '2024-01-01',
      notes: 'Test notes',
      projectId: 'project-1',
    } as const;

    it('creates a content slot successfully with all fields', async () => {
      const mockCreatedSlot = {
        id: 'slot-new',
        ...validContentSlotData,
        weekStart: '2024-01-01T00:00:00Z',
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
      expect(data).toEqual(mockCreatedSlot);
      expect(response.headers.get('X-Query-Performance')).toBe('optimized');
      expect(response.headers.get('Cache-Control')).toBe('no-cache');

      expect(mockPrisma.contentSlot.findMany).toHaveBeenCalledWith({
        where: {
          weekStart: new Date('2024-01-01'),
          dayOfWeek: 1,
        },
        orderBy: {
          order: 'desc',
        },
        take: 1,
        select: { order: true },
      });

      expect(mockPrisma.contentSlot.create).toHaveBeenCalledWith({
        data: {
          title: 'New Content Slot',
          type: 'STORY',
          dayOfWeek: 1,
          weekStart: new Date('2024-01-01'),
          order: 0,
          notes: 'Test notes',
          projectId: 'project-1',
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

    it('creates a content slot with minimal required fields', async () => {
      const minimalData = {
        title: 'Minimal Slot',
        type: 'POST',
        dayOfWeek: 2,
        weekStart: '2024-01-01',
      };

      const mockCreatedSlot = {
        id: 'slot-minimal',
        ...minimalData,
        weekStart: '2024-01-01T00:00:00Z',
        order: 0,
        notes: null,
        projectId: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        project: null,
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
      expect(data).toEqual(mockCreatedSlot);
    });

    it('calculates order automatically when not provided', async () => {
      const existingSlots = [{ order: 5 }];
      mockPrisma.contentSlot.findMany.mockResolvedValue(existingSlots);

      const mockCreatedSlot = {
        id: 'slot-ordered',
        ...validContentSlotData,
        weekStart: '2024-01-01T00:00:00Z',
        order: 6,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        project: { id: 'project-1', name: 'Test Project' },
      };

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
      expect(data.order).toBe(6);
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
      expect(data.error).toBe('Missing required fields');
      expect(mockPrisma.contentSlot.create).not.toHaveBeenCalled();
    });

    it('returns 400 when type is missing', async () => {
      const { type, ...invalidData } = validContentSlotData;

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
      expect(data.error).toBe('Missing required fields');
    });

    it('returns 400 when dayOfWeek is missing', async () => {
      const { dayOfWeek, ...invalidData } = validContentSlotData;

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
      expect(data.error).toBe('Missing required fields');
    });

    it('returns 400 when weekStart is missing', async () => {
      const { weekStart, ...invalidData } = validContentSlotData;

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
      expect(data.error).toBe('Missing required fields');
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
      expect(data.error).toBe('Failed to create content slot');
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
      expect(data.error).toBe('Content slot ID is required');
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
      expect(data.error).toBe('Failed to update content slot');
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
      expect(data.error).toBe('Content slot ID is required');
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
      expect(data.error).toBe('Failed to delete content slot');
    });
  });
});
