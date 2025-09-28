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

    // Get all active users (not just admins)
    const allUsers = await prisma.user.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    const allUserIds = allUsers.map(user => user.id);

    // Get tasks assigned to any user that are due today or overdue and not completed
    const urgentTasks = await prisma.task.findMany({
      where: {
        assignedTo: {
          in: allUserIds,
        },
        status: {
          in: ['Todo', 'InProgress'],
        },
        dueDate: {
          lt: tomorrow, // Include all tasks due before tomorrow (today and overdue)
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
    const formattedTasks = urgentTasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      dueDate: task.dueDate,
      assignee: {
        id: task.assignee?.id,
        firstName: task.assignee?.firstName || 'نامشخص',
        lastName: task.assignee?.lastName || '',
        avatar: task.assignee?.avatar,
      },
      project: {
        id: task.project?.id,
        name: task.project?.name || 'بدون پروژه',
      },
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data: formattedTasks,
      total: formattedTasks.length,
    });
  } catch (error) {
    console.error('Error fetching urgent tasks:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در دریافت تسک‌های فوری',
      },
      { status: 500 }
    );
  }
}
