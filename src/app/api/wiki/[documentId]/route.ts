import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { 
  createSuccessResponse, 
  createValidationErrorResponse, 
  createServerErrorResponse,
  createNotFoundErrorResponse,
  createUnauthorizedErrorResponse,
  getHttpStatusForErrorCode,
  HTTP_STATUS_CODES
} from '@/lib/api-response';

// GET /api/wiki/[documentId] - Get individual wiki item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { withAuth } = await import('@/lib/middleware/auth-middleware');
    
    // Check authentication
    const authResult = await withAuth(request);
    if (authResult.response) {
      return authResult.response;
    }

    const { documentId } = await params;

    // Get the document with author information
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!document) {
      const errorResponse = createNotFoundErrorResponse('Wiki item not found');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Check if user has access to the document
    const isPublic = document.isPublic;
    const isAuthor = document.authorId === authResult.context.userId;
    const isAdmin = authResult.context.roles?.includes('ADMIN');

    if (!isPublic && !isAuthor && !isAdmin) {
      const errorResponse = createUnauthorizedErrorResponse('Access denied to this wiki item');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    logger.info('Wiki item retrieved successfully', {
      itemId: documentId,
      userId: authResult.context.userId,
      operation: 'GET /api/wiki/[documentId]',
      source: 'api/wiki/[documentId]/route.ts',
    });

    const successResponse = createSuccessResponse(document);
    return NextResponse.json(successResponse, {
      status: HTTP_STATUS_CODES.OK,
    });

  } catch (error) {
    // CRITICAL: Log the full error object to see what's actually happening
    console.error('[CRITICAL WIKI GET ERROR]', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown',
      operation: 'GET /api/wiki/[documentId]',
      source: 'api/wiki/[documentId]/route.ts',
    });
    
    logger.error('Error retrieving wiki item', {
      error: error as Error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      operation: 'GET /api/wiki/[documentId]',
      source: 'api/wiki/[documentId]/route.ts',
    });
    
    const errorResponse = createServerErrorResponse('Internal server error');
    return NextResponse.json(errorResponse, {
      status: getHttpStatusForErrorCode(errorResponse.error.code),
    });
  }
}

// PUT /api/wiki/[documentId] - Update wiki item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { withAuth } = await import('@/lib/middleware/auth-middleware');
    
    // Check authentication
    const authResult = await withAuth(request);
    if (authResult.response) {
      return authResult.response;
    }

    const { documentId } = await params;
    const body = await request.json();
    const { title, content, type, parentId } = body;

    // CRITICAL: Log the incoming data to see what we're receiving
    console.log('[WIKI PUT DEBUG] Incoming data:', {
      documentId,
      body,
      title,
      content,
      type,
      parentId,
      userId: authResult.context.userId,
    });

    // Validate required fields
    if (!title || !type) {
      const errorResponse = createValidationErrorResponse('Title and type are required');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Get the existing document
    const existingDocument = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!existingDocument) {
      const errorResponse = createNotFoundErrorResponse('Wiki item not found');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Check permissions
    const isAuthor = existingDocument.authorId === authResult.context.userId;
    const isAdmin = authResult.context.roles?.includes('ADMIN');

    if (!isAuthor && !isAdmin) {
      const errorResponse = createUnauthorizedErrorResponse('You can only edit your own wiki items');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Validate parent if provided
    if (parentId) {
      const parent = await prisma.document.findUnique({
        where: { id: parentId },
      });

      if (!parent || parent.type !== 'FOLDER') {
        const errorResponse = createValidationErrorResponse('Parent must be a valid folder');
        return NextResponse.json(errorResponse, {
          status: getHttpStatusForErrorCode(errorResponse.error.code),
        });
      }

      // Prevent circular references
      if (parentId === documentId) {
        const errorResponse = createValidationErrorResponse('Cannot set item as its own parent');
        return NextResponse.json(errorResponse, {
          status: getHttpStatusForErrorCode(errorResponse.error.code),
        });
      }
    }

    // Update the document
    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        title: title.trim(),
        content: type === 'DOCUMENT' ? content : null,
        type,
        parentId,
        updatedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    logger.info('Wiki item updated successfully', {
      itemId: documentId,
      userId: authResult.context.userId,
      operation: 'PUT /api/wiki/[documentId]',
      source: 'api/wiki/[documentId]/route.ts',
    });

    const successResponse = createSuccessResponse(updatedDocument);
    return NextResponse.json(successResponse, {
      status: HTTP_STATUS_CODES.OK,
    });

  } catch (error) {
    // CRITICAL: Log the full error object to see what's actually happening
    console.error('[CRITICAL WIKI PUT ERROR]', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown',
      operation: 'PUT /api/wiki/[documentId]',
      source: 'api/wiki/[documentId]/route.ts',
    });
    
    logger.error('Error updating wiki item', {
      error: error as Error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      operation: 'PUT /api/wiki/[documentId]',
      source: 'api/wiki/[documentId]/route.ts',
    });
    
    const errorResponse = createServerErrorResponse('Internal server error');
    return NextResponse.json(errorResponse, {
      status: getHttpStatusForErrorCode(errorResponse.error.code),
    });
  }
}

