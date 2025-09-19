import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { withCombinedAuthorization } from '@/lib/auth/authorization';

// GET /api/profiles/[userId] - Get comprehensive user profile data      
export async function GET(
  _request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth();
    const { userId } = params;

    // Check authorization
    const authResult = await withCombinedAuthorization({
      requiredRoles: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
      resourceOwnerId: userId,
      allowAdmins: true,
      allowManagers: true,
    })(session);

    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.message },
        { status: authResult.statusCode }
      );
    }

    // Additional check: Verify manager-subordinate relationship
    if (session?.user?.roles?.includes('MANAGER') && session?.user?.id !== userId) {
      const isSubordinate = await prisma.user.findFirst({
        where: {
          id: userId,
          managerId: session?.user?.id,
        },
      });

      if (!isSubordinate) {
        return NextResponse.json(
          { error: 'شما فقط می‌توانید پروفایل زیردستان خود را مشاهده کنید' },
          { status: 403 }
        );
      }
    }

    // Get user with profile and manager data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        subordinates: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            roles: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }

    // Calculate date for attendance query
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Execute all queries in parallel for better performance
    const [
      taskStats,
      userProjects,
      recentTasks,
      attendanceStats,
      leaveStats,
    ] = await Promise.all([
      // Get task statistics
      prisma.task.groupBy({
        by: ['status'],
        where: {
          assignedTo: userId,
        },
        _count: {
          status: true,
        },
      }),

      // Get projects where user is involved (through tasks)
      prisma.project.findMany({
        where: {
          tasks: {
            some: {
              assignedTo: userId,
            },
          },
        },
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          startDate: true,
          endDate: true,
        },
      }),

      // Get recent tasks
      prisma.task.findMany({
        where: {
          assignedTo: userId,
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      }),

      // Get attendance summary (last 30 days)
      prisma.attendance.aggregate({
        where: {
          userId: userId,
          checkIn: {
            gte: thirtyDaysAgo,
          },
        },
        _count: {
          id: true,
        },
      }),

      // Get leave requests summary
      prisma.leaveRequest.groupBy({
        by: ['status'],
        where: {
          userId: userId,
        },
        _count: {
          status: true,
        },
      }),
    ]);

    // Format task statistics
    const taskCounts = {
      Todo: 0,
      InProgress: 0,
      Done: 0,
    };

    taskStats.forEach((stat) => {
      taskCounts[stat.status as keyof typeof taskCounts] = stat._count.status;
    });

    // Format leave statistics
    const leaveCounts = {
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
      CANCELLED: 0,
    };

    leaveStats.forEach((stat) => {
      leaveCounts[stat.status as keyof typeof leaveCounts] = stat._count.status;
    });

    // Build comprehensive profile data
    const profileData = {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        roles: user.roles,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      profile: user.profile,
      manager: user.manager,
      subordinates: user.subordinates,
      performance: {
        taskCounts,
        projectCount: userProjects.length,
        attendanceCount: attendanceStats._count.id,
        leaveCounts,
      },
      projects: userProjects,
      recentTasks,
    };

    return NextResponse.json({
      success: true,
      data: profileData,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات پروفایل' },
      { status: 500 }
    );
  }
}

// PUT /api/profiles/[userId] - Update profile data
export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth();
    const { userId } = params;

    // Check authorization
    const authResult = await withCombinedAuthorization({
      requiredRoles: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
      resourceOwnerId: userId,
      allowAdmins: true,
      allowManagers: true,
    })(session);

    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.message },
        { status: authResult.statusCode }
      );
    }

    // Additional check: Verify manager-subordinate relationship for updates                                                                            
    if (session?.user?.roles?.includes('MANAGER') && session?.user?.id !== userId) {
      const isSubordinate = await prisma.user.findFirst({
        where: {
          id: userId,
          managerId: session?.user?.id,
        },
      });

      if (!isSubordinate) {
        return NextResponse.json(
          { error: 'شما فقط می‌توانید پروفایل زیردستان خود را ویرایش کنید' },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const {
      jobTitle,
      department,
      startDate,
      phoneNumber,
      address,
      emergencyContactName,
      emergencyContactPhone,
    } = body;

    // Validate required fields
    if (!jobTitle || !department) {
      return NextResponse.json(
        { error: 'عنوان شغلی و بخش الزامی هستند' },
        { status: 400 }
      );
    }

    // Update or create profile
    const profile = await prisma.profile.upsert({
      where: { userId },
      update: {
        jobTitle,
        department,
        startDate: startDate ? new Date(startDate) : null,
        phoneNumber,
        address,
        emergencyContactName,
        emergencyContactPhone,
        updatedAt: new Date(),
      },
      create: {
        userId,
        jobTitle,
        department,
        startDate: startDate ? new Date(startDate) : null,
        phoneNumber,
        address,
        emergencyContactName,
        emergencyContactPhone,
      },
    });

    return NextResponse.json({
      success: true,
      data: profile,
      message: 'پروفایل با موفقیت به‌روزرسانی شد',
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'خطا در به‌روزرسانی پروفایل' },
      { status: 500 }
    );
  }
}
