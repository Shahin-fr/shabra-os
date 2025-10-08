import { NextRequest } from 'next/server';

import { auth } from '@/auth';
import {
  ApiResponseBuilder,
  RequestDTO,
  CreateRequestDTO,
  RequestEntity,
  entityToDTO,
  validateCreateDTO,
  CreateRequestDTOSchema
} from '@/types';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/utils/error-handler';
import { withApiRateLimit } from '@/lib/middleware/rate-limit-middleware';
import { validateLeaveRequestPeriod } from '@/lib/work-schedule-utils';


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
      return ApiResponseBuilder.unauthorized('Authentication required');
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

    // Transform entities to DTOs
    const requestDTOs: RequestDTO[] = leaveRequests.map(request => entityToDTO(request as RequestEntity) as unknown as RequestDTO);

    return ApiResponseBuilder.success(requestDTOs, 'Leave requests retrieved successfully');
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
      return ApiResponseBuilder.unauthorized('Authentication required');
    }

    const userId = session.user.id;

    // Parse and validate request body using new type system
    const body = await request.json();
    const createRequestData = validateCreateDTO(body, CreateRequestDTOSchema) as CreateRequestDTO;

    const { details, reason } = createRequestData;
    
    // Extract leave-specific details from the details object
    const { leaveType, startDate, endDate } = details || {};

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

      return ApiResponseBuilder.conflict(`Leave request conflicts with work schedule or holidays: ${conflictMessages}`);
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
      return ApiResponseBuilder.conflict('You already have a pending or approved leave request for this period');
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

    // Transform entity to DTO
    const requestDTO = entityToDTO(leaveRequest as RequestEntity);

    return ApiResponseBuilder.created(requestDTO, 'Leave request created successfully');
  } catch (error) {
    return handleApiError(error, {
      operation: 'POST /api/leave-requests',
      source: 'api/leave-requests/route.ts',
    });
  }
}
