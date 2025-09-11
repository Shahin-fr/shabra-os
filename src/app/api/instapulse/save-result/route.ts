import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import {
  createSuccessResponse,
  createValidationErrorResponse,
  createServerErrorResponse,
  createAuthErrorResponse,
  createDatabaseErrorResponse,
  HTTP_STATUS_CODES,
  getHttpStatusForErrorCode,
} from '@/lib/api/response-utils';
import { config } from '@/lib/config/env';
import { logger } from '@/lib/logger';
import { prismaLocal as prisma } from '@/lib/prisma-local';

// Validation schemas using Zod
const ReelSchema = z.object({
  postUrl: z.string().url('Invalid post URL'),
  shortCode: z.string().min(1, 'Short code is required'),
  viewCount: z.number().int().min(0, 'View count must be non-negative'),
  publishedAt: z.string().datetime('Invalid published date'),
  thumbnailUrl: z.string().url().optional(),
});

const PageSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  followerCount: z.number().int().min(0, 'Follower count must be non-negative'),
});

const SaveResultSchema = z.object({
  page: PageSchema,
  reels: z.array(ReelSchema).min(0, 'Reels array cannot be negative'),
});

// POST /api/instapulse/save-result - Save scraped data from n8n workflow
export async function POST(request: NextRequest) {
  try {
    // 1. Authentication - Check for N8N secret token
    const authHeader = request.headers.get('authorization');
    const expectedToken = config.security.n8nSecretToken;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Missing or invalid authorization header', {
        context: 'instapulse-save-result-api',
        operation: 'POST',
        hasAuthHeader: !!authHeader,
      });
      const errorResponse = createAuthErrorResponse(
        'Missing or invalid authorization header'
      );
      return NextResponse.json(errorResponse, {
        status: HTTP_STATUS_CODES.UNAUTHORIZED,
      });
    }

    const providedToken = authHeader.substring(7); // Remove 'Bearer ' prefix
    if (providedToken !== expectedToken) {
      logger.warn('Invalid authorization token provided', {
        context: 'instapulse-save-result-api',
        operation: 'POST',
        tokenLength: providedToken.length,
      });
      const errorResponse = createAuthErrorResponse(
        'Invalid authorization token'
      );
      return NextResponse.json(errorResponse, {
        status: HTTP_STATUS_CODES.UNAUTHORIZED,
      });
    }

    // 2. Input Validation
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      logger.warn('Invalid JSON in request body', {
        context: 'instapulse-save-result-api',
        operation: 'POST',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      const errorResponse = createValidationErrorResponse(
        'Invalid JSON in request body'
      );
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Validate the request body structure
    const validationResult = SaveResultSchema.safeParse(requestBody);
    if (!validationResult.success) {
      logger.warn('Request body validation failed', {
        context: 'instapulse-save-result-api',
        operation: 'POST',
        validationErrors: validationResult.error.errors,
      });
      const errorResponse = createValidationErrorResponse(
        'Invalid request body structure',
        undefined,
        validationResult.error.errors
      );
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    const { page, reels } = validationResult.data;

    logger.info('Processing save-result request', {
      context: 'instapulse-save-result-api',
      operation: 'POST',
      username: page.username,
      reelsCount: reels.length,
    });

    // 3. Database Logic (within a Prisma Transaction)
    const result = await prisma.$transaction(async (tx) => {
      // Upsert the Page - Find by username and update follower count
      const existingPage = await tx.trackedInstagramPage.findUnique({
        where: { username: page.username },
      });

      if (!existingPage) {
        logger.error('Tracked page not found in database', {
          context: 'instapulse-save-result-api',
          operation: 'POST',
          username: page.username,
        });
        throw new Error(`Tracked page with username '${page.username}' not found`);
      }

      // Update the page with new follower count and set status to ACTIVE
      const updatedPage = await tx.trackedInstagramPage.update({
        where: { id: existingPage.id },
        data: {
          followerCount: page.followerCount,
          status: 'ACTIVE',
          updatedAt: new Date(),
        },
      });

      // Upsert the Reels - Process each reel
      const upsertedReels = [];
      for (const reel of reels) {
        try {
          const upsertedReel = await tx.instagramReel.upsert({
            where: { postUrl: reel.postUrl },
            update: {
              viewCount: reel.viewCount,
              // Update other fields that might have changed
              thumbnailUrl: reel.thumbnailUrl,
            },
            create: {
              postUrl: reel.postUrl,
              shortCode: reel.shortCode,
              thumbnailUrl: reel.thumbnailUrl,
              viewCount: reel.viewCount,
              publishedAt: new Date(reel.publishedAt),
              pageId: existingPage.id,
            },
          });
          upsertedReels.push(upsertedReel);
        } catch (reelError) {
          logger.error('Failed to upsert reel', {
            context: 'instapulse-save-result-api',
            operation: 'POST',
            username: page.username,
            postUrl: reel.postUrl,
            error: reelError instanceof Error ? reelError.message : 'Unknown error',
          });
          // Continue with other reels even if one fails
        }
      }

      return {
        page: updatedPage,
        reels: upsertedReels,
        processedReelsCount: upsertedReels.length,
        totalReelsCount: reels.length,
      };
    });

    // 4. Response
    const successResponse = createSuccessResponse(
      {
        message: 'Data saved successfully',
        page: {
          id: result.page.id,
          username: result.page.username,
          followerCount: result.page.followerCount,
          status: result.page.status,
        },
        reels: {
          processed: result.processedReelsCount,
          total: result.totalReelsCount,
        },
      },
      `Successfully processed ${result.processedReelsCount} out of ${result.totalReelsCount} reels for page @${result.page.username}`
    );

    logger.info('Save-result request completed successfully', {
      context: 'instapulse-save-result-api',
      operation: 'POST',
      username: result.page.username,
      processedReels: result.processedReelsCount,
      totalReels: result.totalReelsCount,
    });

    return NextResponse.json(successResponse, { status: HTTP_STATUS_CODES.OK });
  } catch (error) {
    logger.error(
      'Failed to save scraped data:',
      error instanceof Error ? error : undefined,
      {
        context: 'instapulse-save-result-api',
        operation: 'POST',
      }
    );

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        const errorResponse = createValidationErrorResponse(
          error.message
        );
        return NextResponse.json(errorResponse, {
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        });
      }
    }

    const errorResponse = createDatabaseErrorResponse(
      'Failed to save scraped data'
    );
    return NextResponse.json(errorResponse, {
      status: getHttpStatusForErrorCode(errorResponse.error.code),
    });
  }
}
