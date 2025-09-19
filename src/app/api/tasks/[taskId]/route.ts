import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import {
  createValidationErrorResponse,
  createNotFoundErrorResponse,
  createSuccessResponse,
  getHttpStatusForErrorCode,
  HTTP_STATUS_CODES,
} from '@/lib/api/response-utils';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/utils/error-handler';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const body = await request.json();
    const { status } = body;

    // Validate required fields
    if (!status || typeof status !== 'string') {
      const errorResponse = createValidationErrorResponse(
        'وضعیت وظیفه الزامی است'
      );
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Validate status values
    const validStatuses = ['Todo', 'InProgress', 'Done'];
    if (!validStatuses.includes(status)) {
      const errorResponse = createValidationErrorResponse('وضعیت نامعتبر است');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Verify task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        creator: true,
        assignee: true,
      },
    });

    if (!existingTask) {
      const errorResponse = createNotFoundErrorResponse();
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Update the task status
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: status as 'Todo' | 'InProgress' | 'Done',
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

    return NextResponse.json(updatedTask);
  } catch (error) {
    return handleApiError(error, {
      operation: 'PATCH /api/tasks/[taskId]',
      source: 'api/tasks/[taskId]/route.ts',
    });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;

    // Get current user session
    const session = await auth();
    if (!session?.user?.id) {
      const errorResponse = createValidationErrorResponse('Unauthorized');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Verify task exists and user has permission to delete it
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        creator: true,
      },
    });

    if (!existingTask) {
      const errorResponse = createNotFoundErrorResponse();
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Check if user is the creator or has admin/manager role
    const userRoles = session.user.roles || [];
    const isCreator = existingTask.createdBy === session.user.id;
    const isManagerOrAdmin =
      userRoles.includes('MANAGER') || userRoles.includes('ADMIN');

    if (!isCreator && !isManagerOrAdmin) {
      const errorResponse = createValidationErrorResponse(
        'شما مجاز به حذف این وظیفه نیستید'
      );
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Delete the task
    await prisma.task.delete({
      where: { id: taskId },
    });

    const successResponse = createSuccessResponse({
      message: 'وظیفه با موفقیت حذف شد',
    });
    return NextResponse.json(successResponse, {
      status: HTTP_STATUS_CODES.OK,
    });
  } catch (error) {
    return handleApiError(error, {
      operation: 'DELETE /api/tasks/[taskId]',
      source: 'api/tasks/[taskId]/route.ts',
    });
  }
}
