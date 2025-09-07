import { NextRequest, NextResponse } from 'next/server';

import {
  createSuccessResponse,
  createNotFoundErrorResponse,
  createServerErrorResponse,
  HTTP_STATUS_CODES,
  getHttpStatusForErrorCode,
} from '@/lib/api/response-utils';
import { prismaLocal as prisma } from '@/lib/prisma-local';

// GET /api/content-slots/[contentSlotId] - Get a specific content slot
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ contentSlotId: string }> }
) {
  try {
    const { contentSlotId } = await params;

    const contentSlot = await prisma.contentSlot.findUnique({
      where: { id: contentSlotId },
    });

    if (!contentSlot) {
      const errorResponse = createNotFoundErrorResponse();
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    return NextResponse.json(contentSlot);
  } catch {
    const errorResponse = createServerErrorResponse(
      'Failed to fetch content slot'
    );
    return NextResponse.json(errorResponse, {
      status: getHttpStatusForErrorCode(errorResponse.error.code),
    });
  }
}

// PATCH /api/content-slots/[contentSlotId] - Update a content slot
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ contentSlotId: string }> }
) {
  try {
    const { contentSlotId } = await params;
    const body = await request.json();

    // Check if content slot exists
    const existingSlot = await prisma.contentSlot.findUnique({
      where: { id: contentSlotId },
    });

    if (!existingSlot) {
      const errorResponse = createNotFoundErrorResponse();
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Update the content slot
    const updateData: {
      title?: string;
      projectId?: string;
      startDate?: Date;
      endDate?: Date;
      description?: string;
      type?: string;
    } = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.projectId !== undefined) updateData.projectId = body.projectId;
    if (body.startDate !== undefined)
      updateData.startDate = new Date(body.startDate);
    if (body.endDate !== undefined) updateData.endDate = new Date(body.endDate);
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.type !== undefined) updateData.type = body.type;

    const updatedSlot = await prisma.contentSlot.update({
      where: { id: contentSlotId },
      data: updateData,
    });

    const successResponse = createSuccessResponse(updatedSlot);
    return NextResponse.json(successResponse, {
      status: HTTP_STATUS_CODES.OK,
    });
  } catch {
    const errorResponse = createServerErrorResponse(
      'Failed to update content slot'
    );
    return NextResponse.json(errorResponse, {
      status: getHttpStatusForErrorCode(errorResponse.error.code),
    });
  }
}

// DELETE /api/content-slots/[contentSlotId] - Delete a content slot
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ contentSlotId: string }> }
) {
  try {
    const { contentSlotId } = await params;

    // Check if content slot exists
    const existingSlot = await prisma.contentSlot.findUnique({
      where: { id: contentSlotId },
    });

    if (!existingSlot) {
      const errorResponse = createNotFoundErrorResponse();
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Delete the content slot
    await prisma.contentSlot.delete({
      where: { id: contentSlotId },
    });

    const successResponse = createSuccessResponse({
      message: 'Content slot deleted successfully',
    });
    return NextResponse.json(successResponse, { status: HTTP_STATUS_CODES.OK });
  } catch {
    const errorResponse = createServerErrorResponse(
      'Failed to delete content slot'
    );
    return NextResponse.json(errorResponse, {
      status: getHttpStatusForErrorCode(errorResponse.error.code),
    });
  }
}
