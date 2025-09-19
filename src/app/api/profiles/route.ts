import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { withAuthorization } from '@/lib/auth/authorization';

// GET /api/profiles - Get all profiles (for admins/managers)
export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/profiles - Starting request');
    
    const session = await auth();

    if (!session?.user) {
      console.log('GET /api/profiles - No session found');
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized' 
        },
        { status: 401 }
      );
    }

    // Check authorization - only admins and managers can list all profiles
    const authResult = await withAuthorization(['ADMIN', 'MANAGER'])(session);

    if (!authResult.authorized) {
      console.log('GET /api/profiles - User not authorized:', session.user.roles);
      return NextResponse.json(
        { 
          success: false,
          error: authResult.message 
        },
        { status: authResult.statusCode }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10'))); // Cap at 50
    const search = searchParams.get('search')?.trim() || '';
    const department = searchParams.get('department')?.trim() || '';

    console.log('GET /api/profiles - Query params:', { page, limit, search, department });

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isActive: true,
    };

    if (search && search.length >= 2) { // Minimum 2 characters for search
      // Sanitize search input - remove special characters that could cause issues
      const sanitizedSearch = search.replace(/[<>"'%;()&+]/g, '');
      where.OR = [
        { firstName: { contains: sanitizedSearch, mode: 'insensitive' } },
        { lastName: { contains: sanitizedSearch, mode: 'insensitive' } },
        { email: { contains: sanitizedSearch, mode: 'insensitive' } },
      ];
    }

    if (department) {
      where.profile = {
        department: { contains: department, mode: 'insensitive' },
      };
    }

    console.log('GET /api/profiles - Where clause:', where);

    // Get users with profiles
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          profile: true,
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              assignedTasks: true,
              subordinates: true,
            },
          },
        },
        orderBy: {
          firstName: 'asc',
        },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    console.log('GET /api/profiles - Found users:', users.length, 'Total count:', totalCount);

    // Get task statistics for each user
    const userIds = users.map((user) => user.id);
    const taskStats = await prisma.task.groupBy({
      by: ['assignedTo', 'status'],
      where: {
        assignedTo: { in: userIds },
      },
      _count: {
        status: true,
      },
    });

    // Format task statistics
    const taskStatsMap = new Map();
    taskStats.forEach((stat) => {
      if (!taskStatsMap.has(stat.assignedTo)) {
        taskStatsMap.set(stat.assignedTo, {
          Todo: 0,
          InProgress: 0,
          Done: 0,
        });
      }
      taskStatsMap.get(stat.assignedTo)[stat.status] = stat._count.status;
    });

    // Build response data
    const profiles = users.map((user) => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      roles: user.roles,
      isActive: user.isActive,
      createdAt: user.createdAt,
      profile: user.profile,
      manager: user.manager,
      taskCount: user._count.assignedTasks,
      subordinateCount: user._count.subordinates,
      taskStats: taskStatsMap.get(user.id) || {
        Todo: 0,
        InProgress: 0,
        Done: 0,
      },
    }));

    console.log('GET /api/profiles - Returning profiles:', profiles.length);

    return NextResponse.json({
      success: true,
      data: profiles,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'خطا در دریافت لیست پروفایل‌ها',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
