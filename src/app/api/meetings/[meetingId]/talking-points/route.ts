import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth-middleware';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createTalkingPointSchema = z.object({
  content: z.string().min(1, 'Content is required'),
});


// GET /api/meetings/[meetingId]/talking-points - Get talking points for a meeting
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

    const talkingPoints = await prisma.talkingPoint.findMany({
      where: { meetingId: params.meetingId },
      include: {
        addedBy: {
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
      data: talkingPoints,
    });
  } catch (error) {
    console.error('Error fetching talking points:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در دریافت نکات گفتگو',
      },
      { status: 500 }
    );
  }
}

// POST /api/meetings/[meetingId]/talking-points - Create a new talking point
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
    const validationResult = createTalkingPointSchema.safeParse(body);

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

    const { content } = validationResult.data;

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

    const talkingPoint = await prisma.talkingPoint.create({
      data: {
        meetingId: params.meetingId,
        content,
        addedById: context.userId,
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
      data: talkingPoint,
      message: 'نکته گفتگو با موفقیت اضافه شد',
    });
  } catch (error) {
    console.error('Error creating talking point:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در ایجاد نکته گفتگو',
      },
      { status: 500 }
    );
  }
}
