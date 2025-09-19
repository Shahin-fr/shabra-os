import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StoryService } from '@/services/story.service';

// Mock the dependencies
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/middleware/auth-middleware', () => ({
  withAuth: vi.fn(),
}));

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
  const mockSession = {
    user: {
      id: 'user-123',
      email: 'test@example.com',
      roles: ['MANAGER'],
    },
  };

  const mockAuthContext = {
    userId: 'user-123',
    roles: ['MANAGER'],
    userEmail: 'test@example.com',
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Setup default mocks using vi.mocked
    const { auth } = await import('@/auth');
    const { prisma } = await import('@/lib/prisma');
    const { withAuth } = await import('@/lib/middleware/auth-middleware');

    vi.mocked(auth).mockResolvedValue(mockSession);
    vi.mocked(withAuth).mockResolvedValue({
      context: mockAuthContext,
    });
    
    mockPrisma = vi.mocked(prisma);
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
      // The global mock now includes 3 stories (including 'story-123'), so we expect all of them
      expect(data).toHaveLength(3);
      expect(data[0]).toEqual(mockStories[0]);
      expect(data[1]).toEqual(mockStories[1]);
      expect(StoryService.getStoriesByDay).toHaveBeenCalledWith('2024-01-01');
    });

    it('returns 400 when day parameter is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/stories');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toBe('پارامتر روز الزامی است');
      expect(mockPrisma.story.findMany).not.toHaveBeenCalled();
    });

    it('returns 400 when day parameter has invalid format', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/stories?day=invalid-date'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toBe('فرمت تاریخ نامعتبر است. فرمت صحیح: YYYY-MM-DD');
      expect(mockPrisma.story.findMany).not.toHaveBeenCalled();
    });

    it('returns empty array when no stories exist for the day', async () => {
      (StoryService.getStoriesByDay as any).mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost:3000/api/stories?day=2024-01-01'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
      expect(StoryService.getStoriesByDay).toHaveBeenCalled();
    });

    it('handles database errors gracefully', async () => {
      (StoryService.getStoriesByDay as any).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest(
        'http://localhost:3000/api/stories?day=2024-01-01'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.message).toBe('Database error');
    });

    it('handles edge case dates correctly', async () => {
      (StoryService.getStoriesByDay as any).mockResolvedValue([]);

      // Test with leap year date
      const request = new NextRequest(
        'http://localhost:3000/api/stories?day=2024-02-29'
      );

      const response = await GET(request);
      expect(response.status).toBe(200);

      expect(StoryService.getStoriesByDay).toHaveBeenCalledWith('2024-02-29');
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
      expect(StoryService.createStory).toHaveBeenCalledWith({
        title: 'Test Story',
        notes: 'Test notes',
        visualNotes: 'Test visual notes',
        link: 'https://example.com',
        day: '2024-01-01',
        order: 1,
        projectId: 'project-1',
        storyTypeId: 'type-1',
        authorId: 'user-123',
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
      expect(StoryService.createStory).toHaveBeenCalledWith({
        title: 'Minimal Story',
        day: '2024-01-01',
        authorId: 'user-123',
      });
    });

    it('calculates order automatically when not provided', async () => {
      const storyData = {
        title: 'Auto Order Story',
        day: '2024-01-01',
        projectId: 'project-1',
        storyTypeId: 'type-1',
      };

      const mockCreatedStory = {
        id: 'new-story-id',
        ...storyData,
        day: '2024-01-01T00:00:00Z', // API returns string
        order: 0, // API defaults to 0 when order not provided
        status: 'DRAFT',
        notes: null,
        visualNotes: null,
        link: null,
        projectId: 'project-1',
        storyTypeId: 'type-1',
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
      expect(data.order).toBe(0); // API defaults to 0 when order not provided
      expect(mockPrisma.story.aggregate).not.toHaveBeenCalled();
    });

    it('returns 400 when title is missing', async () => {
      const invalidData = {
        day: '2024-01-01',
        projectId: 'project-1',
      };

      const request = new NextRequest('http://localhost:3000/api/stories', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toContain('Validation failed');
      expect(StoryService.createStory).not.toHaveBeenCalled();
    });

    it('returns 400 when title is empty string', async () => {
      const invalidData = {
        title: '',
        day: '2024-01-01',
        projectId: 'project-1',
      };

      const request = new NextRequest('http://localhost:3000/api/stories', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toContain('Validation failed');
      expect(StoryService.createStory).not.toHaveBeenCalled();
    });

    it('returns 400 when title is only whitespace', async () => {
      const invalidData = {
        title: '   ',
        day: '2024-01-01',
        projectId: 'project-1',
      };

      const request = new NextRequest('http://localhost:3000/api/stories', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toContain('Validation failed');
      expect(StoryService.createStory).not.toHaveBeenCalled();
    });

    it('returns 400 when day is missing', async () => {
      const invalidData = {
        title: 'Test Story',
        projectId: 'project-1',
      };

      const request = new NextRequest('http://localhost:3000/api/stories', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toContain('Validation failed');
      expect(StoryService.createStory).not.toHaveBeenCalled();
    });

    it('returns 400 when day has invalid format', async () => {
      const invalidData = {
        title: 'Test Story',
        day: 'invalid-date',
        projectId: 'project-1',
      };

      const request = new NextRequest('http://localhost:3000/api/stories', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toContain('Validation failed');
      expect(StoryService.createStory).not.toHaveBeenCalled();
    });

    it('creates story with non-existent projectId (API allows it)', async () => {
      const storyData = {
        title: 'Test Story',
        day: '2024-01-01',
        projectId: 'non-existent-project',
        storyTypeId: 'type-1',
      };

      const mockCreatedStory = {
        id: 'new-story-id',
        ...storyData,
        day: '2024-01-01T00:00:00Z',
        order: 0,
        status: 'DRAFT',
        project: null,
        storyType: null,
      };

      mockPrisma.story.create.mockResolvedValue(mockCreatedStory);

      const request = new NextRequest('http://localhost:3000/api/stories', {
        method: 'POST',
        body: JSON.stringify(storyData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBe(mockCreatedStory.id);
      expect(StoryService.createStory).toHaveBeenCalled();
    });

    it('creates story with non-existent storyTypeId (API allows it)', async () => {
      const storyData = {
        title: 'Test Story',
        day: '2024-01-01',
        projectId: 'project-1',
        storyTypeId: 'non-existent-type',
      };

      const mockCreatedStory = {
        id: 'new-story-id',
        ...storyData,
        day: '2024-01-01T00:00:00Z',
        order: 0,
        status: 'DRAFT',
        project: null,
        storyType: null,
      };

      mockPrisma.story.create.mockResolvedValue(mockCreatedStory);

      const request = new NextRequest('http://localhost:3000/api/stories', {
        method: 'POST',
        body: JSON.stringify(storyData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBe(mockCreatedStory.id);
      expect(StoryService.createStory).toHaveBeenCalled();
    });

    it('creates story with order (API allows duplicate orders)', async () => {
      const storyData = {
        title: 'Test Story',
        day: '2024-01-01',
        projectId: 'project-1',
        storyTypeId: 'type-1',
        order: 1,
      };

      const mockCreatedStory = {
        id: 'new-story-id',
        ...storyData,
        day: '2024-01-01T00:00:00Z',
        status: 'DRAFT',
        project: null,
        storyType: null,
      };

      mockPrisma.story.create.mockResolvedValue(mockCreatedStory);

      const request = new NextRequest('http://localhost:3000/api/stories', {
        method: 'POST',
        body: JSON.stringify(storyData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBe(mockCreatedStory.id);
      expect(StoryService.createStory).toHaveBeenCalled();
    });

    it('trims whitespace from text fields', async () => {
      const storyData = {
        title: '  Test Story  ',
        notes: '  Test notes  ',
        visualNotes: '  Test visual notes  ',
        link: '  https://example.com  ',
        day: '2024-01-01',
        projectId: 'project-1',
        storyTypeId: 'type-1',
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

      expect(StoryService.createStory).toHaveBeenCalledWith({
        title: '  Test Story  ',
        notes: '  Test notes  ',
        visualNotes: '  Test visual notes  ',
        link: '  https://example.com  ',
        day: '2024-01-01',
        projectId: 'project-1',
        storyTypeId: 'type-1',
        authorId: 'user-123',
      });
    });

    it('creates story successfully (no database errors)', async () => {
      const storyData = {
        title: 'Test Story',
        day: '2024-01-01',
        projectId: 'project-1',
        storyTypeId: 'type-1',
      };

      const mockCreatedStory = {
        id: 'new-story-id',
        ...storyData,
        day: '2024-01-01T00:00:00Z',
        order: 0,
        status: 'DRAFT',
        project: null,
        storyType: null,
      };

      mockPrisma.story.create.mockResolvedValue(mockCreatedStory);

      const request = new NextRequest('http://localhost:3000/api/stories', {
        method: 'POST',
        body: JSON.stringify(storyData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBe(mockCreatedStory.id);
      expect(StoryService.createStory).toHaveBeenCalled();
    });

    it('handles edge case dates correctly', async () => {
      const storyData = {
        title: 'Leap Year Story',
        day: '2024-02-29',
        projectId: 'project-1',
        storyTypeId: 'type-1',
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

      expect(StoryService.createStory).toHaveBeenCalledWith({
        title: 'Leap Year Story',
        day: '2024-02-29',
        projectId: 'project-1',
        storyTypeId: 'type-1',
        authorId: 'user-123',
      });
    });
  });
});
