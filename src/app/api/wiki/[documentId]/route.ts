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
    
    // Check authentication - but allow public access
    const authResult = await withAuth(request);
    let userId: string | null = null;
    if (!authResult.response && authResult.context?.userId) {
      userId = authResult.context.userId;
    }

    const { documentId } = await params;

    // Validate documentId
    if (!documentId || typeof documentId !== 'string') {
      const errorResponse = createValidationErrorResponse('Invalid document ID');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error?.code || 'VALIDATION_ERROR'),
      });
    }

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
        status: getHttpStatusForErrorCode(errorResponse.error?.code || 'VALIDATION_ERROR'),
      });
    }

    // Check if user has access to the document
    const isPublic = document.isPublic;
    const isAuthor = userId && document.authorId === userId;
    const isAdmin = authResult.context?.roles?.includes('ADMIN');

    if (!isPublic && !isAuthor && !isAdmin) {
      const errorResponse = createUnauthorizedErrorResponse('Access denied to this wiki item');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error?.code || 'VALIDATION_ERROR'),
      });
    }

    logger.info('Wiki item retrieved successfully', {
      itemId: documentId,
      title: document.title,
      type: document.type,
      userId: authResult.context.userId,
      operation: 'GET /api/wiki/[documentId]',
      source: 'api/wiki/[documentId]/route.ts',
    });

    const successResponse = createSuccessResponse(document);
    return NextResponse.json(successResponse, {
      status: HTTP_STATUS_CODES.OK,
    });

  } catch (error) {
    logger.error('Error retrieving wiki item', error as Error, {
      operation: 'GET /api/wiki/[documentId]',
    }, 'api/wiki/[documentId]/route.ts');
    
    const errorResponse = createServerErrorResponse('Internal server error');
    return NextResponse.json(errorResponse, {
      status: getHttpStatusForErrorCode(errorResponse.error?.code || 'VALIDATION_ERROR'),
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

    // Validate documentId
    if (!documentId || typeof documentId !== 'string') {
      const errorResponse = createValidationErrorResponse('Invalid document ID');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error?.code || 'VALIDATION_ERROR'),
      });
    }

    // Validate required fields
    if (!title || !type) {
      const errorResponse = createValidationErrorResponse('Title and type are required');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error?.code || 'VALIDATION_ERROR'),
      });
    }

    // Validate type
    if (!['FOLDER', 'DOCUMENT'].includes(type)) {
      const errorResponse = createValidationErrorResponse(
        'Type must be either FOLDER or DOCUMENT'
      );
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error?.code || 'VALIDATION_ERROR'),
      });
    }

    // Validate title length
    if (title.trim().length < 1 || title.trim().length > 255) {
      const errorResponse = createValidationErrorResponse(
        'Title must be between 1 and 255 characters'
      );
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error?.code || 'VALIDATION_ERROR'),
      });
    }

    // Get the existing document
    const existingDocument = await prisma.document.findUnique({
      where: { id: documentId },
      select: { id: true, authorId: true, type: true, parentId: true },
    });

    if (!existingDocument) {
      const errorResponse = createNotFoundErrorResponse('Wiki item not found');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error?.code || 'VALIDATION_ERROR'),
      });
    }

    // Check permissions
    const isAuthor = existingDocument.authorId === authResult.context.userId;
    const isAdmin = authResult.context.roles?.includes('ADMIN');

    if (!isAuthor && !isAdmin) {
      const errorResponse = createUnauthorizedErrorResponse('You can only edit your own wiki items');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error?.code || 'VALIDATION_ERROR'),
      });
    }

    // Validate parent if provided
    if (parentId) {
      try {
        const parent = await prisma.document.findUnique({
          where: { id: parentId },
          select: { id: true, type: true, authorId: true },
        });

        if (!parent) {
          const errorResponse = createValidationErrorResponse('Parent folder not found');
          return NextResponse.json(errorResponse, {
            status: getHttpStatusForErrorCode(errorResponse.error?.code || 'VALIDATION_ERROR'),
          });
        }

        if (parent.type !== 'FOLDER') {
          const errorResponse = createValidationErrorResponse('Parent must be a folder');
          return NextResponse.json(errorResponse, {
            status: getHttpStatusForErrorCode(errorResponse.error?.code || 'VALIDATION_ERROR'),
          });
        }

        // Prevent circular references
        if (parentId === documentId) {
          const errorResponse = createValidationErrorResponse('Cannot set item as its own parent');
          return NextResponse.json(errorResponse, {
            status: getHttpStatusForErrorCode(errorResponse.error?.code || 'VALIDATION_ERROR'),
          });
        }

        // Check if user has access to the parent folder
        if (parent.authorId !== authResult.context.userId && !isAdmin) {
          const errorResponse = createUnauthorizedErrorResponse(
            'You do not have permission to move items to this folder'
          );
          return NextResponse.json(errorResponse, {
            status: getHttpStatusForErrorCode(errorResponse.error?.code || 'VALIDATION_ERROR'),
          });
        }
      } catch (dbError) {
        logger.error('Error validating parent folder', dbError as Error, {
          parentId,
          documentId,
          userId: authResult.context.userId,
          operation: 'PUT /api/wiki/[documentId]',
        }, 'api/wiki/[documentId]/route.ts');
        
        const errorResponse = createServerErrorResponse('Failed to validate parent folder');
        return NextResponse.json(errorResponse, {
          status: getHttpStatusForErrorCode(errorResponse.error?.code || 'VALIDATION_ERROR'),
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
      title: updatedDocument.title,
      type: updatedDocument.type,
      parentId: updatedDocument.parentId,
      userId: authResult.context.userId,
      operation: 'PUT /api/wiki/[documentId]',
      source: 'api/wiki/[documentId]/route.ts',
    });

    const successResponse = createSuccessResponse(updatedDocument);
    return NextResponse.json(successResponse, {
      status: HTTP_STATUS_CODES.OK,
    });

  } catch (error) {
    logger.error('Error updating wiki item', {
      error: error as Error,
      operation: 'PUT /api/wiki/[documentId]',
      source: 'api/wiki/[documentId]/route.ts',
    });
    
    const errorResponse = createServerErrorResponse('Internal server error');
    return NextResponse.json(errorResponse, {
      status: getHttpStatusForErrorCode(errorResponse.error?.code || 'VALIDATION_ERROR'),
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

    // Validate documentId
    if (!documentId || typeof documentId !== 'string') {
      const errorResponse = createValidationErrorResponse('Invalid document ID');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error?.code || 'VALIDATION_ERROR'),
      });
    }

    // Get the existing document
    const existingDocument = await prisma.document.findUnique({
      where: { id: documentId },
      select: { 
        id: true, 
        title: true, 
        type: true, 
        authorId: true, 
        filePublicId: true,
        parentId: true 
      },
    });

    if (!existingDocument) {
      const errorResponse = createNotFoundErrorResponse('Wiki item not found');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error?.code || 'VALIDATION_ERROR'),
      });
    }

    // Check permissions
    const isAuthor = existingDocument.authorId === authResult.context.userId;
    const isAdmin = authResult.context.roles?.includes('ADMIN');

    if (!isAuthor && !isAdmin) {
      const errorResponse = createUnauthorizedErrorResponse('You can only delete your own wiki items');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error?.code || 'VALIDATION_ERROR'),
      });
    }

    // If it's a folder, check if it has children
    if (existingDocument.type === 'FOLDER') {
      const children = await prisma.document.findMany({
        where: { parentId: documentId },
        select: { id: true, title: true },
      });

      if (children.length > 0) {
        const errorResponse = createValidationErrorResponse(
          `Cannot delete folder that contains ${children.length} item(s). Please delete or move all items first.`
        );
        return NextResponse.json(errorResponse, {
          status: getHttpStatusForErrorCode(errorResponse.error?.code || 'VALIDATION_ERROR'),
        });
      }
    }

    // Delete from Cloudinary if file exists
    if (existingDocument.filePublicId) {
      try {
        const { deleteFromCloudinary } = await import('@/lib/cloudinary');
        await deleteFromCloudinary(existingDocument.filePublicId);
        logger.info('File deleted from Cloudinary', {
          documentId,
          publicId: existingDocument.filePublicId,
          operation: 'DELETE /api/wiki/[documentId]',
          source: 'api/wiki/[documentId]/route.ts',
        });
      } catch (cloudinaryError) {
        logger.warn('Failed to delete file from Cloudinary', {
          error: cloudinaryError as Error,
          documentId: documentId,
          publicId: existingDocument.filePublicId,
          operation: 'DELETE /api/wiki/[documentId]',
          source: 'api/wiki/[documentId]/route.ts',
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
      title: existingDocument.title,
      type: existingDocument.type,
      userId: authResult.context.userId,
      operation: 'DELETE /api/wiki/[documentId]',
      source: 'api/wiki/[documentId]/route.ts',
    });

    const successResponse = createSuccessResponse({ id: documentId, deleted: true });
    return NextResponse.json(successResponse, {
      status: HTTP_STATUS_CODES.OK,
    });

  } catch (error) {
    logger.error('Error deleting wiki item', {
      error: error as Error,
      operation: 'DELETE /api/wiki/[documentId]',
      source: 'api/wiki/[documentId]/route.ts',
    });
    
    const errorResponse = createServerErrorResponse('Internal server error');
    return NextResponse.json(errorResponse, {
      status: getHttpStatusForErrorCode(errorResponse.error?.code || 'VALIDATION_ERROR'),
    });
  }
}
