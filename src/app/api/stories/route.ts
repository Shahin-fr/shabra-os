import { NextRequest, NextResponse } from 'next/server';

import {
  createValidationErrorResponse,
  createServerErrorResponse,
  HTTP_STATUS_CODES,
  getHttpStatusForErrorCode,
} from '@/lib/api/response-utils';
import { DatabasePerformanceMonitor } from '@/lib/database/query-optimizer';
import { StoryQueryOptimizer } from '@/lib/database/query-optimizer';
import { logger } from '@/lib/logger';

// GET /api/stories - Get stories for a specific day
export async function GET(request: NextRequest) {
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

    // Use optimized query with performance monitoring
    // Pass the dayParam string directly instead of converting to Date
    const result = await DatabasePerformanceMonitor.monitorQueryPerformance(
      'getStoriesByDay',
      () => StoryQueryOptimizer.getStoriesByDay(dayParam)
    );

    // Return stories directly in the expected format
    return NextResponse.json(result.result, { status: HTTP_STATUS_CODES.OK });
  } catch (error) {
    logger.error(
      'Stories fetch error:',
      error instanceof Error ? error : undefined,
      {
        context: 'stories-api',
        operation: 'GET /api/stories',
        source: 'api/stories/route.ts',
      }
    );

    const errorResponse = createServerErrorResponse('خطا در دریافت استوری‌ها');
    return NextResponse.json(errorResponse, {
      status: getHttpStatusForErrorCode(errorResponse.error.code),
    });
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      title,
      notes,
      visualNotes,
      link,
      day,
      order,
      status,
      projectId,
      storyTypeId,
      storyIdeaId,
      customTitle,
      type,
      ideaId,
    } = body;

    logger.info('Story creation request received', {
      body,
      userId: authResult.context.userId,
      operation: 'POST /api/stories',
      source: 'api/stories/route.ts',
    });

    if (!title || !day) {
      logger.warn('Story creation failed: missing required fields', {
        body,
        userId: authResult.context.userId,
        operation: 'POST /api/stories',
        source: 'api/stories/route.ts',
      });
      const errorResponse = createValidationErrorResponse(
        'عنوان و تاریخ الزامی است',
        !title ? 'title' : 'day'
      );
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Validate required IDs - no hardcoded fallbacks
    if (!projectId) {
      const errorResponse = createValidationErrorResponse(
        'شناسه پروژه الزامی است',
        'projectId'
      );
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    if (!storyTypeId) {
      const errorResponse = createValidationErrorResponse(
        'شناسه نوع استوری الزامی است',
        'storyTypeId'
      );
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Use optimized story creation with validation
    const result = await DatabasePerformanceMonitor.monitorQueryPerformance(
      'createStory',
      () =>
        StoryQueryOptimizer.createStory({
          title: title.trim(),
          notes: notes?.trim() || null,
          visualNotes: visualNotes?.trim() || null,
          link: link?.trim() || null,
          day,
          order: order || 0,
          status: status || 'DRAFT',
          projectId,
          storyTypeId,
          storyIdeaId: storyIdeaId || null,
          customTitle: customTitle?.trim() || null,
          type: type?.trim() || null,
          ideaId: ideaId || null,
        })
    );

    logger.info('Story created successfully', {
      storyId: result.result?.id,
      userId: authResult.context.userId,
      operation: 'POST /api/stories',
      source: 'api/stories/route.ts',
    });

    // Return the created story directly
    return NextResponse.json(result.result, {
      status: HTTP_STATUS_CODES.CREATED,
    });
  } catch (error) {
    logger.error(
      'Story creation error:',
      error instanceof Error ? error : undefined,
      {
        context: 'stories-api',
        operation: 'POST /api/stories',
        source: 'api/stories/route.ts',
      }
    );

    const errorResponse = createServerErrorResponse('خطا در ایجاد استوری');
    return NextResponse.json(errorResponse, {
      status: getHttpStatusForErrorCode(errorResponse.error.code),
    });
  }
}
