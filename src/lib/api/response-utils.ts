/**
 * Standardized API Response Utilities
 * Ensures consistent response structure across all API endpoints
 */

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timestamp: string;
    requestId?: string;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    field?: string;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    retryable?: boolean;
  };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Creates a standardized success response
 */
export function createSuccessResponse<T>(
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
export function createErrorResponse(
  code: string,
  message: string,
  details?: any,
  meta?: Partial<ApiErrorResponse['meta']>
): ApiErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
      retryable: false,
      ...meta,
    },
  };
}

/**
 * Creates a validation error response
 */
export function createValidationErrorResponse(
  message: string,
  _field?: string,
  details?: any
): ApiErrorResponse {
  return createErrorResponse('VALIDATION_ERROR', message, details, {
    retryable: false,
  });
}

/**
 * Creates an authentication error response
 */
export function createAuthErrorResponse(
  message: string = 'Authentication required'
): ApiErrorResponse {
  return createErrorResponse('AUTH_ERROR', message, undefined, {
    retryable: false,
  });
}

/**
 * Creates an authorization error response
 */
export function createAuthorizationErrorResponse(
  message: string = 'Insufficient permissions'
): ApiErrorResponse {
  return createErrorResponse('AUTHORIZATION_ERROR', message, undefined, {
    retryable: false,
  });
}

/**
 * Creates a not found error response
 */
export function createNotFoundErrorResponse(
  resource: string = 'Resource'
): ApiErrorResponse {
  return createErrorResponse('NOT_FOUND', `${resource} not found`, undefined, {
    retryable: false,
  });
}

/**
 * Creates a server error response
 */
export function createServerErrorResponse(
  message: string = 'Internal server error'
): ApiErrorResponse {
  return createErrorResponse('SERVER_ERROR', message, undefined, {
    retryable: true,
  });
}

/**
 * Creates a database error response
 */
export function createDatabaseErrorResponse(
  message: string = 'Database operation failed'
): ApiErrorResponse {
  return createErrorResponse('DATABASE_ERROR', message, undefined, {
    retryable: true,
  });
}

/**
 * Creates a rate limit error response
 */
export function createRateLimitErrorResponse(
  retryAfter?: number
): ApiErrorResponse {
  return createErrorResponse(
    'RATE_LIMIT_EXCEEDED',
    'Too many requests. Please try again later.',
    { retryAfter },
    {
      retryable: true,
    }
  );
}

/**
 * Creates a paginated success response
 */
export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): ApiSuccessResponse<T[]> {
  const totalPages = Math.ceil(total / limit);

  return createSuccessResponse(data, message, {
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  });
}

/**
 * Error code constants for consistency
 */
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  SERVER_ERROR: 'SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  CONFLICT: 'CONFLICT',
  BAD_REQUEST: 'BAD_REQUEST',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;

/**
 * HTTP status code mapping for error responses
 */
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
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Maps error codes to HTTP status codes
 */
export function getHttpStatusForErrorCode(errorCode: string): number {
  switch (errorCode) {
    case ERROR_CODES.VALIDATION_ERROR:
    case ERROR_CODES.BAD_REQUEST:
      return HTTP_STATUS_CODES.BAD_REQUEST;
    case ERROR_CODES.AUTH_ERROR:
      return HTTP_STATUS_CODES.UNAUTHORIZED;
    case ERROR_CODES.AUTHORIZATION_ERROR:
      return HTTP_STATUS_CODES.FORBIDDEN;
    case ERROR_CODES.NOT_FOUND:
      return HTTP_STATUS_CODES.NOT_FOUND;
    case ERROR_CODES.CONFLICT:
      return HTTP_STATUS_CODES.CONFLICT;
    case ERROR_CODES.RATE_LIMIT_EXCEEDED:
      return HTTP_STATUS_CODES.TOO_MANY_REQUESTS;
    case ERROR_CODES.SERVER_ERROR:
    case ERROR_CODES.DATABASE_ERROR:
    case ERROR_CODES.EXTERNAL_SERVICE_ERROR:
      return HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR;
    default:
      return HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR;
  }
}
