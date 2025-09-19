import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

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

// Validation schema for user creation
const CreateUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  role: z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE'], {
    errorMap: () => ({ message: 'Role must be one of: ADMIN, MANAGER, EMPLOYEE' })
  }),
});

// type CreateUserData = z.infer<typeof CreateUserSchema>;

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

    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        roles: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        firstName: 'asc',
      },
    });

    const successResponse = createSuccessResponse(users);
    return NextResponse.json(successResponse, { status: HTTP_STATUS_CODES.OK });
  } catch (error) {
    return handleApiError(error, {
      operation: 'GET /api/users',
      source: 'api/users/route.ts',
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

    // Check if user has required roles (ADMIN or MANAGER)
    const userRoles = session.user.roles || [];
    if (!hasRequiredRole(userRoles, ['ADMIN', 'MANAGER'])) {
      const errorResponse = createAuthorizationErrorResponse('Insufficient permissions. ADMIN or MANAGER role required.');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = CreateUserSchema.safeParse(body);

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

    const { email, password, firstName, lastName, role } = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const errorResponse = createValidationErrorResponse('User with this email already exists');
      return NextResponse.json(errorResponse, {
        status: HTTP_STATUS_CODES.CONFLICT,
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        roles: role,
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        roles: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info(`User created: ${newUser.email} with role: ${newUser.roles}`);

    const successResponse = createSuccessResponse(newUser, 'User created successfully');
    return NextResponse.json(successResponse, { status: HTTP_STATUS_CODES.CREATED });
  } catch (error) {
    return handleApiError(error, {
      operation: 'POST /api/users',
      source: 'api/users/route.ts',
    });
  }
}
