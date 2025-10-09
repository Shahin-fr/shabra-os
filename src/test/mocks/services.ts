import { vi } from 'vitest';
import { createServiceMock, createMockUser, createMockProject, createMockStory } from './factory';

/**
 * Service Mock Configuration
 * 
 * Centralized service mocking with consistent patterns.
 */

// Story Service Mock
export const createStoryServiceMock = () => {
  const mockStories = [
    createMockStory({ id: '1', title: 'Test Story 1' }),
    createMockStory({ id: '2', title: 'Test Story 2' }),
  ];

  return {
    createStory: vi.fn().mockImplementation(async (data) => ({
      id: 'new-story-id',
      title: data.title,
      content: data.content || '',
      notes: data.notes || null,
      visualNotes: data.visualNotes || null,
      link: data.link || null,
      day: data.day ? new Date(data.day).toISOString() : new Date().toISOString(),
      order: data.order !== undefined ? data.order : 0,
      status: data.status || 'DRAFT',
      projectId: data.projectId || null,
      storyTypeId: data.storyTypeId || null,
      storyIdeaId: data.storyIdeaId || null,
      customTitle: data.customTitle || null,
      type: data.type || null,
      ideaId: data.ideaId || null,
      authorId: data.authorId || 'user-123',
      project: data.projectId ? createMockProject({ id: data.projectId }) : null,
      storyType: data.storyTypeId ? { id: data.storyTypeId, name: 'News Story', icon: '📰' } : null,
    })),
    getStoriesByDay: vi.fn().mockResolvedValue(mockStories),
    getAllStories: vi.fn().mockResolvedValue(mockStories),
    getStoryById: vi.fn().mockImplementation(async (storyId) => {
      const story = mockStories.find(s => s.id === storyId);
      if (!story) {
        throw new Error('Story not found');
      }
      return story;
    }),
    updateStory: vi.fn().mockImplementation(async (storyId, updateData) => {
      const existingStory = mockStories.find(s => s.id === storyId);
      if (!existingStory) {
        throw new Error('Story not found');
      }
      return {
        ...existingStory,
        ...updateData,
        updatedAt: new Date().toISOString(),
      };
    }),
    deleteStory: vi.fn().mockImplementation(async (storyId) => {
      const existingStory = mockStories.find(s => s.id === storyId);
      if (!existingStory) {
        throw new Error('Story not found');
      }
      return {
        success: true,
        deletedId: storyId,
        message: 'Story deleted successfully',
      };
    }),
    reorderStories: vi.fn(),
  };
};

// Project Service Mock
export const createProjectServiceMock = () => {
  const mockProjects = [
    createMockProject({ id: '1', name: 'Project 1' }),
    createMockProject({ id: '2', name: 'Project 2' }),
  ];

  return {
    getProjects: vi.fn().mockImplementation(async (queryParams) => {
      const { page = 1, pageSize = 20 } = queryParams;
      return {
        projects: mockProjects,
        pagination: {
          currentPage: page,
          pageSize,
          totalProjects: 2,
          totalPages: Math.ceil(2 / pageSize),
        },
      };
    }),
    getProjectById: vi.fn().mockResolvedValue(createMockProject()),
    createProject: vi.fn().mockImplementation(async (data) => ({
      id: 'new-project-id',
      name: data.name,
      description: data.description || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })),
    updateProject: vi.fn().mockResolvedValue(createMockProject({ updatedAt: new Date() })),
    deleteProject: vi.fn().mockResolvedValue({ success: true }),
  };
};

// Global service mocks
export const mockStoryService = createStoryServiceMock();
export const mockProjectService = createProjectServiceMock();
