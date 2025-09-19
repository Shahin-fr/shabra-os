import '@testing-library/jest-dom';

// Import vitest globals
import { vi } from 'vitest';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock Next.js image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => {
    return <img src={src} alt={alt} {...props} />;
  },
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock performance.memory
Object.defineProperty(performance, 'memory', {
  writable: true,
  value: {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
    jsHeapSizeLimit: 3000000,
  },
});

// Mock authentication middleware
vi.mock('@/lib/middleware/auth-middleware', () => ({
  withAuth: vi.fn().mockImplementation((request, options) => {
    // Return different auth levels based on options
    const role = options?.requiredPrivilegeLevel === 'MANAGER' ? 'MANAGER' : 'EMPLOYEE';
    return Promise.resolve({
      response: null,
      context: {
        userId: 'test-user-id',
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: role,
        },
      },
    });
  }),
}));

// Mock Prisma client
const mockPrisma = {
  story: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    aggregate: vi.fn(),
  },
  project: {
    findMany: vi.fn(),
    findUnique: vi.fn().mockImplementation(async ({ where }) => {
      if (where.id === 'project-1') {
        return { id: 'project-1', name: 'Test Project' };
      }
      return null;
    }),
    create: vi.fn(),
    update: vi.fn().mockResolvedValue({ id: 'project-1', name: 'Test Project', updatedAt: new Date() }),
    delete: vi.fn(),
    count: vi.fn(),
  },
  storyType: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
  },
  user: {
    findMany: vi.fn(),
    findUnique: vi.fn().mockResolvedValue({ id: 'user-123', firstName: 'John', lastName: 'Doe' }),
  },
  task: {
    findMany: vi.fn(),
    create: vi.fn().mockImplementation(async ({ data, include }) => {
      // Mock task creation
      const mockTask = {
        id: 'new-task-id',
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Convert Date objects to ISO strings to avoid serialization issues
        dueDate: data.dueDate ? (data.dueDate instanceof Date ? data.dueDate.toISOString() : data.dueDate) : null,
      };

      // Add included relations if requested
      if (include) {
        if (include.creator) {
          mockTask.creator = { id: 'user-123', firstName: 'John', lastName: 'Doe', email: 'john@example.com' };
        }
        if (include.assignee) {
          mockTask.assignee = data.assignedTo ? { id: data.assignedTo, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' } : null;
        }
        if (include.project) {
          mockTask.project = data.projectId ? { id: data.projectId, name: 'Test Project' } : null;
        }
      }

      // Returning mock task
      return mockTask;
    }),
    update: vi.fn(),
    delete: vi.fn(),
  },
  wiki: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  contentSlot: {
    findMany: vi.fn(),
    create: vi.fn().mockImplementation(async ({ data }) => {
      // Mock content slot creation
      const mockContentSlot = {
        id: 'slot-123',
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      // Returning mock content slot
      return mockContentSlot;
    }),
    update: vi.fn(),
    delete: vi.fn(),
  },
  document: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  storyIdea: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  $transaction: vi.fn(),
};

// Mock transaction to execute the callback with the same mock object
mockPrisma.$transaction.mockImplementation(async (callback) => {
  // Create a transaction context (tx) that has the same mocks as the main prisma object
  const txMock = {
    ...mockPrisma,
    // Ensure task.create is available in transaction context with proper implementation
    task: {
      ...mockPrisma.task,
      create: vi.fn().mockImplementation(async ({ data, include }) => {
        const mockTask = {
          id: 'new-task-id',
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          // Convert Date objects to ISO strings to avoid serialization issues
          dueDate: data.dueDate ? (data.dueDate instanceof Date ? data.dueDate.toISOString() : data.dueDate) : null,
        };

        // Add included relations if requested
        if (include) {
          if (include.creator) {
            mockTask.creator = { id: 'user-123', firstName: 'John', lastName: 'Doe', email: 'john@example.com' };
          }
          if (include.assignee) {
            mockTask.assignee = data.assignedTo ? { id: data.assignedTo, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' } : null;
          }
          if (include.project) {
            mockTask.project = data.projectId ? { id: data.projectId, name: 'Test Project' } : null;
          }
        }

        return mockTask;
      }),
    },
    project: {
      ...mockPrisma.project,
      update: vi.fn().mockImplementation(async ({ where, data }) => {
        return { id: where.id, name: 'Test Project', updatedAt: new Date() };
      }),
    },
    contentSlot: {
      ...mockPrisma.contentSlot,
      create: mockPrisma.contentSlot.create,
    },
    document: {
      ...mockPrisma.document,
      create: mockPrisma.document.create,
    },
    storyIdea: {
      ...mockPrisma.storyIdea,
      findFirst: mockPrisma.storyIdea.findFirst,
    }
  };
  
  return await callback(txMock);
});

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

// Mock auth function
vi.mock('@/auth', () => ({
  auth: vi.fn().mockResolvedValue({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    },
  }),
}));

// Mock validation middleware
vi.mock('@/lib/middleware/validation-middleware', () => {
  class ValidationError extends Error {
    statusCode = 400;
    errors: Array<{ path: string[]; message: string }> = [];
    
    constructor(message: string, errors: Array<{ path: string[]; message: string }> = []) {
      super(message);
      this.name = 'ValidationError';
      this.errors = errors;
    }
  }

  const validateQuery = vi.fn().mockImplementation((schema) => {
    return async (request) => {
      // Mock query validation
      const url = new URL(request.url);
      const queryParams = Object.fromEntries(url.searchParams.entries());
      
      // Convert string values to appropriate types for testing
      const processedParams = {
        page: queryParams.page ? parseInt(queryParams.page, 10) : 1,
        pageSize: queryParams.pageSize ? parseInt(queryParams.pageSize, 10) : 20,
        search: queryParams.search || undefined,
        sortBy: queryParams.sortBy || undefined,
        sortOrder: queryParams.sortOrder || undefined,
      };

      // Basic validation for query parameters
      if (processedParams.page && (isNaN(processedParams.page) || processedParams.page < 1)) {
        throw new ValidationError('Validation failed: page: Page must be a positive integer', [
          { path: ['page'], message: 'Page must be a positive integer' }
        ]);
      }

      if (processedParams.pageSize && (isNaN(processedParams.pageSize) || processedParams.pageSize < 1)) {
        throw new ValidationError('Validation failed: pageSize: Page size must be a positive integer', [
          { path: ['pageSize'], message: 'Page size must be a positive integer' }
        ]);
      }

      return processedParams;
    };
  });

  const validate = vi.fn().mockImplementation((schema) => {
    return async (request) => {
      const body = await request.json();
      
      // Basic validation for testing
      if (!body.title || body.title.trim() === '') {
        throw new ValidationError('Validation failed: title: Title is required', [
          { path: ['title'], message: 'Title is required' }
        ]);
      }
      
      if (!body.day) {
        throw new ValidationError('Validation failed: day: Day is required', [
          { path: ['day'], message: 'Day is required' }
        ]);
      }
      
      // Check for invalid date format
      if (body.day && !/^\d{4}-\d{2}-\d{2}$/.test(body.day)) {
        throw new ValidationError('Validation failed: day: Invalid date format', [
          { path: ['day'], message: 'Invalid date format' }
        ]);
      }
      
      return body; // Return the body if validation passes
    };
  });

  return {
    validate,
    validateQuery,
    ValidationError,
  };
});

// Mock StoryService
const mockStories = [
  {
    id: '1',
    title: 'Test Story 1',
    notes: 'Test notes',
    visualNotes: 'Test visual notes',
    link: 'https://example.com',
    day: '2024-01-01T00:00:00Z',
    order: 1,
    status: 'DRAFT',
    projectId: 'project-1',
    storyTypeId: 'type-1',
    project: { id: 'project-1', name: 'Test Project' },
    storyType: { id: 'type-1', name: 'News Story', icon: '📰' },
  },
  {
    id: '2',
    title: 'Test Story 2',
    notes: null,
    visualNotes: null,
    link: null,
    day: '2024-01-01T00:00:00Z',
    order: 2,
    status: 'READY',
    projectId: null,
    storyTypeId: null,
    project: null,
    storyType: null,
  },
  {
    id: 'story-123',
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
  },
];

vi.mock('@/services/story.service', () => ({
  StoryService: {
    createStory: vi.fn().mockImplementation(async (data) => {
      return {
        id: 'new-story-id',
        title: data.title,
        content: data.content || '',
        notes: data.notes || null,
        visualNotes: data.visualNotes || null,
        link: data.link || null,
        day: data.day ? new Date(data.day).toISOString() : new Date().toISOString(),
        order: data.order !== undefined ? data.order : (data.title === 'Minimal Story' ? 1 : 0),
        status: data.status || 'DRAFT',
        projectId: data.projectId || null,
        storyTypeId: data.storyTypeId || null,
        storyIdeaId: data.storyIdeaId || null,
        customTitle: data.customTitle || null,
        type: data.type || null,
        ideaId: data.ideaId || null,
        authorId: data.authorId || 'user-123',
        project: data.projectId ? { id: data.projectId, name: 'Test Project' } : null,
        storyType: data.storyTypeId ? { id: data.storyTypeId, name: 'News Story', icon: '📰' } : null,
      };
    }),
    getStoriesByDay: vi.fn().mockResolvedValue(mockStories),
    getAllStories: vi.fn(),
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
  },
}));

// Mock ProjectService
vi.mock('@/services/project.service', () => ({
  ProjectService: {
    getProjects: vi.fn().mockImplementation(async (queryParams) => {
      const { page = 1, pageSize = 20 } = queryParams;
      const mockProjects = [
        { id: '1', name: 'Project 1', description: 'Description 1' },
        { id: '2', name: 'Project 2', description: 'Description 2' },
      ];
      
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
    getProjectById: vi.fn(),
    createProject: vi.fn().mockImplementation(async (data) => {
      return {
        id: 'new-project-id',
        name: data.name,
        description: data.description || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }),
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
  },
}));

// Mock toast notifications
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

// Note: beforeAll and afterAll are provided by Vitest globals

