import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth-middleware';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateMeetingSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  startTime: z.string().datetime('Invalid start time format').optional(),
  endTime: z.string().datetime('Invalid end time format').optional(),
  type: z.enum(['ONE_ON_ONE', 'TEAM_MEETING']).optional(),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED']).optional(),
  attendeeIds: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

// GET /api/meetings/[meetingId] - Get a specific meeting
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

    const meeting = await prisma.meeting.findUnique({
      where: { id: params.meetingId },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        talkingPoints: {
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
        },
        actionItems: {
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
        },
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

    // Check if user has access to this meeting
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

    return NextResponse.json({
      success: true,
      data: meeting,
    });
  } catch (error) {
    console.error('Error fetching meeting:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در دریافت جلسه',
      },
      { status: 500 }
    );
  }
}

// PUT /api/meetings/[meetingId] - Update a meeting
export async function PUT(
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
    const validationResult = updateMeetingSchema.safeParse(body);

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

    const { title, startTime, endTime, type, status, attendeeIds, notes } = validationResult.data;

    // Check if meeting exists and user has permission to update
    const existingMeeting = await prisma.meeting.findUnique({
      where: { id: params.meetingId },
      include: {
        attendees: true,
      },
    });

    if (!existingMeeting) {
      return NextResponse.json(
        {
          success: false,
          error: 'جلسه یافت نشد',
        },
        { status: 404 }
      );
    }

    // Only creator can update meeting details
    if (existingMeeting.creatorId !== context.userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'فقط سازنده جلسه می‌تواند آن را ویرایش کند',
        },
        { status: 403 }
      );
    }

    // Validate time constraints
    if (startTime && endTime && new Date(startTime) >= new Date(endTime)) {
      return NextResponse.json(
        {
          success: false,
          error: 'زمان شروع باید قبل از زمان پایان باشد',
        },
        { status: 400 }
      );
    }

    // Validate attendees if provided
    if (attendeeIds) {
      const attendees = await prisma.user.findMany({
        where: {
          id: { in: attendeeIds },
          isActive: true,
        },
        select: { id: true },
      });

      if (attendees.length !== attendeeIds.length) {
        return NextResponse.json(
          {
            success: false,
            error: 'برخی از شرکت‌کنندگان معتبر نیستند',
          },
          { status: 400 }
        );
      }
    }

    // Update meeting in transaction
    await prisma.$transaction(async (tx) => {
      // Update meeting
      const meeting = await tx.meeting.update({
        where: { id: params.meetingId },
        data: {
          ...(title && { title }),
          ...(startTime && { startTime: new Date(startTime) }),
          ...(endTime && { endTime: new Date(endTime) }),
          ...(type && { type }),
          ...(status && { status }),
          ...(notes !== undefined && { notes }),
        },
      });

      // Update attendees if provided
      if (attendeeIds) {
        // Remove existing attendees
        await tx.meetingAttendee.deleteMany({
          where: { meetingId: params.meetingId },
        });

        // Add new attendees
        await tx.meetingAttendee.createMany({
          data: attendeeIds.map((userId) => ({
            meetingId: params.meetingId,
            userId,
          })),
        });
      }

      return meeting;
    });

    // Fetch complete meeting with relations
    const completeMeeting = await prisma.meeting.findUnique({
      where: { id: params.meetingId },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        talkingPoints: {
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
        },
        actionItems: {
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
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: completeMeeting,
      message: 'جلسه با موفقیت به‌روزرسانی شد',
    });
  } catch (error) {
    console.error('Error updating meeting:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در به‌روزرسانی جلسه',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/meetings/[meetingId] - Delete a meeting
export async function DELETE(
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

    // Check if meeting exists and user has permission to delete
    const existingMeeting = await prisma.meeting.findUnique({
      where: { id: params.meetingId },
    });

    if (!existingMeeting) {
      return NextResponse.json(
        {
          success: false,
          error: 'جلسه یافت نشد',
        },
        { status: 404 }
      );
    }

    // Only creator can delete meeting
    if (existingMeeting.creatorId !== context.userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'فقط سازنده جلسه می‌تواند آن را حذف کند',
        },
        { status: 403 }
      );
    }

    await prisma.meeting.delete({
      where: { id: params.meetingId },
    });

    return NextResponse.json({
      success: true,
      message: 'جلسه با موفقیت حذف شد',
    });
  } catch (error) {
    console.error('Error deleting meeting:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در حذف جلسه',
      },
      { status: 500 }
    );
  }
}
