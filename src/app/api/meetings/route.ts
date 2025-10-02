import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth-middleware';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createMeetingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  startTime: z.string().datetime('Invalid start time format'),
  endTime: z.string().datetime('Invalid end time format'),
  type: z.enum(['ONE_ON_ONE', 'TEAM_MEETING']).default('ONE_ON_ONE'),
  attendeeIds: z.array(z.string()).optional().default([]),
  notes: z.string().optional(),
});


// GET /api/meetings - Get meetings for the logged-in user
export async function GET(request: NextRequest) {
  try {
    const { context, response } = await withAuth(request, {
      requiredRoles: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
    });

    if (response) {
      return response;
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type');

    // Build where clause
    const whereClause: any = {
      OR: [
        { creatorId: context.userId },
        { attendees: { some: { userId: context.userId } } }
      ]
    };

    if (startDate && endDate) {
      whereClause.startTime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (type) {
      whereClause.type = type;
    }

    // Optimized query with pagination and selective loading
    const meetings = await prisma.meeting.findMany({
      where: whereClause,
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
        // Only load talking points and action items if specifically requested
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
          take: 10, // Limit to recent items for performance
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
          take: 10, // Limit to recent items for performance
        },
      },
      orderBy: { startTime: 'asc' },
      take: 50, // Limit total meetings for performance
    });

    return NextResponse.json({
      success: true,
      data: meetings,
    });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در دریافت جلسات',
      },
      { status: 500 }
    );
  }
}

// POST /api/meetings - Create a new meeting
export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Starting meeting creation process...");
    
    const { context, response } = await withAuth(request, {
      requiredRoles: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
    });

    if (response) {
      console.log("❌ Auth failed:", response);
      return response;
    }

    const body = await request.json();
    console.log("1. Received request body:", body);
    
    console.log("2. Session data - User ID:", context.userId);
    
    console.log("3. Validating request body with Zod schema...");
    const validationResult = createMeetingSchema.safeParse(body);

    if (!validationResult.success) {
      console.log("❌ Zod validation failed:", validationResult.error.errors);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input data',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    console.log("✅ Zod validation passed");
    const { title, startTime, endTime, type, attendeeIds, notes } = validationResult.data;
    
    console.log("Validated data:", {
      title,
      startTime,
      endTime,
      type,
      attendeeIds,
      notes
    });

    console.log("4. Validating time constraints...");
    // Validate that start time is before end time
    if (new Date(startTime) >= new Date(endTime)) {
      console.log("❌ Time validation failed: start time >= end time");
      return NextResponse.json(
        {
          success: false,
          error: 'زمان شروع باید قبل از زمان پایان باشد',
        },
        { status: 400 }
      );
    }

    console.log("5. Validating creator exists...");
    // Validate that creator exists
    const creator = await prisma.user.findUnique({
      where: {
        id: context.userId,
        isActive: true,
      },
      select: { id: true },
    });

    if (!creator) {
      console.log("❌ Creator validation failed: creator not found or inactive");
      return NextResponse.json(
        {
          success: false,
          error: 'کاربر سازنده جلسه معتبر نیست',
        },
        { status: 400 }
      );
    }

    console.log("6. Validating attendees...");
    // Validate that attendees exist (only if attendeeIds is provided and not empty)
    if (attendeeIds && attendeeIds.length > 0) {
      const attendees = await prisma.user.findMany({
        where: {
          id: { in: attendeeIds },
          isActive: true,
        },
        select: { id: true },
      });

      console.log("Found attendees:", attendees.length, "Expected:", attendeeIds.length);

      if (attendees.length !== attendeeIds.length) {
        console.log("❌ Attendee validation failed: not all attendees found");
        return NextResponse.json(
          {
            success: false,
            error: 'برخی از شرکت‌کنندگان معتبر نیستند',
          },
          { status: 400 }
        );
      }
    } else {
      console.log("No attendees specified - meeting will be created without attendees");
    }

    console.log("7. Preparing data for Prisma...");
    console.log("Raw type value:", type, "Type of type:", typeof type);
    console.log("Raw startTime:", startTime, "Parsed:", new Date(startTime));
    console.log("Raw endTime:", endTime, "Parsed:", new Date(endTime));
    
    // Validate enum values
    const validTypes = ['ONE_ON_ONE', 'TEAM_MEETING'];
    if (!validTypes.includes(type)) {
      console.error("❌ Invalid meeting type:", type);
      return NextResponse.json({
        success: false,
        error: `نوع جلسه نامعتبر: ${type}. باید یکی از موارد زیر باشد: ${validTypes.join(', ')}`,
      }, { status: 400 });
    }
    
    const dataToSave = {
      title,
      creatorId: context.userId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      type: type as 'ONE_ON_ONE' | 'TEAM_MEETING',
      notes: notes || null,
    };
    
    console.log("3. Data prepared for Prisma:", dataToSave);

    console.log("8. Testing database connection...");
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log("✅ Database connection successful");
    } catch (dbError) {
      console.error("❌ Database connection failed:", dbError);
      return NextResponse.json({
        success: false,
        error: 'خطا در اتصال به پایگاه داده',
        details: process.env.NODE_ENV === 'development' ? (dbError as Error).message : undefined,
      }, { status: 500 });
    }

    console.log("9. Starting Prisma transaction...");
    // Create meeting with attendees in a transaction
    const meeting = await prisma.$transaction(async (tx) => {
      console.log("10. Creating meeting record...");
      const newMeeting = await tx.meeting.create({
        data: dataToSave,
      });

      console.log("11. Prisma create response:", newMeeting);

      console.log("12. Adding attendees...");
      // Add attendees (only if attendeeIds is provided and not empty)
      if (attendeeIds && attendeeIds.length > 0) {
        const attendeeData = attendeeIds.map((userId) => ({
          meetingId: newMeeting.id,
          userId,
        }));
        
        console.log("Attendee data to create:", attendeeData);
        
        await tx.meetingAttendee.createMany({
          data: attendeeData,
        });
        console.log("✅ Attendees added successfully");
      } else {
        console.log("No attendees to add - skipping attendee creation");
      }

      return newMeeting;
    });

    console.log("13. Transaction completed, fetching complete meeting...");
    // Fetch the complete meeting with relations
    const completeMeeting = await prisma.meeting.findUnique({
      where: { id: meeting.id },
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
        talkingPoints: true,
        actionItems: true,
      },
    });

    console.log("✅ Meeting created successfully:", completeMeeting?.id);
    return NextResponse.json({
      success: true,
      data: completeMeeting,
      message: 'جلسه با موفقیت ایجاد شد',
    });
  } catch (error) {
    console.error("!!! MEETING CREATION FAILED !!!", error);
    console.error("Error details:", {
      name: (error as Error).name,
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در ایجاد جلسه',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    );
  }
}
