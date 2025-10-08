/**
 * Standardized API response utilities for Shabra OS
 * Provides consistent response formats for success and error cases
 */

import { NextResponse } from 'next/server';
import { ErrorResponse } from './error-handler';
import { BaseError } from './domain-errors';

// Success response interface
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  meta?: {
    timestamp: string;
    requestId?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Pagination response interface
export interface PaginatedResponse<T = any> {
  success: true;
  data: T[];
  meta: {
    timestamp: string;
    requestId?: string;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

// API response utilities
export class ApiResponse {
  /**
   * Create a successful response
   */
  static success<T>(
    data: T,
    statusCode: number = 200,
    meta?: Partial<SuccessResponse<T>['meta']>
  ): NextResponse<SuccessResponse<T>> {
    const response: SuccessResponse<T> = {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    };

    return NextResponse.json(response, { status: statusCode });
  }

  /**
   * Create a successful response with pagination
   */
  static paginated<T>(
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
    },
    statusCode: number = 200,
    requestId?: string
  ): NextResponse<PaginatedResponse<T>> {
    const totalPages = Math.ceil(pagination.total / pagination.limit);
    
    const response: PaginatedResponse<T> = {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: pagination.total,
          totalPages,
          hasNext: pagination.page < totalPages,
          hasPrev: pagination.page > 1,
        },
      },
    };

    return NextResponse.json(response, { status: statusCode });
  }

  /**
   * Create a created response (201)
   */
  static created<T>(
    data: T,
    meta?: Partial<SuccessResponse<T>['meta']>
  ): NextResponse<SuccessResponse<T>> {
    return this.success(data, 201, meta);
  }

  /**
   * Create an accepted response (202)
   */
  static accepted<T>(
    data: T,
    meta?: Partial<SuccessResponse<T>['meta']>
  ): NextResponse<SuccessResponse<T>> {
    return this.success(data, 202, meta);
  }

  /**
   * Create a no content response (204)
   */
  static noContent(): NextResponse {
    return new NextResponse(null, { status: 204 });
  }

  /**
   * Create an error response from BaseError
   */
  static error(error: BaseError): NextResponse<ErrorResponse> {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: error.errorCode,
        message: error.message,
        type: error.constructor.name,
        category: error.constructor.name.replace('Error', '').toUpperCase(),
        severity: error.statusCode >= 500 ? 'CRITICAL' : 'MEDIUM',
        timestamp: error.timestamp.toISOString(),
        requestId: error.context?.request?.id,
        details: error.context,
      },
    };

    return NextResponse.json(response, { status: error.statusCode });
  }

  /**
   * Create a validation error response
   */
  static validationError(
    message: string,
    field?: string,
    details?: Record<string, any>
  ): NextResponse<ErrorResponse> {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: 'VALIDATION_FAILED',
        message,
        type: 'ValidationError',
        category: 'VALIDATION',
        severity: 'LOW',
        timestamp: new Date().toISOString(),
        details: {
          field,
          ...details,
        },
      },
    };

    return NextResponse.json(response, { status: 400 });
  }

  /**
   * Create an authentication error response
   */
  static authenticationError(
    message: string = 'Authentication required',
    details?: Record<string, any>
  ): NextResponse<ErrorResponse> {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: 'AUTHENTICATION_REQUIRED',
        message,
        type: 'AuthenticationError',
        category: 'AUTHENTICATION',
        severity: 'MEDIUM',
        timestamp: new Date().toISOString(),
        details,
      },
    };

    return NextResponse.json(response, { status: 401 });
  }

  /**
   * Create an authorization error response
   */
  static authorizationError(
    message: string = 'Insufficient permissions',
    details?: Record<string, any>
  ): NextResponse<ErrorResponse> {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: 'ACCESS_DENIED',
        message,
        type: 'AuthorizationError',
        category: 'AUTHORIZATION',
        severity: 'HIGH',
        timestamp: new Date().toISOString(),
        details,
      },
    };

    return NextResponse.json(response, { status: 403 });
  }

  /**
   * Create a not found error response
   */
  static notFound(
    message: string = 'Resource not found',
    details?: Record<string, any>
  ): NextResponse<ErrorResponse> {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: 'RESOURCE_NOT_FOUND',
        message,
        type: 'NotFoundError',
        category: 'NOT_FOUND',
        severity: 'LOW',
        timestamp: new Date().toISOString(),
        details,
      },
    };

    return NextResponse.json(response, { status: 404 });
  }

  /**
   * Create a conflict error response
   */
  static conflict(
    message: string = 'Resource already exists',
    details?: Record<string, any>
  ): NextResponse<ErrorResponse> {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: 'RESOURCE_CONFLICT',
        message,
        type: 'ConflictError',
        category: 'CONFLICT',
        severity: 'MEDIUM',
        timestamp: new Date().toISOString(),
        details,
      },
    };

    return NextResponse.json(response, { status: 409 });
  }

  /**
   * Create a rate limit error response
   */
  static rateLimit(
    message: string = 'Rate limit exceeded',
    retryAfter?: number,
    details?: Record<string, any>
  ): NextResponse<ErrorResponse> {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message,
        type: 'RateLimitError',
        category: 'RATE_LIMIT',
        severity: 'HIGH',
        timestamp: new Date().toISOString(),
        details: {
          retryAfter,
          ...details,
        },
      },
    };

    const headers: Record<string, string> = {};
    if (retryAfter) {
      headers['Retry-After'] = retryAfter.toString();
    }

    return NextResponse.json(response, { 
      status: 429,
      headers,
    });
  }

  /**
   * Create an internal server error response
   */
  static internalError(
    message: string = 'Internal server error',
    details?: Record<string, any>
  ): NextResponse<ErrorResponse> {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message,
        type: 'InternalServerError',
        category: 'INTERNAL',
        severity: 'CRITICAL',
        timestamp: new Date().toISOString(),
        details,
      },
    };

    return NextResponse.json(response, { status: 500 });
  }

  /**
   * Create a service unavailable error response
   */
  static serviceUnavailable(
    message: string = 'Service temporarily unavailable',
    details?: Record<string, any>
  ): NextResponse<ErrorResponse> {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message,
        type: 'ServiceUnavailableError',
        category: 'EXTERNAL_SERVICE',
        severity: 'HIGH',
        timestamp: new Date().toISOString(),
        details,
      },
    };

    return NextResponse.json(response, { status: 503 });
  }
}

