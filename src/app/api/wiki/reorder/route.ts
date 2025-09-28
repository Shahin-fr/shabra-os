import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { 
  createSuccessResponse, 
  createValidationErrorResponse, 
  createServerErrorResponse,
  createUnauthorizedErrorResponse,
  getHttpStatusForErrorCode,
  HTTP_STATUS_CODES
} from '@/lib/api-response';

// POST /api/wiki/reorder - Reorder wiki items
export async function POST(request: NextRequest) {
  try {
    const { withAuth } = await import('@/lib/middleware/auth-middleware');
    
    // Check authentication
    const authResult = await withAuth(request);
    if (authResult.response) {
      return authResult.response;
    }

    const body = await request.json();
    const { items } = body;

    // Validate input
    if (!Array.isArray(items) || items.length === 0) {
      const errorResponse = createValidationErrorResponse('Items array is required and must not be empty');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error?.code || 'VALIDATION_ERROR'),
      });
    }

    // Validate that all items have required fields
    for (const item of items) {
      if (!item.id || typeof item.order !== 'number' || item.order < 0) {
        const errorResponse = createValidationErrorResponse('Each item must have a valid id and non-negative order');
        return NextResponse.json(errorResponse, {
          status: getHttpStatusForErrorCode(errorResponse.error?.code || 'VALIDATION_ERROR'),
        });
      }
    }

    logger.info('Wiki reorder request received', {
      itemCount: items.length,
      userId: authResult.context.userId,
      operation: 'POST /api/wiki/reorder',
      source: 'api/wiki/reorder/route.ts',
    });

    // Check if user has permission to reorder these items
    const itemIds = items.map(item => item.id);
    const existingItems = await prisma.document.findMany({
      where: {
        id: { in: itemIds },
      },
      select: {
        id: true,
        authorId: true,
        parentId: true,
        title: true,
      },
    });

    if (existingItems.length !== items.length) {
      const foundIds = existingItems.map(item => item.id);
      const missingIds = itemIds.filter(id => !foundIds.includes(id));
      
      const errorResponse = createValidationErrorResponse(
        `Some items not found: ${missingIds.join(', ')}`
      );
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error?.code || 'VALIDATION_ERROR'),
      });
    }

    // Check permissions - user must be author of all items or admin
    const isAdmin = authResult.context.roles?.includes('ADMIN');
    const unauthorizedItems = existingItems.filter(
      item => item.authorId !== authResult.context.userId && !isAdmin
    );

    if (unauthorizedItems.length > 0) {
      const unauthorizedTitles = unauthorizedItems.map(item => item.title);
      const errorResponse = createUnauthorizedErrorResponse(
        `You can only reorder your own items. Unauthorized items: ${unauthorizedTitles.join(', ')}`
      );
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error?.code || 'VALIDATION_ERROR'),
      });
    }

    // Update all items in a transaction
    const updatedItems = await prisma.$transaction(
      items.map(item =>
        prisma.document.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    logger.info('Wiki items reordered successfully', {
      itemCount: updatedItems.length,
      userId: authResult.context.userId,
      operation: 'POST /api/wiki/reorder',
      source: 'api/wiki/reorder/route.ts',
    });

    const successResponse = createSuccessResponse({ 
      message: 'Items reordered successfully',
      updatedCount: updatedItems.length 
    });
    return NextResponse.json(successResponse, {
      status: HTTP_STATUS_CODES.OK,
    });

  } catch (error) {
    logger.error('Error reordering wiki items', error as Error, {
      operation: 'POST /api/wiki/reorder',
    }, 'api/wiki/reorder/route.ts');
    
    const errorResponse = createServerErrorResponse('Internal server error');
    return NextResponse.json(errorResponse, {
      status: getHttpStatusForErrorCode(errorResponse.error?.code || 'VALIDATION_ERROR'),
    });
  }
}
