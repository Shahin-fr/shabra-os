import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/auth';
import {
  createSuccessResponse,
  createAuthErrorResponse,
  createValidationErrorResponse,
  HTTP_STATUS_CODES,
  getHttpStatusForErrorCode,
} from '@/lib/api/response-utils';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/utils/error-handler';
import { withApiRateLimit } from '@/lib/middleware/rate-limit-middleware';
import { validateLeaveRequestPeriod } from '@/lib/work-schedule-utils';

// Validation schema for creating leave request
const CreateLeaveRequestSchema = z.object({
  leaveType: z.enum(['ANNUAL', 'SICK', 'UNPAID', 'EMERGENCY', 'MATERNITY', 'PATERNITY', 'STUDY', 'OTHER']),
  startDate: z.string().datetime('Invalid start date format'),
  endDate: z.string().datetime('Invalid end date format'),
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(500, 'Reason cannot exceed 500 characters'),
}).refine((data) => {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  return endDate >= startDate;
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export async function GET(request: NextRequest) {
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

    const userId = session.user.id;

    // Fetch all leave requests for the current user from the new Request model
    const leaveRequests = await prisma.request.findMany({
      where: { 
        userId,
        type: 'LEAVE',
      },
      orderBy: { createdAt: 'desc' },
    });

    logger.info(`Leave requests fetched for user ${userId}`);

    const successResponse = createSuccessResponse(leaveRequests);
    return NextResponse.json(successResponse, { status: HTTP_STATUS_CODES.OK });
  } catch (error) {
    return handleApiError(error, {
      operation: 'GET /api/leave-requests',
      source: 'api/leave-requests/route.ts',
    });
  }
}

export async function POST(request: NextRequest) {
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

    const userId = session.user.id;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = CreateLeaveRequestSchema.safeParse(body);

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

    const { leaveType, startDate, endDate, reason } = validationResult.data;

    // Validate against work schedule and holidays
    const workScheduleValidation = await validateLeaveRequestPeriod(
      userId,
      new Date(startDate),
      new Date(endDate)
    );

    if (!workScheduleValidation.isValid) {
      const conflictMessages = workScheduleValidation.conflicts.map(conflict => 
        `${conflict.reason} (${conflict.date.toLocaleDateString()})`
      ).join(', ');

      const errorResponse = createValidationErrorResponse(
        `Leave request conflicts with work schedule or holidays: ${conflictMessages}`
      );
      return NextResponse.json(errorResponse, {
        status: HTTP_STATUS_CODES.CONFLICT,
      });
    }

    // Check for overlapping leave requests
    const overlappingRequest = await prisma.request.findFirst({
      where: {
        userId,
        type: 'LEAVE',
        status: {
          in: ['PENDING', 'APPROVED'],
        },
        details: {
          path: ['startDate', 'endDate'],
          array_contains: [startDate, endDate],
        },
      },
    });

    if (overlappingRequest) {
      const errorResponse = createValidationErrorResponse(
        'You already have a pending or approved leave request for this period'
      );
      return NextResponse.json(errorResponse, {
        status: HTTP_STATUS_CODES.CONFLICT,
      });
    }

    // Create the leave request using the new Request model
    const leaveRequest = await prisma.request.create({
      data: {
        userId,
        type: 'LEAVE',
        details: {
          leaveType,
          startDate,
          endDate,
        },
        reason,
        status: 'PENDING',
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

    logger.info(`Leave request created: ${leaveRequest.id} for user ${userId}`);

    const successResponse = createSuccessResponse(leaveRequest, 'Leave request created successfully');
    return NextResponse.json(successResponse, { status: HTTP_STATUS_CODES.CREATED });
  } catch (error) {
    return handleApiError(error, {
      operation: 'POST /api/leave-requests',
      source: 'api/leave-requests/route.ts',
    });
  }
}
