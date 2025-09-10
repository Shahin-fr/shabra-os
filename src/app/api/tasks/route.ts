import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import {
  createSuccessResponse,
  createValidationErrorResponse,
  createAuthErrorResponse,
  createNotFoundErrorResponse,
  createServerErrorResponse,
  HTTP_STATUS_CODES,
  getHttpStatusForErrorCode,
} from '@/lib/api/response-utils';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

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
      const errorResponse = createAuthErrorResponse('Unauthorized');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Validate query parameters
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const assignedTo = searchParams.get('assignedTo');

    // Build the where clause for filtering based on user role
    const where: {
      projectId?: string;
      assignedTo?: string;
      createdBy?: string;
    } = {};

    if (projectId) {
      where.projectId = projectId;
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

    // Fetch tasks with relations
    const tasks = await prisma.task.findMany({
      where,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    logger.error(
      'Tasks API error:',
      error instanceof Error ? error : undefined,
      {
        context: 'tasks-api',
      }
    );
    const errorResponse = createServerErrorResponse('خطا در دریافت وظایف');
    return NextResponse.json(errorResponse, {
      status: getHttpStatusForErrorCode(errorResponse.error.code),
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
      const errorResponse = createAuthErrorResponse('Unauthorized');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    const body = await request.json();
    const { title, description, assignedTo, projectId, dueDate } = body;

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      const errorResponse = createValidationErrorResponse(
        'عنوان وظیفه الزامی است'
      );
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Verify project exists if provided
    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        const errorResponse = createNotFoundErrorResponse();
        return NextResponse.json(errorResponse, {
          status: getHttpStatusForErrorCode(errorResponse.error.code),
        });
      }
    }

    // Verify assignee exists if provided
    if (assignedTo) {
      const assignee = await prisma.user.findUnique({
        where: { id: assignedTo },
      });

      if (!assignee) {
        const errorResponse = createNotFoundErrorResponse();
        return NextResponse.json(errorResponse, {
          status: getHttpStatusForErrorCode(errorResponse.error.code),
        });
      }
    }

    // Create the task
    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        createdBy: session.user.id,
        assignedTo: assignedTo || null,
        projectId: projectId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'Todo', // Default status
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

    const successResponse = createSuccessResponse(task);
    return NextResponse.json(successResponse, {
      status: HTTP_STATUS_CODES.CREATED,
    });
  } catch (error) {
    logger.error(
      'Create task API error:',
      error instanceof Error ? error : undefined,
      {
        context: 'create-task-api',
      }
    );
    const errorResponse = createServerErrorResponse('خطا در ایجاد وظیفه');
    return NextResponse.json(errorResponse, {
      status: getHttpStatusForErrorCode(errorResponse.error.code),
    });
  }
}
