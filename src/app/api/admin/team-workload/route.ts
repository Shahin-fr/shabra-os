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
        profile: {
          select: {
            jobTitle: true,
            department: true,
          },
        },
      },
    });

    // Get task counts for each subordinate
    const workloadData = await Promise.all(
      subordinates.map(async (subordinate) => {
        // Count tasks by status
        const taskCounts = await prisma.task.groupBy({
          by: ['status'],
          where: {
            assignedTo: subordinate.id,
          },
          _count: {
            id: true,
          },
        });

        // Count overdue tasks
        const now = new Date();
        const overdueCount = await prisma.task.count({
          where: {
            assignedTo: subordinate.id,
            status: {
              in: ['Todo', 'InProgress'],
            },
            dueDate: {
              lt: now,
            },
          },
        });

        // Count tasks due this week
        const weekFromNow = new Date(now);
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        const dueThisWeekCount = await prisma.task.count({
          where: {
            assignedTo: subordinate.id,
            status: {
              in: ['Todo', 'InProgress'],
            },
            dueDate: {
              gte: now,
              lte: weekFromNow,
            },
          },
        });

        // Calculate workload score (0-100)
        const totalTasks = taskCounts.reduce((sum, count) => sum + count._count.id, 0);
        const inProgressTasks = taskCounts.find(c => c.status === 'InProgress')?._count.id || 0;
        const todoTasks = taskCounts.find(c => c.status === 'Todo')?._count.id || 0;
        
        // Workload calculation: in-progress tasks are weighted more heavily
        const workloadScore = Math.min(100, (inProgressTasks * 2 + todoTasks + overdueCount * 3) * 10);

        // Determine workload status
        let workloadStatus: 'low' | 'medium' | 'high' | 'critical' = 'low';
        if (workloadScore >= 80) workloadStatus = 'critical';
        else if (workloadScore >= 60) workloadStatus = 'high';
        else if (workloadScore >= 30) workloadStatus = 'medium';

        return {
          id: subordinate.id,
          name: `${subordinate.firstName} ${subordinate.lastName}`,
          avatar: subordinate.avatar,
          jobTitle: subordinate.profile?.jobTitle || 'کارمند',
          department: subordinate.profile?.department || 'نامشخص',
          workload: {
            total: totalTasks,
            inProgress: inProgressTasks,
            todo: todoTasks,
            done: taskCounts.find(c => c.status === 'Done')?._count.id || 0,
            overdue: overdueCount,
            dueThisWeek: dueThisWeekCount,
            score: workloadScore,
            status: workloadStatus,
          },
        };
      })
    );

    // Sort by workload score (highest first)
    workloadData.sort((a, b) => b.workload.score - a.workload.score);

    // Calculate team statistics
    const teamStats = {
      totalMembers: subordinates.length,
      averageWorkload: workloadData.length > 0 
        ? Math.round(workloadData.reduce((sum, member) => sum + member.workload.score, 0) / workloadData.length)
        : 0,
      membersWithHighWorkload: workloadData.filter(member => 
        member.workload.status === 'high' || member.workload.status === 'critical'
      ).length,
      totalOverdueTasks: workloadData.reduce((sum, member) => sum + member.workload.overdue, 0),
      totalTasksDueThisWeek: workloadData.reduce((sum, member) => sum + member.workload.dueThisWeek, 0),
    };

    return NextResponse.json({
      success: true,
      data: workloadData,
      teamStats,
    });
  } catch (error) {
    console.error('Error fetching team workload:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در دریافت بار کاری تیم',
      },
      { status: 500 }
    );
  }
}
