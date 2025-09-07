import { NextRequest, NextResponse } from 'next/server';

import {
  createSuccessResponse,
  createValidationErrorResponse,
  createServerErrorResponse,
  HTTP_STATUS_CODES,
  getHttpStatusForErrorCode,
} from '@/lib/api/response-utils';
import { logger } from '@/lib/logger';
import { prismaLocal as prisma } from '@/lib/prisma-local';

export async function GET(request: NextRequest) {
  try {
    // Add authorization check
    const { withAuth } = await import('@/lib/middleware/auth-middleware');

    // Check authentication
    const authResult = await withAuth(request);
    if (authResult.response) {
      return authResult.response;
    }

    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get('page') || '1';
    const limitParam = searchParams.get('limit') || '20';

    const page = parseInt(pageParam);
    const limit = parseInt(limitParam);

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1 || limit > 100) {
      const errorResponse = createValidationErrorResponse(
        'پارامترهای صفحه و محدوده نامعتبر هستند'
      );
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    const skip = (page - 1) * limit;

    // Get projects with pagination
    const [projects, totalProjects] = await Promise.all([
      prisma.project.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              stories: true,
              tasks: true,
            },
          },
        },
      }),
      prisma.project.count(),
    ]);

    const totalPages = Math.ceil(totalProjects / limit);

    const successResponse = createSuccessResponse({
      projects,
      currentPage: page,
      totalPages,
      totalProjects,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    });
    return NextResponse.json(successResponse, { status: HTTP_STATUS_CODES.OK });
  } catch (error) {
    logger.error('Projects fetch error:', error as Error, {
      operation: 'GET /api/projects',
      source: 'api/projects/route.ts',
    });
    const errorResponse = createServerErrorResponse('خطا در دریافت پروژه‌ها');
    return NextResponse.json(errorResponse, {
      status: getHttpStatusForErrorCode(errorResponse.error.code),
    });
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    logger.info('Project creation request received', {
      body,
      userId: authResult.context.userId,
      operation: 'POST /api/projects',
      source: 'api/projects/route.ts',
    });

    const { name, description, status, startDate, endDate } = body;

    if (!name) {
      logger.warn('Project creation failed: missing name', {
        body,
        userId: authResult.context.userId,
        operation: 'POST /api/projects',
        source: 'api/projects/route.ts',
      });
      const errorResponse = createValidationErrorResponse(
        'نام پروژه الزامی است'
      );
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Create project with proper data structure
    const projectData = {
      name,
      description: description || null,
      status: status || 'ACTIVE',
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      accessLevel: 'PRIVATE' as const, // Default access level
    };

    logger.info('Creating project in database', {
      projectData,
      userId: authResult.context.userId,
      operation: 'POST /api/projects',
      source: 'api/projects/route.ts',
    });

    const project = await prisma.project.create({
      data: projectData,
    });

    logger.info('Project created successfully', {
      projectId: project.id,
      userId: authResult.context.userId,
      operation: 'POST /api/projects',
      source: 'api/projects/route.ts',
    });

    const successResponse = createSuccessResponse(project);
    return NextResponse.json(successResponse, {
      status: HTTP_STATUS_CODES.CREATED,
    });
  } catch (error) {
    logger.error('Project creation error:', error as Error, {
      operation: 'POST /api/projects',
      source: 'api/projects/route.ts',
    });
    const errorResponse = createServerErrorResponse('خطا در ایجاد پروژه');
    return NextResponse.json(errorResponse, {
      status: getHttpStatusForErrorCode(errorResponse.error.code),
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
      const errorResponse = createValidationErrorResponse(
        'شناسه پروژه الزامی است'
      );
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    logger.info('Project deletion request received', {
      projectId,
      userId: authResult.context.userId,
      operation: 'DELETE /api/projects',
      source: 'api/projects/route.ts',
    });

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!existingProject) {
      const errorResponse = createValidationErrorResponse(
        'پروژه مورد نظر یافت نشد'
      );
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Delete the project
    await prisma.project.delete({
      where: { id: projectId },
    });

    logger.info('Project deleted successfully', {
      projectId,
      userId: authResult.context.userId,
      operation: 'DELETE /api/projects',
      source: 'api/projects/route.ts',
    });

    const successResponse = createSuccessResponse(
      { id: projectId },
      'پروژه با موفقیت حذف شد'
    );
    return NextResponse.json(successResponse, {
      status: HTTP_STATUS_CODES.OK,
    });
  } catch (error) {
    logger.error('Project deletion error:', error as Error, {
      operation: 'DELETE /api/projects',
      source: 'api/projects/route.ts',
    });
    const errorResponse = createServerErrorResponse('خطا در حذف پروژه');
    return NextResponse.json(errorResponse, {
      status: getHttpStatusForErrorCode(errorResponse.error.code),
    });
  }
}
