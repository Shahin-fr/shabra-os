import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the dependencies
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    task: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    project: {
      findUnique: vi.fn(),
    },
  },
}));

// Import the component after mocking
import { GET, POST } from './route';

describe('Tasks API Route', () => {
  const mockSession = {
    user: {
      id: 'user-123',
      email: 'test@example.com',
      roles: ['USER'],
    },
  };

  const mockTasks = [
    {
      id: 'task-1',
      title: 'Test Task 1',
      description: 'Test Description 1',
      status: 'PENDING',
      priority: 'medium',
      projectId: 'project-1',
      assignedTo: 'user-123',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      project: {
        id: 'project-1',
        name: 'Test Project 1',
      },
      user: {
        id: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      },
    },
    {
      id: 'task-2',
      title: 'Test Task 2',
      description: 'Test Description 2',
      status: 'IN_PROGRESS',
      priority: 'high',
      projectId: 'project-2',
      assignedTo: 'user-456',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
      project: {
        id: 'project-2',
        name: 'Test Project 2',
      },
      user: {
        id: 'user-456',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
      },
    },
  ];

  const mockProject = {
    id: 'project-1',
    name: 'Test Project',
    description: 'Test Project Description',
    status: 'ACTIVE',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup default mocks using vi.mocked
    const { auth } = await import('@/auth');
    const { prisma } = await import('@/lib/prisma');

    vi.mocked(auth).mockResolvedValue(mockSession);
    vi.mocked(prisma.task.findMany).mockResolvedValue(mockTasks as any);
    vi.mocked(prisma.project.findUnique).mockResolvedValue(mockProject as any);

    // Mock task creation to return the actual data being created
    (vi.mocked(prisma.task.create) as any).mockImplementation(
      async ({ data }: any) => ({
        id: 'new-task-id',
        title: data.title,
        description: data.description,
        status: data.status || 'PENDING',
        priority: data.priority || 'medium',
        projectId: data.projectId,
        assignedTo: data.assignedTo,
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/tasks', () => {
    it('returns all tasks when no query parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/tasks');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
      expect(data[0].title).toBe('Test Task 1');
      expect(data[1].title).toBe('Test Task 2');
    });

    it('filters tasks by projectId', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.task.findMany).mockResolvedValue([mockTasks[0]] as any);

      const request = new NextRequest(
        'http://localhost:3000/api/tasks?projectId=project-1'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(data[0].projectId).toBe('project-1');
      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { projectId: 'project-1' },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('filters tasks by assignedTo user ID', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.task.findMany).mockResolvedValue([mockTasks[1]] as any);

      const request = new NextRequest(
        'http://localhost:3000/api/tasks?assignedTo=user-456'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(data[0].assignedTo).toBe('user-456');
      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { assignedTo: 'user-456' },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('filters tasks by assignedTo=me for current user', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.task.findMany).mockResolvedValue([mockTasks[0]] as any);

      const request = new NextRequest(
        'http://localhost:3000/api/tasks?assignedTo=me'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(data[0].assignedTo).toBe('user-123');
      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { assignedTo: 'user-123' },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('combines multiple filters correctly', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.task.findMany).mockResolvedValue([mockTasks[0]] as any);

      const request = new NextRequest(
        'http://localhost:3000/api/tasks?projectId=project-1&assignedTo=user-123'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: {
          projectId: 'project-1',
          assignedTo: 'user-123',
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('returns 401 when assignedTo=me and user not authenticated', async () => {
      const { auth } = await import('@/auth');
      vi.mocked(auth).mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost:3000/api/tasks?assignedTo=me'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('returns 401 when assignedTo=me and session has no user', async () => {
      const { auth } = await import('@/auth');
      vi.mocked(auth).mockResolvedValue({ user: null });

      const request = new NextRequest(
        'http://localhost:3000/api/tasks?assignedTo=me'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('returns 401 when assignedTo=me and user has no ID', async () => {
      const { auth } = await import('@/auth');
      vi.mocked(auth).mockResolvedValue({
        user: { email: 'test@example.com' },
      });

      const request = new NextRequest(
        'http://localhost:3000/api/tasks?assignedTo=me'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('handles empty results gracefully', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.task.findMany).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/tasks');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(0);
    });

    it('handles database errors gracefully', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.task.findMany).mockRejectedValue(
        new Error('Database error')
      );

      const request = new NextRequest('http://localhost:3000/api/tasks');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('خطا در دریافت وظایف');
    });

    it('includes correct project and user data in response', async () => {
      const request = new NextRequest('http://localhost:3000/api/tasks');
      const response = await GET(request);
      const data = await response.json();

      expect(data[0].project).toBeDefined();
      expect(data[0].project.id).toBe('project-1');
      expect(data[0].project.name).toBe('Test Project 1');
      expect(data[0].user).toBeDefined();
      expect(data[0].user.id).toBe('user-123');
      expect(data[0].user.firstName).toBe('John');
      expect(data[0].user.lastName).toBe('Doe');
      expect(data[0].user.email).toBe('john@example.com');
    });

    it('orders tasks by creation date descending', async () => {
      const { prisma } = await import('@/lib/prisma');

      const request = new NextRequest('http://localhost:3000/api/tasks');
      await GET(request);

      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            createdAt: 'desc',
          },
        })
      );
    });
  });

  describe('POST /api/tasks', () => {
    it('creates task successfully with valid data', async () => {
      const taskData = {
        title: 'New Task',
        description: 'New Task Description',
        projectId: 'project-1',
        assigneeId: 'user-123',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.title).toBe('New Task');
      expect(data.description).toBe('New Task Description');
      expect(data.projectId).toBe('project-1');
      expect(data.assignedTo).toBe('user-123');
      expect(data.status).toBe('PENDING');
      expect(data.priority).toBe('medium');
    });

    it('creates task with minimal required data', async () => {
      const taskData = {
        title: 'Minimal Task',
        projectId: 'project-1',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.title).toBe('Minimal Task');
      expect(data.description).toBeNull();
      expect(data.assignedTo).toBeNull();
    });

    it('trims whitespace from title and description', async () => {
      const taskData = {
        title: '  Trimmed Task  ',
        description: '  Trimmed Description  ',
        projectId: 'project-1',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.title).toBe('Trimmed Task');
      expect(data.description).toBe('Trimmed Description');
    });

    it('returns 400 when title is missing', async () => {
      const taskData = {
        description: 'Task Description',
        projectId: 'project-1',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('عنوان وظیفه الزامی است');
    });

    it('returns 400 when title is empty string', async () => {
      const taskData = {
        title: '',
        projectId: 'project-1',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('عنوان وظیفه الزامی است');
    });

    it('returns 400 when title is only whitespace', async () => {
      const taskData = {
        title: '   ',
        projectId: 'project-1',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('عنوان وظیفه الزامی است');
    });

    it('returns 400 when title is not a string', async () => {
      const taskData = {
        title: 123,
        projectId: 'project-1',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('عنوان وظیفه الزامی است');
    });

    it('returns 400 when title is null', async () => {
      const taskData = {
        title: null,
        projectId: 'project-1',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('عنوان وظیفه الزامی است');
    });

    it('returns 400 when projectId is missing', async () => {
      const taskData = {
        title: 'New Task',
        description: 'Task Description',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('شناسه پروژه الزامی است');
    });

    it('returns 400 when projectId is not a string', async () => {
      const taskData = {
        title: 'New Task',
        projectId: 123,
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('شناسه پروژه الزامی است');
    });

    it('returns 400 when projectId is null', async () => {
      const taskData = {
        title: 'New Task',
        projectId: null,
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('شناسه پروژه الزامی است');
    });

    it('returns 404 when project does not exist', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.project.findUnique).mockResolvedValue(null);

      const taskData = {
        title: 'New Task',
        projectId: 'nonexistent-project',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('پروژه مورد نظر یافت نشد');
    });

    it('creates task without assignee when assigneeId is not provided', async () => {
      const taskData = {
        title: 'Unassigned Task',
        projectId: 'project-1',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.assignedTo).toBeNull();
    });

    it('creates task with null description when description is not provided', async () => {
      const taskData = {
        title: 'No Description Task',
        projectId: 'project-1',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.description).toBeNull();
    });

    it('creates task with empty string description converted to null', async () => {
      const taskData = {
        title: 'Empty Description Task',
        description: '',
        projectId: 'project-1',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.description).toBeNull();
    });

    it('handles database errors gracefully', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.task.create).mockRejectedValue(
        new Error('Database error')
      );

      const taskData = {
        title: 'New Task',
        projectId: 'project-1',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('خطا در ایجاد وظیفه');
    });

    it('handles JSON parsing errors gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('خطا در ایجاد وظیفه');
    });

    it('sets default status and priority correctly', async () => {
      const taskData = {
        title: 'Default Values Task',
        projectId: 'project-1',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.status).toBe('PENDING');
      expect(data.priority).toBe('medium');
    });

    it('verifies project exists before creating task', async () => {
      const { prisma } = await import('@/lib/prisma');

      const taskData = {
        title: 'Verified Project Task',
        projectId: 'project-1',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      await POST(request);

      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: 'project-1' },
      });
    });
  });

  describe('Edge Cases and Validation', () => {
    it('handles very long task titles', async () => {
      const longTitle = 'A'.repeat(1000);
      const taskData = {
        title: longTitle,
        projectId: 'project-1',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.title).toBe(longTitle);
    });

    it('handles very long task descriptions', async () => {
      const longDescription = 'A'.repeat(10000);
      const taskData = {
        title: 'Long Description Task',
        description: longDescription,
        projectId: 'project-1',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.description).toBe(longDescription);
    });

    it('handles special characters in task data', async () => {
      const specialTitle = 'Task @#$%^&*()_+-=[]{}|;:,.<>?';
      const specialDescription = 'Description with special chars: @#$%^&*()';

      const taskData = {
        title: specialTitle,
        description: specialDescription,
        projectId: 'project-1',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.title).toBe(specialTitle);
      expect(data.description).toBe(specialDescription);
    });

    it('handles unicode characters in task data', async () => {
      const unicodeTitle = 'وظیفه با کاراکترهای فارسی';
      const unicodeDescription = 'توضیحات با کاراکترهای فارسی و emoji 🚀';

      const taskData = {
        title: unicodeTitle,
        description: unicodeDescription,
        projectId: 'project-1',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.title).toBe(unicodeTitle);
      expect(data.description).toBe(unicodeDescription);
    });
  });
});
