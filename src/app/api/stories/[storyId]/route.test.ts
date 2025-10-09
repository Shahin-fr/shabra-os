import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the dependencies
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/middleware/auth-middleware', () => ({
  withAuth: vi.fn(),
}));

// Mock StoryService instead of Prisma
vi.mock('@/services/story.service', () => ({
  StoryService: {
    getStoryById: vi.fn(),
    updateStory: vi.fn(),
    deleteStory: vi.fn(),
  },
}));

import { PATCH, DELETE } from './route';

describe('Individual Story API Route', () => {
  let mockStoryService: any;
  const storyId = 'story-123';
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
    // Setup default mocks using vi.mocked
    const { auth } = await import('@/auth');
    const { StoryService } = await import('@/services/story.service');
    const { withAuth } = await import('@/lib/middleware/auth-middleware');

    vi.mocked(auth).mockResolvedValue(mockSession);
    vi.mocked(withAuth).mockResolvedValue({
      context: mockAuthContext,
    });
    
    mockStoryService = vi.mocked(StoryService);
  });

  afterEach(() => {
    // Don't restore all mocks to preserve global transaction mock
  });

  describe('PATCH /api/stories/[storyId]', () => {
    const validUpdateData = {
      title: 'Updated Story Title',
      notes: 'Updated notes',
      visualNotes: 'Updated visual notes',
      link: 'https://updated-example.com',
      storyTypeId: 'type-2',
    };

    it('updates a story successfully with all fields', async () => {
      const existingStory = {
        id: storyId,
        title: 'Original Title',
        notes: 'Original notes',
        visualNotes: 'Original visual notes',
        link: 'https://original-example.com',
        day: '2024-01-01T00:00:00Z',
        order: 1,
        status: 'DRAFT',
        projectId: 'project-1',
        storyTypeId: 'type-1',
        project: { id: 'project-1', name: 'Test Project' },
        storyType: { id: 'type-1', name: 'News Story', icon: '📰' },
      };

      const updatedStory = {
        ...existingStory,
        ...validUpdateData,
        project: { id: 'project-1', name: 'Test Project' },
        storyType: { id: 'type-2', name: 'Updated Story Type', icon: '📺' },
      };

      mockStoryService.getStoryById.mockResolvedValue(existingStory);
      mockStoryService.updateStory.mockResolvedValue(updatedStory);

      const request = new NextRequest(
        `http://localhost:3000/api/stories/${storyId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(validUpdateData),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve({ storyId }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe(updatedStory.id);
      expect(data.title).toBe(updatedStory.title);
      expect(data.notes).toBe(updatedStory.notes);
      expect(data.visualNotes).toBe(updatedStory.visualNotes);
      expect(data.link).toBe(updatedStory.link);
      expect(data.storyTypeId).toBe(updatedStory.storyTypeId);
      expect(data.projectId).toBe('project-1');
      expect(data.project).toEqual(updatedStory.project);
      expect(data.storyType).toEqual(updatedStory.storyType);
      expect(mockStoryService.updateStory).toHaveBeenCalledWith(storyId, validUpdateData);
    });

    it('updates a story with partial fields', async () => {
      const existingStory = {
        id: storyId,
        title: 'Original Title',
        notes: 'Original notes',
        visualNotes: 'Original visual notes',
        link: 'https://original-example.com',
        day: '2024-01-01T00:00:00Z',
        order: 1,
        status: 'DRAFT',
        projectId: 'project-1',
        storyTypeId: 'type-1',
        project: { id: 'project-1', name: 'Test Project' },
        storyType: { id: 'type-1', name: 'News Story', icon: '📰' },
      };

      const partialUpdateData = {
        title: 'Updated Title Only',
      };

      const updatedStory = {
        ...existingStory,
        ...partialUpdateData,
        project: { id: 'project-1', name: 'Test Project' },
        storyType: { id: 'type-1', name: 'News Story', icon: '📰' },
      };

      mockStoryService.getStoryById.mockResolvedValue(existingStory);
      mockStoryService.updateStory.mockResolvedValue(updatedStory);

      const request = new NextRequest(
        `http://localhost:3000/api/stories/${storyId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(partialUpdateData),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve({ storyId }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe(updatedStory.id);
      expect(data.title).toBe(updatedStory.title);
      expect(data.notes).toBe(updatedStory.notes);
      expect(data.visualNotes).toBe(updatedStory.visualNotes);
      expect(data.link).toBe(updatedStory.link);
      expect(data.projectId).toBe(updatedStory.projectId);
      expect(data.storyTypeId).toBe(updatedStory.storyTypeId);
      expect(data.project).toEqual(updatedStory.project);
      expect(data.storyType).toEqual(updatedStory.storyType);
      expect(mockStoryService.updateStory).toHaveBeenCalledWith(storyId, partialUpdateData);
    });

    it('updates a story with empty string fields (converts to null)', async () => {
      const existingStory = {
        id: storyId,
        title: 'Original Title',
        notes: 'Original notes',
        visualNotes: 'Original visual notes',
        link: 'https://original-example.com',
        day: '2024-01-01T00:00:00Z',
        order: 1,
        status: 'DRAFT',
        projectId: 'project-1',
        storyTypeId: 'type-1',
        project: { id: 'project-1', name: 'Test Project' },
        storyType: { id: 'type-1', name: 'News Story', icon: '📰' },
      };

      const emptyStringData = {
        title: 'Updated Title',
        notes: '',
        visualNotes: '',
        link: '',
      };

      const updatedStory = {
        ...existingStory,
        ...emptyStringData,
        notes: null,
        visualNotes: null,
        link: null,
        project: { id: 'project-1', name: 'Test Project' },
        storyType: { id: 'type-1', name: 'News Story', icon: '📰' },
      };

      mockStoryService.getStoryById.mockResolvedValue(existingStory);
      mockStoryService.updateStory.mockResolvedValue(updatedStory);

      const request = new NextRequest(
        `http://localhost:3000/api/stories/${storyId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(emptyStringData),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve({ storyId }),
      });
      expect(response.status).toBe(200);

      expect(mockStoryService.updateStory).toHaveBeenCalledWith(storyId, emptyStringData);
    });

    it('trims whitespace from text fields', async () => {
      const existingStory = {
        id: storyId,
        title: 'Original Title',
        notes: 'Original notes',
        visualNotes: 'Original visual notes',
        link: 'https://original-example.com',
        day: '2024-01-01T00:00:00Z',
        order: 1,
        status: 'DRAFT',
        projectId: 'project-1',
        storyTypeId: 'type-1',
        project: { id: 'project-1', name: 'Test Project' },
        storyType: { id: 'type-1', name: 'News Story', icon: '📰' },
      };

      const whitespaceData = {
        title: '  Updated Title  ',
        notes: '  Updated notes  ',
        visualNotes: '  Updated visual notes  ',
        link: '  https://updated-example.com  ',
      };

      const trimmedData = {
        title: 'Updated Title',
        notes: 'Updated notes',
        visualNotes: 'Updated visual notes',
        link: 'https://updated-example.com',
      };

      const updatedStory = {
        ...existingStory,
        ...trimmedData,
        project: { id: 'project-1', name: 'Test Project' },
        storyType: { id: 'type-1', name: 'News Story', icon: '📰' },
      };

      mockStoryService.getStoryById.mockResolvedValue(existingStory);
      mockStoryService.updateStory.mockResolvedValue(updatedStory);

      const request = new NextRequest(
        `http://localhost:3000/api/stories/${storyId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(whitespaceData),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve({ storyId }),
      });
      expect(response.status).toBe(200);

      expect(mockStoryService.updateStory).toHaveBeenCalledWith(storyId, whitespaceData);
    });

    it('returns 404 when story does not exist', async () => {
      // Mock updateStory to throw error directly
      mockStoryService.updateStory.mockRejectedValue(new Error('Story not found'));

      const request = new NextRequest(
        `http://localhost:3000/api/stories/${storyId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(validUpdateData),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve({ storyId }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.message).toBe('Resource not found');
      expect(mockStoryService.updateStory).toHaveBeenCalledWith(storyId, validUpdateData);
    });

    it('returns 404 when storyTypeId does not exist', async () => {
      const existingStory = {
        id: storyId,
        title: 'Original Title',
        notes: 'Original notes',
        visualNotes: 'Original visual notes',
        link: 'https://original-example.com',
        day: '2024-01-01T00:00:00Z',
        order: 1,
        status: 'DRAFT',
        projectId: 'project-1',
        storyTypeId: 'type-1',
        project: { id: 'project-1', name: 'Test Project' },
        storyType: { id: 'type-1', name: 'News Story', icon: '📰' },
      };

      mockStoryService.getStoryById.mockResolvedValue(existingStory);
      mockStoryService.updateStory.mockRejectedValue(new Error('Story type not found'));

      const request = new NextRequest(
        `http://localhost:3000/api/stories/${storyId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(validUpdateData),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve({ storyId }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.message).toBe('Resource not found');
      expect(mockStoryService.updateStory).toHaveBeenCalledWith(storyId, validUpdateData);
    });

    it('returns 400 when title is empty string', async () => {
      const invalidData = {
        title: '',
      };

      // Mock updateStory to throw validation error
      mockStoryService.updateStory.mockRejectedValue(new Error('Validation failed: title cannot be empty'));

      const request = new NextRequest(
        `http://localhost:3000/api/stories/${storyId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(invalidData),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve({ storyId }),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.message).toBe('Validation failed: title cannot be empty');
      expect(mockStoryService.updateStory).toHaveBeenCalledWith(storyId, invalidData);
    });

    it('returns 400 when title is only whitespace', async () => {
      const invalidData = {
        title: '   ',
      };

      // Mock updateStory to throw validation error
      mockStoryService.updateStory.mockRejectedValue(new Error('Validation failed: title cannot be only whitespace'));

      const request = new NextRequest(
        `http://localhost:3000/api/stories/${storyId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(invalidData),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve({ storyId }),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.message).toBe('Validation failed: title cannot be only whitespace');
      expect(mockStoryService.updateStory).toHaveBeenCalledWith(storyId, invalidData);
    });

    it('handles database errors gracefully', async () => {
      const existingStory = {
        id: storyId,
        title: 'Original Title',
        notes: 'Original notes',
        visualNotes: 'Original visual notes',
        link: 'https://original-example.com',
        day: '2024-01-01T00:00:00Z',
        order: 1,
        status: 'DRAFT',
        projectId: 'project-1',
        storyTypeId: 'type-1',
        project: { id: 'project-1', name: 'Test Project' },
        storyType: { id: 'type-1', name: 'News Story', icon: '📰' },
      };

      mockStoryService.getStoryById.mockResolvedValue(existingStory);
      const { DatabaseError } = await import('@/lib/utils/error-handler');
      mockStoryService.updateStory.mockRejectedValue(new DatabaseError('Database error'));

      const request = new NextRequest(
        `http://localhost:3000/api/stories/${storyId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(validUpdateData),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve({ storyId }),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.message).toBe('Database error');
    });

    it('handles empty request body gracefully', async () => {
      const existingStory = {
        id: storyId,
        title: 'Original Title',
        notes: 'Original notes',
        visualNotes: 'Original visual notes',
        link: 'https://original-example.com',
        day: '2024-01-01T00:00:00Z',
        order: 1,
        status: 'DRAFT',
        projectId: 'project-1',
        storyTypeId: 'type-1',
        project: { id: 'project-1', name: 'Test Project' },
        storyType: { id: 'type-1', name: 'News Story', icon: '📰' },
      };

      const updatedStory = {
        ...existingStory,
        project: { id: 'project-1', name: 'Test Project' },
        storyType: { id: 'type-1', name: 'News Story', icon: '📰' },
      };

      mockStoryService.getStoryById.mockResolvedValue(existingStory);
      mockStoryService.updateStory.mockResolvedValue(updatedStory);

      const request = new NextRequest(
        `http://localhost:3000/api/stories/${storyId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({}),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve({ storyId }),
      });
      expect(response.status).toBe(200);

      expect(mockStoryService.updateStory).toHaveBeenCalledWith(storyId, {});
    });
  });

  describe('DELETE /api/stories/[storyId]', () => {
    it('deletes a story successfully', async () => {
      const existingStory = {
        id: storyId,
        title: 'Original Title',
        notes: 'Original notes',
        visualNotes: 'Original visual notes',
        link: 'https://original-example.com',
        day: '2024-01-01T00:00:00Z',
        order: 1,
        status: 'DRAFT',
        projectId: 'project-1',
        storyTypeId: 'type-1',
        project: { id: 'project-1', name: 'Test Project' },
        storyType: { id: 'type-1', name: 'News Story', icon: '📰' },
      };

      const deleteResult = {
        success: true,
        deletedId: storyId,
        message: 'Story deleted successfully',
      };

      mockStoryService.getStoryById.mockResolvedValue(existingStory);
      mockStoryService.deleteStory.mockResolvedValue(deleteResult);

      const request = new NextRequest(
        `http://localhost:3000/api/stories/${storyId}`,
        {
          method: 'DELETE',
        }
      );

      const response = await DELETE(request, {
        params: Promise.resolve({ storyId }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('استوری با موفقیت حذف شد');
      expect(data.deletedId).toBe(storyId);
      expect(mockStoryService.deleteStory).toHaveBeenCalledWith(storyId);
    });

    it('returns 404 when story does not exist', async () => {
      // Mock deleteStory to throw error directly
      mockStoryService.deleteStory.mockRejectedValue(new Error('Story not found'));

      const request = new NextRequest(
        `http://localhost:3000/api/stories/${storyId}`,
        {
          method: 'DELETE',
        }
      );

      const response = await DELETE(request, {
        params: Promise.resolve({ storyId }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.message).toBe('Resource not found');
      expect(mockStoryService.deleteStory).toHaveBeenCalledWith(storyId);
    });

    it('handles database errors gracefully', async () => {
      const existingStory = {
        id: storyId,
        title: 'Original Title',
        notes: 'Original notes',
        visualNotes: 'Original visual notes',
        link: 'https://original-example.com',
        day: '2024-01-01T00:00:00Z',
        order: 1,
        status: 'DRAFT',
        projectId: 'project-1',
        storyTypeId: 'type-1',
        project: { id: 'project-1', name: 'Test Project' },
        storyType: { id: 'type-1', name: 'News Story', icon: '📰' },
      };

      mockStoryService.getStoryById.mockResolvedValue(existingStory);
      const { DatabaseError } = await import('@/lib/utils/error-handler');
      mockStoryService.deleteStory.mockRejectedValue(new DatabaseError('Database error'));

      const request = new NextRequest(
        `http://localhost:3000/api/stories/${storyId}`,
        {
          method: 'DELETE',
        }
      );

      const response = await DELETE(request, {
        params: Promise.resolve({ storyId }),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.message).toBe('Database error');
    });

    it('handles story with null fields correctly', async () => {
      const existingStory = {
        id: storyId,
        title: 'Original Title',
        notes: null,
        visualNotes: null,
        link: null,
        day: '2024-01-01T00:00:00Z',
        order: 1,
        status: 'DRAFT',
        projectId: null,
        storyTypeId: null,
        project: null,
        storyType: null,
      };

      const deleteResult = {
        success: true,
        deletedId: storyId,
        message: 'Story deleted successfully',
      };

      mockStoryService.getStoryById.mockResolvedValue(existingStory);
      mockStoryService.deleteStory.mockResolvedValue(deleteResult);

      const request = new NextRequest(
        `http://localhost:3000/api/stories/${storyId}`,
        {
          method: 'DELETE',
        }
      );

      const response = await DELETE(request, {
        params: Promise.resolve({ storyId }),
      });
      expect(response.status).toBe(200);

      expect(mockStoryService.deleteStory).toHaveBeenCalledWith(storyId);
    });
  });
});