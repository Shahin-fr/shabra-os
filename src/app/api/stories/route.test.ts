import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    story: {
      findMany: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
      aggregate: vi.fn(),
    },
    project: {
      findUnique: vi.fn(),
    },
    storyType: {
      findUnique: vi.fn(),
    },
  },
}));

import { GET, POST } from './route';

describe('Stories API Route', () => {
  let mockPrisma: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockPrisma = vi.mocked(await import('@/lib/prisma'), true).prisma;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/stories', () => {
    it('fetches stories for a specific day successfully', async () => {
      const mockStories = [
        {
          id: '1',
          title: 'Test Story 1',
          day: '2024-01-01T00:00:00Z',
          order: 1,
          status: 'DRAFT',
          notes: 'Test notes',
          visualNotes: 'Test visual notes',
          link: 'https://example.com',
          projectId: 'project-1',
          storyTypeId: 'type-1',
          project: { id: 'project-1', name: 'Test Project' },
          storyType: { id: 'type-1', name: 'News Story', icon: '📰' },
        },
        {
          id: '2',
          title: 'Test Story 2',
          day: '2024-01-01T00:00:00Z',
          order: 2,
          status: 'READY',
          notes: null,
          visualNotes: null,
          link: null,
          projectId: null,
          storyTypeId: null,
          project: null,
          storyType: null,
        },
      ];

      mockPrisma.story.findMany.mockResolvedValue(mockStories);

      const request = new NextRequest(
        'http://localhost:3000/api/stories?day=2024-01-01'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockStories);
      expect(mockPrisma.story.findMany).toHaveBeenCalledWith({
        where: {
          day: {
            gte: expect.any(Date),
            lte: expect.any(Date),
          },
        },
        orderBy: {
          order: 'asc',
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          storyType: {
            select: {
              id: true,
              name: true,
              icon: true,
            },
          },
        },
      });
    });

    it('returns 400 when day parameter is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/stories');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('پارامتر روز الزامی است');
      expect(mockPrisma.story.findMany).not.toHaveBeenCalled();
    });

    it('returns 400 when day parameter has invalid format', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/stories?day=invalid-date'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('فرمت تاریخ نامعتبر است');
      expect(mockPrisma.story.findMany).not.toHaveBeenCalled();
    });

    it('returns empty array when no stories exist for the day', async () => {
      mockPrisma.story.findMany.mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost:3000/api/stories?day=2024-01-01'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
      expect(mockPrisma.story.findMany).toHaveBeenCalled();
    });

    it('handles database errors gracefully', async () => {
      mockPrisma.story.findMany.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest(
        'http://localhost:3000/api/stories?day=2024-01-01'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('خطا در دریافت استوری‌ها');
    });

    it('handles edge case dates correctly', async () => {
      const mockStories: any[] = [];
      mockPrisma.story.findMany.mockResolvedValue(mockStories);

      // Test with leap year date
      const request = new NextRequest(
        'http://localhost:3000/api/stories?day=2024-02-29'
      );

      const response = await GET(request);
      expect(response.status).toBe(200);

      expect(mockPrisma.story.findMany).toHaveBeenCalledWith({
        where: {
          day: {
            gte: expect.any(Date),
            lte: expect.any(Date),
          },
        },
        orderBy: {
          order: 'asc',
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          storyType: {
            select: {
              id: true,
              name: true,
              icon: true,
            },
          },
        },
      });
    });
  });

  describe('POST /api/stories', () => {
    const validStoryData = {
      title: 'Test Story',
      notes: 'Test notes',
      visualNotes: 'Test visual notes',
      link: 'https://example.com',
      day: '2024-01-01',
      order: 1,
      projectId: 'project-1',
      storyTypeId: 'type-1',
    };

    it('creates a story successfully with all fields', async () => {
      const mockCreatedStory = {
        id: 'new-story-id',
        ...validStoryData,
        day: '2024-01-01T00:00:00Z', // API returns string
        status: 'DRAFT',
        project: { id: 'project-1', name: 'Test Project' },
        storyType: { id: 'type-1', name: 'News Story', icon: '📰' },
      };

      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'project-1',
        name: 'Test Project',
      });
      mockPrisma.storyType.findUnique.mockResolvedValue({
        id: 'type-1',
        name: 'News Story',
        icon: '📰',
      });
      mockPrisma.story.findFirst.mockResolvedValue(null); // No order conflict
      mockPrisma.story.create.mockResolvedValue(mockCreatedStory);

      const request = new NextRequest('http://localhost:3000/api/stories', {
        method: 'POST',
        body: JSON.stringify(validStoryData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBe(mockCreatedStory.id);
      expect(data.title).toBe(mockCreatedStory.title);
      expect(data.notes).toBe(mockCreatedStory.notes);
      expect(data.visualNotes).toBe(mockCreatedStory.visualNotes);
      expect(data.link).toBe(mockCreatedStory.link);
      expect(data.order).toBe(mockCreatedStory.order);
      expect(data.status).toBe(mockCreatedStory.status);
      expect(data.projectId).toBe(mockCreatedStory.projectId);
      expect(data.storyTypeId).toBe(mockCreatedStory.storyTypeId);
      expect(data.project).toEqual(mockCreatedStory.project);
      expect(data.storyType).toEqual(mockCreatedStory.storyType);
      expect(mockPrisma.story.create).toHaveBeenCalledWith({
        data: {
          title: 'Test Story',
          notes: 'Test notes',
          visualNotes: 'Test visual notes',
          link: 'https://example.com',
          day: expect.any(Date),
          order: 1,
          status: 'DRAFT',
          projectId: 'project-1',
          storyTypeId: 'type-1',
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          storyType: {
            select: {
              id: true,
              name: true,
              icon: true,
            },
          },
        },
      });
    });

    it('creates a story with minimal required fields', async () => {
      const minimalData = {
        title: 'Minimal Story',
        day: '2024-01-01',
      };

      const mockCreatedStory = {
        id: 'new-story-id',
        ...minimalData,
        day: '2024-01-01T00:00:00Z', // API returns string
        order: 1,
        status: 'DRAFT',
        notes: null,
        visualNotes: null,
        link: null,
        projectId: null,
        storyTypeId: null,
        project: null,
        storyType: null,
      };

      mockPrisma.story.aggregate.mockResolvedValue({ _max: { order: 0 } });
      mockPrisma.story.create.mockResolvedValue(mockCreatedStory);

      const request = new NextRequest('http://localhost:3000/api/stories', {
        method: 'POST',
        body: JSON.stringify(minimalData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBe(mockCreatedStory.id);
      expect(data.title).toBe(mockCreatedStory.title);
      expect(data.notes).toBe(mockCreatedStory.notes);
      expect(data.visualNotes).toBe(mockCreatedStory.visualNotes);
      expect(data.link).toBe(mockCreatedStory.link);
      expect(data.order).toBe(mockCreatedStory.order);
      expect(data.status).toBe(mockCreatedStory.status);
      expect(data.projectId).toBe(mockCreatedStory.projectId);
      expect(data.storyTypeId).toBe(mockCreatedStory.storyTypeId);
      expect(data.project).toEqual(mockCreatedStory.project);
      expect(data.storyType).toEqual(mockCreatedStory.storyType);
      expect(mockPrisma.story.create).toHaveBeenCalledWith({
        data: {
          title: 'Minimal Story',
          notes: null,
          visualNotes: null,
          link: null,
          day: expect.any(Date),
          order: 1,
          status: 'DRAFT',
          projectId: null,
          storyTypeId: null,
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          storyType: {
            select: {
              id: true,
              name: true,
              icon: true,
            },
          },
        },
      });
    });

    it('calculates order automatically when not provided', async () => {
      const storyData = {
        title: 'Auto Order Story',
        day: '2024-01-01',
      };

      const mockCreatedStory = {
        id: 'new-story-id',
        ...storyData,
        day: '2024-01-01T00:00:00Z', // API returns string
        order: 3,
        status: 'DRAFT',
        notes: null,
        visualNotes: null,
        link: null,
        projectId: null,
        storyTypeId: null,
        project: null,
        storyType: null,
      };

      mockPrisma.story.aggregate.mockResolvedValue({ _max: { order: 2 } });
      mockPrisma.story.create.mockResolvedValue(mockCreatedStory);

      const request = new NextRequest('http://localhost:3000/api/stories', {
        method: 'POST',
        body: JSON.stringify(storyData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.order).toBe(3);
      expect(mockPrisma.story.aggregate).toHaveBeenCalledWith({
        where: {
          day: {
            gte: expect.any(Date),
            lte: expect.any(Date),
          },
        },
        _max: {
          order: true,
        },
      });
    });

    it('returns 400 when title is missing', async () => {
      const invalidData = {
        day: '2024-01-01',
      };

      const request = new NextRequest('http://localhost:3000/api/stories', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('عنوان استوری الزامی است');
      expect(mockPrisma.story.create).not.toHaveBeenCalled();
    });

    it('returns 400 when title is empty string', async () => {
      const invalidData = {
        title: '',
        day: '2024-01-01',
      };

      const request = new NextRequest('http://localhost:3000/api/stories', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('عنوان استوری الزامی است');
      expect(mockPrisma.story.create).not.toHaveBeenCalled();
    });

    it('returns 400 when title is only whitespace', async () => {
      const invalidData = {
        title: '   ',
        day: '2024-01-01',
      };

      const request = new NextRequest('http://localhost:3000/api/stories', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('عنوان استوری الزامی است');
      expect(mockPrisma.story.create).not.toHaveBeenCalled();
    });

    it('returns 400 when day is missing', async () => {
      const invalidData = {
        title: 'Test Story',
      };

      const request = new NextRequest('http://localhost:3000/api/stories', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('تاریخ الزامی است');
      expect(mockPrisma.story.create).not.toHaveBeenCalled();
    });

    it('returns 400 when day has invalid format', async () => {
      const invalidData = {
        title: 'Test Story',
        day: 'invalid-date',
      };

      const request = new NextRequest('http://localhost:3000/api/stories', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('فرمت تاریخ نامعتبر است');
      expect(mockPrisma.story.create).not.toHaveBeenCalled();
    });

    it('returns 404 when projectId does not exist', async () => {
      const storyData = {
        title: 'Test Story',
        day: '2024-01-01',
        projectId: 'non-existent-project',
      };

      mockPrisma.project.findUnique.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/stories', {
        method: 'POST',
        body: JSON.stringify(storyData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('پروژه مورد نظر یافت نشد');
      expect(mockPrisma.story.create).not.toHaveBeenCalled();
    });

    it('returns 404 when storyTypeId does not exist', async () => {
      const storyData = {
        title: 'Test Story',
        day: '2024-01-01',
        storyTypeId: 'non-existent-type',
      };

      mockPrisma.storyType.findUnique.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/stories', {
        method: 'POST',
        body: JSON.stringify(storyData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('نوع استوری مورد نظر یافت نشد');
      expect(mockPrisma.story.create).not.toHaveBeenCalled();
    });

    it('returns 409 when order conflicts with existing story', async () => {
      const storyData = {
        title: 'Test Story',
        day: '2024-01-01',
        order: 1,
      };

      mockPrisma.story.findFirst.mockResolvedValue({
        id: 'existing-story',
        title: 'Existing Story',
        day: new Date('2024-01-01T00:00:00Z'),
        order: 1,
      });

      const request = new NextRequest('http://localhost:3000/api/stories', {
        method: 'POST',
        body: JSON.stringify(storyData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe('اسلات شماره 1 قبلاً اشغال شده است');
      expect(mockPrisma.story.create).not.toHaveBeenCalled();
    });

    it('trims whitespace from text fields', async () => {
      const storyData = {
        title: '  Test Story  ',
        notes: '  Test notes  ',
        visualNotes: '  Test visual notes  ',
        link: '  https://example.com  ',
        day: '2024-01-01',
      };

      const mockCreatedStory = {
        id: 'new-story-id',
        title: 'Test Story',
        notes: 'Test notes',
        visualNotes: 'Test visual notes',
        link: 'https://example.com',
        day: '2024-01-01T00:00:00Z', // API returns string
        order: 1,
        status: 'DRAFT',
        projectId: null,
        storyTypeId: null,
        project: null,
        storyType: null,
      };

      mockPrisma.story.aggregate.mockResolvedValue({ _max: { order: 0 } });
      mockPrisma.story.create.mockResolvedValue(mockCreatedStory);

      const request = new NextRequest('http://localhost:3000/api/stories', {
        method: 'POST',
        body: JSON.stringify(storyData),
      });

      const response = await POST(request);
      expect(response.status).toBe(201);

      expect(mockPrisma.story.create).toHaveBeenCalledWith({
        data: {
          title: 'Test Story',
          notes: 'Test notes',
          visualNotes: 'Test visual notes',
          link: 'https://example.com',
          day: expect.any(Date),
          order: 1,
          status: 'DRAFT',
          projectId: null,
          storyTypeId: null,
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          storyType: {
            select: {
              id: true,
              name: true,
              icon: true,
            },
          },
        },
      });
    });

    it('handles database errors gracefully', async () => {
      const storyData = {
        title: 'Test Story',
        day: '2024-01-01',
      };

      mockPrisma.story.aggregate.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/stories', {
        method: 'POST',
        body: JSON.stringify(storyData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('خطا در ایجاد استوری');
    });

    it('handles edge case dates correctly', async () => {
      const storyData = {
        title: 'Leap Year Story',
        day: '2024-02-29',
      };

      const mockCreatedStory = {
        id: 'new-story-id',
        ...storyData,
        day: '2024-02-29T00:00:00Z', // API returns string
        order: 1,
        status: 'DRAFT',
        notes: null,
        visualNotes: null,
        link: null,
        projectId: null,
        storyTypeId: null,
        project: null,
        storyType: null,
      };

      mockPrisma.story.aggregate.mockResolvedValue({ _max: { order: 0 } });
      mockPrisma.story.create.mockResolvedValue(mockCreatedStory);

      const request = new NextRequest('http://localhost:3000/api/stories', {
        method: 'POST',
        body: JSON.stringify(storyData),
      });

      const response = await POST(request);
      expect(response.status).toBe(201);

      expect(mockPrisma.story.create).toHaveBeenCalledWith({
        data: {
          title: 'Leap Year Story',
          notes: null,
          visualNotes: null,
          link: null,
          day: expect.any(Date),
          order: 1,
          status: 'DRAFT',
          projectId: null,
          storyTypeId: null,
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          storyType: {
            select: {
              id: true,
              name: true,
              icon: true,
            },
          },
        },
      });
    });
  });
});
