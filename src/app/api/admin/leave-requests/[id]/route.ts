import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/auth';
import {
  createSuccessResponse,
  createAuthErrorResponse,
  createAuthorizationErrorResponse,
  createValidationErrorResponse,
  createNotFoundErrorResponse,
  HTTP_STATUS_CODES,
  getHttpStatusForErrorCode,
} from '@/lib/api/response-utils';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/utils/error-handler';
import { withApiRateLimit } from '@/lib/middleware/rate-limit-middleware';
import { hasRequiredRole } from '@/lib/utils/auth-utils';

// Validation schema for updating leave request
const UpdateLeaveRequestSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']),
  rejectionReason: z.string().optional(),
}).refine((data) => {
  if (data.status === 'REJECTED' && !data.rejectionReason) {
    return false;
  }
  return true;
}, {
  message: 'Rejection reason is required when rejecting a leave request',
  path: ['rejectionReason'],
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Apply rate limiting
  const rateLimitResult = withApiRateLimit(request);
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response!;
  }

  try {
    // Get the authenticated user from the session
    const session = await auth();

    if (!session?.user?.id) {
      const errorResponse = createAuthErrorResponse('Unauthorized');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Check if user has required roles (ADMIN or MANAGER)
    const userRoles = session.user.roles || [];
    if (!hasRequiredRole(userRoles, ['ADMIN', 'MANAGER'])) {
      const errorResponse = createAuthorizationErrorResponse('Insufficient permissions. ADMIN or MANAGER role required.');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    const { id } = params;

    // Validate leave request ID
    if (!id || typeof id !== 'string') {
      const errorResponse = createValidationErrorResponse('Invalid leave request ID');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = UpdateLeaveRequestSchema.safeParse(body);

    if (!validationResult.success) {
      const errorResponse = createValidationErrorResponse(
        'Validation failed',
        undefined,
        validationResult.error.errors
      );
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    const { status, rejectionReason } = validationResult.data;

    // Check if leave request exists
    const existingRequest = await prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!existingRequest) {
      const errorResponse = createNotFoundErrorResponse('Leave request not found');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Check if request is already processed
    if (existingRequest.status !== 'PENDING') {
      const errorResponse = createValidationErrorResponse('Leave request has already been processed');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Update the leave request
    const updatedRequest = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason : null,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    logger.info(`Leave request ${id} ${status.toLowerCase()} by user ${session.user.id}`);

    const successResponse = createSuccessResponse(
      updatedRequest,
      `Leave request ${status.toLowerCase()} successfully`
    );
    return NextResponse.json(successResponse, { status: HTTP_STATUS_CODES.OK });
  } catch (error) {
    return handleApiError(error, {
      operation: 'PUT /api/admin/leave-requests/[id]',
      source: 'api/admin/leave-requests/[id]/route.ts',
    });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Apply rate limiting
  const rateLimitResult = withApiRateLimit(request);
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response!;
  }

  try {
    // Get the authenticated user from the session
    const session = await auth();

    if (!session?.user?.id) {
      const errorResponse = createAuthErrorResponse('Unauthorized');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Check if user has required roles (ADMIN or MANAGER)
    const userRoles = session.user.roles || [];
    if (!hasRequiredRole(userRoles, ['ADMIN', 'MANAGER'])) {
      const errorResponse = createAuthorizationErrorResponse('Insufficient permissions. ADMIN or MANAGER role required.');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    const { id } = params;

    // Validate leave request ID
    if (!id || typeof id !== 'string') {
      const errorResponse = createValidationErrorResponse('Invalid leave request ID');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Check if leave request exists
    const existingRequest = await prisma.leaveRequest.findUnique({
      where: { id },
    });

    if (!existingRequest) {
      const errorResponse = createNotFoundErrorResponse('Leave request not found');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Delete the leave request
    await prisma.leaveRequest.delete({
      where: { id },
    });

    logger.info(`Leave request ${id} deleted by user ${session.user.id}`);

    const successResponse = createSuccessResponse(
      { id, deletedAt: new Date().toISOString() },
      'Leave request deleted successfully'
    );
    return NextResponse.json(successResponse, { status: HTTP_STATUS_CODES.OK });
  } catch (error) {
    return handleApiError(error, {
      operation: 'DELETE /api/admin/leave-requests/[id]',
      source: 'api/admin/leave-requests/[id]/route.ts',
    });
  }
}
