import '@testing-library/jest-dom';

// Import vitest globals
import { vi } from 'vitest';

// Import centralized mocks
import { mockPrisma, mockAuth, mockStoryService, mockProjectService } from './mocks';

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
  withAuth: mockAuth.withAuth,
}));

// Mock Prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

// Mock auth function
vi.mock('@/auth', () => ({
  auth: mockAuth.auth,
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
vi.mock('@/services/story.service', () => ({
  StoryService: mockStoryService,
}));

// Mock ProjectService
vi.mock('@/services/project.service', () => ({
  ProjectService: mockProjectService,
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

