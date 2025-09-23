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

    // Get all subordinates for the current manager
    const subordinates = await prisma.user.findMany({
      where: {
        managerId: context.userId,
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        roles: true,
        profile: {
          select: {
            jobTitle: true,
            department: true,
          },
        },
      },
    });

    // Get today's attendance for all subordinates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAttendance = await prisma.attendance.findMany({
      where: {
        userId: {
          in: subordinates.map(sub => sub.id),
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

    // Optimized: Get all tasks for subordinates in one query
    const subordinateIds = subordinates.map(sub => sub.id);
    
    const [allTasks, inProgressTasks] = await Promise.all([
      // Get all tasks for subordinates, ordered by updatedAt
      prisma.task.findMany({
        where: {
          assignedTo: { in: subordinateIds },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        select: {
          id: true,
          title: true,
          status: true,
          updatedAt: true,
          assignedTo: true,
          project: {
            select: {
              name: true,
            },
          },
        },
      }),
      // Get in-progress tasks for subordinates
      prisma.task.findMany({
        where: {
          assignedTo: { in: subordinateIds },
          status: 'InProgress',
        },
        orderBy: {
          updatedAt: 'desc',
        },
        select: {
          id: true,
          title: true,
          status: true,
          updatedAt: true,
          assignedTo: true,
          project: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    // Group tasks by user
    const tasksByUser = allTasks.reduce((acc, task) => {
      if (task.assignedTo) {
        if (!acc[task.assignedTo]) {
          acc[task.assignedTo] = [];
        }
        acc[task.assignedTo]!.push(task);
      }
      return acc;
    }, {} as Record<string, typeof allTasks>);

    const inProgressByUser = inProgressTasks.reduce((acc, task) => {
      if (task.assignedTo) {
        if (!acc[task.assignedTo]) {
          acc[task.assignedTo] = [];
        }
        acc[task.assignedTo]!.push(task);
      }
      return acc;
    }, {} as Record<string, typeof inProgressTasks>);

    // Build team activity data
    const teamActivity = subordinates.map((subordinate) => {
      const userTasks = tasksByUser[subordinate.id] || [];
      const userInProgressTasks = inProgressByUser[subordinate.id] || [];
      
      const lastTaskUpdate = userTasks[0] || null;
      const currentTask = userInProgressTasks[0] || null;

      // Check attendance status
      const attendance = todayAttendance.find(att => att.userId === subordinate.id);
      const isClockedIn = attendance && !attendance.checkOut;
      const isPresent = !!attendance;

      return {
        id: subordinate.id,
        name: `${subordinate.firstName} ${subordinate.lastName}`,
        avatar: subordinate.avatar,
        jobTitle: subordinate.profile?.jobTitle || 'کارمند',
        department: subordinate.profile?.department || 'نامشخص',
        presence: {
          isClockedIn,
          isPresent,
          checkInTime: attendance?.checkIn,
          checkOutTime: attendance?.checkOut,
        },
        lastActivity: lastTaskUpdate ? {
          taskId: lastTaskUpdate.id,
          taskTitle: lastTaskUpdate.title,
          status: lastTaskUpdate.status,
          projectName: lastTaskUpdate.project?.name,
          updatedAt: lastTaskUpdate.updatedAt,
        } : null,
        currentTask: currentTask ? {
          taskId: currentTask.id,
          taskTitle: currentTask.title,
          projectName: currentTask.project?.name,
          updatedAt: currentTask.updatedAt,
        } : null,
      };
    });

    // Sort by activity status (active first, then by last activity time)
    teamActivity.sort((a, b) => {
      // Active (clocked in) users first
      if (a.presence.isClockedIn && !b.presence.isClockedIn) return -1;
      if (!a.presence.isClockedIn && b.presence.isClockedIn) return 1;
      
      // Then by last activity time
      if (a.lastActivity && b.lastActivity) {
        return new Date(b.lastActivity.updatedAt).getTime() - new Date(a.lastActivity.updatedAt).getTime();
      }
      if (a.lastActivity && !b.lastActivity) return -1;
      if (!a.lastActivity && b.lastActivity) return 1;
      
      return 0;
    });

    return NextResponse.json({
      success: true,
      data: teamActivity,
      total: teamActivity.length,
    });
  } catch (error) {
    console.error('Error fetching team activity:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در دریافت اطلاعات فعالیت تیم',
      },
      { status: 500 }
    );
  }
}
