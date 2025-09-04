import { NextRequest, NextResponse } from 'next/server';

import {
  createValidationErrorResponse,
  createNotFoundErrorResponse,
  createServerErrorResponse,
  HTTP_STATUS_CODES,
  getHttpStatusForErrorCode,
} from '@/lib/api/response-utils';
import { prisma } from '@/lib/prisma';

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
    const { title, notes, visualNotes, link, order, storyTypeId, status } =
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
  } catch (error) {
    const errorResponse = createServerErrorResponse('خطا در حذف استوری');
    return NextResponse.json(errorResponse, {
      status: getHttpStatusForErrorCode(errorResponse.error.code),
    });
  }
}
