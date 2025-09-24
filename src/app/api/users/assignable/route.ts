import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { createSuccessResponse, createAuthErrorResponse, HTTP_STATUS_CODES } from '@/lib/api/response-utils';

// Force Node.js runtime to avoid Edge Runtime issues
export const runtime = 'nodejs';

export async function GET(_request: NextRequest) {
  try {
    // Get the authenticated user from the session
    const session = await auth();

    if (!session?.user?.id) {
      const errorResponse = createAuthErrorResponse('Unauthorized');
      return NextResponse.json(errorResponse, {
        status: HTTP_STATUS_CODES.UNAUTHORIZED,
      });
    }

    // Get all active users for task assignment
    // This endpoint is more permissive - any authenticated user can see assignable users
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        roles: true,
      },
      orderBy: {
        firstName: 'asc',
      },
    });

    const successResponse = createSuccessResponse(users);
    return NextResponse.json(successResponse, { status: HTTP_STATUS_CODES.OK });
  } catch (error) {
    console.error('Error fetching assignable users:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'خطا در دریافت لیست کاربران قابل انتساب',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}
