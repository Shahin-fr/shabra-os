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

    // Get all admin users
    const adminUsers = await prisma.user.findMany({
      where: {
        roles: 'ADMIN',
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    const adminIds = adminUsers.map(admin => admin.id);

    // Get tasks assigned to admins that are due today
    const urgentTasks = await prisma.task.findMany({
      where: {
        assignedTo: {
          in: adminIds,
        },
        status: {
          in: ['Todo', 'InProgress'],
        },
        dueDate: {
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