// DELETE /api/wiki/[documentId] - Delete wiki item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { withAuth } = await import('@/lib/middleware/auth-middleware');
    
    // Check authentication
    const authResult = await withAuth(request);
    if (authResult.response) {
      return authResult.response;
    }

    const { documentId } = await params;

    // Get the existing document
    const existingDocument = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!existingDocument) {
      const errorResponse = createNotFoundErrorResponse('Wiki item not found');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Check permissions
    const isAuthor = existingDocument.authorId === authResult.context.userId;
    const isAdmin = authResult.context.roles?.includes('ADMIN');

    if (!isAuthor && !isAdmin) {
      const errorResponse = createUnauthorizedErrorResponse('You can only delete your own wiki items');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // If it's a folder, check if it has children
    if (existingDocument.type === 'FOLDER') {
      const children = await prisma.document.findMany({
        where: { parentId: documentId },
      });

      if (children.length > 0) {
        const errorResponse = createValidationErrorResponse(
          'Cannot delete folder that contains items. Please delete or move all items first.'
        );
        return NextResponse.json(errorResponse, {
          status: getHttpStatusForErrorCode(errorResponse.error.code),
        });
      }
    }

    // Delete from Cloudinary if file exists
    if (existingDocument.filePublicId) {
      try {
        const { deleteFromCloudinary } = await import('@/lib/cloudinary');
        await deleteFromCloudinary(existingDocument.filePublicId);
      } catch (cloudinaryError) {
        logger.warn('Failed to delete file from Cloudinary', {
          error: cloudinaryError as Error,
          documentId: documentId,
          publicId: existingDocument.filePublicId,
        });
        // Continue with database deletion even if Cloudinary deletion fails
      }
    }

    // Delete the document
    await prisma.document.delete({
      where: { id: documentId },
    });

    logger.info('Wiki item deleted successfully', {
      itemId: documentId,
      userId: authResult.context.userId,
      operation: 'DELETE /api/wiki/[documentId]',
      source: 'api/wiki/[documentId]/route.ts',
    });

    const successResponse = createSuccessResponse({ id: documentId, deleted: true });
    return NextResponse.json(successResponse, {
      status: HTTP_STATUS_CODES.OK,
    });

  } catch (error) {
    // CRITICAL: Log the full error object to see what's actually happening
    console.error('[CRITICAL WIKI DELETE ERROR]', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown',
      operation: 'DELETE /api/wiki/[documentId]',
      source: 'api/wiki/[documentId]/route.ts',
    });
    
    logger.error('Error deleting wiki item', {
      error: error as Error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      operation: 'DELETE /api/wiki/[documentId]',
      source: 'api/wiki/[documentId]/route.ts',
    });
    
    const errorResponse = createServerErrorResponse('Internal server error');
    return NextResponse.json(errorResponse, {
      status: getHttpStatusForErrorCode(errorResponse.error.code),
    });
  }
}
