import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import {
  createSuccessResponse,
  createValidationErrorResponse,
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
  followerCount: z.number().int().min(0, 'Follower count must be non-negative').optional(),
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
    logger.info('Starting database transaction', {
      context: 'instapulse-save-result-api',
      operation: 'POST',
      username: page.username,
      reelsCount: reels.length,
    });

    const result = await prisma.$transaction(async (tx) => {
      logger.info('Transaction started - looking up page', {
        context: 'instapulse-save-result-api',
        operation: 'POST',
        username: page.username,
      });

      // Upsert the Page - Find by username and update follower count
      const existingPage = await tx.trackedInstagramPage.findUnique({
        where: { username: page.username },
      });

      if (!existingPage) {
        logger.error('Tracked page not found in database', undefined, {
          context: 'instapulse-save-result-api',
          operation: 'POST',
          username: page.username,
        });
        throw new Error(`Tracked page with username '${page.username}' not found`);
      }

      logger.info('Page found, updating page record', {
        context: 'instapulse-save-result-api',
        operation: 'POST',
        pageId: existingPage.id,
        username: page.username,
        followerCount: page.followerCount,
      });

      // Update the page with new follower count and set status to ACTIVE
      const updatedPage = await tx.trackedInstagramPage.update({
        where: { id: existingPage.id },
        data: {
          status: 'ACTIVE',
          // Conditionally update followerCount only if it exists and is a number
          ...(typeof page.followerCount === 'number' && {
            followerCount: page.followerCount,
          }),
          updatedAt: new Date(),
        },
      });

      logger.info('Page updated successfully, starting reels processing', {
        context: 'instapulse-save-result-api',
        operation: 'POST',
        pageId: existingPage.id,
        totalReelsToProcess: reels.length,
      });

      // Upsert the Reels - Process each reel
      const upsertedReels = [];
      const failedReels = [];
      
      for (let i = 0; i < reels.length; i++) {
        const reel = reels[i];
        if (!reel) {
          logger.warn(`Reel at index ${i} is undefined, skipping`, {
            context: 'instapulse-save-result-api',
            operation: 'POST',
            reelIndex: i + 1,
            totalReels: reels.length,
          });
          continue;
        }
        
        logger.info(`Processing reel ${i + 1}/${reels.length}`, {
          context: 'instapulse-save-result-api',
          operation: 'POST',
          reelIndex: i + 1,
          totalReels: reels.length,
          postUrl: reel.postUrl,
          shortCode: reel.shortCode,
          pageId: existingPage.id,
        });

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
          logger.info(`Successfully upserted reel ${i + 1}`, {
            context: 'instapulse-save-result-api',
            operation: 'POST',
            reelIndex: i + 1,
            postUrl: reel.postUrl,
            reelId: upsertedReel.id,
          });
        } catch (reelError) {
          const errorMessage = reelError instanceof Error ? reelError.message : 'Unknown error';
          const errorStack = reelError instanceof Error ? reelError.stack : undefined;
          
          logger.error('Failed to upsert reel', reelError instanceof Error ? reelError : new Error('Unknown error'), {
            context: 'instapulse-save-result-api',
            operation: 'POST',
            username: page.username,
            postUrl: reel.postUrl,
            reelIndex: i + 1,
            errorMessage,
            errorStack,
            pageId: existingPage.id,
          });
          
          failedReels.push({
            index: i + 1,
            postUrl: reel.postUrl,
            error: errorMessage,
          });
          
          // Continue with other reels even if one fails
        }
      }

      logger.info('Transaction completed - processing summary', {
        context: 'instapulse-save-result-api',
        operation: 'POST',
        username: page.username,
        pageId: existingPage.id,
        totalReels: reels.length,
        successfulReels: upsertedReels.length,
        failedReels: failedReels.length,
        failedReelsDetails: failedReels,
      });

      return {
        page: updatedPage,
        reels: upsertedReels,
        processedReelsCount: upsertedReels.length,
        totalReelsCount: reels.length,
        failedReels: failedReels,
      };
    });

    logger.info('Database transaction completed successfully', {
      context: 'instapulse-save-result-api',
      operation: 'POST',
      username: result.page.username,
      processedReels: result.processedReelsCount,
      totalReels: result.totalReelsCount,
      failedReels: result.failedReels?.length || 0,
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
          failed: result.failedReels?.length || 0,
          failedDetails: result.failedReels || [],
        },
      },
      `Successfully processed ${result.processedReelsCount} out of ${result.totalReelsCount} reels for page @${result.page.username}${result.failedReels?.length ? ` (${result.failedReels.length} failed)` : ''}`
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    
    logger.error(
      'Failed to save scraped data:',
      error instanceof Error ? error : undefined,
      {
        context: 'instapulse-save-result-api',
        operation: 'POST',
        errorMessage,
        errorName,
        errorStack,
        username: page?.username || 'unknown',
        reelsCount: reels?.length || 0,
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
      
      // Handle Prisma constraint violations
      if (error.message.includes('Unique constraint') || error.message.includes('Foreign key constraint')) {
        logger.error('Database constraint violation detected', error, {
          context: 'instapulse-save-result-api',
          operation: 'POST',
          username: page?.username || 'unknown',
          constraintError: error.message,
        });
        
        const errorResponse = createValidationErrorResponse(
          'Database constraint violation: ' + error.message
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
