import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth-middleware';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createActionItemSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  assigneeId: z.string().min(1, 'Assignee is required'),
});


// GET /api/meetings/[meetingId]/action-items - Get action items for a meeting
export async function GET(
  request: NextRequest,
  { params }: { params: { meetingId: string } }
) {
  try {
    const { context, response } = await withAuth(request, {
      requiredRoles: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
    });

    if (response) {
      return response;
    }

    // Check if user has access to this meeting
    const meeting = await prisma.meeting.findUnique({
      where: { id: params.meetingId },
      include: {
        attendees: true,
      },
    });

    if (!meeting) {
      return NextResponse.json(
        {
          success: false,
          error: 'جلسه یافت نشد',
        },
        { status: 404 }
      );
    }

    const hasAccess = meeting.creatorId === context.userId || 
      meeting.attendees.some(attendee => attendee.userId === context.userId);

    if (!hasAccess) {
      return NextResponse.json(
        {
          success: false,
          error: 'شما دسترسی به این جلسه ندارید',
        },
        { status: 403 }
      );
    }

    const actionItems = await prisma.actionItem.findMany({
      where: { meetingId: params.meetingId },
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: actionItems,
    });
  } catch (error) {
    console.error('Error fetching action items:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در دریافت موارد اقدام',
      },
      { status: 500 }
    );
  }
}

// POST /api/meetings/[meetingId]/action-items - Create a new action item
export async function POST(
  request: NextRequest,
  { params }: { params: { meetingId: string } }
) {
  try {
    const { context, response } = await withAuth(request, {
      requiredRoles: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
    });

    if (response) {
      return response;
    }

    const body = await request.json();
    const validationResult = createActionItemSchema.safeParse(body);

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

    const { content, assigneeId } = validationResult.data;

    // Check if user has access to this meeting
    const meeting = await prisma.meeting.findUnique({
      where: { id: params.meetingId },
      include: {
        attendees: true,
      },
    });

    if (!meeting) {
      return NextResponse.json(
        {
          success: false,
          error: 'جلسه یافت نشد',
        },
        { status: 404 }
      );
    }

    const hasAccess = meeting.creatorId === context.userId || 
      meeting.attendees.some(attendee => attendee.userId === context.userId);

    if (!hasAccess) {
      return NextResponse.json(
        {
          success: false,
          error: 'شما دسترسی به این جلسه ندارید',
        },
        { status: 403 }
      );
    }

    // Validate that assignee exists and is active
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

    const actionItem = await prisma.actionItem.create({
      data: {
        meetingId: params.meetingId,
        content,
        assigneeId,
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
      data: actionItem,
      message: 'مورد اقدام با موفقیت اضافه شد',
    });
  } catch (error) {
    console.error('Error creating action item:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در ایجاد مورد اقدام',
      },
      { status: 500 }
    );
  }
}
