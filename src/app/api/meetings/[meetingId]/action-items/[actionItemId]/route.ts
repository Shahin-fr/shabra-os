import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth-middleware';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateActionItemSchema = z.object({
  content: z.string().min(1, 'Content is required').optional(),
  assigneeId: z.string().min(1, 'Assignee is required').optional(),
  isCompleted: z.boolean().optional(),
});

// PUT /api/meetings/[meetingId]/action-items/[actionItemId] - Update an action item
export async function PUT(
  request: NextRequest,
  { params }: { params: { meetingId: string; actionItemId: string } }
) {
  try {
    const { context, response } = await withAuth(request, {
      requiredRoles: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
    });

    if (response) {
      return response;
    }

    const body = await request.json();
    const validationResult = updateActionItemSchema.safeParse(body);

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

    const { content, assigneeId, isCompleted } = validationResult.data;

    // Check if action item exists and user has access to the meeting
    const actionItem = await prisma.actionItem.findUnique({
      where: { id: params.actionItemId },
      include: {
        meeting: {
          include: {
            attendees: true,
          },
        },
      },
    });

    if (!actionItem) {
      return NextResponse.json(
        {
          success: false,
          error: 'مورد اقدام یافت نشد',
        },
        { status: 404 }
      );
    }

    // Check if user has access to this meeting
    const hasAccess = actionItem.meeting.creatorId === context.userId || 
      actionItem.meeting.attendees.some(attendee => attendee.userId === context.userId);

    if (!hasAccess) {
      return NextResponse.json(
        {
          success: false,
          error: 'شما دسترسی به این جلسه ندارید',
        },
        { status: 403 }
      );
    }

    // Validate assignee if provided
    if (assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: {
          id: assigneeId,
          isActive: true,
        },
        select: { id: true },
      });

      if (!assignee) {
        return NextResponse.json(
          {
            success: false,
            error: 'مسئول انتخاب شده معتبر نیست',
          },
          { status: 400 }
        );
      }
    }

    const updatedActionItem = await prisma.actionItem.update({
      where: { id: params.actionItemId },
      data: {
        ...(content && { content }),
        ...(assigneeId && { assigneeId }),
        ...(isCompleted !== undefined && { isCompleted }),
      },
      include: {
        assignee: {
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
      data: updatedActionItem,
      message: 'مورد اقدام با موفقیت به‌روزرسانی شد',
    });
  } catch (error) {
    console.error('Error updating action item:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در به‌روزرسانی مورد اقدام',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/meetings/[meetingId]/action-items/[actionItemId] - Delete an action item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { meetingId: string; actionItemId: string } }
) {
  try {
    const { context, response } = await withAuth(request, {
      requiredRoles: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
    });

    if (response) {
      return response;
    }

    // Check if action item exists and user has access to the meeting
    const actionItem = await prisma.actionItem.findUnique({
      where: { id: params.actionItemId },
      include: {
        meeting: {
          include: {
            attendees: true,
          },
        },
      },
    });

    if (!actionItem) {
      return NextResponse.json(
        {
          success: false,
          error: 'مورد اقدام یافت نشد',
        },
        { status: 404 }
      );
    }

    // Check if user has access to this meeting
    const hasAccess = actionItem.meeting.creatorId === context.userId || 
      actionItem.meeting.attendees.some(attendee => attendee.userId === context.userId);

    if (!hasAccess) {
      return NextResponse.json(
        {
          success: false,
          error: 'شما دسترسی به این جلسه ندارید',
        },
        { status: 403 }
      );
    }

    await prisma.actionItem.delete({
      where: { id: params.actionItemId },
    });

    return NextResponse.json({
      success: true,
      message: 'مورد اقدام با موفقیت حذف شد',
    });
  } catch (error) {
    console.error('Error deleting action item:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در حذف مورد اقدام',
      },
      { status: 500 }
    );
  }
}
