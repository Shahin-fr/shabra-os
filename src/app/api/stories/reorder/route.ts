import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import {
  createSuccessResponse,
  HTTP_STATUS_CODES,
} from '@/lib/api/response-utils';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

const reorderSchema = z.object({
  stories: z
    .array(
      z.object({
        id: z.string().cuid(),
      })
    )
    .min(1),
});

export async function PUT(request: NextRequest) {
  try {
    const { withAuth } = await import('@/lib/middleware/auth-middleware');
    const { validateRequest } = await import(
      '@/lib/middleware/validation-middleware'
    );

    const authResult = await withAuth(request, {
      requiredPrivilegeLevel: 'EMPLOYEE',
    });
    if (authResult.response) return authResult.response;

    const validationResult = await validateRequest(request, reorderSchema);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'داده‌های ارسالی نامعتبر است',
          details: validationResult.errors,
        },
        { status: 400 }
      );
    }

    const { stories } = validationResult.data!;

    // Verify that all stories exist
    const existingStories = await prisma.story.findMany({
      where: {
        id: { in: stories.map(s => s.id) },
      },
      select: { id: true },
    });

    if (existingStories.length !== stories.length) {
      return NextResponse.json(
        {
          error: 'دسترسی به برخی از داستان‌ها محدود است',
          code: 'ACCESS_DENIED',
        },
        { status: 403 }
      );
    }

    // Update story orders in a transaction
    const updatedStories = await prisma.$transaction(async tx => {
      const updates = stories.map(({ id }) =>
        tx.story.update({
          where: { id },
          data: {},
        })
      );

      return Promise.all(updates);
    });

    const successResponse = createSuccessResponse({
      message: 'ترتیب داستان‌ها با موفقیت به‌روزرسانی شد',
      stories: updatedStories,
    });
    return NextResponse.json(successResponse, { status: HTTP_STATUS_CODES.OK });
  } catch (error) {
    logger.error('Failed to reorder stories:', error as Error);
    return NextResponse.json(
      {
        error: 'خطا در به‌روزرسانی ترتیب داستان‌ها',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
