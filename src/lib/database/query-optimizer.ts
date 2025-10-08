/**
 * Database Query Optimizer
 * Provides optimized query patterns and performance monitoring
 */

import { Prisma, PrismaClient } from '@prisma/client';
import { logger } from '@/lib/logger';

const prisma = new PrismaClient();

/**
 * Query optimization utilities for common patterns
 */
export class QueryOptimizer {
  /**
   * Optimize user queries with selective field loading
   */
  static getUserSelect() {
    return {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      avatar: true,
      isActive: true,
      roles: true,
      createdAt: true,
    };
  }

  /**
   * Optimize task queries with minimal relations
   */
  static getTaskSelect() {
    return {
      id: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      dueDate: true,
      createdAt: true,
      updatedAt: true,
      createdBy: true,
      assignedTo: true,
      projectId: true,
    };
  }

  /**
   * Optimize story queries with minimal relations
   */
  static getStorySelect() {
    return {
      id: true,
      title: true,
      content: true,
      day: true,
      status: true,
      order: true,
      createdAt: true,
      updatedAt: true,
      authorId: true,
      projectId: true,
      storyTypeId: true,
    };
  }

  /**
   * Optimize meeting queries with minimal relations
   */
  static getMeetingSelect() {
    return {
      id: true,
      title: true,
      startTime: true,
      endTime: true,
      type: true,
      status: true,
      notes: true,
      createdAt: true,
      creatorId: true,
    };
  }

  /**
   * Create optimized where clause for common filters
   */
  static createOptimizedWhere<T extends Record<string, any>>(
    baseWhere: T,
    filters: {
      search?: string;
      searchFields?: string[];
      dateRange?: { startDate?: string; endDate?: string; field?: string };
      status?: string;
      validStatuses?: string[];
      userId?: string;
      projectId?: string;
    }
  ): T {
    let where = { ...baseWhere };

    // Add search conditions
    if (filters.search && filters.searchFields) {
      const searchConditions = this.createSearchConditions(
        filters.search,
        filters.searchFields
      );
      if (searchConditions) {
        where = {
          ...where,
          ...searchConditions,
        };
      }
    }

    // Add date range filter
    if (filters.dateRange) {
      const dateFilter = this.createDateRangeFilter(
        filters.dateRange.startDate,
        filters.dateRange.endDate,
        filters.dateRange.field
      );
      if (dateFilter) {
        where = {
          ...where,
          [filters.dateRange.field || 'createdAt']: dateFilter,
        };
      }
    }

    // Add status filter
    if (filters.status) {
      const statusFilter = this.createStatusFilter(
        filters.status,
        filters.validStatuses
      );
      if (statusFilter) {
        where = { ...where, ...statusFilter };
      }
    }

    // Add user filter
    if (filters.userId) {
      where = { ...where, userId: filters.userId };
    }

    // Add project filter
    if (filters.projectId) {
      where = { ...where, projectId: filters.projectId };
    }

    return where;
  }

