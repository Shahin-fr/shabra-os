import { NextRequest, NextResponse } from 'next/server';

import {
  createSuccessResponse,
  HTTP_STATUS_CODES,
} from '@/lib/api/response-utils';
import { logger } from '@/lib/logger';
import { ProjectService } from '@/services/project.service';
import { validate, validateParams } from '@/lib/middleware/validation-middleware';
import { handleApiError } from '@/lib/utils/error-handler';
import { UpdateProjectSchema, ProjectIdParamSchema } from '@/lib/validators/project-validators';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

    // Validate path parameters
    const validatedParams = await validateParams(ProjectIdParamSchema)({ projectId });

    // Use ProjectService to get project
    const project = await ProjectService.getProjectById(validatedParams.projectId);

    const successResponse = createSuccessResponse(project);
    return NextResponse.json(successResponse, {
      status: HTTP_STATUS_CODES.OK,
    });
  } catch (error) {
    return handleApiError(error, {
      operation: 'GET /api/projects/[projectId]',
      source: 'api/projects/[projectId]/route.ts',
    });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    // Add authorization check
    const { withAuth } = await import('@/lib/middleware/auth-middleware');

    // Check authentication and authorization - only managers and admins can update projects
    const authResult = await withAuth(request, {
      requiredPrivilegeLevel: 'MANAGER', // Managers and admins can update projects
    });

    if (authResult.response) {
      return authResult.response;
    }

    const { projectId } = await params;

    // Validate path parameters
    const validatedParams = await validateParams(ProjectIdParamSchema)({ projectId });

    // Validate request body using middleware
    const validatedData = await validate(UpdateProjectSchema)(request);

    logger.info('Project update request received', {
      projectId: validatedParams.projectId,
      userId: authResult.context.userId,
      operation: 'PUT /api/projects/[projectId]',
      source: 'api/projects/[projectId]/route.ts',
      // Only log non-sensitive fields
      name: validatedData.name?.substring(0, 50) + (validatedData.name && validatedData.name.length > 50 ? '...' : ''),
      status: validatedData.status,
    });

    // Use ProjectService to update project
    const updatedProject = await ProjectService.updateProject(validatedParams.projectId, validatedData);

    const successResponse = createSuccessResponse(
      updatedProject,
      'پروژه با موفقیت به‌روزرسانی شد'
    );
    return NextResponse.json(successResponse, {
      status: HTTP_STATUS_CODES.OK,
    });
  } catch (error) {
    return handleApiError(error, {
      operation: 'PUT /api/projects/[projectId]',
      source: 'api/projects/[projectId]/route.ts',
    });
  }
}
