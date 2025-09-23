import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth-middleware';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { context, response } = await withAuth(request, {
      requiredRoles: ['ADMIN', 'MANAGER'],
    });

    if (response) {
      return response;
    }

    // Get today's date in local timezone (Iran timezone)
    const now = new Date();
    const iranTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Tehran"}));
    const today = new Date(iranTime.getFullYear(), iranTime.getMonth(), iranTime.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all active users (for admin) or subordinates (for manager)
    const isAdmin = context.roles.includes('ADMIN');
    
    const teamMembers = await prisma.user.findMany({
      where: {
        ...(isAdmin ? {} : { managerId: context.userId }),
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
      },
    });

    const teamMemberIds = teamMembers.map((member: any) => member.id);

    // Get today's attendance records directly from database
    const todayAttendance = await prisma.attendance.findMany({
      where: {
        userId: {
          in: teamMemberIds,
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
      orderBy: {
        checkIn: 'desc',
      },
    });

    // Get today's leave requests
    const todayLeaveRequests = await prisma.leaveRequest.findMany({
      where: {
        userId: {
          in: teamMemberIds,
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
      },
    });

    // Categorize team members
    const clockedIn: any[] = [];
    const onLeave: any[] = [];
    const absent: any[] = [];

    teamMembers.forEach((member: any) => {
      const attendance = todayAttendance.find((att: any) => att.userId === member.id);
      const leaveRequest = todayLeaveRequests.find((leave: any) => leave.userId === member.id);

      const memberData = {
        id: member.id,
        name: `${member.firstName} ${member.lastName}`,
        avatar: member.avatar,
      };

      if (leaveRequest) {
        // On approved leave
        onLeave.push({
          ...memberData,
          leaveType: leaveRequest.leaveType,
          leaveStartDate: leaveRequest.startDate,
          leaveEndDate: leaveRequest.endDate,
        });
      } else if (attendance) {
        // Has attendance record - consider as present
        const now = new Date();
        const checkInTime = new Date(attendance.checkIn);
        
        // Calculate work duration in hours
        let workDuration = 0;
        if (attendance.checkOut) {
          // Has checked out
          workDuration = Math.floor((attendance.checkOut.getTime() - checkInTime.getTime()) / (1000 * 60 * 60));
        } else {
          // Still clocked in - calculate from check-in to now
          workDuration = Math.floor((now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60));
        }

        // Only consider as clocked in if they haven't checked out yet
        if (!attendance.checkOut) {
          clockedIn.push({
            ...memberData,
            checkInTime: attendance.checkIn,
            checkOutTime: attendance.checkOut,
            workDuration: workDuration,
            status: 'active',
          });
        } else {
          // They checked out today, but we still count them as present for the day
          clockedIn.push({
            ...memberData,
            checkInTime: attendance.checkIn,
            checkOutTime: attendance.checkOut,
            workDuration: workDuration,
            status: 'completed',
          });
        }
      } else {
        // No attendance record and no leave - absent
        absent.push(memberData);
      }
    });

    // Calculate statistics
    const totalTeamMembers = teamMembers.length;
    const clockedInCount = clockedIn.length;
    const onLeaveCount = onLeave.length;
    const absentCount = absent.length;

    // Calculate attendance rate based on present members (clocked in + on leave)
    const presentCount = clockedInCount + onLeaveCount;
    const attendanceRate = totalTeamMembers > 0 ? Math.round((presentCount / totalTeamMembers) * 100) : 0;

    const stats = {
      total: totalTeamMembers,
      clockedIn: clockedInCount,
      onLeave: onLeaveCount,
      absent: absentCount,
      attendanceRate: attendanceRate,
    };

    return NextResponse.json({
      success: true,
      data: {
        stats,
        clockedIn,
        onLeave,
        absent,
      },
    });
  } catch (error) {
    console.error('Error fetching team presence stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در دریافت آمار حضور تیم',
      },
      { status: 500 }
    );
  }
}