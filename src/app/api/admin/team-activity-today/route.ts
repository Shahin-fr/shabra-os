import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth-middleware';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { response } = await withAuth(request, {
      requiredRoles: ['ADMIN', 'MANAGER'],
    });

    if (response) {
      return response;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all active users (team members) who have completed tasks today
    const allUsers = await prisma.user.findMany({
      where: {
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

    const allUserIds = allUsers.map(user => user.id);

    // Get tasks completed today by all team members
    // First, let's get all Done tasks for all users to see what we have
    const allDoneTasks = await prisma.task.findMany({
      where: {
        assignedTo: { in: allUserIds },
        status: 'Done',
      },
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Filter tasks that were completed today (updatedAt within today's range)
    const completedTasksToday = allDoneTasks.filter(task => {
      const taskUpdatedAt = new Date(task.updatedAt);
      return taskUpdatedAt >= today && taskUpdatedAt < tomorrow;
    });

    // Group tasks by user
    const tasksByUser = completedTasksToday.reduce((acc, task) => {
      if (task.assignedTo) {
        if (!acc[task.assignedTo]) {
          acc[task.assignedTo] = [];
        }
        acc[task.assignedTo]!.push(task);
      }
      return acc;
    }, {} as Record<string, typeof completedTasksToday>);

    // Build team activity data - only include users who completed tasks today
    const teamActivity = allUsers
      .filter(user => tasksByUser[user.id] && (tasksByUser[user.id]?.length ?? 0) > 0)
      .map((user) => {
        const userTasks = tasksByUser[user.id] || [];
        const latestTask = userTasks[0] || null;

        return {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          avatar: user.avatar,
          jobTitle: user.profile?.jobTitle || 'کارمند',
          department: user.profile?.department || 'نامشخص',
          isActive: true, // All users in this list are active (completed tasks today)
          lastActivity: latestTask ? {
            taskId: latestTask.id,
            title: latestTask.title,
            status: latestTask.status,
            projectName: latestTask.project?.name,
            updatedAt: latestTask.updatedAt,
          } : null,
          completedTasksCount: userTasks.length,
        };
      });

    // Sort by activity (most active first)
    teamActivity.sort((a, b) => {
      if (a.completedTasksCount > b.completedTasksCount) return -1;
      if (a.completedTasksCount < b.completedTasksCount) return 1;
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
      summary: {
        totalMembers: allUsers.length,
        activeMembers: teamActivity.length, // All members in this list are active
        totalCompletedTasks: completedTasksToday.length,
      },
    });
  } catch (error) {
    console.error('Error fetching team activity today:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در دریافت فعالیت امروز تیم',
      },
      { status: 500 }
    );
  }
}
