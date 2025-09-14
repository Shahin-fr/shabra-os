import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import {
  createSuccessResponse,
  createValidationErrorResponse,
  createNotFoundErrorResponse,
  createDatabaseErrorResponse,
  HTTP_STATUS_CODES,
  getHttpStatusForErrorCode,
} from '@/lib/api/response-utils';
import { logger } from '@/lib/logger';
import { prismaLocal as prisma } from '@/lib/prisma-local';

// Validation schema for the request body
const UpdatePageSchema = z.object({
  followerCount: z
    .number()
    .int()
    .min(0, 'Follower count must be a non-negative integer'),
});

// PATCH /api/instapulse/pages/[id] - Update follower count for a tracked Instagram page
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Extract and validate ID from URL parameters
    const idParam = params.id;
    const id = parseInt(idParam, 10);

    if (isNaN(id) || id <= 0) {
      const errorResponse = createValidationErrorResponse(
        'Invalid page ID. Must be a positive number.',
        'id'
      );
      return NextResponse.json(errorResponse, {
        status: HTTP_STATUS_CODES.BAD_REQUEST,
      });
    }

    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      logger.warn('Invalid JSON in request body', {
        context: 'instapulse-pages-update-api',
        operation: 'PATCH',
        pageId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      const errorResponse = createValidationErrorResponse(
        'Invalid JSON in request body'
      );
      return NextResponse.json(errorResponse, {
        status: HTTP_STATUS_CODES.BAD_REQUEST,
      });
    }

    // Validate the request body structure
    const validationResult = UpdatePageSchema.safeParse(requestBody);
    if (!validationResult.success) {
      logger.warn('Request body validation failed', {
        context: 'instapulse-pages-update-api',
        operation: 'PATCH',
        pageId: id,
        validationErrors: validationResult.error.errors,
      });
      const errorResponse = createValidationErrorResponse(
        'Invalid request body structure',
        undefined,
        validationResult.error.errors
      );
      return NextResponse.json(errorResponse, {
        status: HTTP_STATUS_CODES.BAD_REQUEST,
      });
    }

    const { followerCount } = validationResult.data;

    logger.info('Updating tracked Instagram page', {
      context: 'instapulse-pages-update-api',
      operation: 'PATCH',
      pageId: id,
      newFollowerCount: followerCount,
    });

    // Update the page in the database
    const updatedPage = await prisma.trackedInstagramPage.update({
      where: { id },
      data: {
        followerCount,
        updatedAt: new Date(),
      },
    });

    const successResponse = createSuccessResponse(
      updatedPage,
      'Instagram page follower count updated successfully'
    );

    logger.info('Instagram page updated successfully', {
      context: 'instapulse-pages-update-api',
      operation: 'PATCH',
      pageId: id,
      username: updatedPage.username,
      newFollowerCount: updatedPage.followerCount,
    });

    return NextResponse.json(successResponse, { status: HTTP_STATUS_CODES.OK });
  } catch (error) {
    logger.error(
      'Failed to update tracked Instagram page:',
      error instanceof Error ? error : undefined,
      {
        context: 'instapulse-pages-update-api',
        operation: 'PATCH',
        pageId: params.id,
      }
    );

    // Handle specific Prisma errors
    if (error instanceof Error) {
      // Handle "Record not found" error
      if (error.message.includes('Record to update not found')) {
        const errorResponse = createNotFoundErrorResponse('Tracked Instagram page');
        return NextResponse.json(errorResponse, {
          status: getHttpStatusForErrorCode(errorResponse.error.code),
        });
      }

      // Handle unique constraint violations
      if (error.message.includes('Unique constraint')) {
        const errorResponse = createValidationErrorResponse(
          'A page with this data already exists',
          'data'
        );
        return NextResponse.json(errorResponse, {
          status: HTTP_STATUS_CODES.CONFLICT,
        });
      }
    }

    const errorResponse = createDatabaseErrorResponse(
      'Failed to update tracked Instagram page'
    );
    return NextResponse.json(errorResponse, {
      status: getHttpStatusForErrorCode(errorResponse.error.code),
    });
  }
}
