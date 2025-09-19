import { NextRequest, NextResponse } from 'next/server';

import {
  createSuccessResponse,
  HTTP_STATUS_CODES,
} from '@/lib/api/response-utils';
import { logger } from '@/lib/logger';
import { ProjectService } from '@/services/project.service';
import { validate, validateQuery } from '@/lib/middleware/validation-middleware';
import { handleApiError } from '@/lib/utils/error-handler';
import { CreateProjectSchema, GetProjectsQuerySchema } from '@/lib/validators/project-validators';
import { withApiRateLimit } from '@/lib/middleware/rate-limit-middleware';

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = withApiRateLimit(request);
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response!;
  }

  try {
    // Add authorization check
    const { withAuth } = await import('@/lib/middleware/auth-middleware');

    // Check authentication
    const authResult = await withAuth(request);
    if (authResult.response) {
      return authResult.response;
    }

    // Validate query parameters using middleware
    const queryParams = await validateQuery(GetProjectsQuerySchema)(request);

    // Use ProjectService to get projects
    const result = await ProjectService.getProjects(queryParams);

    const successResponse = createSuccessResponse(result);
    return NextResponse.json(successResponse, { status: HTTP_STATUS_CODES.OK });
  } catch (error) {
    return handleApiError(error, {
      operation: 'GET /api/projects',
      source: 'api/projects/route.ts',
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
    // Add authorization check
    const { withAuth } = await import('@/lib/middleware/auth-middleware');

    // Check authentication and authorization - only managers and admins can create projects
    const authResult = await withAuth(request, {
      requiredPrivilegeLevel: 'MANAGER', // Managers and admins can create projects
    });

    if (authResult.response) {
      return authResult.response;
    }

    // Validate request body using middleware
    const validatedData = await validate(CreateProjectSchema)(request);

    logger.info('Project creation request received', {
      userId: authResult.context.userId,
      operation: 'POST /api/projects',
      source: 'api/projects/route.ts',
      // Only log non-sensitive fields
      name: validatedData.name?.substring(0, 50) + (validatedData.name && validatedData.name.length > 50 ? '...' : ''),
      status: validatedData.status,
    });

    // Use ProjectService to create project
    const project = await ProjectService.createProject(validatedData);

    const successResponse = createSuccessResponse(project);
    return NextResponse.json(successResponse, {
      status: HTTP_STATUS_CODES.CREATED,
    });
  } catch (error) {
    return handleApiError(error, {
      operation: 'POST /api/projects',
      source: 'api/projects/route.ts',
    });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Add authorization check
    const { withAuth } = await import('@/lib/middleware/auth-middleware');

    // Check authentication and authorization - only managers and admins can delete projects
    const authResult = await withAuth(request, {
      requiredPrivilegeLevel: 'MANAGER', // Managers and admins can delete projects
    });

    if (authResult.response) {
      return authResult.response;
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('id');

    if (!projectId) {
      throw new Error('Project ID is required');
    }

    logger.info('Project deletion request received', {
      projectId,
      userId: authResult.context.userId,
      operation: 'DELETE /api/projects',
      source: 'api/projects/route.ts',
    });

    // Use ProjectService to delete project
    const result = await ProjectService.deleteProject(projectId);

    const successResponse = createSuccessResponse(
      { id: result.deletedId },
      'پروژه با موفقیت حذف شد'
    );
    return NextResponse.json(successResponse, {
      status: HTTP_STATUS_CODES.OK,
    });
  } catch (error) {
    return handleApiError(error, {
      operation: 'DELETE /api/projects',
      source: 'api/projects/route.ts',
    });
  }
}
