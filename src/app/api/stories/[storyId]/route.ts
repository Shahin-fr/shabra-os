import { NextRequest, NextResponse } from 'next/server';

import {
  HTTP_STATUS_CODES,
} from '@/lib/api/response-utils';
import { StoryService } from '@/services/story.service';
import { handleApiError } from '@/lib/utils/error-handler';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storyId: string }> }
) {
  try {
    // Add authorization check
    const { withAuth } = await import('@/lib/middleware/auth-middleware');

    // Check authentication
    const authResult = await withAuth(request);
    if (authResult.response) {
      return authResult.response;
    }

    const { storyId } = await params;

    // Use StoryService to get story
    const story = await StoryService.getStoryById(storyId);

    return NextResponse.json(story);
  } catch (error) {
    return handleApiError(error, {
      operation: 'GET /api/stories/[storyId]',
      source: 'api/stories/[storyId]/route.ts',
    });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ storyId: string }> }
) {
  try {
    // Add authorization check
    const { withAuth } = await import('@/lib/middleware/auth-middleware');

    // Check authentication
    const authResult = await withAuth(request);
    if (authResult.response) {
      return authResult.response;
    }

    const { storyId } = await params;
    const body = await request.json();

    // Use StoryService to update story
    const updatedStory = await StoryService.updateStory(storyId, body);

    return NextResponse.json(updatedStory);
  } catch (error) {
    return handleApiError(error, {
      operation: 'PATCH /api/stories/[storyId]',
      source: 'api/stories/[storyId]/route.ts',
    });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ storyId: string }> }
) {
  try {
    // Add authorization check
    const { withAuth } = await import('@/lib/middleware/auth-middleware');

    // Check authentication
    const authResult = await withAuth(request);
    if (authResult.response) {
      return authResult.response;
    }

    const { storyId } = await params;

    // Use StoryService to delete story
    const result = await StoryService.deleteStory(storyId);

    // Return success response with the deleted story ID
    return NextResponse.json(
      {
        success: true,
        message: 'استوری با موفقیت حذف شد',
        deletedId: result.deletedId,
      },
      { status: HTTP_STATUS_CODES.OK }
    );
  } catch (error) {
    return handleApiError(error, {
      operation: 'DELETE /api/stories/[storyId]',
      source: 'api/stories/[storyId]/route.ts',
    });
  }
}
