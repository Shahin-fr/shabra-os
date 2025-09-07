import { NextRequest, NextResponse } from 'next/server';

import {
  createValidationErrorResponse,
  createNotFoundErrorResponse,
  createServerErrorResponse,
  HTTP_STATUS_CODES,
  getHttpStatusForErrorCode,
} from '@/lib/api/response-utils';
import { prismaLocal as prisma } from '@/lib/prisma-local';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storyId: string }> }
) {
  try {
    // Add authorization check
    const { withAuth } = await import('@/lib/middleware/auth-middleware');

    // Check authentication
    const authResult = await withAuth(request);
    if (authResult.response) {
      return authResult.response;
    }

    const { storyId } = await params;

    // Get the story with all related data
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      include: {
        storyType: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
        storyIdea: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            storyType: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!story) {
      const errorResponse = createNotFoundErrorResponse();
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    return NextResponse.json(story);
  } catch {
    const errorResponse = createServerErrorResponse('خطا در دریافت استوری');
    return NextResponse.json(errorResponse, {
      status: getHttpStatusForErrorCode(errorResponse.error.code),
    });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ storyId: string }> }
) {
  try {
    // Add authorization check
    const { withAuth } = await import('@/lib/middleware/auth-middleware');

    // Check authentication
    const authResult = await withAuth(request);
    if (authResult.response) {
      return authResult.response;
    }

    const { storyId } = await params;
    const body = await request.json();
    const { title, notes, visualNotes, link, order, storyTypeId, storyIdeaId, status } =
      body;

    // Check if story exists
    const existingStory = await prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!existingStory) {
      const errorResponse = createNotFoundErrorResponse();
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Prepare update data
    const updateData: {
      title?: string;
      notes?: string | null;
      visualNotes?: string | null;
      link?: string | null;
      storyTypeId?: string | null;
      storyIdeaId?: string | null;
      order?: number;
      status?: string;
    } = {};

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        const errorResponse = createValidationErrorResponse(
          'عنوان استوری نمی‌تواند خالی باشد'
        );
        return NextResponse.json(errorResponse, {
          status: getHttpStatusForErrorCode(errorResponse.error.code),
        });
      }
      updateData.title = title.trim();
    }

    if (notes !== undefined) {
      updateData.notes = notes?.trim() || null;
    }

    if (visualNotes !== undefined) {
      updateData.visualNotes = visualNotes?.trim() || null;
    }

    if (link !== undefined) {
      updateData.link = link?.trim() || null;
    }

    if (storyTypeId !== undefined) {
      if (storyTypeId) {
        // Verify story type exists
        const storyType = await prisma.storyType.findUnique({
          where: { id: storyTypeId },
        });

        if (!storyType) {
          const errorResponse = createNotFoundErrorResponse();
          return NextResponse.json(errorResponse, {
            status: getHttpStatusForErrorCode(errorResponse.error.code),
          });
        }
      }
      updateData.storyTypeId = storyTypeId || null;
    }

    if (storyIdeaId !== undefined) {
      if (storyIdeaId) {
        // Check if storyIdeaId is actually a story idea name
        const storyIdea = await prisma.storyIdea.findFirst({
          where: {
            OR: [
              { id: storyIdeaId },
              { title: storyIdeaId }
            ]
          },
          select: { id: true, title: true }
        });
        
        if (storyIdea) {
          updateData.storyIdeaId = storyIdea.id;
          console.log('🔄 Fixed story idea ID:', storyIdea.id, 'for:', storyIdea.title);
        } else {
          console.log('⚠️ Story idea not found:', storyIdeaId);
          updateData.storyIdeaId = null;
        }
      } else {
        updateData.storyIdeaId = null;
      }
    }

    if (order !== undefined) {
      if (typeof order !== 'number' || order < 0) {
        const errorResponse = createValidationErrorResponse(
          'ترتیب باید عدد مثبت باشد'
        );
        return NextResponse.json(errorResponse, {
          status: getHttpStatusForErrorCode(errorResponse.error.code),
        });
      }
      updateData.order = order;
    }

    if (status !== undefined) {
      if (
        typeof status !== 'string' ||
        !['DRAFT', 'READY', 'PUBLISHED'].includes(status)
      ) {
        const errorResponse = createValidationErrorResponse(
          'وضعیت باید یکی از مقادیر DRAFT، READY یا PUBLISHED باشد'
        );
        return NextResponse.json(errorResponse, {
          status: getHttpStatusForErrorCode(errorResponse.error.code),
        });
      }
      updateData.status = status;
    }

    // Update the story
    const updatedStory = await prisma.story.update({
      where: { id: storyId },
      data: updateData,
      include: {
        storyType: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
        storyIdea: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            storyType: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(updatedStory);
  } catch {
    const errorResponse = createServerErrorResponse('خطا در بروزرسانی استوری');
    return NextResponse.json(errorResponse, {
      status: getHttpStatusForErrorCode(errorResponse.error.code),
    });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ storyId: string }> }
) {
  try {
    // Add authorization check
    const { withAuth } = await import('@/lib/middleware/auth-middleware');

    // Check authentication
    const authResult = await withAuth(request);
    if (authResult.response) {
      return authResult.response;
    }

    const { storyId } = await params;

    // Check if story exists
    const existingStory = await prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!existingStory) {
      const errorResponse = createNotFoundErrorResponse();
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Delete the story
    await prisma.story.delete({
      where: { id: storyId },
    });

    // Return success response with the deleted story ID
    return NextResponse.json(
      {
        success: true,
        message: 'استوری با موفقیت حذف شد',
        deletedId: storyId,
      },
      { status: HTTP_STATUS_CODES.OK }
    );
  } catch (_error) {
    const errorResponse = createServerErrorResponse('خطا در حذف استوری');
    return NextResponse.json(errorResponse, {
      status: getHttpStatusForErrorCode(errorResponse.error.code),
    });
  }
}
