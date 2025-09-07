import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import {
  createSuccessResponse,
  createAuthErrorResponse,
  createAuthorizationErrorResponse,
  createNotFoundErrorResponse,
  createServerErrorResponse,
  HTTP_STATUS_CODES,
  getHttpStatusForErrorCode,
} from '@/lib/api/response-utils';
import { logger } from '@/lib/logger';
import { prismaLocal as prisma } from '@/lib/prisma-local';

// GET /api/wiki/[documentId] - Get specific document
export async function GET(
  _request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      const errorResponse = createAuthErrorResponse('Unauthorized');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    const { documentId } = params;

    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      const errorResponse = createNotFoundErrorResponse();
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Check access permissions
    if (!document.isPublic) {
      // Fetch author to check permissions
      const author = await prisma.user.findUnique({
        where: { id: document.authorId },
        select: { email: true },
      });

      if (author?.email !== session.user.email) {
        const errorResponse = createAuthorizationErrorResponse('Access denied');
        return NextResponse.json(errorResponse, {
          status: getHttpStatusForErrorCode(errorResponse.error.code),
        });
      }
    }

    // Convert content to HTML if it's markdown
    let htmlContent = document.content;
    if (document.content && document.type === 'DOCUMENT') {
      // TODO: Add markdown to HTML conversion
      // For now, just return the raw content
      htmlContent = document.content;
    }

    const response = {
      ...document,
      content: htmlContent,
      tags: [], // TODO: Add tags support
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Error fetching document:', error as Error);
    const errorResponse = createServerErrorResponse('Internal server error');
    return NextResponse.json(errorResponse, {
      status: getHttpStatusForErrorCode(errorResponse.error.code),
    });
  }
}

// PUT /api/wiki/[documentId] - Update document
export async function PUT(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      const errorResponse = createAuthErrorResponse('Unauthorized');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    const { documentId } = params;
    const body = await request.json();

    // Check if user owns the document
    const existingDocument = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!existingDocument) {
      const errorResponse = createNotFoundErrorResponse();
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Fetch author to check permissions
    const author = await prisma.user.findUnique({
      where: { id: existingDocument.authorId },
      select: { email: true },
    });

    if (author?.email !== session.user.email) {
      const errorResponse = createAuthorizationErrorResponse('Access denied');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Update the document
    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        title: body.title,
        content: body.content,
        type: body.type,
        parentId: body.parentId,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedDocument);
  } catch (error) {
    logger.error('Error updating document:', error as Error);
    const errorResponse = createServerErrorResponse('Internal server error');
    return NextResponse.json(errorResponse, {
      status: getHttpStatusForErrorCode(errorResponse.error.code),
    });
  }
}

// DELETE /api/wiki/[documentId] - Delete document
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      const errorResponse = createAuthErrorResponse('Unauthorized');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    const { documentId } = params;

    // Check if user owns the document
    const existingDocument = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!existingDocument) {
      const errorResponse = createNotFoundErrorResponse();
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Fetch author to check permissions
    const author = await prisma.user.findUnique({
      where: { id: existingDocument.authorId },
      select: { email: true },
    });

    if (author?.email !== session.user.email) {
      const errorResponse = createAuthorizationErrorResponse('Access denied');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Check if document has children
    const childrenCount = await prisma.document.count({
      where: { parentId: documentId },
    });

    if (childrenCount > 0) {
      return NextResponse.json(
        {
          error:
            'Cannot delete document with children. Move or delete children first.',
        },
        { status: 400 }
      );
    }

    // Delete the document
    await prisma.document.delete({
      where: { id: documentId },
    });

    const successResponse = createSuccessResponse({ success: true });
    return NextResponse.json(successResponse, { status: HTTP_STATUS_CODES.OK });
  } catch (error) {
    logger.error('Error deleting document:', error as Error);
    const errorResponse = createServerErrorResponse('Internal server error');
    return NextResponse.json(errorResponse, {
      status: getHttpStatusForErrorCode(errorResponse.error.code),
    });
  }
}
