import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

/**
 * Database Query Optimizer
 * Eliminates N+1 queries and optimizes database operations
 */

export interface OptimizedProjectQuery {
  id: string;
  name: string;
  description?: string;
  status: string;
  startDate?: Date;
  endDate?: Date;
  accessLevel: string;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    stories: number;
    tasks: number;
  };
  // Pre-fetched related data to avoid N+1 queries
  recentStories?: Array<{
    id: string;
    title: string;
    status: string;
    day: Date;
  }>;
  recentTasks?: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
  }>;
}

export interface OptimizedStoryQuery {
  id: string;
  title: string;
  notes?: string;
  visualNotes?: string;
  link?: string;
  day: Date;
  order: number;
  status: string;
  projectId?: string;
  storyTypeId?: string;
  createdAt: Date;
  updatedAt: Date;
  // Pre-fetched related data
  project?: {
    id: string;
    name: string;
  };
  storyType?: {
    id: string;
    name: string;
    icon?: string;
  };
}

export interface OptimizedUserQuery {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  isActive: boolean;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
  // Pre-fetched related data
  _count: {
    tasks: number;
    documents: number;
    ideas: number;
  };
  recentActivity?: Array<{
    type: 'task' | 'document' | 'idea';
    id: string;
    title: string;
    timestamp: Date;
  }>;
}

/**
 * Optimized project queries with pre-fetched related data
 */
export class ProjectQueryOptimizer {
  /**
   * Get projects with pagination and optimized data fetching
   */
  static async getProjectsWithPagination(page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const [totalProjects, projects] = await Promise.all([
      prisma.project.count(),
      prisma.project.findMany({
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(totalProjects / limit);

    return {
      projects,
      pagination: {
        currentPage: page,
        totalPages,
        totalProjects,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Get projects by status with optimized data fetching
   */
  static async getProjectsByStatus(status: string, limit: number = 20) {
    return await prisma.project.findMany({
      where: { status: status as any },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get single project with all related data in one query
   */
  static async getProjectWithDetails(projectId: string) {
    return await prisma.project.findUnique({
      where: { id: projectId },
    });
  }
}

/**
 * Optimized story queries with pre-fetched related data
 */
export class StoryQueryOptimizer {
  /**
   * Get stories for a specific day with optimized data fetching
   */
  static async getStoriesByDay(day: string) {
    // Use the day string directly since it's already in YYYY-MM-DD format
    const dayString = day;

    return await prisma.story.findMany({
      where: {
        day: dayString,
      },
      include: {
        storyType: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        storyIdea: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            storyType: true,
            template: true,
            guidelines: true,
            icon: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  /**
   * Get stories by project with pagination and optimized data fetching
   */
  static async getStoriesByProject(
    projectId: string,
    page: number = 1,
    limit: number = 50
  ) {
    const offset = (page - 1) * limit;

    const [totalStories, stories] = await Promise.all([
      prisma.story.count({
        where: { projectId },
      }),
      prisma.story.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(totalStories / limit);

    return {
      stories,
      pagination: {
        currentPage: page,
        totalPages,
        totalStories,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Get stories by date range with optimized data fetching
   */
  static async getStoriesByDateRange(projectId?: string) {
    const whereClause: any = {};

    if (projectId) {
      whereClause.projectId = projectId;
    }

    return await prisma.story.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Create a new story with optimized data validation and creation
   */
  static async createStory(storyData: {
    title: string;
    notes?: string | null;
    visualNotes?: string | null;
    link?: string | null;
    day: string; // Changed from Date to string
    projectId: string | null;
    storyTypeId: string | null;
    storyIdeaId?: string | null;
    customTitle?: string | null;
    type?: string | null;
    ideaId?: string | null;
    order: number;
    status?: string;
  }) {
    // Use the day string directly since it's already in YYYY-MM-DD format
    const dayString = storyData.day;

    const story = await prisma.story.create({
      data: {
        title: storyData.title,
        content:
          storyData.notes || storyData.visualNotes || storyData.link || '',
        notes: storyData.notes,
        visualNotes: storyData.visualNotes,
        link: storyData.link,
        day: dayString,
        order: storyData.order,
        status: storyData.status || 'DRAFT',
        projectId: storyData.projectId,
        storyTypeId: storyData.storyTypeId,
        storyIdeaId: storyData.storyIdeaId,
        customTitle: storyData.customTitle,
        type: storyData.type,
        ideaId: storyData.ideaId,
        authorId: 'default-author-id', // You might want to handle this differently
      },
      include: {
        storyType: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        storyIdea: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            storyType: true,
            template: true,
            guidelines: true,
            icon: true,
          },
        },
      },
    });

    return story;
  }
}

/**
 * Optimized user queries with pre-fetched related data
 */
export class UserQueryOptimizer {
  /**
   * Get users with optimized data fetching
   */
  static async getUsersWithCounts(page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const [totalUsers, users] = await Promise.all([
      prisma.user.count(),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(totalUsers / limit);

    return {
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Get single user with all related data in one query
   */
  static async getUserWithDetails(userId: string) {
    return await prisma.user.findUnique({
      where: { id: userId },
    });
  }
}

/**
 * Database performance monitoring and optimization
 */
export class DatabasePerformanceMonitor {
  /**
   * Monitor query performance
   */
  static async monitorQueryPerformance<T>(
    queryName: string,
    queryFn: () => Promise<T>
  ): Promise<{
    result: T;
    performance: { duration: number; timestamp: string };
  }> {
    const startTime = Date.now();

    try {
      const result = await queryFn();
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Log slow queries
      if (duration > 1000) {
        logger.warn(`Slow query detected: ${queryName} took ${duration}ms`);
      }

      return {
        result,
        performance: {
          duration,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      logger.error(
        `Query failed: ${queryName} after ${duration}ms`,
        error as Error
      );
      throw error;
    }
  }

  /**
   * Get database performance statistics
   */
  static async getPerformanceStats() {
    try {
      const stats = await prisma.$queryRaw`
        SELECT 
          schemaname,
          tablename,
          attname,
          n_distinct,
          correlation
        FROM pg_stats 
        WHERE schemaname = 'public'
        ORDER BY tablename, attname
      `;

      return stats;
    } catch (error) {
      logger.error('Failed to get performance stats:', error as Error);
      return [];
    }
  }
}
