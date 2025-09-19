import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import {
  createValidationErrorResponse,
  createServerErrorResponse,
  createNotFoundErrorResponse,
  createAuthErrorResponse,
  HTTP_STATUS_CODES,
} from '@/lib/api/response-utils';
import { logger } from '@/lib/logger';
import { ValidationError } from '@/lib/middleware/validation-middleware';

/**
 * Custom error types for better error handling
 */
export class AppError extends Error {
  public statusCode: number = 500;
  public code: string;
  public isOperational: boolean;

  constructor(
    message: string,
    _statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = _statusCode;
    this.code = code;
    this.isOperational = isOperational;
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request') {
    super(message, 400, 'BAD_REQUEST');
  }
}

/**
 * Centralized error handler for API routes
 * Handles different types of errors and returns appropriate responses
 */
export function handleApiError(error: unknown, context?: {
  operation?: string;
  source?: string;
  userId?: string;
}): NextResponse {
  // Log the error for debugging
  logger.error(
    'API Error occurred:',
    error instanceof Error ? error : undefined,
    {
      context: context?.operation || 'unknown',
      source: context?.source || 'unknown',
      userId: context?.userId,
      errorType: error?.constructor?.name || 'Unknown',
    }
  );

  // Handle ValidationError (from validation middleware)
  if (error instanceof ValidationError) {
    const errorResponse = createValidationErrorResponse(
      error.message,
      error.errors[0]?.path?.join('.') || 'unknown'
    );
    return NextResponse.json(errorResponse, {
      status: error.statusCode,
    });
  }

  // Handle ZodError (direct from Zod validation)
  if (error instanceof ZodError) {
    const formattedErrors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));

    const errorMessage = formattedErrors
      .map(err => `${err.field}: ${err.message}`)
      .join(', ');

    const errorResponse = createValidationErrorResponse(
      `Validation failed: ${errorMessage}`,
      formattedErrors[0]?.field || 'unknown'
    );
    return NextResponse.json(errorResponse, {
      status: HTTP_STATUS_CODES.BAD_REQUEST,
    });
  }

  // Handle custom AppError types
  if (error instanceof AppError) {
    if (error instanceof NotFoundError) {
      const errorResponse = createNotFoundErrorResponse();
      return NextResponse.json(errorResponse, {
        status: error.statusCode,
      });
    }

    if (error instanceof UnauthorizedError) {
      const errorResponse = createAuthErrorResponse('Unauthorized');
      return NextResponse.json(errorResponse, {
        status: error.statusCode,
      });
    }

    if (error instanceof ForbiddenError) {
      const errorResponse = createErrorResponse('Forbidden', 403);
      return NextResponse.json(errorResponse, {
        status: error.statusCode,
      });
    }

    if (error instanceof BadRequestError) {
      const errorResponse = createValidationErrorResponse(error.message);
      return NextResponse.json(errorResponse, {
        status: error.statusCode,
      });
    }

    // Generic AppError
    const errorResponse = createServerErrorResponse(error.message);
    return NextResponse.json(errorResponse, {
      status: error.statusCode,
    });
  }

  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as any;
    
    switch (prismaError.code) {
      case 'P2002': {
        // Unique constraint violation
        const errorResponse = createValidationErrorResponse(
          'A record with this information already exists'
        );
        return NextResponse.json(errorResponse, {
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        });
      }
      
      case 'P2025': {
        // Record not found
        const notFoundResponse = createNotFoundErrorResponse();
        return NextResponse.json(notFoundResponse, {
          status: HTTP_STATUS_CODES.NOT_FOUND,
        });
      }
      
      case 'P2003': {
        // Foreign key constraint violation
        const foreignKeyResponse = createValidationErrorResponse(
          'Referenced record does not exist'
        );
        return NextResponse.json(foreignKeyResponse, {
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        });
      }
      
      default: {
        // Generic Prisma error
        const prismaErrorResponse = createServerErrorResponse(
          'Database operation failed'
        );
        return NextResponse.json(prismaErrorResponse, {
          status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        });
      }
    }
  }

  // Handle generic Error
  if (error instanceof Error) {
    // Check for specific error messages that we can handle gracefully
    if (error.message.includes('not found')) {
      const errorResponse = createNotFoundErrorResponse();
      return NextResponse.json(errorResponse, {
        status: HTTP_STATUS_CODES.NOT_FOUND,
      });
    }

    if (error.message.includes('unauthorized') || error.message.includes('Unauthorized')) {
      const errorResponse = createAuthErrorResponse('Unauthorized');
      return NextResponse.json(errorResponse, {
        status: HTTP_STATUS_CODES.UNAUTHORIZED,
      });
    }

    if (error.message.includes('forbidden') || error.message.includes('Forbidden')) {
      const errorResponse = createErrorResponse('Forbidden', 403);
      return NextResponse.json(errorResponse, {
        status: HTTP_STATUS_CODES.FORBIDDEN,
      });
    }

    // Generic error
    const errorResponse = createServerErrorResponse(error.message);
    return NextResponse.json(errorResponse, {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    });
  }

  // Handle unknown error types
  const errorResponse = createServerErrorResponse('An unexpected error occurred');
  return NextResponse.json(errorResponse, {
    status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
  });
}

/**
 * Higher-order function to wrap API route handlers with error handling
 */
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>,
  context?: {
    operation?: string;
    source?: string;
  }
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error, context);
    }
  };
}

/**
 * Utility function to create standardized error responses
 */
export function createErrorResponse(
  message: string,
  _statusCode: number = 500,
  code: string = 'INTERNAL_ERROR'
) {
  return {
    error: {
      message,
      code,
      timestamp: new Date().toISOString(),
    },
  };
}
