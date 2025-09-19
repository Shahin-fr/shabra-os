import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import {
  createSuccessResponse,
  createAuthErrorResponse,
  HTTP_STATUS_CODES,
  getHttpStatusForErrorCode,
} from '@/lib/api/response-utils';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/utils/error-handler';
import { withApiRateLimit } from '@/lib/middleware/rate-limit-middleware';

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

    const userId = session.user.id;
    const now = new Date();
    
    // Calculate date ranges
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
    startOfWeek.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    startOfYear.setHours(0, 0, 0, 0);

    // Get attendance records for different periods
    const [weekRecords, monthRecords, yearRecords, todayRecords] = await Promise.all([
      // This week's records
      prisma.attendance.findMany({
        where: {
          userId,
          checkIn: {
            gte: startOfWeek,
          },
        },
        orderBy: {
          checkIn: 'desc',
        },
      }),
      
      // This month's records
      prisma.attendance.findMany({
        where: {
          userId,
          checkIn: {
            gte: startOfMonth,
          },
        },
        orderBy: {
          checkIn: 'desc',
        },
      }),
      
      // This year's records
      prisma.attendance.findMany({
        where: {
          userId,
          checkIn: {
            gte: startOfYear,
          },
        },
        orderBy: {
          checkIn: 'desc',
        },
      }),
      
      // Today's records
      prisma.attendance.findMany({
        where: {
          userId,
          checkIn: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          },
        },
        orderBy: {
          checkIn: 'desc',
        },
      }),
    ]);

    // Helper function to calculate total hours from records
    const calculateTotalHours = (records: any[]) => {
      return records.reduce((total, record) => {
        if (record.checkOut) {
          const checkIn = new Date(record.checkIn);
          const checkOut = new Date(record.checkOut);
          const hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
          return total + hours;
        }
        return total;
      }, 0);
    };

    // Helper function to calculate average hours per day
    const calculateAverageHours = (records: any[], days: number) => {
      const totalHours = calculateTotalHours(records);
      return days > 0 ? totalHours / days : 0;
    };

    // Helper function to get working days in a period
    const getWorkingDays = (startDate: Date, endDate: Date) => {
      let count = 0;
      const current = new Date(startDate);
      while (current <= endDate) {
        const dayOfWeek = current.getDay();
        if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday to Friday
          count++;
        }
        current.setDate(current.getDate() + 1);
      }
      return count;
    };

    // Calculate statistics
    const weekWorkingDays = getWorkingDays(startOfWeek, now);
    const monthWorkingDays = getWorkingDays(startOfMonth, now);
    const yearWorkingDays = getWorkingDays(startOfYear, now);

    const stats = {
      today: {
        totalHours: calculateTotalHours(todayRecords),
        records: todayRecords.length,
        isClockedIn: todayRecords.some(record => !record.checkOut),
      },
      thisWeek: {
        totalHours: calculateTotalHours(weekRecords),
        averageHours: calculateAverageHours(weekRecords, weekWorkingDays),
        workingDays: weekWorkingDays,
        records: weekRecords.length,
      },
      thisMonth: {
        totalHours: calculateTotalHours(monthRecords),
        averageHours: calculateAverageHours(monthRecords, monthWorkingDays),
        workingDays: monthWorkingDays,
        records: monthRecords.length,
      },
      thisYear: {
        totalHours: calculateTotalHours(yearRecords),
        averageHours: calculateAverageHours(yearRecords, yearWorkingDays),
        workingDays: yearWorkingDays,
        records: yearRecords.length,
      },
      // Recent attendance records (last 7 days)
      recentRecords: weekRecords.slice(0, 7).map(record => ({
        id: record.id,
        date: record.checkIn.toISOString().split('T')[0],
        checkIn: record.checkIn.toLocaleTimeString('fa-IR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        checkOut: record.checkOut ? record.checkOut.toLocaleTimeString('fa-IR', {
          hour: '2-digit',
          minute: '2-digit',
        }) : null,
        totalHours: record.checkOut ? 
          (new Date(record.checkOut).getTime() - new Date(record.checkIn).getTime()) / (1000 * 60 * 60) : 
          null,
        status: record.checkOut ? 'completed' : 'in-progress',
      })),
    };

    logger.info(`Attendance stats calculated for user ${userId}`);

    const successResponse = createSuccessResponse(stats);
    return NextResponse.json(successResponse, { status: HTTP_STATUS_CODES.OK });
  } catch (error) {
    return handleApiError(error, {
      operation: 'GET /api/attendance/stats',
      source: 'api/attendance/stats/route.ts',
    });
  }
}
