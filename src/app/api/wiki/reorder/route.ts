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

    // CRITICAL: Log the incoming data to see what we're receiving
    console.log('[WIKI REORDER DEBUG] Incoming data:', {
      items,
      userId: authResult.context.userId,
    });

    if (!Array.isArray(items) || items.length === 0) {
      const errorResponse = createValidationErrorResponse('Items array is required and must not be empty');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Validate that all items have required fields
    for (const item of items) {
      if (!item.id || typeof item.order !== 'number') {
        const errorResponse = createValidationErrorResponse('Each item must have id and order fields');
        return NextResponse.json(errorResponse, {
          status: getHttpStatusForErrorCode(errorResponse.error.code),
        });
      }
    }

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
      },
    });

    if (existingItems.length !== items.length) {
      const errorResponse = createValidationErrorResponse('Some items not found');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Check permissions - user must be author of all items or admin
    const isAdmin = authResult.context.roles?.includes('ADMIN');
    const unauthorizedItems = existingItems.filter(
      item => item.authorId !== authResult.context.userId && !isAdmin
    );

    if (unauthorizedItems.length > 0) {
      const errorResponse = createUnauthorizedErrorResponse('You can only reorder your own items');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
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
    // CRITICAL: Log the full error object to see what's actually happening
    console.error('[CRITICAL WIKI REORDER ERROR]', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown',
      operation: 'POST /api/wiki/reorder',
      source: 'api/wiki/reorder/route.ts',
    });
    
    logger.error('Error reordering wiki items', {
      error: error as Error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      operation: 'POST /api/wiki/reorder',
      source: 'api/wiki/reorder/route.ts',
    });
    
    const errorResponse = createServerErrorResponse('Internal server error');
    return NextResponse.json(errorResponse, {
      status: getHttpStatusForErrorCode(errorResponse.error.code),
    });
  }
}
