import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import {
  createSuccessResponse,
  createAuthErrorResponse,
  createServerErrorResponse,
  HTTP_STATUS_CODES,
  getHttpStatusForErrorCode,
} from '@/lib/api/response-utils';
import { logger } from '@/lib/logger';
import { prismaLocal as prisma } from '@/lib/prisma-local';

// POST handler for clock-in/clock-out
export async function POST() {
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
    const currentTime = new Date();

    // Find the latest attendance record for this user within the last 24 hours
    const twentyFourHoursAgo = new Date(
      currentTime.getTime() - 24 * 60 * 60 * 1000
    );

    const latestAttendance = await prisma.attendance.findFirst({
      where: {
        userId,
        checkIn: {
          gte: twentyFourHoursAgo,
        },
      },
      orderBy: {
        checkIn: 'desc',
      },
    });

    let attendanceRecord;

    if (!latestAttendance || latestAttendance.checkOut) {
      // Clock-in: Create new attendance record
      attendanceRecord = await prisma.attendance.create({
        data: {
          userId,
          checkIn: currentTime,
        },
      });

      logger.info('User ${userId} clocked in at ${currentTime}');
    } else {
      // Clock-out: Update existing record
      attendanceRecord = await prisma.attendance.update({
        where: {
          id: latestAttendance.id,
        },
        data: {
          checkOut: currentTime,
        },
      });

      logger.info('User ${userId} clocked out at ${currentTime}');
    }

    const successResponse = createSuccessResponse({
      success: true,
      action:
        !latestAttendance || latestAttendance.checkOut
          ? 'clock-in'
          : 'clock-out',
      attendance: attendanceRecord,
    });
    return NextResponse.json(successResponse, { status: HTTP_STATUS_CODES.OK });
  } catch (_error) {
    logger.error(
      'Attendance API error:',
      _error instanceof Error ? _error : undefined,
      {
        context: 'attendance-api',
      }
    );
    const errorResponse = createServerErrorResponse('Internal server error');
    return NextResponse.json(errorResponse, {
      status: getHttpStatusForErrorCode(errorResponse.error.code),
    });
  }
}

// GET handler for current attendance status
export async function GET() {
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
    const currentTime = new Date();

    // Find the latest attendance record for this user within the last 24 hours
    const twentyFourHoursAgo = new Date(
      currentTime.getTime() - 24 * 60 * 60 * 1000
    );

    const currentAttendance = await prisma.attendance.findFirst({
      where: {
        userId,
        checkIn: {
          gte: twentyFourHoursAgo,
        },
      },
      orderBy: {
        checkIn: 'desc',
      },
    });

    // Determine current status
    let status = 'not-started';
    let isClockedIn = false;

    if (currentAttendance) {
      if (currentAttendance.checkOut) {
        status = 'completed';
        isClockedIn = false;
      } else {
        status = 'active';
        isClockedIn = true;
      }
    }

    const successResponse = createSuccessResponse({
      success: true,
      currentAttendance,
      status,
      isClockedIn,
      currentTime,
    });
    return NextResponse.json(successResponse, { status: HTTP_STATUS_CODES.OK });
  } catch (_error) {
    logger.error(
      'Attendance status API error:',
      _error instanceof Error ? _error : undefined,
      {
        context: 'attendance-api',
      }
    );
    const errorResponse = createServerErrorResponse('Internal server error');
    return NextResponse.json(errorResponse, {
      status: getHttpStatusForErrorCode(errorResponse.error.code),
    });
  }
}
