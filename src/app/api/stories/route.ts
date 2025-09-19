import { NextRequest, NextResponse } from 'next/server';

import {
  createValidationErrorResponse,
  HTTP_STATUS_CODES,
  getHttpStatusForErrorCode,
} from '@/lib/api/response-utils';
import { logger } from '@/lib/logger';
import { StoryService } from '@/services/story.service';
import { validate } from '@/lib/middleware/validation-middleware';
import { handleApiError } from '@/lib/utils/error-handler';
import { CreateStorySchema } from '@/lib/validators/story-validators';
import { withApiRateLimit } from '@/lib/middleware/rate-limit-middleware';

// GET /api/stories - Get stories for a specific day
export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = withApiRateLimit(request);
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response!;
  }

  try {
    // Add authorization check
    const { withAuth } = await import('@/lib/middleware/auth-middleware');

    // Check authentication
    const authResult = await withAuth(request);
    if (authResult.response) {
      return authResult.response;
    }

    const { searchParams } = new URL(request.url);
    const dayParam = searchParams.get('day');

    if (!dayParam) {
      const errorResponse = createValidationErrorResponse(
        'پارامتر روز الزامی است',
        'day'
      );
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Validate that dayParam is in correct format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dayParam)) {
      const errorResponse = createValidationErrorResponse(
        'فرمت تاریخ نامعتبر است. فرمت صحیح: YYYY-MM-DD',
        'day'
      );
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Use StoryService to get stories
    const stories = await StoryService.getStoriesByDay(dayParam);

    // Return stories directly in the expected format
    return NextResponse.json(stories, { status: HTTP_STATUS_CODES.OK });
  } catch (error) {
    return handleApiError(error, {
      operation: 'GET /api/stories',
      source: 'api/stories/route.ts',
    });
  }
}

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = withApiRateLimit(request);
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response!;
  }

  try {
    // Add authorization check
    const { withAuth } = await import('@/lib/middleware/auth-middleware');

    // Check authentication - any authenticated user can create stories
    const authResult = await withAuth(request, {
      requiredPrivilegeLevel: 'EMPLOYEE',
    });

    if (authResult.response) {
      return authResult.response;
    }

    // Validate request body using middleware
    const validatedData = await validate(CreateStorySchema)(request);

    // Prepare story data for service
    const storyData = {
      ...validatedData,
      authorId: authResult.context.userId,
    };


    logger.info('Story creation request received', {
      userId: authResult.context.userId,
      operation: 'POST /api/stories',
      source: 'api/stories/route.ts',
      // Only log non-sensitive fields
      title: validatedData.title?.substring(0, 50) + (validatedData.title && validatedData.title.length > 50 ? '...' : ''),
      day: validatedData.day,
      projectId: validatedData.projectId,
      storyTypeId: validatedData.storyTypeId,
    });

    // Use StoryService to create story
    const story = await StoryService.createStory(storyData);

    // Return the created story directly
    return NextResponse.json(story, {
      status: HTTP_STATUS_CODES.CREATED,
    });
  } catch (error) {
    return handleApiError(error, {
      operation: 'POST /api/stories',
      source: 'api/stories/route.ts',
    });
  }
}
