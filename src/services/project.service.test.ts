import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ProjectService } from './project.service';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

// Unmock ProjectService to test the actual implementation
vi.unmock('@/services/project.service');

// Mock Prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: {
    project: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    story: {
      count: vi.fn(),
    },
    task: {
      count: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ProjectService', () => {
  const mockPrisma = vi.mocked(prisma);
  const mockLogger = vi.mocked(logger);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getProjects', () => {
    it('should return paginated projects with counts', async () => {
      // Arrange
      const query = {
        page: '1',
        limit: '10',
        status: 'ACTIVE' as const,
        search: 'test project',
      };

      const mockProjects = [
        {
          id: 'project-1',
          name: 'Test Project 1',
          description: 'Test description 1',
          status: 'ACTIVE',
          _count: {
            stories: 5,
            tasks: 10,
          },
        },
        {
          id: 'project-2',
          name: 'Test Project 2',
          description: 'Test description 2',
          status: 'ACTIVE',
          _count: {
            stories: 3,
            tasks: 7,
          },
        },
      ];

      mockPrisma.project.findMany.mockResolvedValue(mockProjects);
      mockPrisma.project.count.mockResolvedValue(2);

      // Act
      const result = await ProjectService.getProjects(query);

      // Assert
      expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              stories: true,
              tasks: true,
            },
          },
        },
      });
      expect(mockPrisma.project.count).toHaveBeenCalled();
      expect(result).toEqual({
        projects: mockProjects,
        currentPage: 1,
        totalPages: 1,
        totalProjects: 2,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });

    it('should handle pagination correctly', async () => {
      // Arrange
      const query = {
        page: '2',
        limit: '5',
      };

      const mockProjects = [
        {
          id: 'project-1',
          name: 'Test Project 1',
          status: 'ACTIVE',
          _count: { stories: 0, tasks: 0 },
        },
      ];

      mockPrisma.project.findMany.mockResolvedValue(mockProjects);
      mockPrisma.project.count.mockResolvedValue(12);

      // Act
      const result = await ProjectService.getProjects(query);

      // Assert
      expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
        skip: 5, // (page - 1) * limit = (2 - 1) * 5 = 5
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              stories: true,
              tasks: true,
            },
          },
        },
      });
      expect(result).toEqual({
        projects: mockProjects,
        currentPage: 2,
        totalPages: 3, // Math.ceil(12 / 5) = 3
        totalProjects: 12,
        hasNextPage: true,
        hasPreviousPage: true,
      });
    });
  });

  describe('getProjectById', () => {
    it('should return project with related data for valid ID', async () => {
      // Arrange
      const projectId = 'project-123';
      const mockProject = {
        id: projectId,
        name: 'Test Project',
        description: 'Test description',
        status: 'ACTIVE',
        _count: {
          stories: 5,
          tasks: 10,
        },
      };

      mockPrisma.project.findUnique.mockResolvedValue(mockProject);

      // Act
      const result = await ProjectService.getProjectById(projectId);

      // Assert
      expect(mockPrisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: projectId },
        include: {
          _count: {
            select: {
              stories: true,
              tasks: true,
            },
          },
        },
      });
      expect(result).toEqual(mockProject);
    });

    it('should throw error when project not found', async () => {
      // Arrange
      const projectId = 'non-existent-id';
      mockPrisma.project.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(ProjectService.getProjectById(projectId)).rejects.toThrow(
        'Project not found'
      );
    });
  });

  describe('createProject', () => {
    it('should create project with valid data', async () => {
      // Arrange
      const projectData = {
        name: 'New Project',
        description: 'New project description',
        status: 'ACTIVE' as const,
      };

      const mockCreatedProject = {
        id: 'new-project-id',
        ...projectData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          project: {
            create: vi.fn().mockResolvedValue(mockCreatedProject),
          },
        };
        return await callback(mockTx);
      });

      // Act
      const result = await ProjectService.createProject(projectData);

      // Assert
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      // The actual create call is within the transaction callback
      expect(result).toEqual(mockCreatedProject);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Project created successfully',
        expect.objectContaining({
          projectId: 'new-project-id',
          operation: 'ProjectService.createProject',
        })
      );
    });

    it('should handle project creation with minimal data', async () => {
      // Arrange
      const projectData = {
        name: 'Minimal Project',
      };

      const mockCreatedProject = {
        id: 'minimal-project-id',
        name: 'Minimal Project',
        description: null,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          project: {
            create: vi.fn().mockResolvedValue(mockCreatedProject),
          },
        };
        return await callback(mockTx);
      });

      // Act
      const result = await ProjectService.createProject(projectData);

      // Assert
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      // The actual create call is within the transaction callback
      expect(result).toEqual(mockCreatedProject);
    });
  });

  describe('updateProject', () => {
    it('should update project with valid data', async () => {
      // Arrange
      const projectId = 'project-123';
      const updateData = {
        name: 'Updated Project',
        description: 'Updated description',
        status: 'COMPLETED' as const,
      };

      const mockUpdatedProject = {
        id: projectId,
        ...updateData,
        updatedAt: new Date(),
      };

      mockPrisma.project.findUnique.mockResolvedValue({ id: projectId });
      mockPrisma.project.update.mockResolvedValue(mockUpdatedProject);

      // Act
      const result = await ProjectService.updateProject(projectId, updateData);

      // Assert
      expect(mockPrisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: projectId },
      });
      expect(mockPrisma.project.update).toHaveBeenCalledWith({
        where: { id: projectId },
        data: updateData,
      });
      expect(result).toEqual(mockUpdatedProject);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Project updated successfully',
        expect.objectContaining({
          projectId,
          operation: 'ProjectService.updateProject',
        })
      );
    });

    it('should throw error when project not found for update', async () => {
      // Arrange
      const projectId = 'non-existent-id';
      const updateData = { name: 'Updated Project' };

      mockPrisma.project.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(ProjectService.updateProject(projectId, updateData)).rejects.toThrow(
        'Project not found'
      );
    });
  });

  describe('deleteProject', () => {
    it('should delete project with valid ID', async () => {
      // Arrange
      const projectId = 'project-123';
      const mockExistingProject = { id: projectId };

      mockPrisma.project.findUnique.mockResolvedValue(mockExistingProject);
      mockPrisma.project.delete.mockResolvedValue(mockExistingProject);

      // Act
      const result = await ProjectService.deleteProject(projectId);

      // Assert
      expect(mockPrisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: projectId },
      });
      expect(mockPrisma.project.delete).toHaveBeenCalledWith({
        where: { id: projectId },
      });
      expect(result).toEqual({
        success: true,
        deletedId: projectId,
      });
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Project deleted successfully',
        expect.objectContaining({
          projectId,
          operation: 'ProjectService.deleteProject',
        })
      );
    });

    it('should throw error when project not found for deletion', async () => {
      // Arrange
      const projectId = 'non-existent-id';
      mockPrisma.project.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(ProjectService.deleteProject(projectId)).rejects.toThrow(
        'Project not found'
      );
    });
  });

  describe('getProjectStats', () => {
    it('should return project statistics', async () => {
      // Arrange
      const projectId = 'project-123';
      const mockProject = { 
        id: projectId, 
        name: 'Test Project',
        _count: {
          stories: 15,
          tasks: 25,
        },
        stories: [
          { status: 'ACTIVE' },
          { status: 'COMPLETED' },
          { status: 'ACTIVE' },
        ],
        tasks: [
          { status: 'PENDING' },
          { status: 'IN_PROGRESS' },
          { status: 'COMPLETED' },
        ],
      };

      mockPrisma.project.findUnique.mockResolvedValue(mockProject);

      // Act
      const result = await ProjectService.getProjectStats(projectId);

      // Assert
      expect(mockPrisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: projectId },
        include: {
          _count: {
            select: {
              stories: true,
              tasks: true,
            },
          },
          stories: {
            select: {
              status: true,
            },
          },
          tasks: {
            select: {
              status: true,
            },
          },
        },
      });
      expect(result).toEqual({
        project: {
          id: projectId,
          name: 'Test Project',
          description: undefined,
          status: undefined,
          startDate: undefined,
          endDate: undefined,
          accessLevel: undefined,
          createdAt: undefined,
          updatedAt: undefined,
        },
        counts: {
          totalStories: 15,
          totalTasks: 25,
        },
        storyStats: {
          ACTIVE: 2,
          COMPLETED: 1,
        },
        taskStats: {
          PENDING: 1,
          IN_PROGRESS: 1,
          COMPLETED: 1,
        },
      });
    });

    it('should throw error when project not found for stats', async () => {
      // Arrange
      const projectId = 'non-existent-id';
      mockPrisma.project.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(ProjectService.getProjectStats(projectId)).rejects.toThrow(
        'Project not found'
      );
    });
  });

  describe('getProjectsByStatus', () => {
    it('should return projects filtered by status', async () => {
      // Arrange
      const status = 'ACTIVE';
      const mockProjects = [
        {
          id: 'project-1',
          name: 'Active Project 1',
          status: 'ACTIVE',
          _count: { stories: 5, tasks: 10 },
        },
        {
          id: 'project-2',
          name: 'Active Project 2',
          status: 'ACTIVE',
          _count: { stories: 3, tasks: 7 },
        },
      ];

      mockPrisma.project.findMany.mockResolvedValue(mockProjects);

      // Act
      const result = await ProjectService.getProjectsByStatus(status);

      // Assert
      expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
        where: { status },
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              stories: true,
              tasks: true,
            },
          },
        },
      });
      expect(result).toEqual(mockProjects);
    });

    it('should return empty array when no projects found for status', async () => {
      // Arrange
      const status = 'CANCELLED';
      mockPrisma.project.findMany.mockResolvedValue([]);

      // Act
      const result = await ProjectService.getProjectsByStatus(status);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('searchProjects', () => {
    it('should return projects matching search term', async () => {
      // Arrange
      const searchTerm = 'test project';
      const limit = 5;
      const mockProjects = [
        {
          id: 'project-1',
          name: 'Test Project 1',
          description: 'A test project',
          status: 'ACTIVE',
          _count: { stories: 2, tasks: 5 },
        },
        {
          id: 'project-2',
          name: 'Another Test Project',
          description: 'Another test project',
          status: 'ACTIVE',
          _count: { stories: 1, tasks: 3 },
        },
      ];

      mockPrisma.project.findMany.mockResolvedValue(mockProjects);

      // Act
      const result = await ProjectService.searchProjects(searchTerm, limit);

      // Assert
      expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              stories: true,
              tasks: true,
            },
          },
        },
      });
      expect(result).toEqual(mockProjects);
    });

    it('should use default limit when not provided', async () => {
      // Arrange
      const searchTerm = 'test';
      const mockProjects = [
        {
          id: 'project-1',
          name: 'Test Project',
          status: 'ACTIVE',
          _count: { stories: 0, tasks: 0 },
        },
      ];

      mockPrisma.project.findMany.mockResolvedValue(mockProjects);

      // Act
      const result = await ProjectService.searchProjects(searchTerm);

      // Assert
      expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        take: 10, // Default limit
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              stories: true,
              tasks: true,
            },
          },
        },
      });
      expect(result).toEqual(mockProjects);
    });

    it('should return empty array when no projects match search term', async () => {
      // Arrange
      const searchTerm = 'nonexistent';
      mockPrisma.project.findMany.mockResolvedValue([]);

      // Act
      const result = await ProjectService.searchProjects(searchTerm);

      // Assert
      expect(result).toEqual([]);
    });
  });
});
