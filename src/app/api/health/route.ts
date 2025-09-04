import { NextResponse } from 'next/server';

import {
  createSuccessResponse,
  HTTP_STATUS_CODES,
} from '@/lib/api/response-utils';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;

    const successResponse = createSuccessResponse({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json(successResponse, { status: HTTP_STATUS_CODES.OK });
  } catch (error) {
    logger.error(
      'Health check failed:',
      error instanceof Error ? error : undefined,
      {
        context: 'health-api',
      }
    );
    return NextResponse.json(
      {
        status: 'unhealthy',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
