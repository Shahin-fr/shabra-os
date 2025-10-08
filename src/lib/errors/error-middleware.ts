/**
 * Error handling middleware for Next.js API routes and middleware
 * Provides centralized error catching and processing
 */

import { NextRequest, NextResponse } from 'next/server';
import { errorHandler, ErrorResponse } from './error-handler';
import { BaseError, InternalServerError } from './domain-errors';

// Middleware error handler
export function withErrorHandling(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(request);
    } catch (error) {
      console.error('Middleware error:', error);
      return await errorHandler.handleError(error as Error, request);
    }
  };
}

// API route error handler
export function withApiErrorHandling(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error('API route error:', error);
      return await errorHandler.handleError(error as Error, request, context);
    }
  };
}

// Error boundary for React components
export class ErrorBoundary {
  private static instance: ErrorBoundary;
  private errorHandler = errorHandler;

  static getInstance(): ErrorBoundary {
    if (!ErrorBoundary.instance) {
      ErrorBoundary.instance = new ErrorBoundary();
    }
    return ErrorBoundary.instance;
  }

  async handleError(
    error: Error,
    errorInfo?: {
      componentStack?: string;
      errorBoundary?: string;
    }
  ): Promise<void> {
    const baseError = new InternalServerError(
      error.message,
      {
        componentStack: errorInfo?.componentStack,
        errorBoundary: errorInfo?.errorBoundary,
        originalError: error.name,
        stack: error.stack,
      }
    );

    await this.errorHandler.handleError(baseError);
  }
}

// Error response utilities
export class ErrorResponseUtils {
  /**
   * Create a standardized error response
   */
  static createErrorResponse(
    statusCode: number,
    message: string,
    code: string,
    details?: Record<string, any>
  ): NextResponse {
    const response: ErrorResponse = {
      success: false,
      error: {
        code,
        message,
        type: 'Error',
        category: 'INTERNAL',
        severity: statusCode >= 500 ? 'CRITICAL' : 'MEDIUM',
        timestamp: new Date().toISOString(),
        details,
      },
    };

    return NextResponse.json(response, { status: statusCode });
  }

  /**
   * Create a validation error response
   */
  static createValidationErrorResponse(
    message: string,
    field?: string,
    details?: Record<string, any>
  ): NextResponse {
    return this.createErrorResponse(400, message, 'VALIDATION_FAILED', {
      field,
      ...details,
    });
  }

  /**
   * Create an authentication error response
   */
  static createAuthenticationErrorResponse(
    message: string = 'Authentication required',
    details?: Record<string, any>
  ): NextResponse {
    return this.createErrorResponse(401, message, 'AUTHENTICATION_REQUIRED', details);
  }

  /**
   * Create an authorization error response
   */
  static createAuthorizationErrorResponse(
    message: string = 'Insufficient permissions',
    details?: Record<string, any>
  ): NextResponse {
    return this.createErrorResponse(403, message, 'ACCESS_DENIED', details);
  }

  /**
   * Create a not found error response
   */
  static createNotFoundErrorResponse(
    message: string = 'Resource not found',
    details?: Record<string, any>
  ): NextResponse {
    return this.createErrorResponse(404, message, 'RESOURCE_NOT_FOUND', details);
  }

  /**
   * Create a conflict error response
   */
  static createConflictErrorResponse(
    message: string = 'Resource already exists',
    details?: Record<string, any>
  ): NextResponse {
    return this.createErrorResponse(409, message, 'RESOURCE_CONFLICT', details);
  }

  /**
   * Create a rate limit error response
   */
  static createRateLimitErrorResponse(
    message: string = 'Rate limit exceeded',
    retryAfter?: number,
    details?: Record<string, any>
  ): NextResponse {
    const response = this.createErrorResponse(429, message, 'RATE_LIMIT_EXCEEDED', {
      retryAfter,
      ...details,
    });

    if (retryAfter) {
      response.headers.set('Retry-After', retryAfter.toString());
    }

    return response;
  }

  /**
   * Create an internal server error response
   */
  static createInternalServerErrorResponse(
    message: string = 'Internal server error',
    details?: Record<string, any>
  ): NextResponse {
    return this.createErrorResponse(500, message, 'INTERNAL_SERVER_ERROR', details);
  }
}

// Error logging utilities
export class ErrorLogger {
  /**
   * Log error with context
   */
  static async logError(
    error: Error | BaseError,
    context?: Record<string, any>,
    request?: NextRequest
  ): Promise<void> {
    try {
      await errorHandler.handleError(error, request, context);
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }

  /**
   * Log warning with context
   */
  static logWarning(
    message: string,
    context?: Record<string, any>
  ): void {
    console.warn('WARNING:', {
      message,
      context,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log info with context
   */
  static logInfo(
    message: string,
    context?: Record<string, any>
  ): void {
    console.info('INFO:', {
      message,
      context,
      timestamp: new Date().toISOString(),
    });
  }
}

// Error recovery utilities
export class ErrorRecovery {
  /**
   * Retry operation with exponential backoff
   */
  static async retry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          throw lastError;
        }

        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  /**
   * Execute operation with fallback
   */
  static async withFallback<T>(
    primaryOperation: () => Promise<T>,
    fallbackOperation: () => Promise<T>
  ): Promise<T> {
    try {
      return await primaryOperation();
    } catch (error) {
      console.warn('Primary operation failed, using fallback:', error);
      return await fallbackOperation();
    }
  }

  /**
   * Execute operation with timeout
   */
  static async withTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return Promise.race([
      operation(),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Operation timeout')), timeoutMs);
      }),
    ]);
  }
}

// Error validation utilities
export class ErrorValidator {
  /**
   * Validate error response format
   */
  static isValidErrorResponse(response: any): response is ErrorResponse {
    return (
      response &&
      typeof response === 'object' &&
      response.success === false &&
      response.error &&
      typeof response.error.code === 'string' &&
      typeof response.error.message === 'string' &&
      typeof response.error.type === 'string' &&
      typeof response.error.category === 'string' &&
      typeof response.error.severity === 'string' &&
      typeof response.error.timestamp === 'string'
    );
  }

  /**
   * Validate error context
   */
  static isValidErrorContext(context: any): boolean {
    return (
      context &&
      typeof context === 'object' &&
      !Array.isArray(context)
    );
  }
}

// Export commonly used utilities
export {
  errorHandler,
  ErrorResponseUtils as ErrorResponse,
};
