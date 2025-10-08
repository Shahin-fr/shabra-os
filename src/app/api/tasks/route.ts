import { NextRequest } from 'next/server';

import { auth } from '@/auth';
import {
  ApiResponseBuilder,
  TaskDTO,
  CreateTaskDTO,
  TaskEntity,
  entityToDTO,
  validateCreateDTO,
  CreateTaskDTOSchema
} from '@/types';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/utils/error-handler';
import { parsePaginationParams, executePaginatedQuery } from '@/lib/database/pagination';
import { CommonSelects, createSearchConditions } from '@/lib/database/query-optimizer';

export async function GET(request: NextRequest) {
  try {
    // Add authorization check
    const { withAuth } = await import('@/lib/middleware/auth-middleware');

    // Check authentication
    const authResult = await withAuth(request);
    if (authResult.response) {
      return authResult.response;
    }

    // Get current user session
    const session = await auth();
    if (!session?.user?.id) {
      return ApiResponseBuilder.unauthorized('Authentication required');
    }

    // Parse pagination and filter parameters
    const { searchParams } = new URL(request.url);
    const paginationParams = parsePaginationParams(searchParams);
    const projectId = searchParams.get('projectId');
    const assignedTo = searchParams.get('assignedTo');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    // Build the where clause for filtering based on user role
    let where: any = {};

    if (projectId) {
      where.projectId = projectId;
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    // Role-based task filtering
    const userRoles = session.user.roles || [];
    if (userRoles.includes('MANAGER') || userRoles.includes('ADMIN')) {
      // Managers and admins see tasks they created
      if (assignedTo === 'me') {
        where.createdBy = session.user.id;
      } else if (assignedTo) {
        where.assignedTo = assignedTo;
      } else {
        where.createdBy = session.user.id;
      }
    } else {
      // Employees see tasks assigned to them
      where.assignedTo = session.user.id;
    }

    // Add search functionality
    if (paginationParams.search) {
      const searchConditions = createSearchConditions(
        paginationParams.search,
        ['title', 'description']
      );
      if (searchConditions) {
        where = { ...where, ...searchConditions };
      }
    }

    // Execute paginated query
    const result = await executePaginatedQuery(
      prisma.task,
      paginationParams,
      where,
      {
        creator: {
          select: CommonSelects.userMinimal,
        },
        assignee: {
          select: CommonSelects.userMinimal,
        },
        project: {
          select: CommonSelects.project,
        },
      }
    );

    // Transform entities to DTOs
    const taskDTOs: TaskDTO[] = result.data.map(task => 
      entityToDTO(task as TaskEntity) as unknown as TaskDTO
    );

    return ApiResponseBuilder.success({
      data: taskDTOs,
      pagination: result.pagination,
    }, 'Tasks retrieved successfully');
  } catch (error) {
    return handleApiError(error, {
      operation: 'GET /api/tasks',
      source: 'api/tasks/route.ts',
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Add authorization check
    const { withAuth } = await import('@/lib/middleware/auth-middleware');

    // Check authentication and authorization - only managers can create tasks
    const authResult = await withAuth(request, {
      requiredPrivilegeLevel: 'MANAGER',
    });

    if (authResult.response) {
      return authResult.response;
    }

    // Get current user session
    const session = await auth();
    if (!session?.user?.id) {
      return ApiResponseBuilder.unauthorized('Authentication required');
    }

    const body = await request.json();
    
    // Validate request body using new type system
    const createTaskData = validateCreateDTO(body, CreateTaskDTOSchema) as CreateTaskDTO;

    // Verify project exists if provided
    if (createTaskData.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: createTaskData.projectId },
      });

      if (!project) {
        return ApiResponseBuilder.notFound('Project not found');
      }
    }

    // Verify assignee exists if provided
    if (createTaskData.assignedTo) {
      const assignee = await prisma.user.findUnique({
        where: { id: createTaskData.assignedTo },
      });

      if (!assignee) {
        return ApiResponseBuilder.notFound('User not found');
      }
    }

    // Create the task in a transaction
    const task = await prisma.$transaction(async (tx) => {
      const newTask = await tx.task.create({
        data: {
          title: createTaskData.title.trim(),
          description: createTaskData.description?.trim() || null,
          createdBy: session.user.id,
          assignedTo: createTaskData.assignedTo || null,
          projectId: createTaskData.projectId || null,
          dueDate: createTaskData.dueDate ? new Date(createTaskData.dueDate) : null,
          status: createTaskData.status || 'Todo', // Default status
          priority: createTaskData.priority || 'MEDIUM',
        },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          assignee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Update project's last activity timestamp if projectId is provided
      if (createTaskData.projectId) {
        await tx.project.update({
          where: { id: createTaskData.projectId },
          data: { updatedAt: new Date() },
        });
      }

      return newTask;
    });

    // Transform entity to DTO
    const taskDTO = entityToDTO(task as TaskEntity);

    return ApiResponseBuilder.created(taskDTO, 'Task created successfully');
  } catch (error) {
    return handleApiError(error, {
      operation: 'POST /api/tasks',
      source: 'api/tasks/route.ts',
    });
  }
}
