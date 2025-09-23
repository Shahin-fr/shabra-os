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

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all active users (excluding the current user)
    const allUsers = await prisma.user.findMany({
      where: {
        isActive: true,
        id: {
          not: context.userId,
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        profile: {
          select: {
            jobTitle: true,
            department: true,
          },
        },
      },
    });

    // Get today's attendance for all users
    const todayAttendance = await prisma.attendance.findMany({
      where: {
        userId: {
          in: allUsers.map(user => user.id),
        },
        checkIn: {
          gte: today,
          lt: tomorrow,
        },
      },
      select: {
        userId: true,
        checkIn: true,
        checkOut: true,
      },
    });

    // Get today's leave requests
    const todayLeaveRequests = await prisma.leaveRequest.findMany({
      where: {
        userId: {
          in: allUsers.map(user => user.id),
        },
        status: 'APPROVED',
        startDate: {
          lte: today,
        },
        endDate: {
          gte: today,
        },
      },
      select: {
        userId: true,
        leaveType: true,
        startDate: true,
        endDate: true,
        reason: true,
      },
    });

    // Categorize users
    const whosOut: any[] = [];
    const whosIn: any[] = [];

    allUsers.forEach(user => {
      const attendance = todayAttendance.find(att => att.userId === user.id);
      const leaveRequest = todayLeaveRequests.find(leave => leave.userId === user.id);

      const userData = {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        avatar: user.avatar,
        jobTitle: user.profile?.jobTitle || 'کارمند',
        department: user.profile?.department || 'نامشخص',
      };

      if (leaveRequest) {
        // On approved leave
        whosOut.push({
          ...userData,
          status: 'on_leave',
          leaveType: leaveRequest.leaveType,
          leaveReason: leaveRequest.reason,
          leaveStartDate: leaveRequest.startDate,
          leaveEndDate: leaveRequest.endDate,
          leaveTypeLabel: getLeaveTypeLabel(leaveRequest.leaveType),
        });
      } else if (attendance) {
        // Has attendance record
        if (!attendance.checkOut) {
          // Still clocked in
          whosIn.push({
            ...userData,
            status: 'clocked_in',
            checkInTime: attendance.checkIn,
            workDuration: Math.floor((new Date().getTime() - attendance.checkIn.getTime()) / (1000 * 60 * 60)),
          });
        } else {
          // Clocked out (completed work day)
          whosIn.push({
            ...userData,
            status: 'completed',
            checkInTime: attendance.checkIn,
            checkOutTime: attendance.checkOut,
            workDuration: Math.floor((attendance.checkOut.getTime() - attendance.checkIn.getTime()) / (1000 * 60 * 60)),
          });
        }
      } else {
        // No attendance record and no leave - absent
        whosOut.push({
          ...userData,
          status: 'absent',
          reason: 'عدم حضور',
        });
      }
    });

    // Sort whosOut by leave type priority
    whosOut.sort((a, b) => {
      if (a.status === 'on_leave' && b.status === 'absent') return -1;
      if (a.status === 'absent' && b.status === 'on_leave') return 1;
      return 0;
    });

    // Sort whosIn by check-in time (earliest first)
    whosIn.sort((a, b) => {
      if (a.checkInTime && b.checkInTime) {
        return new Date(a.checkInTime).getTime() - new Date(b.checkInTime).getTime();
      }
      return 0;
    });

    return NextResponse.json({
      success: true,
      data: {
        whosOut,
        whosIn,
        summary: {
          total: allUsers.length,
          out: whosOut.length,
          in: whosIn.length,
          onLeave: whosOut.filter(user => user.status === 'on_leave').length,
          absent: whosOut.filter(user => user.status === 'absent').length,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching who\'s out:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در دریافت وضعیت تیم',
      },
      { status: 500 }
    );
  }
}

function getLeaveTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    ANNUAL: 'مرخصی سالانه',
    SICK: 'مرخصی استعلاجی',
    UNPAID: 'مرخصی بدون حقوق',
    EMERGENCY: 'مرخصی اضطراری',
    MATERNITY: 'مرخصی زایمان',
    PATERNITY: 'مرخصی پدری',
    STUDY: 'مرخصی تحصیلی',
    OTHER: 'مرخصی دیگر',
  };
  return labels[type] || 'مرخصی';
}
