import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import { auth } from '@/auth';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { withApiRateLimit } from '@/lib/middleware/rate-limit-middleware';
import { hasRequiredRole } from '@/lib/utils/auth-utils';
import { 
  withApiErrorHandling, 
  AuthenticationError,
  AuthorizationError,
  ConflictError 
} from '@/lib/errors';
import { 
  CreateUserDTOSchema, 
  UserDTO,
  ApiResponseBuilder,
  validateCreateDTO,
  entityToDTO,
  CreateUserDTO
} from '@/types';

async function getUsers(request: NextRequest): Promise<NextResponse> {
  // Apply rate limiting
  const rateLimitResult = withApiRateLimit(request);
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response!;
  }

  // Get the authenticated user from the session
  const session = await auth();

  if (!session?.user?.id) {
    throw new AuthenticationError('Authentication required');
  }

  // Check if user has required roles (ADMIN or MANAGER)
  const userRoles = session.user.roles || [];
  if (!hasRequiredRole(userRoles, ['ADMIN', 'MANAGER'])) {
    throw new AuthorizationError('Insufficient permissions. ADMIN or MANAGER role required.');
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

  // Transform entities to DTOs
  const userDTOs: UserDTO[] = users.map(user => entityToDTO(user));

  return ApiResponseBuilder.success(userDTOs, 'Users retrieved successfully');
}

export const GET = withApiErrorHandling(getUsers);

async function createUser(request: NextRequest): Promise<NextResponse> {
  // Apply rate limiting
  const rateLimitResult = withApiRateLimit(request);
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response!;
  }

  // Get the authenticated user from the session
  const session = await auth();

  if (!session?.user?.id) {
    throw new AuthenticationError('Authentication required');
  }

  // Check if user has required roles (ADMIN or MANAGER)
  const userRoles = session.user.roles || [];
  if (!hasRequiredRole(userRoles, ['ADMIN', 'MANAGER'])) {
    throw new AuthorizationError('Insufficient permissions. ADMIN or MANAGER role required.');
  }

  // Parse and validate request body
  const body = await request.json();
  const createUserData = validateCreateDTO(body, CreateUserDTOSchema) as CreateUserDTO;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: createUserData.email },
  });

  if (existingUser) {
    throw new ConflictError('User with this email already exists', undefined, { email: createUserData.email });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(createUserData.password, 12);

  // Create the user
  const newUser = await prisma.user.create({
    data: {
      email: createUserData.email,
      password: hashedPassword,
      firstName: createUserData.firstName,
      lastName: createUserData.lastName,
      roles: createUserData.roles,
      isActive: createUserData.isActive ?? true,
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

  // Transform entity to DTO
  const userDTO = entityToDTO(newUser);

  return ApiResponseBuilder.created(userDTO, 'User created successfully');
}

export const POST = withApiErrorHandling(createUser);
