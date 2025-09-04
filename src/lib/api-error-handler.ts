/**
 * Unified API Error Handler
 *
 * This module provides standardized error handling for all API routes,
 * integrating with the unified error handling system and consolidated state management.
 */

import { NextResponse } from 'next/server';

import { ErrorHandler } from '@/lib/error-handler';
import { logger } from '@/lib/logger';
import { ErrorCategory, ErrorPriority, ErrorContext } from '@/types/error';

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    field?: string;
    errorId: string;
    category: ErrorCategory;
    priority: ErrorPriority;
    retryable: boolean;
    suggestions: string[];
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    retryable?: boolean;
  };
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface ApiErrorHandlerOptions {
  component: string;
  action?: string;
  enableLogging?: boolean;
  enableNotifications?: boolean;
  enableRetry?: boolean;
  maxRetries?: number;
}

export class ApiErrorHandler {
  private errorHandler: ErrorHandler;
  private options: ApiErrorHandlerOptions;

  constructor(options: ApiErrorHandlerOptions) {
    this.options = {
      enableLogging: true,
      enableNotifications: false, // API errors don't show UI notifications
      enableRetry: false, // API retries are handled at the client level
      maxRetries: 0,
      ...options,
    };

    this.errorHandler = new ErrorHandler({
      component: options.component,
      action: options.action || 'ApiOperation',
      enableNotifications: this.options.enableNotifications,
      enableRetry: this.options.enableRetry,
      maxRetries: this.options.maxRetries,
    });
  }

  /**
   * Creates a standardized success response
   */
  createSuccessResponse<T>(
    data: T,
    message?: string,
    meta?: Partial<ApiSuccessResponse<T>['meta']>
  ): ApiSuccessResponse<T> {
    return {
      success: true,
      data,
      message,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    };
  }

  /**
   * Creates a standardized error response
   */
  createErrorResponse(
    code: string,
    message: string,
    error: Error | string | unknown,
    context?: Partial<ErrorContext>,
    details?: any,
    meta?: Partial<ApiErrorResponse['meta']>
  ): ApiErrorResponse {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    const errorId = this.errorHandler.handleError(errorObj, context);

    const category = this.errorHandler.getErrorCategory(errorObj);
    const priority = this.errorHandler.getErrorPriority(errorObj, category);
    const suggestions = this.errorHandler.getErrorSuggestions(
      errorObj,
      category
    );

    if (this.options.enableLogging) {
      logger.error(`API Error [${code}]:`, errorObj, {
        component: this.options.component,
        action: this.options.action || 'ApiOperation',
        errorCode: code,
        errorId,
        category,
        priority,
        details,
      });
    }

    return {
      success: false,
      error: {
        code,
        message,
        details,
        errorId,
        category,
        priority,
        retryable: this.errorHandler.isRetryable(errorObj, category),
        suggestions,
      },
      meta: {
        timestamp: new Date().toISOString(),
        retryable: this.errorHandler.isRetryable(errorObj, category),
        ...meta,
      },
    };
  }

  /**
   * Creates a validation error response
   */
  createValidationErrorResponse(
    message: string,
    _field?: string,
    error?: Error | string | unknown,
    context?: Partial<ErrorContext>,
    details?: any
  ): ApiErrorResponse {
    return this.createErrorResponse(
      'VALIDATION_ERROR',
      message,
      error || new Error(message),
      {
        ...context,
        action: 'Validation',
      },
      details,
      { retryable: false }
    );
  }

  /**
   * Creates an authentication error response
   */
  createAuthErrorResponse(
    message: string = 'Authentication required',
    error?: Error | string | unknown,
    context?: Partial<ErrorContext>,
    details?: any
  ): ApiErrorResponse {
    return this.createErrorResponse(
      'AUTHENTICATION_ERROR',
      message,
      error || new Error(message),
      {
        ...context,
        action: 'Authentication',
      },
      details,
      { retryable: false }
    );
  }

