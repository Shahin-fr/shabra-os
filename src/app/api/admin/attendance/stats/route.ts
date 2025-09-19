import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import {
  createSuccessResponse,
  createAuthErrorResponse,
  createAuthorizationErrorResponse,
  HTTP_STATUS_CODES,
  getHttpStatusForErrorCode,
} from '@/lib/api/response-utils';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/utils/error-handler';
import { withApiRateLimit } from '@/lib/middleware/rate-limit-middleware';
import { hasRequiredRole } from '@/lib/utils/auth-utils';
import { getAllUsersAttendanceSummary } from '@/lib/attendance-utils';

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = withApiRateLimit(request);
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response!;
  }

  try {
    // Get the authenticated user from the session
    const session = await auth();

    if (!session?.user?.id) {
      const errorResponse = createAuthErrorResponse('Unauthorized');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Check if user has required roles (ADMIN or MANAGER)
    const userRoles = session.user.roles || [];
    if (!hasRequiredRole(userRoles, ['ADMIN', 'MANAGER'])) {
      const errorResponse = createAuthorizationErrorResponse('Insufficient permissions. ADMIN or MANAGER role required.');
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // Get today's attendance data with user information
    const todayAttendance = await prisma.attendance.findMany({
      where: {
        checkIn: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        checkIn: 'asc',
      },
    });

    // Calculate statistics
    const totalEmployeesPresent = todayAttendance.length;
    
    // Calculate total hours logged today
    const totalHoursLogged = todayAttendance.reduce((total, record) => {
      if (record.checkOut) {
        const checkIn = new Date(record.checkIn);
        const checkOut = new Date(record.checkOut);
        const hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
        return total + hours;
      }
      return total;
    }, 0);

    // Calculate average clock-in time
    const clockInTimes = todayAttendance.map(record => {
      const checkIn = new Date(record.checkIn);
      return checkIn.getHours() + (checkIn.getMinutes() / 60);
    });

    const averageClockInTime = clockInTimes.length > 0 
      ? clockInTimes.reduce((sum, time) => sum + time, 0) / clockInTimes.length 
      : 0;

    // Format average clock-in time
    const averageClockInHours = Math.floor(averageClockInTime);
    const averageClockInMinutes = Math.round((averageClockInTime - averageClockInHours) * 60);
    const formattedAverageClockIn = `${averageClockInHours.toString().padStart(2, '0')}:${averageClockInMinutes.toString().padStart(2, '0')}`;

    // Get additional statistics
    const totalEmployees = await prisma.user.count({
      where: {
        isActive: true,
      },
    });

    const currentlyClockedIn = todayAttendance.filter(record => !record.checkOut).length;

    // Get this week's statistics with work schedule awareness
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
    startOfWeek.setHours(0, 0, 0, 0);

    // Get work schedule-aware attendance summary for this week
    const weekAttendanceSummary = await getAllUsersAttendanceSummary(startOfWeek, now);
    
    // Calculate week totals
    const weekTotalHours = weekAttendanceSummary.reduce((total, userSummary) => {
      return total + userSummary.stats.totalHoursWorked;
    }, 0);

    const weekTotalWorkingDays = weekAttendanceSummary.reduce((total, userSummary) => {
      return total + userSummary.stats.totalWorkingDays;
    }, 0);

    const weekTotalPresentDays = weekAttendanceSummary.reduce((total, userSummary) => {
      return total + userSummary.stats.presentDays;
    }, 0);

    const weekAttendanceRate = weekTotalWorkingDays > 0 
      ? Math.round((weekTotalPresentDays / weekTotalWorkingDays) * 100) 
      : 0;

    const stats = {
      today: {
        totalEmployeesPresent,
        totalHoursLogged: Math.round(totalHoursLogged * 100) / 100,
        averageClockInTime: formattedAverageClockIn,
        currentlyClockedIn,
        attendanceRate: totalEmployees > 0 ? Math.round((totalEmployeesPresent / totalEmployees) * 100) : 0,
      },
      week: {
        totalHoursLogged: Math.round(weekTotalHours * 100) / 100,
        totalWorkingDays: weekTotalWorkingDays,
        totalPresentDays: weekTotalPresentDays,
        attendanceRate: weekAttendanceRate,
        totalRecords: weekAttendanceSummary.length,
      },
      overall: {
        totalEmployees,
        activeEmployees: totalEmployeesPresent,
      },
      workScheduleAware: true,
    };

    logger.info(`Admin attendance stats calculated for user ${session.user.id}`);

    const successResponse = createSuccessResponse(stats);
    return NextResponse.json(successResponse, { status: HTTP_STATUS_CODES.OK });
  } catch (error) {
    return handleApiError(error, {
      operation: 'GET /api/admin/attendance/stats',
      source: 'api/admin/attendance/stats/route.ts',
    });
  }
}
