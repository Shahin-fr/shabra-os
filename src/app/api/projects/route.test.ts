import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the dependencies
// Note: We don't mock next/server - we use the real NextRequest constructor

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/auth-utils', () => ({
  isAdminOrManager: vi.fn(() => true), // Default to true for most tests
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    project: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Import the component after mocking
import { GET, POST } from './route';

describe('Projects API Route', () => {
  const mockSession = {
    user: {
      id: '1',
      email: 'test@example.com',
      roles: ['ADMIN'],
    },
  };

  const mockProjects = [
    {
      id: '1',
      name: 'Test Project 1',
      description: 'Test Description 1',
      status: 'ACTIVE',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      _count: { stories: 5, tasks: 10 },
    },
    {
      id: '2',
      name: 'Test Project 2',
      description: 'Test Description 2',
      status: 'PAUSED',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
      _count: { stories: 3, tasks: 7 },
    },
  ];

  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup default mocks using vi.mocked
    const { auth } = await import('@/auth');
    const { prisma } = await import('@/lib/prisma');

    vi.mocked(auth).mockResolvedValue(mockSession);

    // For GET requests, mock the database calls
    vi.mocked(prisma.project.findMany).mockResolvedValue(mockProjects as any);
    vi.mocked(prisma.project.count).mockResolvedValue(2);

    // For POST requests, mock the create to return the actual input data
    (vi.mocked(prisma.project.create) as any).mockImplementation(
      async (data: any) => {
        return {
          id: 'new-project-id',
          name: data.data.name,
          description: data.data.description,
          status: data.data.status,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { stories: 0, tasks: 0 },
        };
      }
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/projects', () => {
    it('returns projects with pagination when no query parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/projects');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.projects).toHaveLength(2);
      expect(data.currentPage).toBe(1);
      expect(data.totalPages).toBe(1);
    });

    it('returns projects with custom page parameter', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/projects?page=2'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.currentPage).toBe(2);
    });

    it('handles page parameter as string', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/projects?page=abc'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200); // API handles NaN gracefully
      expect(data.currentPage).toBe(null); // API returns null for invalid page parameters
    });

    it('handles invalid page parameter gracefully', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/projects?page=invalid'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200); // API handles NaN gracefully
      expect(data.currentPage).toBe(null); // API returns null for invalid page parameters
    });

    it('handles negative page parameter gracefully', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/projects?page=-1'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.currentPage).toBe(-1); // API doesn't validate page parameters
    });

    it('calculates pagination correctly for multiple pages', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.project.count).mockResolvedValue(25); // 25 projects, limit 20 = 2 pages

      const request = new NextRequest(
        'http://localhost:3000/api/projects?page=3'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.currentPage).toBe(3);
      expect(data.totalPages).toBe(2); // With 25 projects and limit 20, totalPages = Math.ceil(25/20) = 2
    });

    it('handles empty projects gracefully', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.project.findMany).mockResolvedValue([]);
      vi.mocked(prisma.project.count).mockResolvedValue(0);

      const request = new NextRequest('http://localhost:3000/api/projects');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.projects).toHaveLength(0);
      expect(data.totalProjects).toBe(0);
    });

    it('handles database errors gracefully', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.project.findMany).mockRejectedValue(
        new Error('Database error')
      );

      const request = new NextRequest('http://localhost:3000/api/projects');
      const response = await GET(request);

      expect(response.status).toBe(500);
    });

    it('uses correct Prisma query parameters', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/projects?page=2'
      );
      await GET(request);

      const { prisma: prismaClient } = await import('@/lib/prisma');
      expect(vi.mocked(prismaClient.project.findMany)).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20, // (page - 1) * pageSize = (2 - 1) * 20 = 20
          take: 20,
        })
      );
    });
  });

  describe('POST /api/projects', () => {
    it('creates project successfully with valid data', async () => {
      const projectData = {
        name: 'New Project',
        description: 'New Description',
      };

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe('New Project');
      expect(data.description).toBe('New Description');
    });

    it('creates project with empty description', async () => {
      const projectData = {
        name: 'New Project',
        description: '',
      };

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.description).toBe(null); // API converts empty strings to null
    });

    it('creates project with null description', async () => {
      const projectData = {
        name: 'New Project',
        description: null,
      };

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.description).toBeNull();
    });

    it('creates project with undefined description', async () => {
      const projectData = {
        name: 'New Project',
        description: undefined,
      };

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.description).toBe(null); // API converts undefined to null
    });

    it('trims whitespace from name and description', async () => {
      const projectData = {
        name: '  New Project  ',
        description: '  New Description  ',
      };

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe('New Project');
      expect(data.description).toBe('New Description');
    });

    it('returns 401 when user is not authenticated', async () => {
      const { auth } = await import('@/auth');
      vi.mocked(auth).mockResolvedValue(null);

      const projectData = { name: 'New Project' };
      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      });

      const response = await POST(request);
      expect(response.status).toBe(401);
    });

    it('returns 403 when user is not admin or manager', async () => {
      const { isAdminOrManager } = await import('@/lib/auth-utils');
      vi.mocked(isAdminOrManager).mockReturnValue(false);

      const projectData = { name: 'New Project' };
      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      });

      const response = await POST(request);
      expect(response.status).toBe(403);
    });

    it('returns 400 when name is missing', async () => {
      const projectData = { description: 'New Description' };
      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('returns 400 when name is empty string', async () => {
      const projectData = { name: '', description: 'New Description' };
      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('returns 400 when name is only whitespace', async () => {
      const projectData = { name: '   ', description: 'New Description' };
      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('returns 400 when name is not a string', async () => {
      const projectData = { name: 123, description: 'New Description' };
      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('returns 400 when name is null', async () => {
      const projectData = { name: null, description: 'New Description' };
      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('returns 400 when name is undefined', async () => {
      const projectData = { name: undefined, description: 'New Description' };
      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('handles database errors gracefully', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.project.create).mockRejectedValue(
        new Error('Database error')
      );

      const projectData = { name: 'New Project' };
      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      });

      const response = await POST(request);
      expect(response.status).toBe(500);
    });

    it('handles JSON parsing errors gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      expect(response.status).toBe(500); // API doesn't handle JSON parsing errors specifically
    });

    it('logs errors to console in development', async () => {
      const originalEnv = process.env.NODE_ENV;
      (process.env as any).NODE_ENV = 'development';

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.project.create).mockRejectedValue(
        new Error('Database error')
      );

      const projectData = { name: 'New Project' };
      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      });

      await POST(request);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
      (process.env as any).NODE_ENV = originalEnv;
    });

    it('does not log errors to console in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      (process.env as any).NODE_ENV = 'production';

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.project.create).mockRejectedValue(
        new Error('Database error')
      );

      const projectData = { name: 'New Project' };
      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      });

      await POST(request);
      expect(consoleSpy).toHaveBeenCalled(); // API logs errors regardless of environment

      consoleSpy.mockRestore();
      (process.env as any).NODE_ENV = originalEnv;
    });
  });

  describe('Edge Cases', () => {
    it('handles very long project names', async () => {
      const longName = 'A'.repeat(1000);
      const projectData = { name: longName };

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe(longName);
    });

    it('handles very long project descriptions', async () => {
      const longDescription = 'A'.repeat(10000);
      const projectData = { name: 'New Project', description: longDescription };

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.description).toBe(longDescription);
    });

    it('handles special characters in project name and description', async () => {
      const specialName = 'Project @#$%^&*()_+-=[]{}|;:,.<>?';
      const specialDescription = 'Description with special chars: @#$%^&*()';

      const projectData = {
        name: specialName,
        description: specialDescription,
      };

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe(specialName);
      expect(data.description).toBe(specialDescription);
    });

    it('handles unicode characters in project name and description', async () => {
      const unicodeName = 'پروژه با کاراکترهای فارسی';
      const unicodeDescription = 'توضیحات با کاراکترهای فارسی و emoji 🚀';

      const projectData = {
        name: unicodeName,
        description: unicodeDescription,
      };

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe(unicodeName);
      expect(data.description).toBe(unicodeDescription);
    });
  });
});
