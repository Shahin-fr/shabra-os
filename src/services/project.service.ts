import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import {
  CreateProjectSchema,
  UpdateProjectSchema,
  GetProjectsQuerySchema,
  UpdateProjectData,
  GetProjectsQuery,
} from '@/lib/validators/project-validators';

/**
 * Project Service
 * Contains all business logic related to project operations
 */
export class ProjectService {
  /**
   * Get projects with pagination and filtering
   */
  static async getProjects(query: GetProjectsQuery) {
    // Validate query parameters
    const validatedQuery = GetProjectsQuerySchema.parse(query);

    // Convert string parameters to numbers
    const page = parseInt(validatedQuery.page || '1', 10);
    const limit = parseInt(validatedQuery.limit || '20', 10);
    const skip = (page - 1) * limit;

    // Get projects with pagination
    const [projects, totalProjects] = await Promise.all([
      prisma.project.findMany({
        skip,
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
      }),
      prisma.project.count(),
    ]);

    const totalPages = Math.ceil(totalProjects / limit);

    return {
      projects,
      currentPage: page,
      totalPages,
      totalProjects,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  /**
   * Get a project by ID
   */
  static async getProjectById(projectId: string) {
    const project = await prisma.project.findUnique({
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

    if (!project) {
      throw new Error('Project not found');
    }

    return project;
  }

  /**
   * Create a new project
   */
  static async createProject(data: any) {
    // Validate input data
    const validatedData = CreateProjectSchema.parse(data);

    logger.info('Creating project in database', {
      projectData: validatedData,
      operation: 'ProjectService.createProject',
    });

    // Create project in a transaction for consistency
    const project = await prisma.$transaction(async (tx) => {
      return await tx.project.create({
        data: {
          name: validatedData.name.trim(),
          description: validatedData.description?.trim() || null,
          status: (validatedData.status as 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED') || 'ACTIVE',
          startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
          endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
          accessLevel: validatedData.accessLevel || 'PRIVATE',
        },
      });
    });

    logger.info('Project created successfully', {
      projectId: project.id,
      operation: 'ProjectService.createProject',
    });

    return project;
  }

  /**
   * Update a project
   */
  static async updateProject(projectId: string, data: UpdateProjectData) {
    // Validate input data
    const validatedData = UpdateProjectSchema.parse(data);

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!existingProject) {
      throw new Error('Project not found');
    }

    logger.info('Project update request received', {
      projectId,
      updateData: validatedData,
      operation: 'ProjectService.updateProject',
    });

    // Prepare update data
    const updateData: {
      name?: string;
      description?: string | null;
      status?: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
      startDate?: Date | null;
      endDate?: Date | null;
    } = {};

    if (validatedData.name !== undefined) {
      updateData.name = validatedData.name.trim();
    }

    if (validatedData.description !== undefined) {
      updateData.description = validatedData.description?.trim() || null;
    }

    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status as 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
    }

    if (validatedData.startDate !== undefined) {
      updateData.startDate = validatedData.startDate ? new Date(validatedData.startDate) : null;
    }

    if (validatedData.endDate !== undefined) {
      updateData.endDate = validatedData.endDate ? new Date(validatedData.endDate) : null;
    }

    // Update project
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: updateData,
    });

    logger.info('Project updated successfully', {
      projectId,
      operation: 'ProjectService.updateProject',
    });

    return updatedProject;
  }

  /**
   * Delete a project
   */
  static async deleteProject(projectId: string) {
    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!existingProject) {
      throw new Error('Project not found');
    }

    logger.info('Project deletion request received', {
      projectId,
      operation: 'ProjectService.deleteProject',
    });

    // Delete the project
    await prisma.project.delete({
      where: { id: projectId },
    });

    logger.info('Project deleted successfully', {
      projectId,
      operation: 'ProjectService.deleteProject',
    });

    return { success: true, deletedId: projectId };
  }

  /**
   * Get project statistics
   */
  static async getProjectStats(projectId: string) {
    const project = await prisma.project.findUnique({
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

    if (!project) {
      throw new Error('Project not found');
    }

    // Calculate story statistics
    const storyStats = project.stories.reduce(
      (acc, story) => {
        acc[story.status] = (acc[story.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Calculate task statistics
    const taskStats = project.tasks.reduce(
      (acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        startDate: project.startDate,
        endDate: project.endDate,
        accessLevel: project.accessLevel,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
      counts: {
        totalStories: project._count.stories,
        totalTasks: project._count.tasks,
      },
      storyStats,
      taskStats,
    };
  }

  /**
   * Get projects by status
   */
  static async getProjectsByStatus(status: string) {
    const projects = await prisma.project.findMany({
      where: { status: status as 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED' },
      include: {
        _count: {
          select: {
            stories: true,
            tasks: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return projects;
  }

  /**
   * Search projects by name
   */
  static async searchProjects(searchTerm: string, limit: number = 10) {
    const projects = await prisma.project.findMany({
      where: {
        name: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
      include: {
        _count: {
          select: {
            stories: true,
            tasks: true,
          },
        },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return projects;
  }
}
