/**
 * Type-safe API response types for Shabra OS
 * Provides standardized response types for all API endpoints
 */

import { NextResponse } from 'next/server';

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
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

export type HTTPStatusCode = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];

// Standard API response types
export type SingleEntityResponse<T = any> = {
  success: true;
  data: T;
  message?: string;
};

export type EntityListResponse<T = any> = {
  success: true;
  data: T[];
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

export type EntityCreatedResponse<T = any> = {
  success: true;
  data: T;
  message?: string;
};

export type EntityUpdatedResponse<T = any> = {
  success: true;
  data: T;
  message?: string;
};

export type EntityDeletedResponse = {
  success: true;
  data: null;
  message?: string;
};

export type EntityNotFoundResponse = {
  success: false;
  error: {
    code: 'ENTITY_NOT_FOUND';
    message: string;
  };
};

export type ValidationErrorResponse = {
  success: false;
  error: {
    code: 'VALIDATION_ERROR';
    message: string;
    details?: { field: string; message: string }[];
  };
};

export type UnauthorizedResponse = {
  success: false;
  error: {
    code: 'UNAUTHORIZED';
    message: string;
  };
};

export type ForbiddenResponse = {
  success: false;
  error: {
    code: 'FORBIDDEN';
    message: string;
  };
};

export type ConflictResponse = {
  success: false;
  error: {
    code: 'CONFLICT';
    message: string;
    details?: any;
  };
};

export type RateLimitResponse = {
  success: false;
  error: {
    code: 'RATE_LIMIT_EXCEEDED';
    message: string;
    retryAfter?: number;
  };
};

export type InternalServerErrorResponse = {
  success: false;
  error: {
    code: 'INTERNAL_SERVER_ERROR';
    message: string;
  };
};

// Union type for all possible API responses
export type ApiResponseType<T = any> =
  | SingleEntityResponse<T>
  | EntityListResponse<T>
  | EntityCreatedResponse<T>
  | EntityUpdatedResponse<T>
  | EntityDeletedResponse
  | EntityNotFoundResponse
  | ValidationErrorResponse
  | UnauthorizedResponse
  | ForbiddenResponse
  | ConflictResponse
  | RateLimitResponse
  | InternalServerErrorResponse;

// Request types
export type CreateEntityRequest<T = any> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateEntityRequest<T = any> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;

// Query parameters
export type QueryParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
  include?: string[];
  select?: string[];
};

// API response builders - simplified for NextResponse compatibility
export class ApiResponseBuilder {
  static success<T>(data: T, message?: string, meta?: Record<string, any>) {
    return {
      success: true,
      data,
      message,
      meta,
    };
  }

  static created<T>(data: T, message?: string) {
    return {
      success: true,
      data,
      message: message || 'Entity created successfully',
      status: 201,
    };
  }

  static updated<T>(data: T, message?: string) {
    return NextResponse.json({
      success: true,
      data,
      message: message || 'Entity updated successfully',
    });
  }

  static deleted(message?: string) {
    return NextResponse.json({
      success: true,
      data: null,
      message: message || 'Entity deleted successfully',
    }, { status: HTTP_STATUS.NO_CONTENT });
  }

  static notFound(entity: string, id?: string) {
    return {
      success: false,
      error: {
        code: 'ENTITY_NOT_FOUND',
        message: `${entity}${id ? ` with id ${id}` : ''} not found`,
        requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      },
    };
  }

  static validationError(details: { field: string; message: string }[], message?: string) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: message || 'Validation failed',
        details,
        requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      },
    };
  }

  static unauthorized(message?: string) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: message || 'Authentication required',
      },
    }, { status: HTTP_STATUS.UNAUTHORIZED });
  }

  static forbidden(message?: string) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: message || 'Insufficient permissions',
      },
    }, { status: HTTP_STATUS.FORBIDDEN });
  }

  static conflict(message: string, details?: any) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'CONFLICT',
        message,
        details,
      },
    }, { status: HTTP_STATUS.CONFLICT });
  }

  static rateLimit(message?: string, retryAfter?: number) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: message || 'Too many requests',
        retryAfter,
      },
    }, { status: HTTP_STATUS.TOO_MANY_REQUESTS });
  }

  static internalError(message?: string) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: message || 'Internal server error',
      },
    }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}

