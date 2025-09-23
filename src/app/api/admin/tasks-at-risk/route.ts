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

    const now = new Date();
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    // Get all subordinates for the current manager
    const subordinates = await prisma.user.findMany({
      where: {
        managerId: context.userId,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    const subordinateIds = subordinates.map(sub => sub.id);

    // Get overdue tasks
    const overdueTasks = await prisma.task.findMany({
      where: {
        assignedTo: {
          in: subordinateIds,
        },
        status: {
          in: ['Todo', 'InProgress'],
        },
        dueDate: {
          lt: now,
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
        dueDate: 'asc',
      },
    });

    // Get tasks approaching deadline (due within 3 days and not started)
    const approachingDeadlineTasks = await prisma.task.findMany({
      where: {
        assignedTo: {
          in: subordinateIds,
        },
        status: 'Todo',
        dueDate: {
          gte: now,
          lte: threeDaysFromNow,
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
        dueDate: 'asc',
      },
    });

    // Format the tasks
    const tasksAtRisk = [
      ...overdueTasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        dueDate: task.dueDate,
        priority: 'OVERDUE' as const,
        daysOverdue: Math.ceil((now.getTime() - (task.dueDate?.getTime() || 0)) / (1000 * 60 * 60 * 24)),
        assignee: {
          id: task.assignee?.id,
          name: task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : 'نامشخص',
          avatar: task.assignee?.avatar,
        },
        project: {
          id: task.project?.id,
          name: task.project?.name || 'بدون پروژه',
        },
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      })),
      ...approachingDeadlineTasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        dueDate: task.dueDate,
        priority: 'APPROACHING' as const,
        daysUntilDue: Math.ceil(((task.dueDate?.getTime() || 0) - now.getTime()) / (1000 * 60 * 60 * 24)),
        assignee: {
          id: task.assignee?.id,
          name: task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : 'نامشخص',
          avatar: task.assignee?.avatar,
        },
        project: {
          id: task.project?.id,
          name: task.project?.name || 'بدون پروژه',
        },
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      })),
    ].sort((a, b) => {
      // Sort by priority (overdue first), then by days overdue/until due
      if (a.priority === 'OVERDUE' && b.priority === 'APPROACHING') return -1;
      if (a.priority === 'APPROACHING' && b.priority === 'OVERDUE') return 1;
      
      if (a.priority === 'OVERDUE' && b.priority === 'OVERDUE') {
        return (a as any).daysOverdue - (b as any).daysOverdue;
      }
      
      if (a.priority === 'APPROACHING' && b.priority === 'APPROACHING') {
        return (a as any).daysUntilDue - (b as any).daysUntilDue;
      }
      
      return 0;
    });

    return NextResponse.json({
      success: true,
      data: tasksAtRisk,
      total: tasksAtRisk.length,
      summary: {
        overdue: overdueTasks.length,
        approaching: approachingDeadlineTasks.length,
      },
    });
  } catch (error) {
    console.error('Error fetching tasks at risk:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در دریافت تسک‌های در معرض خطر',
      },
      { status: 500 }
    );
  }
}