  /**
   * Creates an authorization error response
   */
  createForbiddenErrorResponse(
    message: string = 'Access denied',
    error?: Error | string | unknown,
    context?: Partial<ErrorContext>,
    details?: any
  ): ApiErrorResponse {
    return this.createErrorResponse(
      'AUTHORIZATION_ERROR',
      message,
      error || new Error(message),
      {
        ...context,
        action: 'Authorization',
      },
      details,
      { retryable: false }
    );
  }

  /**
   * Creates a not found error response
   */
  createNotFoundErrorResponse(
    message: string = 'Resource not found',
    error?: Error | string | unknown,
    context?: Partial<ErrorContext>,
    details?: any
  ): ApiErrorResponse {
    return this.createErrorResponse(
      'NOT_FOUND_ERROR',
      message,
      error || new Error(message),
      {
        ...context,
        action: 'ResourceLookup',
      },
      details,
      { retryable: false }
    );
  }

  /**
   * Creates a server error response
   */
  createServerErrorResponse(
    message: string = 'Internal server error',
    error?: Error | string | unknown,
    context?: Partial<ErrorContext>,
    details?: any
  ): ApiErrorResponse {
    return this.createErrorResponse(
      'SERVER_ERROR',
      message,
      error || new Error(message),
      {
        ...context,
        action: 'ServerOperation',
      },
      details,
      { retryable: true }
    );
  }

  /**
   * Creates a database error response
   */
  createDatabaseErrorResponse(
    message: string = 'Database operation failed',
    error?: Error | string | unknown,
    context?: Partial<ErrorContext>,
    details?: any
  ): ApiErrorResponse {
    return this.createErrorResponse(
      'DATABASE_ERROR',
      message,
      error || new Error(message),
      {
        ...context,
        action: 'DatabaseOperation',
      },
      details,
      { retryable: true }
    );
  }

  /**
   * Creates a network error response
   */
  createNetworkErrorResponse(
    message: string = 'Network operation failed',
    error?: Error | string | unknown,
    context?: Partial<ErrorContext>,
    details?: any
  ): ApiErrorResponse {
    return this.createErrorResponse(
      'NETWORK_ERROR',
      message,
      error || new Error(message),
      {
        ...context,
        action: 'NetworkOperation',
      },
      details,
      { retryable: true }
    );
  }

  /**
   * Creates a rate limit error response
   */
  createRateLimitErrorResponse(
    message: string = 'Rate limit exceeded',
    error?: Error | string | unknown,
    context?: Partial<ErrorContext>,
    details?: any
  ): ApiErrorResponse {
    return this.createErrorResponse(
      'RATE_LIMIT_ERROR',
      message,
      error || new Error(message),
      {
        ...context,
        action: 'RateLimit',
      },
      details,
      { retryable: true }
    );
  }

