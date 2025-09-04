import { NextRequest, NextResponse } from 'next/server';

import {
  createNotFoundErrorResponse,
  createServerErrorResponse,
  createSuccessResponse,
  createValidationErrorResponse,
  getHttpStatusForErrorCode,
  HTTP_STATUS_CODES,
} from '@/lib/api/response-utils';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

    // Fetch the project
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!project) {
      const errorResponse = createNotFoundErrorResponse();
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    const successResponse = createSuccessResponse(project);
    return NextResponse.json(successResponse, {
      status: HTTP_STATUS_CODES.OK,
    });
  } catch (error) {
    logger.error('Project fetch error:', error as Error, {
      operation: 'GET /api/projects/[projectId]',
      source: 'api/projects/[projectId]/route.ts',
    });
    const errorResponse = createServerErrorResponse('خطا در دریافت پروژه');
    return NextResponse.json(errorResponse, {
      status: getHttpStatusForErrorCode(errorResponse.error.code),
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
    const body = await request.json();

    logger.info('Project update request received', {
      projectId,
      body,
      userId: authResult.context.userId,
      operation: 'PUT /api/projects/[projectId]',
      source: 'api/projects/[projectId]/route.ts',
    });

    const { name, description, status, startDate, endDate } = body;

    if (!name) {
      const errorResponse = createValidationErrorResponse(
        'نام پروژه الزامی است'
      );
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!existingProject) {
      const errorResponse = createNotFoundErrorResponse();
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Update project data
    const updateData = {
      name,
      description: description || null,
      status: status || existingProject.status,
      startDate: startDate ? new Date(startDate) : existingProject.startDate,
      endDate: endDate ? new Date(endDate) : existingProject.endDate,
    };

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: updateData,
    });

    logger.info('Project updated successfully', {
      projectId,
      userId: authResult.context.userId,
      operation: 'PUT /api/projects/[projectId]',
      source: 'api/projects/[projectId]/route.ts',
    });

    const successResponse = createSuccessResponse(
      updatedProject,
      'پروژه با موفقیت به‌روزرسانی شد'
    );
    return NextResponse.json(successResponse, {
      status: HTTP_STATUS_CODES.OK,
    });
  } catch (error) {
    logger.error('Project update error:', error as Error, {
      operation: 'PUT /api/projects/[projectId]',
      source: 'api/projects/[projectId]/route.ts',
    });
    const errorResponse = createServerErrorResponse('خطا در به‌روزرسانی پروژه');
    return NextResponse.json(errorResponse, {
      status: getHttpStatusForErrorCode(errorResponse.error.code),
    });
  }
}
