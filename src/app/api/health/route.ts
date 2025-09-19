import { NextResponse } from 'next/server';

import {
  createSuccessResponse,
  HTTP_STATUS_CODES,
} from '@/lib/api/response-utils';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/utils/error-handler';

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
    return handleApiError(error, {
      operation: 'GET /api/health',
      source: 'api/health/route.ts',
    });
  }
}
