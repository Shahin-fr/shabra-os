import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth-middleware';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { context, response } = await withAuth(request, {
      requiredRoles: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
    });

    if (response) {
      return response;
    }

    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // First, try to get the next meeting for today
    const nextMeeting = await prisma.meeting.findFirst({
      where: {
        startTime: {
          gte: now,
        },
        status: 'SCHEDULED',
        OR: [
          { creatorId: context.userId },
          { attendees: { some: { userId: context.userId } } }
        ],
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    // If no meeting found, fall back to content slot
    let nextEvent = null;
    if (!nextMeeting) {
      nextEvent = await prisma.contentSlot.findFirst({
        where: {
          startDate: {
            gte: now,
          },
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          startDate: 'asc',
        },
      });
    }

    if (!nextMeeting && !nextEvent) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'جلسه جدیدی تنظیم نشده',
      });
    }

    // Return meeting if found, otherwise content slot
    const event = nextMeeting || nextEvent;
    const isMeeting = !!nextMeeting;
    
    if (!event) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'جلسه جدیدی تنظیم نشده',
      });
    }
    
    const eventStartTime = isMeeting ? (event as any).startTime : (event as any).startDate;
    const timeUntilEvent = Math.max(0, Math.ceil((eventStartTime.getTime() - now.getTime()) / (1000 * 60)));
    const isUpcoming = timeUntilEvent <= 60 && timeUntilEvent >= 0; // Within next hour and not past

    return NextResponse.json({
      success: true,
      data: {
        id: event.id,
        title: event.title,
        description: isMeeting ? (event as any).notes : (event as any).description,
        type: isMeeting ? ((event as any).type === 'ONE_ON_ONE' ? 'meeting' : 'team-meeting') : (event as any).type || 'event',
        startDate: (event as any).startTime || (event as any).startDate,
        endDate: (event as any).endTime || (event as any).endDate,
        location: isMeeting ? null : ((event as any).project ? (event as any).project.name : null),
        attendees: isMeeting ? (event as any).attendees?.length || 0 : null,
        project: !isMeeting && (event as any).project ? {
          id: (event as any).project.id,
          name: (event as any).project.name,
        } : null,
        timeUntilEvent,
        isUpcoming,
        timeLabel: getTimeLabel(timeUntilEvent),
      },
    });
  } catch (error) {
    console.error('Error fetching next event:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در دریافت رویداد بعدی',
      },
      { status: 500 }
    );
  }
}

function getTimeLabel(minutes: number): string {
  if (minutes <= 0) return 'الان';
  if (minutes < 60) return `${minutes} دقیقه دیگر`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours < 24) {
    return remainingMinutes > 0 
      ? `${hours} ساعت و ${remainingMinutes} دقیقه دیگر`
      : `${hours} ساعت دیگر`;
  }
  
  const days = Math.floor(hours / 24);
  return `${days} روز دیگر`;
}
