import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import {
  createSuccessResponse,
  createValidationErrorResponse,
  createDatabaseErrorResponse,
  HTTP_STATUS_CODES,
  getHttpStatusForErrorCode,
} from '@/lib/api/response-utils';
import { logger } from '@/lib/logger';
import { prismaLocal as prisma } from '@/lib/prisma-local';

// Query parameters validation schema
const QueryParamsSchema = z.object({
  startDate: z
    .string()
    .datetime('Invalid startDate format. Use ISO 8601 format (e.g., 2024-05-20T00:00:00.000Z)')
    .optional()
    .transform((val) => val ? new Date(val) : undefined),
  endDate: z
    .string()
    .datetime('Invalid endDate format. Use ISO 8601 format (e.g., 2024-05-20T00:00:00.000Z)')
    .optional()
    .transform((val) => val ? new Date(val) : undefined),
  sortBy: z
    .enum(['publishedAt', 'viewCount'])
    .default('publishedAt'),
  sortOrder: z
    .enum(['asc', 'desc'])
    .default('desc'),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, 'Page must be a positive number')
    .default('1'),
  pageSize: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val <= 100, 'Page size must be between 1 and 100')
    .default('10'),
});

// GET /api/instapulse/reels - Fetch Instagram reels with filtering, sorting, and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const queryParams = QueryParamsSchema.parse({
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      sortOrder: searchParams.get('sortOrder') || undefined,
      page: searchParams.get('page') || undefined,
      pageSize: searchParams.get('pageSize') || undefined,
    });

    // Validate date range logic
    if (queryParams.startDate && queryParams.endDate) {
      if (queryParams.startDate >= queryParams.endDate) {
        const errorResponse = createValidationErrorResponse(
          'startDate must be before endDate'
        );
        return NextResponse.json(errorResponse, {
          status: getHttpStatusForErrorCode(errorResponse.error.code),
        });
      }
    }

    logger.info('Fetching Instagram reels', {
      context: 'instapulse-reels-api',
      operation: 'GET',
      filters: {
        startDate: queryParams.startDate?.toISOString(),
        endDate: queryParams.endDate?.toISOString(),
        sortBy: queryParams.sortBy,
        sortOrder: queryParams.sortOrder,
      },
      pagination: {
        page: queryParams.page,
        pageSize: queryParams.pageSize,
      },
    });

    // Construct the where clause for filtering
    const whereClause: any = {};
    
    if (queryParams.startDate || queryParams.endDate) {
      whereClause.publishedAt = {};
      
      if (queryParams.startDate) {
        whereClause.publishedAt.gte = queryParams.startDate;
      }
      
      if (queryParams.endDate) {
        whereClause.publishedAt.lte = queryParams.endDate;
      }
    }

    // Construct the orderBy clause
    const orderByClause: any = {};
    orderByClause[queryParams.sortBy] = queryParams.sortOrder;

    // Calculate pagination values
    const skip = (queryParams.page - 1) * queryParams.pageSize;
    const take = queryParams.pageSize;

    // Execute queries in parallel using transaction
    const [reels, totalRecords] = await prisma.$transaction([
      // Fetch reels with all options
      prisma.instagramReel.findMany({
        where: whereClause,
        orderBy: orderByClause,
        skip,
        take,
        include: {
          trackedPage: {
            select: {
              id: true,
              username: true,
              profileUrl: true,
              followerCount: true,
              status: true,
            },
          },
        },
      }),
      // Count total records matching the filter
      prisma.instagramReel.count({
        where: whereClause,
      }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalRecords / queryParams.pageSize);
    const hasNextPage = queryParams.page < totalPages;
    const hasPreviousPage = queryParams.page > 1;

    // Calculate virality score for each reel (view-to-follower ratio)
    const reelsWithVirality = reels.map((reel) => ({
      ...reel,
      viralityScore: reel.trackedPage.followerCount > 0 
        ? Number((reel.viewCount / reel.trackedPage.followerCount).toFixed(4))
        : 0,
    }));

    // Sort by virality score if requested
    if (queryParams.sortBy === 'viewCount' && queryParams.sortOrder === 'desc') {
      reelsWithVirality.sort((a, b) => b.viralityScore - a.viralityScore);
    }

    const responseData = {
      reels: reelsWithVirality,
      meta: {
        pagination: {
          currentPage: queryParams.page,
          totalPages,
          pageSize: queryParams.pageSize,
          totalRecords,
          hasNextPage,
          hasPreviousPage,
        },
        filters: {
          startDate: queryParams.startDate?.toISOString(),
          endDate: queryParams.endDate?.toISOString(),
          sortBy: queryParams.sortBy,
          sortOrder: queryParams.sortOrder,
        },
      },
    };

    const successResponse = createSuccessResponse(
      responseData,
      `Successfully fetched ${reelsWithVirality.length} reels out of ${totalRecords} total records`
    );

    logger.info('Instagram reels fetched successfully', {
      context: 'instapulse-reels-api',
      operation: 'GET',
      results: {
        fetched: reelsWithVirality.length,
        total: totalRecords,
        page: queryParams.page,
        totalPages,
      },
    });

    return NextResponse.json(successResponse, { status: HTTP_STATUS_CODES.OK });
  } catch (error) {
    logger.error(
      'Failed to fetch Instagram reels:',
      error instanceof Error ? error : undefined,
      {
        context: 'instapulse-reels-api',
        operation: 'GET',
      }
    );

    // Handle validation errors
    if (error instanceof z.ZodError) {
      const errorResponse = createValidationErrorResponse(
        'Invalid query parameters',
        undefined,
        error.errors
      );
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    const errorResponse = createDatabaseErrorResponse(
      'Failed to fetch Instagram reels'
    );
    return NextResponse.json(errorResponse, {
      status: getHttpStatusForErrorCode(errorResponse.error.code),
    });
  }
}
