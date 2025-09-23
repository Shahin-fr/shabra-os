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

    // Get the next event from content calendar
    const nextEvent = await prisma.contentSlot.findFirst({
      where: {
        startDate: {
          gte: now,
          lte: endOfDay,
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

    // Get today's meetings (if you have a meetings table, otherwise return null)
    // For now, we'll return the next content slot as the "next event"
    
    if (!nextEvent) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'رویداد بعدی برای امروز وجود ندارد',
      });
    }

    const timeUntilEvent = Math.ceil((nextEvent.startDate.getTime() - now.getTime()) / (1000 * 60));
    const isUpcoming = timeUntilEvent <= 60; // Within next hour

    return NextResponse.json({
      success: true,
      data: {
        id: nextEvent.id,
        title: nextEvent.title,
        description: nextEvent.description,
        type: nextEvent.type,
        startDate: nextEvent.startDate,
        endDate: nextEvent.endDate,
        project: nextEvent.project ? {
          id: nextEvent.project.id,
          name: nextEvent.project.name,
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
