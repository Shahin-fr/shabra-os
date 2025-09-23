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

    // Optimized: Use parallel queries with proper indexing
    const [pendingRequests, pendingLeaveRequests] = await Promise.all([
      prisma.request.findMany({
        where: {
          status: 'PENDING',
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      }),
      prisma.leaveRequest.findMany({
        where: {
          status: 'PENDING',
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      }),
    ]);

    // Combine and format the data
    const actionItems = [
      ...pendingRequests.map(request => ({
        id: request.id,
        type: 'REQUEST' as const,
        requestType: request.type,
        title: `درخواست ${getRequestTypeLabel(request.type)}`,
        description: request.reason,
        requester: {
          id: request.user.id,
          name: `${request.user.firstName} ${request.user.lastName}`,
          avatar: request.user.avatar,
        },
        createdAt: request.createdAt,
        priority: getRequestPriority(request.type),
      })),
      ...pendingLeaveRequests.map(leave => ({
        id: leave.id,
        type: 'LEAVE' as const,
        requestType: leave.leaveType,
        title: `درخواست مرخصی ${getLeaveTypeLabel(leave.leaveType)}`,
        description: leave.reason,
        requester: {
          id: leave.user.id,
          name: `${leave.user.firstName} ${leave.user.lastName}`,
          avatar: leave.user.avatar,
        },
        createdAt: leave.createdAt,
        priority: getLeavePriority(leave.leaveType, leave.startDate),
      })),
    ].sort((a, b) => {
      // Sort by priority first, then by creation date
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }).slice(0, 5);

    return NextResponse.json({
      success: true,
      data: actionItems,
      total: actionItems.length,
    });
  } catch (error) {
    console.error('Error fetching action center summary:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در دریافت اطلاعات مرکز اقدامات',
      },
      { status: 500 }
    );
  }
}

function getRequestTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    LEAVE: 'مرخصی',
    OVERTIME: 'اضافه کار',
    EXPENSE_CLAIM: 'هزینه',
    GENERAL: 'عمومی',
  };
  return labels[type] || 'عمومی';
}

function getLeaveTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    ANNUAL: 'سالانه',
    SICK: 'بیماری',
    UNPAID: 'بدون حقوق',
    EMERGENCY: 'اضطراری',
    MATERNITY: 'زایمان',
    PATERNITY: 'پدری',
    STUDY: 'تحصیلی',
    OTHER: 'سایر',
  };
  return labels[type] || 'عمومی';
}

function getRequestPriority(type: string): number {
  const priorities: Record<string, number> = {
    EXPENSE_CLAIM: 3,
    OVERTIME: 2,
    GENERAL: 1,
    LEAVE: 1,
  };
  return priorities[type] || 1;
}

function getLeavePriority(type: string, startDate: Date): number {
  const now = new Date();
  const daysUntilStart = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  // Emergency leave is highest priority
  if (type === 'EMERGENCY') return 5;
  
  // Urgent if starting within 3 days
  if (daysUntilStart <= 3) return 4;
  
  // Maternity/paternity are high priority
  if (type === 'MATERNITY' || type === 'PATERNITY') return 3;
  
  // Sick leave is medium-high priority
  if (type === 'SICK') return 2;
  
  // Annual leave is normal priority
  return 1;
}
