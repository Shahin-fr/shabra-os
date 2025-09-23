import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
// import { z } from 'zod';

// const requestActionSchema = z.object({
//   action: z.enum(['APPROVE', 'REJECT']),
//   rejectionReason: z.string().optional(),
// });

// GET /api/admin/action-center - Get all pending requests from subordinates
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or manager
    const userRoles = Array.isArray(session.user.roles) ? session.user.roles : [session.user.roles];
    if (!userRoles.some(role => ['ADMIN', 'MANAGER'].includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status') || 'PENDING';
    const employeeId = searchParams.get('employeeId');

    // Build where clause for subordinates
    let whereClause: any = {
      status,
    };

    // If not admin, only show requests from direct subordinates
    if (userRoles.includes('MANAGER')) {
      whereClause.user = {
        managerId: session.user.id,
      };
    }

    // Add filters
    if (type) whereClause.type = type;
    if (employeeId) whereClause.userId = employeeId;

    // Fetch requests with user information
    const requests = await prisma.request.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            roles: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get subordinates for filter dropdown
    const subordinates = await prisma.user.findMany({
      where: {
        managerId: userRoles.includes('ADMIN') ? undefined : session.user.id,
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
      orderBy: { firstName: 'asc' },
    });

    // Get statistics
    const stats = await prisma.request.groupBy({
      by: ['type', 'status'],
      where: {
        user: userRoles.includes('ADMIN') ? {} : {
          managerId: session.user.id,
        },
      },
      _count: {
        id: true,
      },
    });

    // Format statistics
    const formattedStats = {
      total: requests.length,
      byType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
    };

    stats.forEach(stat => {
      formattedStats.byType[stat.type] = (formattedStats.byType[stat.type] || 0) + stat._count.id;
      formattedStats.byStatus[stat.status] = (formattedStats.byStatus[stat.status] || 0) + stat._count.id;
    });

    return NextResponse.json({
      requests,
      subordinates,
      stats: formattedStats,
    });

  } catch (error) {
    console.error('Error fetching action center data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
