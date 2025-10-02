import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth-middleware';
import { prisma } from '@/lib/prisma';

// Optimized GET /api/meetings/optimized - Get meetings with better performance
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
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build optimized where clause
    const whereClause: any = {
      OR: [
        { creatorId: context.userId },
        { attendees: { some: { userId: context.userId } } },
      ],
    };

    // Add date filters if provided
    if (startDate && endDate) {
      whereClause.startTime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // Add type filter if provided
    if (type && ['ONE_ON_ONE', 'TEAM_MEETING'].includes(type)) {
      whereClause.type = type;
    }

    // Optimized query with selective includes and pagination
    const [meetings, totalCount] = await Promise.all([
      prisma.meeting.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          startTime: true,
          endTime: true,
          type: true,
          status: true,
          notes: true,
          createdAt: true,
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          attendees: {
            select: {
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
          _count: {
            select: {
              talkingPoints: true,
              actionItems: true,
            },
          },
        },
        orderBy: { startTime: 'asc' },
        take: limit,
        skip: offset,
      }),
      prisma.meeting.count({ where: whereClause }),
    ]);

    // Transform data for better performance
    const transformedMeetings = meetings.map(meeting => ({
      ...meeting,
      attendees: meeting.attendees.map(attendee => attendee.user),
      talkingPointsCount: meeting._count.talkingPoints,
      actionItemsCount: meeting._count.actionItems,
    }));

    return NextResponse.json({
      success: true,
      data: transformedMeetings,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });

  } catch (error) {
    console.error('Error fetching optimized meetings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطا در بارگذاری جلسات',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}
