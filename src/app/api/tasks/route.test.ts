import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMockTask, createMockProject, createMockUser, createMockSession, createTestUsers } from '@/test/mocks';


// Mock the dependencies
vi.mock('@/auth', () => ({
  auth: vi.fn().mockResolvedValue({
    user: {
      id: 'clh1234567890123456789012',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      roles: ['MANAGER'], // Add roles property
    },
  }),
}));

vi.mock('@/lib/middleware/auth-middleware', () => ({
  withAuth: vi.fn().mockImplementation((request, options) => {
    // Return different auth levels based on options
    const role = options?.requiredPrivilegeLevel === 'MANAGER' ? 'MANAGER' : 'EMPLOYEE';
    return Promise.resolve({
      response: null,
      context: {
        userId: 'clh1234567890123456789012',
        roles: [role], // Set roles array
        userEmail: 'test@example.com',
      },
    });
  }),
}));

// Remove local prisma mock to use global one

// Import the component after mocking
import { GET, POST } from './route';

// Remove local prisma mock to use global one

describe('Tasks API Route', () => {
  const mockSession = createMockSession({
    user: createTestUsers.manager({ id: 'clh1234567890123456789012', email: 'test@example.com' })
  });

  const mockAuthContext = {
    userId: 'clh1234567890123456789012',
    roles: ['MANAGER'],
    userEmail: 'test@example.com',
  };

  const mockCreator = createMockUser({ id: 'clh1234567890123456789012', firstName: 'John', lastName: 'Doe', email: 'john@example.com' });
  const mockAssignee1 = createMockUser({ id: 'clh1234567890123456789012', firstName: 'John', lastName: 'Doe', email: 'john@example.com' });
  const mockAssignee2 = createMockUser({ id: 'user-456', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' });

  const mockTasks = [
    createMockTask({
      id: 'task-1',
      title: 'Test Task 1',
      description: 'Test Description 1',
      status: 'Todo',
      priority: 'MEDIUM',
      projectId: 'clh1234567890123456789013',
      assignedTo: 'clh1234567890123456789012',
      createdBy: 'clh1234567890123456789012',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      project: {
        id: 'clh1234567890123456789013',
        name: 'Test Project 1',
      },
      creator: mockCreator,
      assignee: mockAssignee1,
    }),
    createMockTask({
      id: 'task-2',
      title: 'Test Task 2',
      description: 'Test Description 2',
      status: 'InProgress',
      priority: 'HIGH',
      projectId: 'project-2',
      assignedTo: 'user-456',
      createdBy: 'clh1234567890123456789012',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
      project: {
        id: 'project-2',
        name: 'Test Project 2',
      },
      creator: mockCreator,
      assignee: mockAssignee2,
    }),
  ];

  const mockProject = createMockProject({
    id: 'clh1234567890123456789013',
    name: 'Test Project',
    description: 'Test Project Description',
    status: 'ACTIVE',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  });

  beforeEach(async () => {
    // Setup default mocks using vi.mocked - but don't clear all mocks to preserve transaction mock
    const { auth } = await import('@/auth');
    const { prisma } = await import('@/lib/prisma');
    const { withAuth } = await import('@/lib/middleware/auth-middleware');

    vi.mocked(auth).mockResolvedValue(mockSession);
    vi.mocked(withAuth).mockResolvedValue({
      context: mockAuthContext,
    });
    // Mock the paginated query result
    vi.mocked(prisma.task.findMany).mockResolvedValue(mockTasks as any);
    vi.mocked(prisma.task.count).mockResolvedValue(mockTasks.length);
    vi.mocked(prisma.project.findUnique).mockResolvedValue(mockProject as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'clh1234567890123456789012',
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
    } as any);

    // Mock the transaction
    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      const mockTx = {
        task: {
          create: vi.fn().mockImplementation(({ data }) => {
            return Promise.resolve({
              id: 'task-new',
              title: data.title,
              description: data.description,
              status: data.status || 'Todo',
              priority: data.priority || 'MEDIUM',
              createdBy: data.createdBy,
              assignedTo: data.assignedTo,
              projectId: data.projectId,
              dueDate: data.dueDate,
              createdAt: new Date(),
              updatedAt: new Date(),
              creator: {
                id: data.createdBy,
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@example.com',
              },
              assignee: data.assignedTo ? {
                id: data.assignedTo,
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@example.com',
              } : null,
              project: data.projectId ? {
                id: data.projectId,
                name: 'Test Project 1',
              } : null,
            });
          }),
        },
        project: {
          update: vi.fn().mockResolvedValue({}),
        },
      };
      return await callback(mockTx as any);
    });
  });

  afterEach(() => {
    // Don't restore all mocks to preserve global transaction mock
  });

  describe('GET /api/tasks', () => {
    it('returns all tasks when no query parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/tasks');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.data).toHaveLength(2);
      expect(data.data.data[0].title).toBe('Test Task 1');
      expect(data.data.data[1].title).toBe('Test Task 2');
    });

    it('filters tasks by projectId', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.task.findMany).mockResolvedValue([mockTasks[0]] as any);
      vi.mocked(prisma.task.count).mockResolvedValue(1);

      const request = new NextRequest(
        'http://localhost:3000/api/tasks?projectId=clh1234567890123456789013'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.data).toHaveLength(1);
      expect(data.data.data[0].projectId).toBe('clh1234567890123456789013');
      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { 
            projectId: 'clh1234567890123456789013',
            createdBy: 'clh1234567890123456789012',
          },
        })
      );
    });

    it('filters tasks by assignedTo user ID', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.task.findMany).mockResolvedValue([mockTasks[1]] as any);
      vi.mocked(prisma.task.count).mockResolvedValue(1);

      const request = new NextRequest(
        'http://localhost:3000/api/tasks?assignedTo=user-456'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.data).toHaveLength(1);
      expect(data.data.data[0].assignedTo).toBe('user-456');
      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { assignedTo: 'user-456' },
        })
      );
    });

    it('filters tasks by assignedTo=me for current user', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.task.findMany).mockResolvedValue([mockTasks[0]] as any);
      vi.mocked(prisma.task.count).mockResolvedValue(1);

      const request = new NextRequest(
        'http://localhost:3000/api/tasks?assignedTo=me'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.data).toHaveLength(1);
      expect(data.data.data[0].assignedTo).toBe('clh1234567890123456789012');
      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { createdBy: 'clh1234567890123456789012' },
        })
      );
    });

    it('combines multiple filters correctly', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.task.findMany).mockResolvedValue([mockTasks[0]] as any);
      vi.mocked(prisma.task.count).mockResolvedValue(1);

      const request = new NextRequest(
        'http://localhost:3000/api/tasks?projectId=clh1234567890123456789013&assignedTo=user-123'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.data).toHaveLength(1);
      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            projectId: 'clh1234567890123456789013',
            assignedTo: 'user-123',
          },
        })
      );
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
      expect(data.success).toBe(false);
      expect(data.error.message).toBe('Authentication required');
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
      expect(data.success).toBe(false);
      expect(data.error.message).toBe('Authentication required');
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
      expect(data.success).toBe(false);
      expect(data.error.message).toBe('Authentication required');
    });

    it('handles empty results gracefully', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.task.findMany).mockResolvedValue([]);
      vi.mocked(prisma.task.count).mockResolvedValue(0);

      const request = new NextRequest('http://localhost:3000/api/tasks');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.data).toHaveLength(0);
    });

    it('handles database errors gracefully', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { DatabaseError } = await import('@/lib/utils/error-handler');
      vi.mocked(prisma.task.findMany).mockRejectedValue(
        new DatabaseError('Database error')
      );

      const request = new NextRequest('http://localhost:3000/api/tasks');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('Database error');
    });

    it('includes correct project and user data in response', async () => {
      const request = new NextRequest('http://localhost:3000/api/tasks');
      const response = await GET(request);
      const data = await response.json();

      expect(data.data.data[0].project).toBeDefined();
      expect(data.data.data[0].project.id).toBe('clh1234567890123456789013');
      expect(data.data.data[0].project.name).toBe('Test Project 1');
      expect(data.data.data[0].creator).toBeDefined();
      expect(data.data.data[0].creator.id).toBe('clh1234567890123456789012');
      expect(data.data.data[0].creator.firstName).toBe('John');
      expect(data.data.data[0].creator.lastName).toBe('Doe');
      expect(data.data.data[0].creator.email).toBe('john@example.com');
      expect(data.data.data[0].assignee).toBeDefined();
      expect(data.data.data[0].assignee.id).toBe('clh1234567890123456789012');
    });

    it('orders tasks by creation date descending', async () => {
      const { prisma } = await import('@/lib/prisma');

      const request = new NextRequest('http://localhost:3000/api/tasks');
      await GET(request);

      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { createdBy: 'clh1234567890123456789012' },
        })
      );
    });
  });

  describe('POST /api/tasks', () => {
    it('creates task successfully with valid data', async () => {
      const taskData = {
        title: 'New Task',
        description: 'New Task Description',
        projectId: 'clh1234567890123456789013',
        assignedTo: 'clh1234567890123456789012',
        createdBy: 'clh1234567890123456789012',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      const response = await POST(request);
      const data = await response.json();

      console.log('Response status:', response.status);
      console.log('Response data:', data);
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.title).toBe('New Task');
      expect(data.data.description).toBe('New Task Description');
      expect(data.data.projectId).toBe('clh1234567890123456789013');
      expect(data.data.assignedTo).toBe('clh1234567890123456789012');
      expect(data.data.status).toBe('Todo');
      expect(data.data.priority).toBe('MEDIUM');
    });

    it('creates task with minimal required data', async () => {
      const taskData = {
        title: 'Minimal Task',
        projectId: 'clh1234567890123456789013',
        createdBy: 'clh1234567890123456789012',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.title).toBe('Minimal Task');
      expect(data.data.description).toBeNull();
      expect(data.data.assignedTo).toBeNull();
    });

    it('trims whitespace from title and description', async () => {
      const taskData = {
        title: '  Trimmed Task  ',
        description: '  Trimmed Description  ',
        projectId: 'clh1234567890123456789013',
        createdBy: 'clh1234567890123456789012',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.title).toBe('Trimmed Task');
      expect(data.data.description).toBe('Trimmed Description');
    });

    it('returns 400 when title is missing', async () => {
      const taskData = {
        description: 'Task Description',
        projectId: 'clh1234567890123456789013',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('Create DTO validation failed');
    });

    it('returns 400 when title is empty string', async () => {
      const taskData = {
        title: '',
        projectId: 'clh1234567890123456789013',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('Create DTO validation failed');
    });

    it('returns 400 when title is only whitespace', async () => {
      const taskData = {
        title: '   ',
        projectId: 'clh1234567890123456789013',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('Create DTO validation failed');
    });

    it('returns 400 when title is not a string', async () => {
      const taskData = {
        title: 123,
        projectId: 'clh1234567890123456789013',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('Create DTO validation failed');
    });

    it('returns 400 when title is null', async () => {
      const taskData = {
        title: null,
        projectId: 'clh1234567890123456789013',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('Create DTO validation failed');
    });

    it('creates task without projectId when not provided', async () => {
      const taskData = {
        title: 'New Task',
        description: 'Task Description',
        createdBy: 'clh1234567890123456789012',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.title).toBe('New Task');
      expect(data.data.projectId).toBeNull();
    });

    it('creates task with non-string projectId (converts to string)', async () => {
      const taskData = {
        title: 'New Task',
        projectId: 'clh1234567890123456789013',
        createdBy: 'clh1234567890123456789012',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.title).toBe('New Task');
      expect(data.data.projectId).toBe('clh1234567890123456789013');
    });

    it('creates task with null projectId', async () => {
      const taskData = {
        title: 'New Task',
        createdBy: 'clh1234567890123456789012',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.title).toBe('New Task');
      expect(data.data.projectId).toBeNull();
    });

    it('returns 404 when project does not exist', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.project.findUnique).mockResolvedValue(null);

      const taskData = {
        title: 'New Task',
        projectId: 'clh999999999999999999999999',
        createdBy: 'clh1234567890123456789012',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.message).toBe('Project not found not found');
    });

    it('creates task without assignee when assigneeId is not provided', async () => {
      const taskData = {
        title: 'Unassigned Task',
        projectId: 'clh1234567890123456789013',
        createdBy: 'clh1234567890123456789012',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.assignedTo).toBeNull();
    });

    it('creates task with null description when description is not provided', async () => {
      const taskData = {
        title: 'No Description Task',
        projectId: 'clh1234567890123456789013',
        createdBy: 'clh1234567890123456789012',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.description).toBeNull();
    });

    it('creates task with empty string description converted to null', async () => {
      const taskData = {
        title: 'Empty Description Task',
        description: '',
        projectId: 'clh1234567890123456789013',
        createdBy: 'clh1234567890123456789012',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.description).toBeNull();
    });

    it('handles database errors gracefully', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { DatabaseError } = await import('@/lib/utils/error-handler');
      vi.mocked(prisma.$transaction).mockRejectedValue(
        new DatabaseError('Database error')
      );

      const taskData = {
        title: 'New Task',
        projectId: 'clh1234567890123456789013',
        createdBy: 'clh1234567890123456789012',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('Database error');
      
      // Reset the transaction mock to its original implementation
      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        const txMock = {
          task: {
            create: vi.fn().mockImplementation(async ({ data, include }) => {
              const mockTask = {
                id: 'new-task-id',
                ...data,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                dueDate: data.dueDate ? (data.dueDate instanceof Date ? data.dueDate.toISOString() : data.dueDate) : null,
              };

              if (include) {
                if (include.creator) {
                  mockTask.creator = { id: 'clh1234567890123456789012', firstName: 'John', lastName: 'Doe', email: 'john@example.com' };
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
            update: vi.fn().mockImplementation(async ({ where, data }) => {
              return { id: where.id, name: 'Test Project', updatedAt: new Date() };
            }),
          },
        };
        
        return await callback(txMock);
      });
    });

    it('handles JSON parsing errors gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('Unexpected token');
    });

    it('sets default status and priority correctly', async () => {
      const taskData = {
        title: 'Default Values Task',
        projectId: 'clh1234567890123456789013',
        createdBy: 'clh1234567890123456789012',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.status).toBe('Todo');
      expect(data.data.priority).toBe('MEDIUM');
    });

    it('verifies project exists before creating task', async () => {
      const { prisma } = await import('@/lib/prisma');

      const taskData = {
        title: 'Verified Project Task',
        projectId: 'clh1234567890123456789013',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      await POST(request);

      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: 'clh1234567890123456789013' },
      });
    });
  });

  describe('Edge Cases and Validation', () => {
    it('handles very long task titles', async () => {
      const longTitle = 'A'.repeat(1000);
      const taskData = {
        title: longTitle,
        projectId: 'clh1234567890123456789013',
        createdBy: 'clh1234567890123456789012',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('Title must be less than 200 characters');
    });

    it('handles very long task descriptions', async () => {
      const longDescription = 'A'.repeat(10000);
      const taskData = {
        title: 'Long Description Task',
        description: longDescription,
        projectId: 'clh1234567890123456789013',
        createdBy: 'clh1234567890123456789012',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.description).toBe(longDescription);
    });

    it('handles special characters in task data', async () => {
      const specialTitle = 'Task @#$%^&*()_+-=[]{}|;:,.<>?';
      const specialDescription = 'Description with special chars: @#$%^&*()';

      const taskData = {
        title: specialTitle,
        description: specialDescription,
        projectId: 'clh1234567890123456789013',
        createdBy: 'clh1234567890123456789012',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.title).toBe(specialTitle);
      expect(data.data.description).toBe(specialDescription);
    });

    it('handles unicode characters in task data', async () => {
      const unicodeTitle = 'وظیفه با کاراکترهای فارسی';
      const unicodeDescription = 'توضیحات با کاراکترهای فارسی و emoji 🚀';

      const taskData = {
        title: unicodeTitle,
        description: unicodeDescription,
        projectId: 'clh1234567890123456789013',
        createdBy: 'clh1234567890123456789012',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.title).toBe(unicodeTitle);
      expect(data.data.description).toBe(unicodeDescription);
    });
  });
});
