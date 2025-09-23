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

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

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

    const subordinateIds = subordinates.map(sub => sub.id);

    // Get tasks completed today by subordinates
    const completedTasksToday = await prisma.task.findMany({
      where: {
        assignedTo: { in: subordinateIds },
        status: 'Done',
        updatedAt: {
          gte: today,
          lt: tomorrow,
        },
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

    // Build team activity data
    const teamActivity = subordinates.map((subordinate) => {
      const userTasks = tasksByUser[subordinate.id] || [];
      const latestTask = userTasks[0] || null;

      return {
        id: subordinate.id,
        name: `${subordinate.firstName} ${subordinate.lastName}`,
        avatar: subordinate.avatar,
        jobTitle: subordinate.profile?.jobTitle || 'کارمند',
        department: subordinate.profile?.department || 'نامشخص',
        isActive: userTasks.length > 0,
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
        totalMembers: subordinates.length,
        activeMembers: teamActivity.filter(member => member.isActive).length,
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
