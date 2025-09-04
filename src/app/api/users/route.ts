import { NextResponse } from 'next/server';

import {
  createServerErrorResponse,
  getHttpStatusForErrorCode,
} from '@/lib/api/response-utils';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
      orderBy: {
        firstName: 'asc',
      },
    });

    return NextResponse.json(users);
  } catch {
    const errorResponse = createServerErrorResponse(
      'خطا در دریافت لیست کاربران'
    );
    return NextResponse.json(errorResponse, {
      status: getHttpStatusForErrorCode(errorResponse.error.code),
    });
  }
}
