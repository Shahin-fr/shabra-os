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

// Validation schema for updating attendance record
const UpdateAttendanceSchema = z.object({
  checkIn: z.string().datetime('Invalid check-in date format'),
  checkOut: z.string().datetime('Invalid check-out date format').optional(),
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

    // Validate attendance record ID
    if (!id || typeof id !== 'string') {
      const errorResponse = createValidationErrorResponse('Invalid attendance record ID');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = UpdateAttendanceSchema.safeParse(body);

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

    const { checkIn, checkOut } = validationResult.data;

    // Check if attendance record exists
    const existingRecord = await prisma.attendance.findUnique({
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

    if (!existingRecord) {
      const errorResponse = createNotFoundErrorResponse('Attendance record not found');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Validate that check-out is after check-in
    const checkInDate = new Date(checkIn);
    if (checkOut) {
      const checkOutDate = new Date(checkOut);
      if (checkOutDate <= checkInDate) {
        const errorResponse = createValidationErrorResponse('Check-out time must be after check-in time');
        return NextResponse.json(errorResponse, {
          status: getHttpStatusForErrorCode(errorResponse.error.code),
        });
      }
    }

    // Update the attendance record
    const updatedRecord = await prisma.attendance.update({
      where: { id },
      data: {
        checkIn: checkInDate,
        checkOut: checkOut ? new Date(checkOut) : null,
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
      },
    });

    // Calculate total duration
    let totalDuration = null;
    if (updatedRecord.checkOut) {
      const durationMs = updatedRecord.checkOut.getTime() - updatedRecord.checkIn.getTime();
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      totalDuration = `${hours}:${minutes.toString().padStart(2, '0')}`;
    }

    const response = {
      id: updatedRecord.id,
      userId: updatedRecord.userId,
      user: updatedRecord.user,
      checkIn: updatedRecord.checkIn.toISOString(),
      checkOut: updatedRecord.checkOut?.toISOString() || null,
      totalDuration,
      status: updatedRecord.checkOut ? 'completed' : 'in-progress',
      createdAt: updatedRecord.createdAt.toISOString(),
      updatedAt: updatedRecord.updatedAt.toISOString(),
    };

    logger.info(`Attendance record ${id} updated by user ${session.user.id}`);

    const successResponse = createSuccessResponse(response, 'Attendance record updated successfully');
    return NextResponse.json(successResponse, { status: HTTP_STATUS_CODES.OK });
  } catch (error) {
    return handleApiError(error, {
      operation: 'PUT /api/admin/attendance/[id]',
      source: 'api/admin/attendance/[id]/route.ts',
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

    // Validate attendance record ID
    if (!id || typeof id !== 'string') {
      const errorResponse = createValidationErrorResponse('Invalid attendance record ID');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Check if attendance record exists
    const existingRecord = await prisma.attendance.findUnique({
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

    if (!existingRecord) {
      const errorResponse = createNotFoundErrorResponse('Attendance record not found');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Delete the attendance record
    await prisma.attendance.delete({
      where: { id },
    });

    logger.info(`Attendance record ${id} deleted by user ${session.user.id}`);

    const successResponse = createSuccessResponse(
      { id, deletedAt: new Date().toISOString() },
      'Attendance record deleted successfully'
    );
    return NextResponse.json(successResponse, { status: HTTP_STATUS_CODES.OK });
  } catch (error) {
    return handleApiError(error, {
      operation: 'DELETE /api/admin/attendance/[id]',
      source: 'api/admin/attendance/[id]/route.ts',
    });
  }
}
