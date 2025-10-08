import { NextRequest } from 'next/server';

import {
  ApiResponseBuilder,
  StoryDTO,
  CreateStoryDTO,
  StoryEntity,
  entityToDTO,
  validateCreateDTO,
  CreateStoryDTOSchema
} from '@/types';
import { logger } from '@/lib/logger';
import { StoryService } from '@/services/story.service';
import { handleApiError } from '@/lib/utils/error-handler';
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
      return ApiResponseBuilder.validationError('Day parameter is required', [{ field: 'day', message: 'Day parameter is required' }]);
    }

    // Validate that dayParam is in correct format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dayParam)) {
      return ApiResponseBuilder.validationError('Invalid date format. Expected: YYYY-MM-DD', [{ field: 'day', message: 'Invalid date format. Expected: YYYY-MM-DD' }]);
    }

    // Use StoryService to get stories
    const stories = await StoryService.getStoriesByDay(dayParam);

    // Transform entities to DTOs
    const storyDTOs: StoryDTO[] = stories.map(story => entityToDTO(story as StoryEntity) as unknown as StoryDTO);

    return ApiResponseBuilder.success(storyDTOs, 'Stories retrieved successfully');
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

    // Validate request body using new type system
    const body = await request.json();
    const createStoryData = validateCreateDTO(body, CreateStoryDTOSchema) as CreateStoryDTO;

    // Prepare story data for service
    const storyData = {
      ...createStoryData,
      authorId: authResult.context.userId,
    };

    logger.info('Story creation request received', {
      userId: authResult.context.userId,
      operation: 'POST /api/stories',
      source: 'api/stories/route.ts',
      // Only log non-sensitive fields
      title: createStoryData.title?.substring(0, 50) + (createStoryData.title && createStoryData.title.length > 50 ? '...' : ''),
      day: createStoryData.day,
      projectId: createStoryData.projectId,
      storyTypeId: createStoryData.storyTypeId,
    });

    // Use StoryService to create story
    const story = await StoryService.createStory(storyData);

    // Transform entity to DTO
    const storyDTO = entityToDTO(story as StoryEntity);

    return ApiResponseBuilder.created(storyDTO, 'Story created successfully');
  } catch (error) {
    return handleApiError(error, {
      operation: 'POST /api/stories',
      source: 'api/stories/route.ts',
    });
  }
}
