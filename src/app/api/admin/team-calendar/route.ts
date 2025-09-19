import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const teamCalendarQuerySchema = z.object({
  startDate: z.string().datetime('Invalid start date format'),
  endDate: z.string().datetime('Invalid end date format'),
});

interface TeamCalendarData {
  leaveRequests: Array<{
    id: string;
    userId: string;
    userName: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    reason: string;
  }>;
  holidays: Array<{
    id: string;
    name: string;
    date: string;
  }>;
  workSchedules: Array<{
    userId: string;
    userName: string;
    weeklyDaysOff: string[]; // Array of day names that are off
  }>;
  teamMembers: Array<{
    id: string;
    name: string;
    isActive: boolean;
  }>;
  capacityForecast: Array<{
    date: string;
    totalTeamMembers: number;
    onLeave: number;
    availableHeadcount: number;
    isAtRisk: boolean;
  }>;
}

// GET /api/admin/team-calendar - Get team calendar data for a date range
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or manager
    if (!['ADMIN', 'MANAGER'].includes(session.user.roles)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const queryObject = Object.fromEntries(searchParams.entries());
    
    const validationResult = teamCalendarQuerySchema.safeParse(queryObject);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { startDate, endDate } = validationResult.data;
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get team members (subordinates for managers, all for admins)
    let teamMembersQuery: any = { isActive: true };
    if (session.user.roles === 'MANAGER') {
      teamMembersQuery.managerId = session.user.id;
    }

    const teamMembers = await prisma.user.findMany({
      where: teamMembersQuery,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });

    const teamMemberIds = teamMembers.map(member => member.id);

    // Get approved leave requests for the date range
    const leaveRequests = await prisma.request.findMany({
      where: {
        type: 'LEAVE',
        status: 'APPROVED',
        userId: { in: teamMemberIds },
        details: {
          path: ['startDate', 'endDate'],
          array_contains: [startDate, endDate],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Get holidays for the date range
    const holidays = await prisma.holiday.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { date: 'asc' },
    });

    // Get work schedules for team members
    const workSchedules = await prisma.workSchedule.findMany({
      where: {
        userId: { in: teamMemberIds },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Process leave requests to extract details
    const processedLeaveRequests = leaveRequests.map(request => {
      const details = request.details as any;
      return {
        id: request.id,
        userId: request.userId,
        userName: `${request.user.firstName} ${request.user.lastName}`,
        leaveType: details.leaveType || 'UNKNOWN',
        startDate: details.startDate,
        endDate: details.endDate,
        reason: request.reason,
      };
    });

    // Process work schedules to get weekly days off
    const processedWorkSchedules = workSchedules.map(schedule => {
      const daysOff: string[] = [];
      const dayMapping = {
        saturday: 'شنبه',
        sunday: 'یکشنبه',
        monday: 'دوشنبه',
        tuesday: 'سه‌شنبه',
        wednesday: 'چهارشنبه',
        thursday: 'پنج‌شنبه',
        friday: 'جمعه',
      };

      Object.entries(dayMapping).forEach(([key, dayName]) => {
        if (!schedule[key as keyof typeof schedule]) {
          daysOff.push(dayName);
        }
      });

      return {
        userId: schedule.userId,
        userName: `${schedule.user.firstName} ${schedule.user.lastName}`,
        weeklyDaysOff: daysOff,
      };
    });

    // Generate capacity forecast for each day in the range
    const capacityForecast = [];
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayOfWeek = currentDate.getDay();
      const dayNames = ['یکشنبه', 'دوشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
      const persianDayName = dayNames[dayOfWeek];

      // Count team members available (not on leave and not on weekly day off)
      let onLeave = 0;
      let availableCount = 0;

      teamMembers.forEach(member => {
        // Check if member is on leave this day
        const isOnLeave = processedLeaveRequests.some(leave => {
          const leaveStart = new Date(leave.startDate);
          const leaveEnd = new Date(leave.endDate);
          return leave.userId === member.id && 
                 currentDate >= leaveStart && 
                 currentDate <= leaveEnd;
        });

        // Check if member has this day as weekly day off
        const workSchedule = processedWorkSchedules.find(ws => ws.userId === member.id);
        const isWeeklyDayOff = workSchedule?.weeklyDaysOff.includes(persianDayName) || false;

        if (isOnLeave) {
          onLeave++;
        } else if (!isWeeklyDayOff) {
          availableCount++;
        }
      });

      const totalTeamMembers = teamMembers.length;
      const availableHeadcount = availableCount;
      const isAtRisk = availableHeadcount < (totalTeamMembers * 0.5); // Less than 50% available

      capacityForecast.push({
        date: dateStr,
        totalTeamMembers,
        onLeave,
        availableHeadcount,
        isAtRisk,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    const response: TeamCalendarData = {
      leaveRequests: processedLeaveRequests,
      holidays: holidays.map(holiday => ({
        id: holiday.id,
        name: holiday.name,
        date: holiday.date.toISOString().split('T')[0],
      })),
      workSchedules: processedWorkSchedules,
      teamMembers: teamMembers.map(member => ({
        id: member.id,
        name: `${member.firstName} ${member.lastName}`,
        isActive: member.isActive,
      })),
      capacityForecast,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching team calendar data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