// Type guards
export function isSuccessResponse<T>(response: ApiResponseType<T>): response is SingleEntityResponse<T> | EntityListResponse<T> | EntityCreatedResponse<T> | EntityUpdatedResponse<T> | EntityDeletedResponse {
  return response.success === true;
}

export function isErrorResponse<T>(response: ApiResponseType<T>): response is EntityNotFoundResponse | ValidationErrorResponse | UnauthorizedResponse | ForbiddenResponse | ConflictResponse | RateLimitResponse | InternalServerErrorResponse {
  return response.success === false;
}

export function isSingleEntityResponse<T>(response: ApiResponseType<T>): response is SingleEntityResponse<T> {
  return response.success === true && 'data' in response && !Array.isArray(response.data);
}

export function isEntityListResponse<T>(response: ApiResponseType<T>): response is EntityListResponse<T> {
  return response.success === true && 'data' in response && Array.isArray(response.data);
}

export function isEntityCreatedResponse<T>(response: ApiResponseType<T>): response is EntityCreatedResponse<T> {
  return response.success === true && 'data' in response && !Array.isArray(response.data);
}

export function isEntityUpdatedResponse<T>(response: ApiResponseType<T>): response is EntityUpdatedResponse<T> {
  return response.success === true && 'data' in response && !Array.isArray(response.data);
}

export function isEntityDeletedResponse(response: ApiResponseType): response is EntityDeletedResponse {
  return response.success === true && 'data' in response && response.data === null;
}

export function isEntityNotFoundResponse(response: ApiResponseType): response is EntityNotFoundResponse {
  return response.success === false && 'error' in response && response.error.code === 'ENTITY_NOT_FOUND';
}

export function isValidationErrorResponse(response: ApiResponseType): response is ValidationErrorResponse {
  return response.success === false && 'error' in response && response.error.code === 'VALIDATION_ERROR';
}

export function isUnauthorizedResponse(response: ApiResponseType): response is UnauthorizedResponse {
  return response.success === false && 'error' in response && response.error.code === 'UNAUTHORIZED';
}

export function isForbiddenResponse(response: ApiResponseType): response is ForbiddenResponse {
  return response.success === false && 'error' in response && response.error.code === 'FORBIDDEN';
}

export function isConflictResponse(response: ApiResponseType): response is ConflictResponse {
  return response.success === false && 'error' in response && response.error.code === 'CONFLICT';
}

export function isRateLimitResponse(response: ApiResponseType): response is RateLimitResponse {
  return response.success === false && 'error' in response && response.error.code === 'RATE_LIMIT_EXCEEDED';
}

export function isInternalServerErrorResponse(response: ApiResponseType): response is InternalServerErrorResponse {
  return response.success === false && 'error' in response && response.error.code === 'INTERNAL_SERVER_ERROR';
}

// Utility functions
export function validateApiResponse<T>(response: unknown): response is ApiResponseType<T> {
  return typeof response === 'object' && response !== null && 'success' in response;
}

export function transformApiResponse<T, U>(response: ApiResponseType<T>, transformer: (data: T) => U): ApiResponseType<U> {
  if (isSuccessResponse(response) && 'data' in response) {
    return {
      ...response,
      data: transformer(response.data as T),
    } as ApiResponseType<U>;
  }
  return response as ApiResponseType<U>;
}

export function handleApiResponse<T>(
  response: ApiResponseType<T>,
  onSuccess: (data: T) => void,
  onError?: (error: { code: string; message: string }) => void
): void {
  if (isSuccessResponse(response)) {
    onSuccess((response as any).data);
  } else if (onError) {
    onError(response.error);
  }
}

export async function handleApiResponseAsync<T>(
  response: ApiResponseType<T>,
  onSuccess: (data: T) => Promise<void>,
  onError?: (error: { code: string; message: string }) => Promise<void>
): Promise<void> {
  if (isSuccessResponse(response)) {
    await onSuccess((response as any).data);
  } else if (onError) {
    await onError(response.error);
  }
}