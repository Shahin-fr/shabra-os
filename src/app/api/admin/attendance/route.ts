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
const GetAttendanceQuerySchema = z.object({
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('10').transform(Number),
  employeeId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['all', 'present', 'absent', 'late']).optional().default('all'),
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
    
    const validationResult = GetAttendanceQuerySchema.safeParse(queryObject);
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

    const { page, limit, employeeId, startDate, endDate, status } = validationResult.data;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {};

    // Filter by employee
    if (employeeId) {
      where.userId = employeeId;
    }

    // Filter by date range
    if (startDate || endDate) {
      where.checkIn = {};
      if (startDate) {
        where.checkIn.gte = new Date(startDate);
      }
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        where.checkIn.lte = endDateObj;
      }
    }

    // Get total count for pagination
    const totalCount = await prisma.attendance.count({ where });

    // Get attendance records with user information
    const attendanceRecords = await prisma.attendance.findMany({
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
      },
      orderBy: {
        checkIn: 'desc',
      },
      skip,
      take: limit,
    });

    // Process records to add calculated fields
    const processedRecords = attendanceRecords.map(record => {
      const checkIn = new Date(record.checkIn);
      const checkOut = record.checkOut ? new Date(record.checkOut) : null;
      
      // Calculate total duration
      let totalDuration = null;
      if (checkOut) {
        const durationMs = checkOut.getTime() - checkIn.getTime();
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        totalDuration = `${hours}:${minutes.toString().padStart(2, '0')}`;
      }

      // Determine status
      let recordStatus = 'in-progress';
      if (checkOut) {
        recordStatus = 'completed';
      }

      // Check if late (after 9:00 AM)
      const isLate = checkIn.getHours() > 9 || (checkIn.getHours() === 9 && checkIn.getMinutes() > 0);

      return {
        id: record.id,
        userId: record.userId,
        user: record.user,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut?.toISOString() || null,
        totalDuration,
        status: recordStatus,
        isLate,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
      };
    });

    // Apply status filter
    let filteredRecords = processedRecords;
    if (status !== 'all') {
      switch (status) {
        case 'present':
          filteredRecords = processedRecords.filter(record => record.status === 'completed');
          break;
        case 'absent':
          // This would need additional logic to determine absent employees
          filteredRecords = [];
          break;
        case 'late':
          filteredRecords = processedRecords.filter(record => record.isLate);
          break;
      }
    }

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const response = {
      records: filteredRecords,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    };

    logger.info(`Admin attendance records fetched for user ${session.user.id}, page ${page}`);

    const successResponse = createSuccessResponse(response);
    return NextResponse.json(successResponse, { status: HTTP_STATUS_CODES.OK });
  } catch (error) {
    return handleApiError(error, {
      operation: 'GET /api/admin/attendance',
      source: 'api/admin/attendance/route.ts',
    });
  }
}