  /**
   * Wraps an API operation with error handling
   */
  async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    context?: Partial<ErrorContext>
  ): Promise<
    { success: true; data: T } | { success: false; error: ApiErrorResponse }
  > {
    try {
      const result = await operation();
      return { success: true, data: result };
    } catch (error) {
      const errorResponse = this.createServerErrorResponse(
        'Operation failed',
        error,
        context
      );
      return { success: false, error: errorResponse };
    }
  }

  /**
   * Handles common API errors and returns appropriate responses
   */
  handleApiError(
    error: Error | string | unknown,
    context?: Partial<ErrorContext>,
    fallbackMessage?: string
  ): ApiErrorResponse {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    const message =
      fallbackMessage || errorObj.message || 'An unexpected error occurred';

    // Determine error type based on error properties
    if (
      errorObj.name === 'ValidationError' ||
      errorObj.message.includes('validation')
    ) {
      return this.createValidationErrorResponse(
        message,
        undefined,
        errorObj,
        context
      );
    }

    if (
      errorObj.name === 'AuthenticationError' ||
      errorObj.message.includes('auth')
    ) {
      return this.createAuthErrorResponse(message, errorObj, context);
    }

    if (
      errorObj.name === 'AuthorizationError' ||
      errorObj.message.includes('forbidden')
    ) {
      return this.createForbiddenErrorResponse(message, errorObj, context);
    }

    if (
      errorObj.name === 'NotFoundError' ||
      errorObj.message.includes('not found')
    ) {
      return this.createNotFoundErrorResponse(message, errorObj, context);
    }

    if (
      errorObj.name === 'DatabaseError' ||
      errorObj.message.includes('prisma')
    ) {
      return this.createDatabaseErrorResponse(message, errorObj, context);
    }

    if (
      errorObj.name === 'NetworkError' ||
      errorObj.message.includes('fetch')
    ) {
      return this.createNetworkErrorResponse(message, errorObj, context);
    }

    // Default to server error
    return this.createServerErrorResponse(message, errorObj, context);
  }

  /**
   * Creates a NextResponse with proper error handling
   */
  createErrorNextResponse(
    error: Error | string | unknown,
    status: number,
    context?: Partial<ErrorContext>,
    fallbackMessage?: string
  ): NextResponse {
    const errorResponse = this.handleApiError(error, context, fallbackMessage);
    return NextResponse.json(errorResponse, { status });
  }

  /**
   * Creates a NextResponse with success data
   */
  createSuccessNextResponse<T>(
    data: T,
    status: number = 200,
    message?: string
  ): NextResponse {
    const successResponse = this.createSuccessResponse(data, message);
    return NextResponse.json(successResponse, { status });
  }

  /**
   * Gets error metrics for monitoring
   */
  getErrorMetrics() {
    return this.errorHandler.getErrorMetrics();
  }

  /**
   * Gets monitoring status
   */
  getMonitoringStatus() {
    return this.errorHandler.getMonitoringStatus();
  }
}

// HTTP status code constants
export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Error code to HTTP status mapping
export const ERROR_CODE_TO_STATUS: Record<string, number> = {
  VALIDATION_ERROR: HTTP_STATUS_CODES.BAD_REQUEST,
  AUTHENTICATION_ERROR: HTTP_STATUS_CODES.UNAUTHORIZED,
  AUTHORIZATION_ERROR: HTTP_STATUS_CODES.FORBIDDEN,
  NOT_FOUND_ERROR: HTTP_STATUS_CODES.NOT_FOUND,
  CONFLICT_ERROR: HTTP_STATUS_CODES.CONFLICT,
  RATE_LIMIT_ERROR: HTTP_STATUS_CODES.TOO_MANY_REQUESTS,
  DATABASE_ERROR: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
  NETWORK_ERROR: HTTP_STATUS_CODES.SERVICE_UNAVAILABLE,
  SERVER_ERROR: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
};

/**
 * Gets the appropriate HTTP status code for an error code
 */
export function getHttpStatusForErrorCode(errorCode: string): number {
  return (
    ERROR_CODE_TO_STATUS[errorCode] || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
  );
}

/**
 * Creates a default API error handler for common use cases
 */
export function createDefaultApiErrorHandler(
  component: string,
  action?: string
) {
  return new ApiErrorHandler({
    component,
    action,
    enableLogging: true,
    enableNotifications: false,
    enableRetry: false,
  });
}

/**
 * Convenience function to create error responses
 */
export function createApiErrorResponse(
  code: string,
  message: string,
  error?: Error | string | unknown,
  context?: Partial<ErrorContext>
): ApiErrorResponse {
  const handler = createDefaultApiErrorHandler('Api', 'ErrorResponse');
  return handler.createErrorResponse(code, message, error, context);
}

/**
 * Convenience function to create success responses
 */
export function createApiSuccessResponse<T>(
  data: T,
  message?: string
): ApiSuccessResponse<T> {
  const handler = createDefaultApiErrorHandler('Api', 'SuccessResponse');
  return handler.createSuccessResponse(data, message);
}
