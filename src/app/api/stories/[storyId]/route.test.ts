import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    story: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findFirst: vi.fn(),
    },
    project: {
      findUnique: vi.fn(),
    },
    storyType: {
      findUnique: vi.fn(),
    },
  },
}));

import { PATCH, DELETE } from './route';

describe('Individual Story API Route', () => {
  let mockPrisma: any;
  const storyId = 'story-123';

  beforeEach(async () => {
    vi.clearAllMocks();
    mockPrisma = vi.mocked(await import('@/lib/prisma'), true).prisma;
  });

  afterEach(() => {
    vi.clearAllMocks();
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
        day: '2024-01-01T00:00:00Z', // API returns string
        order: 1,
        status: 'DRAFT',
        projectId: 'project-1',
        storyTypeId: 'type-1',
      };

      const updatedStory = {
        ...existingStory,
        ...validUpdateData,
        project: { id: 'project-1', name: 'Original Project' },
        storyType: { id: 'type-1', name: 'Original Story Type', icon: '📰' },
      };

      mockPrisma.story.findUnique.mockResolvedValue(existingStory);
      mockPrisma.storyType.findUnique.mockResolvedValue({
        id: 'type-2',
        name: 'Updated Story Type',
        icon: '📺',
      });
      mockPrisma.story.update.mockResolvedValue(updatedStory);

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
      expect(data.order).toBe(updatedStory.order);
      expect(data.status).toBe('DRAFT'); // Status is not updated by PATCH
      expect(data.projectId).toBe('project-1'); // API doesn't update projectId
      expect(data.storyTypeId).toBe(updatedStory.storyTypeId);
      expect(data.project).toEqual(updatedStory.project);
      expect(data.storyType).toEqual(updatedStory.storyType);
      expect(mockPrisma.story.update).toHaveBeenCalledWith({
        where: { id: storyId },
        data: validUpdateData,
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

    it('updates a story with partial fields', async () => {
      const existingStory = {
        id: storyId,
        title: 'Original Title',
        notes: 'Original notes',
        visualNotes: 'Original visual notes',
        link: 'https://original-example.com',
        day: '2024-01-01T00:00:00Z', // API returns string
        order: 1,
        status: 'DRAFT',
        projectId: 'project-1',
        storyTypeId: 'type-1',
      };

      const partialUpdateData = {
        title: 'Updated Title Only',
        notes: 'Updated notes only',
      };

      const updatedStory = {
        ...existingStory,
        ...partialUpdateData,
        project: { id: 'project-1', name: 'Original Project' },
        storyType: { id: 'type-1', name: 'Original Story Type', icon: '📰' },
      };

      mockPrisma.story.findUnique.mockResolvedValue(existingStory);
      mockPrisma.story.update.mockResolvedValue(updatedStory);

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
      expect(data.order).toBe(updatedStory.order);
      expect(data.status).toBe(updatedStory.status);
      expect(data.projectId).toBe(updatedStory.projectId);
      expect(data.storyTypeId).toBe(updatedStory.storyTypeId);
      expect(data.project).toEqual(updatedStory.project);
      expect(data.storyType).toEqual(updatedStory.storyType);
      expect(mockPrisma.story.update).toHaveBeenCalledWith({
        where: { id: storyId },
        data: {
          title: 'Updated Title Only',
          notes: 'Updated notes only',
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

    it('updates a story with empty string fields (converts to null)', async () => {
      const existingStory = {
        id: storyId,
        title: 'Original Title',
        notes: 'Original notes',
        visualNotes: 'Original visual notes',
        link: 'https://original-example.com',
        day: '2024-01-01T00:00:00Z', // API returns string
        order: 1,
        status: 'DRAFT',
        projectId: 'project-1',
        storyTypeId: 'type-1',
      };

      const updateData = {
        notes: '',
        visualNotes: '',
        link: '',
        storyTypeId: '',
      };

      const updatedStory = {
        ...existingStory,
        notes: null,
        visualNotes: null,
        link: null,
        projectId: null,
        storyTypeId: null,
        project: null,
        storyType: null,
      };

      mockPrisma.story.findUnique.mockResolvedValue(existingStory);
      mockPrisma.story.update.mockResolvedValue(updatedStory);

      const request = new NextRequest(
        `http://localhost:3000/api/stories/${storyId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(updateData),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve({ storyId }),
      });
      expect(response.status).toBe(200);

      expect(mockPrisma.story.update).toHaveBeenCalledWith({
        where: { id: storyId },
        data: {
          notes: null,
          visualNotes: null,
          link: null,
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

    it('trims whitespace from text fields', async () => {
      const existingStory = {
        id: storyId,
        title: 'Original Title',
        notes: 'Original notes',
        visualNotes: 'Original visual notes',
        link: 'https://original-example.com',
        day: '2024-01-01T00:00:00Z', // API returns string
        order: 1,
        status: 'DRAFT',
        projectId: 'project-1',
        storyTypeId: 'type-1',
      };

      const updateData = {
        title: '  Updated Title  ',
        notes: '  Updated Notes  ',
        visualNotes: '  Updated Visual Notes  ',
        link: '  https://updated-example.com  ',
      };

      const updatedStory = {
        ...existingStory,
        title: 'Updated Title',
        notes: 'Updated Notes',
        visualNotes: 'Updated Visual Notes',
        link: 'https://updated-example.com',
        project: { id: 'project-1', name: 'Original Project' },
        storyType: { id: 'type-1', name: 'Original Story Type', icon: '📰' },
      };

      mockPrisma.story.findUnique.mockResolvedValue(existingStory);
      mockPrisma.story.update.mockResolvedValue(updatedStory);

      const request = new NextRequest(
        `http://localhost:3000/api/stories/${storyId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(updateData),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve({ storyId }),
      });
      expect(response.status).toBe(200);

      expect(mockPrisma.story.update).toHaveBeenCalledWith({
        where: { id: storyId },
        data: {
          title: 'Updated Title',
          notes: 'Updated Notes',
          visualNotes: 'Updated Visual Notes',
          link: 'https://updated-example.com',
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

    it('returns 404 when story does not exist', async () => {
      mockPrisma.story.findUnique.mockResolvedValue(null);

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
      expect(data.error).toBe('استوری مورد نظر یافت نشد');
      expect(mockPrisma.story.update).not.toHaveBeenCalled();
    });

    it('returns 404 when storyTypeId does not exist', async () => {
      const existingStory = {
        id: storyId,
        title: 'Original Title',
        notes: 'Original notes',
        visualNotes: 'Original visual notes',
        link: 'https://original-example.com',
        day: '2024-01-01T00:00:00Z', // API returns string
        order: 1,
        status: 'DRAFT',
        projectId: 'project-1',
        storyTypeId: 'type-1',
      };

      const updateData = {
        storyTypeId: 'non-existent-type',
      };

      mockPrisma.story.findUnique.mockResolvedValue(existingStory);
      mockPrisma.storyType.findUnique.mockResolvedValue(null);

      const request = new NextRequest(
        `http://localhost:3000/api/stories/${storyId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(updateData),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve({ storyId }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('نوع استوری مورد نظر یافت نشد');
      expect(mockPrisma.story.update).not.toHaveBeenCalled();
    });

    it('returns 400 when title is empty string', async () => {
      const existingStory = {
        id: storyId,
        title: 'Original Title',
        notes: 'Original notes',
        visualNotes: 'Original visual notes',
        link: 'https://original-example.com',
        day: '2024-01-01T00:00:00Z', // API returns string
        order: 1,
        status: 'DRAFT',
        projectId: 'project-1',
        storyTypeId: 'type-1',
      };

      const updateData = {
        title: '',
      };

      mockPrisma.story.findUnique.mockResolvedValue(existingStory);

      const request = new NextRequest(
        `http://localhost:3000/api/stories/${storyId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(updateData),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve({ storyId }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('عنوان استوری نمی‌تواند خالی باشد');
      expect(mockPrisma.story.update).not.toHaveBeenCalled();
    });

    it('returns 400 when title is only whitespace', async () => {
      const existingStory = {
        id: storyId,
        title: 'Original Title',
        notes: 'Original notes',
        visualNotes: 'Original visual notes',
        link: 'https://original-example.com',
        day: '2024-01-01T00:00:00Z', // API returns string
        order: 1,
        status: 'DRAFT',
        projectId: 'project-1',
        storyTypeId: 'type-1',
      };

      const updateData = {
        title: '   ',
      };

      mockPrisma.story.findUnique.mockResolvedValue(existingStory);

      const request = new NextRequest(
        `http://localhost:3000/api/stories/${storyId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(updateData),
        }
      );

      const response = await PATCH(request, {
        params: Promise.resolve({ storyId }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('عنوان استوری نمی‌تواند خالی باشد');
      expect(mockPrisma.story.update).not.toHaveBeenCalled();
    });

    it('handles database errors gracefully', async () => {
      const existingStory = {
        id: storyId,
        title: 'Original Title',
        notes: 'Original notes',
        visualNotes: 'Original visual notes',
        link: 'https://original-example.com',
        day: '2024-01-01T00:00:00Z', // API returns string
        order: 1,
        status: 'DRAFT',
        projectId: 'project-1',
        storyTypeId: 'type-1',
      };

      mockPrisma.story.findUnique.mockResolvedValue(existingStory);
      // Mock story type lookup to pass validation
      mockPrisma.storyType.findUnique.mockResolvedValue({
        id: 'type-2',
        name: 'Updated Story Type',
        icon: '📺',
      });
      mockPrisma.story.update.mockRejectedValue(new Error('Database error'));

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
      expect(data.error).toBe('خطا در بروزرسانی استوری');
    });

    it('handles empty request body gracefully', async () => {
      const existingStory = {
        id: storyId,
        title: 'Original Title',
        notes: 'Original notes',
        visualNotes: 'Original visual notes',
        link: 'https://original-example.com',
        day: '2024-01-01T00:00:00Z', // API returns string
        order: 1,
        status: 'DRAFT',
        projectId: 'project-1',
        storyTypeId: 'type-1',
      };

      mockPrisma.story.findUnique.mockResolvedValue(existingStory);
      mockPrisma.story.update.mockResolvedValue(existingStory);

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

      expect(mockPrisma.story.update).toHaveBeenCalledWith({
        where: { id: storyId },
        data: {},
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

  describe('DELETE /api/stories/[storyId]', () => {
    it('deletes a story successfully', async () => {
      const existingStory = {
        id: storyId,
        title: 'Story to Delete',
        notes: 'Notes to delete',
        visualNotes: 'Visual notes to delete',
        link: 'https://example-to-delete.com',
        day: '2024-01-01T00:00:00Z', // API returns string
        order: 1,
        status: 'DRAFT',
        projectId: 'project-1',
        storyTypeId: 'type-1',
      };

      mockPrisma.story.findUnique.mockResolvedValue(existingStory);
      mockPrisma.story.delete.mockResolvedValue(existingStory);

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
      expect(mockPrisma.story.delete).toHaveBeenCalledWith({
        where: { id: storyId },
      });
    });

    it('returns 404 when story does not exist', async () => {
      mockPrisma.story.findUnique.mockResolvedValue(null);

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
      expect(data.error).toBe('استوری مورد نظر یافت نشد');
      expect(mockPrisma.story.delete).not.toHaveBeenCalled();
    });

    it('handles database errors gracefully', async () => {
      const existingStory = {
        id: storyId,
        title: 'Story to Delete',
        notes: 'Notes to delete',
        visualNotes: 'Visual notes to delete',
        link: 'https://example-to-delete.com',
        day: '2024-01-01T00:00:00Z', // API returns string
        order: 1,
        status: 'DRAFT',
        projectId: 'project-1',
        storyTypeId: 'type-1',
      };

      mockPrisma.story.findUnique.mockResolvedValue(existingStory);
      mockPrisma.story.delete.mockRejectedValue(new Error('Database error'));

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
      expect(data.error).toBe('خطا در حذف استوری');
    });

    it('handles story with null fields correctly', async () => {
      const existingStory = {
        id: storyId,
        title: 'Story to Delete',
        notes: null,
        visualNotes: null,
        link: null,
        day: '2024-01-01T00:00:00Z', // API returns string
        order: 1,
        status: 'DRAFT',
        projectId: null,
        storyTypeId: null,
      };

      mockPrisma.story.findUnique.mockResolvedValue(existingStory);
      mockPrisma.story.delete.mockResolvedValue(existingStory);

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

      expect(mockPrisma.story.delete).toHaveBeenCalledWith({
        where: { id: storyId },
      });
    });
  });
});