// Response validation utilities
export class ResponseValidator {
  /**
   * Validate success response format
   */
  static isValidSuccessResponse(response: any): response is SuccessResponse {
    return (
      response &&
      typeof response === 'object' &&
      response.success === true &&
      response.data !== undefined &&
      (!response.meta || typeof response.meta === 'object')
    );
  }

  /**
   * Validate paginated response format
   */
  static isValidPaginatedResponse(response: any): response is PaginatedResponse {
    return (
      response &&
      typeof response === 'object' &&
      response.success === true &&
      Array.isArray(response.data) &&
      response.meta &&
      response.meta.pagination &&
      typeof response.meta.pagination.page === 'number' &&
      typeof response.meta.pagination.limit === 'number' &&
      typeof response.meta.pagination.total === 'number' &&
      typeof response.meta.pagination.totalPages === 'number' &&
      typeof response.meta.pagination.hasNext === 'boolean' &&
      typeof response.meta.pagination.hasPrev === 'boolean'
    );
  }

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
}

// Response transformation utilities
export class ResponseTransformer {
  /**
   * Transform data for API response
   */
  static transformData<T>(data: T): T {
    // Remove sensitive fields
    if (typeof data === 'object' && data !== null) {
      const transformed = { ...data } as any;
      
      // Remove password fields
      if (transformed.password) {
        delete transformed.password;
      }
      
      // Remove token fields
      if (transformed.token) {
        delete transformed.token;
      }
      
      // Remove secret fields
      if (transformed.secret) {
        delete transformed.secret;
      }
      
      // Transform nested objects
      Object.keys(transformed).forEach(key => {
        if (typeof transformed[key] === 'object' && transformed[key] !== null) {
          transformed[key] = this.transformData(transformed[key]);
        }
      });
      
      return transformed;
    }
    
    return data;
  }

  /**
   * Add metadata to response
   */
  static addMetadata<T>(
    response: SuccessResponse<T>,
    metadata: Record<string, any>
  ): SuccessResponse<T> {
    return {
      ...response,
      meta: {
        ...response.meta,
        ...metadata,
        timestamp: response.meta?.timestamp || new Date().toISOString(),
      },
    };
  }
}

// Export commonly used utilities
export {
  ApiResponse as Response,
};
