import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/auth';
import {
  createSuccessResponse,
  createAuthErrorResponse,
  createAuthorizationErrorResponse,
  createValidationErrorResponse,
  HTTP_STATUS_CODES,
  getHttpStatusForErrorCode,
} from '@/lib/api/response-utils';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/utils/error-handler';
import { withApiRateLimit } from '@/lib/middleware/rate-limit-middleware';
import { hasRequiredRole } from '@/lib/utils/auth-utils';

// Validation schema for query parameters
const GetLeaveRequestsQuerySchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']).optional(),
  leaveType: z.enum(['ANNUAL', 'SICK', 'UNPAID', 'EMERGENCY', 'MATERNITY', 'PATERNITY', 'STUDY', 'OTHER']).optional(),
  employeeId: z.string().optional(),
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('10').transform(Number),
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

    // Check if user has required roles (ADMIN or MANAGER)
    const userRoles = session.user.roles || [];
    if (!hasRequiredRole(userRoles, ['ADMIN', 'MANAGER'])) {
      const errorResponse = createAuthorizationErrorResponse('Insufficient permissions. ADMIN or MANAGER role required.');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryObject = Object.fromEntries(searchParams.entries());
    
    const validationResult = GetLeaveRequestsQuerySchema.safeParse(queryObject);
    if (!validationResult.success) {
      const errorResponse = createValidationErrorResponse(
        'Invalid query parameters',
        undefined,
        validationResult.error.errors
      );
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    const { status, leaveType, employeeId, page, limit } = validationResult.data;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (leaveType) {
      where.details = {
        path: ['leaveType'],
        equals: leaveType,
      };
    }

    if (employeeId) {
      where.userId = employeeId;
    }

    // Add type filter for leave requests
    where.type = 'LEAVE';

    // Get total count for pagination
    const totalCount = await prisma.request.count({ where });

    // Get leave requests with user information
    const leaveRequests = await prisma.request.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            roles: true,
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
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const response = {
      records: leaveRequests,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    };

    logger.info(`Admin leave requests fetched for user ${session.user.id}, page ${page}`);

    const successResponse = createSuccessResponse(response);
    return NextResponse.json(successResponse, { status: HTTP_STATUS_CODES.OK });
  } catch (error) {
    return handleApiError(error, {
      operation: 'GET /api/admin/leave-requests',
      source: 'api/admin/leave-requests/route.ts',
    });
  }
}
