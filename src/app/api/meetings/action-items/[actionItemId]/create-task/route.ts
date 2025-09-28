import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth-middleware';
import { prisma } from '@/lib/prisma';

// POST /api/meetings/action-items/[actionItemId]/create-task - Convert action item to task
export async function POST(
  request: NextRequest,
  { params }: { params: { actionItemId: string } }
) {
  try {
    const { context, response } = await withAuth(request, {
      requiredRoles: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
    });

    if (response) {
      return response;
    }

    // Get the action item with meeting details
    const actionItem = await prisma.actionItem.findUnique({
      where: { id: params.actionItemId },
      include: {
        meeting: {
          include: {
            attendees: true,
          },
        },
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
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

    // Check if task already exists for this action item
    if (actionItem.relatedTaskId) {
      return NextResponse.json(
        {
          success: false,
          error: 'تسک قبلاً برای این مورد اقدام ایجاد شده است',
        },
        { status: 400 }
      );
    }

    // Create the task in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the task
      const task = await tx.task.create({
        data: {
          title: actionItem.content,
          description: `مورد اقدام از جلسه: ${actionItem.meeting.title}`,
          createdBy: context.userId,
          assignedTo: actionItem.assigneeId,
          status: 'Todo',
        },
      });

      // Update the action item with the related task ID
      const updatedActionItem = await tx.actionItem.update({
        where: { id: params.actionItemId },
        data: {
          relatedTaskId: task.id,
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

      return { task, actionItem: updatedActionItem };
    });

    return NextResponse.json({
      success: true,
      data: {
        task: result.task,
        actionItem: result.actionItem,
      },
      message: 'تسک با موفقیت ایجاد شد و به مورد اقدام مرتبط شد',
    });
  } catch (error) {
    console.error('Error creating task from action item:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در ایجاد تسک از مورد اقدام',
      },
      { status: 500 }
    );
  }
}
