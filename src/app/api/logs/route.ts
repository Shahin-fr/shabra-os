// API endpoint for remote logging
// Implements: [CRITICAL PRIORITY 8: Production Console Log Eradication]

import { NextRequest, NextResponse } from 'next/server';

import {
  createSuccessResponse,
  createValidationErrorResponse,
  createServerErrorResponse,
  HTTP_STATUS_CODES,
  getHttpStatusForErrorCode,
} from '@/lib/api/response-utils';
import { LogEntry } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { logs } = await request.json();

    if (!Array.isArray(logs)) {
      const errorResponse = createValidationErrorResponse(
        'Invalid logs format'
      );
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Validate log entries
    const validLogs: LogEntry[] = logs.filter((log: any) => {
      return (
        log &&
        typeof log.timestamp === 'string' &&
        typeof log.level === 'string' &&
        typeof log.message === 'string'
      );
    });

    if (validLogs.length === 0) {
      const errorResponse = createValidationErrorResponse(
        'No valid log entries found'
      );
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // In production, you might want to:
    // 1. Store logs in a database
    // 2. Send to external logging service (e.g., DataDog, LogRocket)
    // 3. Filter sensitive information
    // 4. Rate limit logging

    // For now, we'll just acknowledge receipt
    // TODO: Implement proper log storage and forwarding

    const successResponse = createSuccessResponse({
      success: true,
      received: validLogs.length,
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json(successResponse, { status: HTTP_STATUS_CODES.OK });
  } catch (_error) {
    // Don't log errors here to avoid infinite loops
    const errorResponse = createServerErrorResponse('Internal server error');
    return NextResponse.json(errorResponse, {
      status: getHttpStatusForErrorCode(errorResponse.error.code),
    });
  }
}

export async function GET() {
  // Health check endpoint for logging service
  const successResponse = createSuccessResponse({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
  return NextResponse.json(successResponse, { status: HTTP_STATUS_CODES.OK });
}
