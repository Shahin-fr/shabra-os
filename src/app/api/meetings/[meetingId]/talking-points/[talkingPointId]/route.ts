import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth-middleware';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateTalkingPointSchema = z.object({
  content: z.string().min(1, 'Content is required').optional(),
  isCompleted: z.boolean().optional(),
});

// PUT /api/meetings/[meetingId]/talking-points/[talkingPointId] - Update a talking point
export async function PUT(
  request: NextRequest,
  { params }: { params: { meetingId: string; talkingPointId: string } }
) {
  try {
    const { context, response } = await withAuth(request, {
      requiredRoles: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
    });

    if (response) {
      return response;
    }

    const body = await request.json();
    const validationResult = updateTalkingPointSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input data',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { content, isCompleted } = validationResult.data;

    // Check if talking point exists and user has access to the meeting
    const talkingPoint = await prisma.talkingPoint.findUnique({
      where: { id: params.talkingPointId },
      include: {
        meeting: {
          include: {
            attendees: true,
          },
        },
      },
    });

    if (!talkingPoint) {
      return NextResponse.json(
        {
          success: false,
          error: 'نکته گفتگو یافت نشد',
        },
        { status: 404 }
      );
    }

    // Check if user has access to this meeting
    const hasAccess = talkingPoint.meeting.creatorId === context.userId || 
      talkingPoint.meeting.attendees.some(attendee => attendee.userId === context.userId);

    if (!hasAccess) {
      return NextResponse.json(
        {
          success: false,
          error: 'شما دسترسی به این جلسه ندارید',
        },
        { status: 403 }
      );
    }

    const updatedTalkingPoint = await prisma.talkingPoint.update({
      where: { id: params.talkingPointId },
      data: {
        ...(content && { content }),
        ...(isCompleted !== undefined && { isCompleted }),
      },
      include: {
        addedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedTalkingPoint,
      message: 'نکته گفتگو با موفقیت به‌روزرسانی شد',
    });
  } catch (error) {
    console.error('Error updating talking point:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در به‌روزرسانی نکته گفتگو',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/meetings/[meetingId]/talking-points/[talkingPointId] - Delete a talking point
export async function DELETE(
  request: NextRequest,
  { params }: { params: { meetingId: string; talkingPointId: string } }
) {
  try {
    const { context, response } = await withAuth(request, {
      requiredRoles: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
    });

    if (response) {
      return response;
    }

    // Check if talking point exists and user has access to the meeting
    const talkingPoint = await prisma.talkingPoint.findUnique({
      where: { id: params.talkingPointId },
      include: {
        meeting: {
          include: {
            attendees: true,
          },
        },
      },
    });

    if (!talkingPoint) {
      return NextResponse.json(
        {
          success: false,
          error: 'نکته گفتگو یافت نشد',
        },
        { status: 404 }
      );
    }

    // Check if user has access to this meeting
    const hasAccess = talkingPoint.meeting.creatorId === context.userId || 
      talkingPoint.meeting.attendees.some(attendee => attendee.userId === context.userId);

    if (!hasAccess) {
      return NextResponse.json(
        {
          success: false,
          error: 'شما دسترسی به این جلسه ندارید',
        },
        { status: 403 }
      );
    }

    await prisma.talkingPoint.delete({
      where: { id: params.talkingPointId },
    });

    return NextResponse.json({
      success: true,
      message: 'نکته گفتگو با موفقیت حذف شد',
    });
  } catch (error) {
    console.error('Error deleting talking point:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در حذف نکته گفتگو',
      },
      { status: 500 }
    );
  }
}
