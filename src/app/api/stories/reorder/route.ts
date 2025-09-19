import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import {
  createSuccessResponse,
  HTTP_STATUS_CODES,
} from '@/lib/api/response-utils';
import { StoryService } from '@/services/story.service';
import { handleApiError } from '@/lib/utils/error-handler';

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

    const validationResult = await validateRequest(reorderSchema)(request);
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

    // Use StoryService to reorder stories
    const storyIds = stories.map(s => s.id);
    const updatedStories = await StoryService.reorderStories(storyIds);

    const successResponse = createSuccessResponse({
      message: 'ترتیب داستان‌ها با موفقیت به‌روزرسانی شد',
      stories: updatedStories,
    });
    return NextResponse.json(successResponse, { status: HTTP_STATUS_CODES.OK });
  } catch (error) {
    return handleApiError(error, {
      operation: 'PUT /api/stories/reorder',
      source: 'api/stories/reorder/route.ts',
    });
  }
}
