/**
 * Standardized API response helpers for consistent error handling
 */

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

/**
 * Create a successful API response
 */
export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Create a validation error response
 */
export function createValidationErrorResponse(message: string, details?: any): ApiResponse {
  return {
    success: false,
    error: {
      code: ERROR_CODES.VALIDATION_ERROR,
      message,
      details,
    },
  };
}

/**
 * Create an unauthorized error response
 */
export function createUnauthorizedErrorResponse(message: string = 'Unauthorized'): ApiResponse {
  return {
    success: false,
    error: {
      code: ERROR_CODES.UNAUTHORIZED,
      message,
    },
  };
}

/**
 * Create a forbidden error response
 */
export function createForbiddenErrorResponse(message: string = 'Forbidden'): ApiResponse {
  return {
    success: false,
    error: {
      code: ERROR_CODES.FORBIDDEN,
      message,
    },
  };
}

/**
 * Create a not found error response
 */
export function createNotFoundErrorResponse(message: string = 'Resource not found'): ApiResponse {
  return {
    success: false,
    error: {
      code: ERROR_CODES.NOT_FOUND,
      message,
    },
  };
}

/**
 * Create a conflict error response
 */
export function createConflictErrorResponse(message: string, details?: any): ApiResponse {
  return {
    success: false,
    error: {
      code: ERROR_CODES.CONFLICT,
      message,
      details,
    },
  };
}

/**
 * Create an internal server error response
 */
export function createServerErrorResponse(message: string = 'Internal server error'): ApiResponse {
  return {
    success: false,
    error: {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message,
    },
  };
}

/**
 * Get HTTP status code for error code
 */
export function getHttpStatusForErrorCode(errorCode: string): number {
  switch (errorCode) {
    case ERROR_CODES.VALIDATION_ERROR:
      return HTTP_STATUS_CODES.BAD_REQUEST;
    case ERROR_CODES.UNAUTHORIZED:
      return HTTP_STATUS_CODES.UNAUTHORIZED;
    case ERROR_CODES.FORBIDDEN:
      return HTTP_STATUS_CODES.FORBIDDEN;
    case ERROR_CODES.NOT_FOUND:
      return HTTP_STATUS_CODES.NOT_FOUND;
    case ERROR_CODES.CONFLICT:
      return HTTP_STATUS_CODES.CONFLICT;
    case ERROR_CODES.INTERNAL_SERVER_ERROR:
    default:
      return HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR;
  }
}
