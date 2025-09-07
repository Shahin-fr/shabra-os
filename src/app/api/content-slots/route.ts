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

// GET /api/content-slots - Fetch content slots for a specific week
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
    const weekStart = searchParams.get('weekStart');

    if (!weekStart) {
      const errorResponse = createValidationErrorResponse(
        'weekStart parameter is required'
      );
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    const contentSlots = await prisma.contentSlot.findMany({
      where: {
        startDate: {
          gte: new Date(weekStart),
          lt: new Date(new Date(weekStart).getTime() + 7 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { startDate: 'asc' },
      take: 100, // Limit results to prevent memory issues
    });

    const successResponse = createSuccessResponse(contentSlots);
    const response = NextResponse.json(successResponse, {
      status: HTTP_STATUS_CODES.OK,
    });
    response.headers.set('X-Query-Performance', 'optimized');
    response.headers.set(
      'Cache-Control',
      'public, max-age=300, stale-while-revalidate=600'
    );

    return response;
  } catch (error) {
    logger.error(
      'Content slots fetch error:',
      error instanceof Error ? error : undefined,
      {
        context: 'content-slots-api',
        operation: 'GET /api/content-slots',
        source: 'api/content-slots/route.ts',
      }
    );
    const errorResponse = createServerErrorResponse(
      'Failed to fetch content slots'
    );
    return NextResponse.json(errorResponse, {
      status: getHttpStatusForErrorCode(errorResponse.error.code),
    });
  }
}

// POST /api/content-slots - Create a new content slot
export async function POST(request: NextRequest) {
  try {
    // Add authorization check
    const { withAuth } = await import('@/lib/middleware/auth-middleware');

    // Check authentication - any authenticated user can create content slots
    const authResult = await withAuth(request, {
      requiredPrivilegeLevel: 'EMPLOYEE',
    });

    if (authResult.response) {
      return authResult.response;
    }

    const body = await request.json();
    const { title, type, startDate, endDate, projectId, description } = body;

    logger.info('Content slot creation request received', {
      body,
      userId: authResult.context.userId,
      operation: 'POST /api/content-slots',
      source: 'api/content-slots/route.ts',
    });

    // Validate required fields
    if (!title || !startDate || !endDate) {
      logger.warn('Content slot creation failed: missing required fields', {
        body,
        userId: authResult.context.userId,
        operation: 'POST /api/content-slots',
        source: 'api/content-slots/route.ts',
      });
      const errorResponse = createValidationErrorResponse(
        'Missing required fields'
      );
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Check for overlapping slots
    const overlappingSlots = await prisma.contentSlot.findMany({
      where: {
        OR: [
          {
            startDate: {
              lt: new Date(endDate),
              gte: new Date(startDate),
            },
          },
          {
            endDate: {
              gt: new Date(startDate),
              lte: new Date(endDate),
            },
          },
        ],
      },
    });

    if (overlappingSlots.length > 0) {
      const errorResponse = createValidationErrorResponse(
        'Time slot overlaps with existing slots'
      );
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Create content slot
    const contentSlot = await prisma.contentSlot.create({
      data: {
        title,
        type: type || 'STORY',
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        projectId,
      },
    });

    logger.info('Content slot created successfully', {
      slotId: contentSlot.id,
      userId: authResult.context.userId,
      operation: 'POST /api/content-slots',
      source: 'api/content-slots/route.ts',
    });

    const successResponse = createSuccessResponse(contentSlot);
    return NextResponse.json(successResponse, {
      status: HTTP_STATUS_CODES.CREATED,
    });
  } catch (error) {
    logger.error(
      'Content slot creation error:',
      error instanceof Error ? error : undefined,
      {
        context: 'content-slots-api',
        operation: 'POST /api/content-slots',
        source: 'api/content-slots/route.ts',
      }
    );
    const errorResponse = createServerErrorResponse(
      'Failed to create content slot'
    );
    return NextResponse.json(errorResponse, {
      status: getHttpStatusForErrorCode(errorResponse.error.code),
    });
  }
}

// PUT /api/content-slots - Update content slot
export async function PUT(request: NextRequest) {
  try {
    // Add authorization check
    const { withAuth } = await import('@/lib/middleware/auth-middleware');

    // Check authentication - any authenticated user can update content slots
    const authResult = await withAuth(request, {
      requiredPrivilegeLevel: 'EMPLOYEE',
    });

    if (authResult.response) {
      return authResult.response;
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      const errorResponse = createValidationErrorResponse(
        'Content slot ID is required'
      );
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Performance tracking for content slot update
    const updatedSlot = await prisma.contentSlot.update({
      where: { id },
      data: updateData,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    logger.info('Content slot updated successfully', {
      slotId: updatedSlot.id,
      userId: authResult.context.userId,
      operation: 'PUT /api/content-slots',
      source: 'api/content-slots/route.ts',
    });

    // Add performance headers
    const response = NextResponse.json(updatedSlot);
    response.headers.set('X-Query-Performance', 'optimized');
    response.headers.set('Cache-Control', 'no-cache');

    return response;
  } catch (error) {
    logger.error(
      'Content slot update error:',
      error instanceof Error ? error : undefined,
      {
        context: 'content-slots-api',
        operation: 'PUT /api/content-slots',
        source: 'api/content-slots/route.ts',
      }
    );
    const errorResponse = createServerErrorResponse(
      'Failed to update content slot'
    );
    return NextResponse.json(errorResponse, {
      status: getHttpStatusForErrorCode(errorResponse.error.code),
    });
  }
}

// DELETE /api/content-slots - Delete content slot
export async function DELETE(request: NextRequest) {
  try {
    // Add authorization check
    const { withAuth } = await import('@/lib/middleware/auth-middleware');

    // Check authentication - any authenticated user can delete content slots
    const authResult = await withAuth(request, {
      requiredPrivilegeLevel: 'EMPLOYEE',
    });

    if (authResult.response) {
      return authResult.response;
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      const errorResponse = createValidationErrorResponse(
        'Content slot ID is required'
      );
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Performance tracking for content slot deletion
    await prisma.contentSlot.delete({
      where: { id },
    });

    logger.info('Content slot deleted successfully', {
      slotId: id,
      userId: authResult.context.userId,
      operation: 'DELETE /api/content-slots',
      source: 'api/content-slots/route.ts',
    });

    // Add performance headers
    const response = NextResponse.json({ success: true });
    response.headers.set('X-Query-Performance', 'optimized');
    response.headers.set('Cache-Control', 'no-cache');

    return response;
  } catch (error) {
    logger.error(
      'Content slot deletion error:',
      error instanceof Error ? error : undefined,
      {
        context: 'content-slots-api',
        operation: 'DELETE /api/content-slots',
        source: 'api/content-slots/route.ts',
      }
    );
    const errorResponse = createServerErrorResponse(
      'Failed to delete content slot'
    );
    return NextResponse.json(errorResponse, {
      status: getHttpStatusForErrorCode(errorResponse.error.code),
    });
  }
}
