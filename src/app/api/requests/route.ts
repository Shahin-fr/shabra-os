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

// Validation schemas for different request types
const leaveRequestDetailsSchema = z.object({
  leaveType: z.enum(['ANNUAL', 'SICK', 'UNPAID', 'EMERGENCY', 'MATERNITY', 'PATERNITY', 'STUDY', 'OTHER']),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid start date format'),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid end date format'),
});

const overtimeRequestDetailsSchema = z.object({
  date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date format'),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

const expenseClaimDetailsSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('IRR'),
  category: z.string().min(1, 'Category is required'),
  receiptUrl: z.string().url('Invalid receipt URL').optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

const generalRequestDetailsSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
});

// Main request validation schema
const CreateRequestSchema = z.object({
  type: z.enum(['LEAVE', 'OVERTIME', 'EXPENSE_CLAIM', 'GENERAL']),
  details: z.record(z.any()),
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(500, 'Reason cannot exceed 500 characters'),
}).refine((data) => {
  // Validate details based on type
  switch (data.type) {
    case 'LEAVE':
      return leaveRequestDetailsSchema.safeParse(data.details).success;
    case 'OVERTIME':
      return overtimeRequestDetailsSchema.safeParse(data.details).success;
    case 'EXPENSE_CLAIM':
      return expenseClaimDetailsSchema.safeParse(data.details).success;
    case 'GENERAL':
      return generalRequestDetailsSchema.safeParse(data.details).success;
    default:
      return false;
  }
}, {
  message: 'Invalid details for the selected request type',
  path: ['details'],
});

// GET /api/requests - Get all requests for the current user
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
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    // Build where clause
    const whereClause: any = { userId };
    if (type) whereClause.type = type;
    if (status) whereClause.status = status;

    // Fetch all requests for the current user
    const requests = await prisma.request.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
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

    logger.info(`Requests fetched for user ${userId}`);

    const successResponse = createSuccessResponse(requests);
    return NextResponse.json(successResponse, { status: HTTP_STATUS_CODES.OK });
  } catch (error) {
    return handleApiError(error, {
      operation: 'GET /api/requests',
      source: 'api/requests/route.ts',
    });
  }
}

// POST /api/requests - Create a new request
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
    console.log('Request body received:', JSON.stringify(body, null, 2));
    const validationResult = CreateRequestSchema.safeParse(body);

    if (!validationResult.success) {
      console.log('Validation failed:', validationResult.error.errors);
      const errorResponse = createValidationErrorResponse(
        'Validation failed',
        undefined,
        validationResult.error.errors
      );
      console.log('Error response created:', JSON.stringify(errorResponse, null, 2));
      console.log('HTTP status code:', getHttpStatusForErrorCode(errorResponse.error.code));
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    const { type, details, reason } = validationResult.data;

    // Special validation for leave requests
    if (type === 'LEAVE') {
      const leaveDetails = leaveRequestDetailsSchema.parse(details);
      
      // Validate against work schedule and holidays
      const workScheduleValidation = await validateLeaveRequestPeriod(
        userId,
        new Date(leaveDetails.startDate),
        new Date(leaveDetails.endDate)
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
            array_contains: [leaveDetails.startDate, leaveDetails.endDate],
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
    }

    // Create the request
    const newRequest = await prisma.request.create({
      data: {
        userId,
        type,
        details,
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

    logger.info(`Request created: ${newRequest.id} for user ${userId}`);

    const successResponse = createSuccessResponse(newRequest, 'Request created successfully');
    return NextResponse.json(successResponse, { status: HTTP_STATUS_CODES.CREATED });
  } catch (error) {
    return handleApiError(error, {
      operation: 'POST /api/requests',
      source: 'api/requests/route.ts',
    });
  }
}