  /**
   * Create search conditions for text fields
   */
  private static createSearchConditions(
    search: string,
    searchFields: string[]
  ): Record<string, any> | undefined {
    if (!search || search.length < 2) return undefined;

    const sanitizedSearch = search.replace(/[<>"'%;()&+]/g, '');

    return {
      OR: searchFields.map(field => ({
        [field]: {
          contains: sanitizedSearch,
          mode: 'insensitive' as const,
        },
      })),
    };
  }

  /**
   * Create date range filter
   */
  private static createDateRangeFilter(
    startDate?: string,
    endDate?: string,
    field: string = 'createdAt'
  ): Prisma.DateTimeFilter | undefined {
    if (!startDate && !endDate) return undefined;

    const filter: Prisma.DateTimeFilter = {};
    
    if (startDate) {
      filter.gte = new Date(startDate);
    }
    
    if (endDate) {
      filter.lte = new Date(endDate);
    }

    return filter;
  }

  /**
   * Create status filter
   */
  private static createStatusFilter(
    status?: string,
    validStatuses?: string[]
  ): Record<string, any> | undefined {
    if (!status) return undefined;
    
    if (validStatuses && !validStatuses.includes(status)) {
      return undefined;
    }

    return { status };
  }
}

/**
 * Optimized query patterns for specific entities
 */
export class TaskQueryOptimizer {
  /**
   * Get tasks with optimized relations
   */
  static async getTasksWithRelations(
    where: Prisma.TaskWhereInput,
    include?: Prisma.TaskInclude,
    orderBy?: Prisma.TaskOrderByWithRelationInput,
    skip?: number,
    take?: number
  ) {
    return prisma.task.findMany({
      where,
      include: include || {
        creator: {
          select: QueryOptimizer.getUserSelect(),
        },
        assignee: {
          select: QueryOptimizer.getUserSelect(),
        },
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
      orderBy: orderBy || { createdAt: 'desc' },
      skip,
      take,
    });
  }

  /**
   * Get task count with same where conditions
   */
  static async getTaskCount(where: Prisma.TaskWhereInput) {
    return prisma.task.count({ where });
  }

  /**
   * Get tasks by project with pagination
   */
  static async getTasksByProject(
    projectId: string,
    filters: {
      status?: string;
      priority?: string;
      assignedTo?: string;
      search?: string;
    },
    pagination: {
      page: number;
      limit: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ) {
    const where = QueryOptimizer.createOptimizedWhere(
      { projectId },
      {
        search: filters.search,
        searchFields: ['title', 'description'],
        status: filters.status,
        validStatuses: ['Todo', 'InProgress', 'Done'],
        userId: filters.assignedTo,
      }
    );

    if (filters.priority) {
      where.priority = filters.priority as any;
    }

    const orderBy = pagination.sortBy 
      ? { [pagination.sortBy]: pagination.sortOrder || 'desc' } as any
      : { createdAt: 'desc' } as any;

    const skip = (pagination.page - 1) * pagination.limit;

    return this.getTasksWithRelations(where, undefined, orderBy, skip, pagination.limit);
  }
}

export class StoryQueryOptimizer {
  /**
   * Get stories with optimized relations
   */
  static async getStoriesWithRelations(
    where: Prisma.StoryWhereInput,
    include?: Prisma.StoryInclude,
    orderBy?: Prisma.StoryOrderByWithRelationInput,
    skip?: number,
    take?: number
  ) {
    return prisma.story.findMany({
      where,
      include: include || {
        author: {
          select: QueryOptimizer.getUserSelect(),
          },
          project: {
            select: {
              id: true,
              name: true,
            status: true,
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
      orderBy: orderBy || { day: 'desc' },
      skip,
      take,
    });
  }

  /**
   * Get story count with same where conditions
   */
  static async getStoryCount(where: Prisma.StoryWhereInput) {
    return prisma.story.count({ where });
  }

  /**
   * Get stories by project with pagination
   */
  static async getStoriesByProject(
    projectId: string,
    filters: {
      day?: string;
      status?: string;
      storyTypeId?: string;
      search?: string;
    },
    pagination: {
      page: number;
      limit: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ) {
    const where = QueryOptimizer.createOptimizedWhere(
      { projectId },
      {
        search: filters.search,
        searchFields: ['title', 'content'],
        status: filters.status,
        validStatuses: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
      }
    );

    if (filters.day) {
      (where as any).day = filters.day;
    }

    if (filters.storyTypeId) {
      (where as any).storyTypeId = filters.storyTypeId;
    }

    const orderBy = pagination.sortBy 
      ? { [pagination.sortBy]: pagination.sortOrder || 'desc' } as any
      : { day: 'desc' } as any;

    const skip = (pagination.page - 1) * pagination.limit;

    return this.getStoriesWithRelations(where, undefined, orderBy, skip, pagination.limit);
  }
}

export class MeetingQueryOptimizer {
  /**
   * Get meetings with optimized relations
   */
  static async getMeetingsWithRelations(
    where: Prisma.MeetingWhereInput,
    include?: Prisma.MeetingInclude,
    orderBy?: Prisma.MeetingOrderByWithRelationInput,
    skip?: number,
    take?: number
  ) {
    return prisma.meeting.findMany({
      where,
      include: include || {
        creator: {
          select: QueryOptimizer.getUserSelect(),
        },
        attendees: {
          include: {
            user: {
              select: QueryOptimizer.getUserSelect(),
            },
          },
        },
      },
      orderBy: orderBy || { startTime: 'asc' },
      skip,
      take,
    });
  }

  /**
   * Get meeting count with same where conditions
   */
  static async getMeetingCount(where: Prisma.MeetingWhereInput) {
    return prisma.meeting.count({ where });
  }

  /**
   * Get meetings by user with pagination
   */
  static async getMeetingsByUser(
    userId: string,
    filters: {
      startDate?: string;
      endDate?: string;
      type?: string;
    status?: string;
      search?: string;
    },
    pagination: {
      page: number;
      limit: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ) {
    const where = QueryOptimizer.createOptimizedWhere(
      {
        OR: [
          { creatorId: userId },
          { attendees: { some: { userId } } },
        ],
      },
      {
        search: filters.search,
        searchFields: ['title', 'notes'],
        dateRange: {
          startDate: filters.startDate,
          endDate: filters.endDate,
          field: 'startTime',
        },
        status: filters.status,
        validStatuses: ['SCHEDULED', 'COMPLETED', 'CANCELLED'],
      }
    );

    if (filters.type) {
      (where as any).type = filters.type;
    }

    const orderBy = pagination.sortBy 
      ? { [pagination.sortBy]: pagination.sortOrder || 'asc' } as any
      : { startTime: 'asc' } as any;

    const skip = (pagination.page - 1) * pagination.limit;

    return this.getMeetingsWithRelations(where, undefined, orderBy, skip, pagination.limit);
  }
}

export class UserQueryOptimizer {
  /**
   * Get users with optimized relations
   */
  static async getUsersWithRelations(
    where: Prisma.UserWhereInput,
    include?: Prisma.UserInclude,
    orderBy?: Prisma.UserOrderByWithRelationInput,
    skip?: number,
    take?: number
  ) {
    return prisma.user.findMany({
      where,
      include: include || {
        profile: {
          select: {
            id: true,
            jobTitle: true,
            department: true,
            startDate: true,
          },
        },
        manager: {
          select: QueryOptimizer.getUserSelect(),
        },
      },
      orderBy: orderBy || { createdAt: 'desc' },
      skip,
      take,
    });
  }

  /**
   * Get user count with same where conditions
   */
  static async getUserCount(where: Prisma.UserWhereInput) {
    return prisma.user.count({ where });
  }

  /**
   * Get users by department with pagination
   */
  static async getUsersByDepartment(
    department: string,
    filters: {
      isActive?: boolean;
      search?: string;
    },
    pagination: {
      page: number;
      limit: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ) {
    const where = QueryOptimizer.createOptimizedWhere(
      {
        profile: {
          department: department,
        },
      },
      {
        search: filters.search,
        searchFields: ['firstName', 'lastName', 'email'],
      }
    );

    if (filters.isActive !== undefined) {
      (where as any).isActive = filters.isActive;
    }

    const orderBy = pagination.sortBy 
      ? { [pagination.sortBy]: pagination.sortOrder || 'asc' } as any
      : { firstName: 'asc' } as any;

    const skip = (pagination.page - 1) * pagination.limit;

    return this.getUsersWithRelations(where, undefined, orderBy, skip, pagination.limit);
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