import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth-middleware';
import { prisma } from '@/lib/prisma';
import { 
  ApiResponseBuilder,
  MeetingDTO,
  CreateMeetingDTO,
  MeetingEntity,
  entityToDTO,
  validateCreateDTO,
  CreateMeetingDTOSchema
} from '@/types';
import { parsePaginationParams, executePaginatedQuery } from '@/lib/database/pagination';
import { CommonSelects, createSearchConditions, createDateRangeFilter } from '@/lib/database/query-optimizer';


// GET /api/meetings - Get meetings for the logged-in user
export async function GET(request: NextRequest) {
  try {
    const { context, response } = await withAuth(request, {
      requiredRoles: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
    });

    if (response) {
      return response;
    }

    // Parse pagination and filter parameters
    const { searchParams } = new URL(request.url);
    const paginationParams = parsePaginationParams(searchParams);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    // Build where clause
    let whereClause: any = {
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

    if (status) {
      whereClause.status = status;
    }

    // Add search functionality
    if (paginationParams.search) {
      const searchConditions = createSearchConditions(
        paginationParams.search,
        ['title', 'notes']
      );
      if (searchConditions) {
        whereClause = { ...whereClause, ...searchConditions };
      }
    }

    // Execute paginated query
    const result = await executePaginatedQuery(
      prisma.meeting,
      paginationParams,
      whereClause,
      {
        creator: {
          select: CommonSelects.userMinimal,
        },
        attendees: {
          include: {
            user: {
              select: CommonSelects.userMinimal,
            },
          },
        },
      }
    );

    // Transform entities to DTOs
    const meetingDTOs: MeetingDTO[] = result.data.map(meeting => 
      entityToDTO(meeting as MeetingEntity) as unknown as MeetingDTO
    );

    return ApiResponseBuilder.success({
      data: meetingDTOs,
      pagination: result.pagination,
    }, 'Meetings retrieved successfully');
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return ApiResponseBuilder.internalError('Failed to fetch meetings');
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
    
    console.log("3. Validating request body with new type system...");
    const createMeetingData = validateCreateDTO(body, CreateMeetingDTOSchema) as CreateMeetingDTO;

    console.log("✅ Validation passed");
    const { title, startTime, endTime, type, notes } = createMeetingData;
    
    // Extract attendeeIds from the request body if provided
    const { attendeeIds } = body;
    
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
    if (type && !validTypes.includes(type)) {
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
        const attendeeData = attendeeIds.map((userId: string) => ({
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
    
    // Transform entity to DTO
    const meetingDTO = entityToDTO(completeMeeting as MeetingEntity);
    
    return ApiResponseBuilder.created(meetingDTO, 'Meeting created successfully');
  } catch (error) {
    console.error("!!! MEETING CREATION FAILED !!!", error);
    console.error("Error details:", {
      name: (error as Error).name,
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    
    return ApiResponseBuilder.internalError('Failed to create meeting');
  }
}
