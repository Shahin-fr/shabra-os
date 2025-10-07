/**
 * Type-safe API response types for Shabra OS
 * Provides standardized response types for all API endpoints
 */

import { BaseEntity, BaseDTO, ListResponse, ApiResponse, ErrorResponse, SuccessResponse } from './base';
import { z } from 'zod';

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

// API endpoint types
export type ApiEndpoint = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  entity?: string;
  requiresAuth: boolean;
  requiredRoles?: string[];
  rateLimit?: {
    requests: number;
    window: number;
  };
};

// Standard API response types
export type SingleEntityResponse<T extends BaseDTO> = SuccessResponse<T>;

export type EntityListResponse<T extends BaseDTO> = SuccessResponse<ListResponse<T>>;

export type EntityCreatedResponse<T extends BaseDTO> = SuccessResponse<T> & {
  status: typeof HTTP_STATUS.CREATED;
};

export type EntityUpdatedResponse<T extends BaseDTO> = SuccessResponse<T>;

export type EntityDeletedResponse = SuccessResponse<null> & {
  status: typeof HTTP_STATUS.NO_CONTENT;
};

export type EntityNotFoundResponse = ErrorResponse & {
  status: typeof HTTP_STATUS.NOT_FOUND;
  error: {
    code: 'ENTITY_NOT_FOUND';
    message: string;
  };
};

export type ValidationErrorResponse = ErrorResponse & {
  status: typeof HTTP_STATUS.UNPROCESSABLE_ENTITY;
  error: {
    code: 'VALIDATION_ERROR';
    message: string;
    details: {
      field: string;
      message: string;
    }[];
  };
};

export type UnauthorizedResponse = ErrorResponse & {
  status: typeof HTTP_STATUS.UNAUTHORIZED;
  error: {
    code: 'UNAUTHORIZED';
    message: string;
  };
};

export type ForbiddenResponse = ErrorResponse & {
  status: typeof HTTP_STATUS.FORBIDDEN;
  error: {
    code: 'FORBIDDEN';
    message: string;
  };
};

export type ConflictResponse = ErrorResponse & {
  status: typeof HTTP_STATUS.CONFLICT;
  error: {
    code: 'CONFLICT';
    message: string;
    details?: any;
  };
};

export type RateLimitResponse = ErrorResponse & {
  status: typeof HTTP_STATUS.TOO_MANY_REQUESTS;
  error: {
    code: 'RATE_LIMIT_EXCEEDED';
    message: string;
    retryAfter?: number;
  };
};

export type InternalServerErrorResponse = ErrorResponse & {
  status: typeof HTTP_STATUS.INTERNAL_SERVER_ERROR;
  error: {
    code: 'INTERNAL_SERVER_ERROR';
    message: string;
  };
};

// Union type for all possible API responses
export type ApiResponseType<T extends BaseDTO = BaseDTO> =
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
export type CreateEntityRequest<T extends BaseDTO> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateEntityRequest<T extends BaseDTO> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;

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

// API response schemas for validation
export const SingleEntityResponseSchema = z.object({
  success: z.literal(true),
  data: z.any(),
  message: z.string().optional(),
  meta: z.record(z.any()).optional(),
});

export const EntityListResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    data: z.array(z.any()),
    meta: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
      hasNextPage: z.boolean(),
      hasPrevPage: z.boolean(),
    }),
  }),
  message: z.string().optional(),
  meta: z.record(z.any()).optional(),
});

export const ApiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
    field: z.string().optional(),
  }),
});

export const ApiResponseTypeSchema = z.union([
  SingleEntityResponseSchema,
  EntityListResponseSchema,
  ApiErrorResponseSchema,
]);

// API response builders
export class ApiResponseBuilder {
  static success<T>(data: T, message?: string, meta?: Record<string, any>): SuccessResponse<T> {
    return {
      success: true,
      data,
      message,
      meta,
    };
  }

  static created<T>(data: T, message?: string): EntityCreatedResponse<T> {
    return {
      success: true,
      data,
      message: message || 'Entity created successfully',
      status: HTTP_STATUS.CREATED,
    };
  }

  static updated<T>(data: T, message?: string): EntityUpdatedResponse<T> {
    return {
      success: true,
      data,
      message: message || 'Entity updated successfully',
    };
  }

  static deleted(message?: string): EntityDeletedResponse {
    return {
      success: true,
      data: null,
      message: message || 'Entity deleted successfully',
      status: HTTP_STATUS.NO_CONTENT,
    };
  }

  static notFound(entity: string, id?: string): EntityNotFoundResponse {
    return {
      success: false,
      error: {
        code: 'ENTITY_NOT_FOUND',
        message: id ? `${entity} with id ${id} not found` : `${entity} not found`,
      },
      status: HTTP_STATUS.NOT_FOUND,
    };
  }

  static validationError(errors: { field: string; message: string }[]): ValidationErrorResponse {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errors,
      },
      status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
    };
  }

  static unauthorized(message?: string): UnauthorizedResponse {
    return {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: message || 'Authentication required',
      },
      status: HTTP_STATUS.UNAUTHORIZED,
    };
  }

  static forbidden(message?: string): ForbiddenResponse {
    return {
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: message || 'Access denied',
      },
      status: HTTP_STATUS.FORBIDDEN,
    };
  }

  static conflict(message: string, details?: any): ConflictResponse {
    return {
      success: false,
      error: {
        code: 'CONFLICT',
        message,
        details,
      },
      status: HTTP_STATUS.CONFLICT,
    };
  }

  static rateLimit(retryAfter?: number): RateLimitResponse {
    return {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests',
        retryAfter,
      },
      status: HTTP_STATUS.TOO_MANY_REQUESTS,
    };
  }

  static internalError(message?: string): InternalServerErrorResponse {
    return {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: message || 'Internal server error',
      },
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    };
  }
}

// Type guards for API responses
export function isSuccessResponse<T>(response: ApiResponseType<T>): response is SuccessResponse<T> {
  return response.success === true;
}

export function isErrorResponse<T>(response: ApiResponseType<T>): response is ErrorResponse {
  return response.success === false;
}

export function isSingleEntityResponse<T>(response: ApiResponseType<T>): response is SingleEntityResponse<T> {
  return isSuccessResponse(response) && !Array.isArray(response.data);
}

export function isEntityListResponse<T>(response: ApiResponseType<T>): response is EntityListResponse<T> {
  return isSuccessResponse(response) && Array.isArray(response.data);
}

export function isEntityCreatedResponse<T>(response: ApiResponseType<T>): response is EntityCreatedResponse<T> {
  return isSuccessResponse(response) && 'status' in response && response.status === HTTP_STATUS.CREATED;
}

export function isEntityUpdatedResponse<T>(response: ApiResponseType<T>): response is EntityUpdatedResponse<T> {
  return isSuccessResponse(response) && !('status' in response);
}

export function isEntityDeletedResponse(response: ApiResponseType): response is EntityDeletedResponse {
  return isSuccessResponse(response) && response.data === null;
}

export function isEntityNotFoundResponse(response: ApiResponseType): response is EntityNotFoundResponse {
  return isErrorResponse(response) && response.error.code === 'ENTITY_NOT_FOUND';
}

export function isValidationErrorResponse(response: ApiResponseType): response is ValidationErrorResponse {
  return isErrorResponse(response) && response.error.code === 'VALIDATION_ERROR';
}

export function isUnauthorizedResponse(response: ApiResponseType): response is UnauthorizedResponse {
  return isErrorResponse(response) && response.error.code === 'UNAUTHORIZED';
}

export function isForbiddenResponse(response: ApiResponseType): response is ForbiddenResponse {
  return isErrorResponse(response) && response.error.code === 'FORBIDDEN';
}

export function isConflictResponse(response: ApiResponseType): response is ConflictResponse {
  return isErrorResponse(response) && response.error.code === 'CONFLICT';
}

export function isRateLimitResponse(response: ApiResponseType): response is RateLimitResponse {
  return isErrorResponse(response) && response.error.code === 'RATE_LIMIT_EXCEEDED';
}

export function isInternalServerErrorResponse(response: ApiResponseType): response is InternalServerErrorResponse {
  return isErrorResponse(response) && response.error.code === 'INTERNAL_SERVER_ERROR';
}

// API response validation
export function validateApiResponse<T>(response: unknown): ApiResponseType<T> {
  const result = ApiResponseSchema.safeParse(response);
  if (!result.success) {
    throw new Error(`Invalid API response format: ${result.error.message}`);
  }
  return response as ApiResponseType<T>;
}

// API response transformation utilities
export function transformApiResponse<T, U>(
  response: ApiResponseType<T>,
  transformer: (data: T) => U
): ApiResponseType<U> {
  if (isSuccessResponse(response)) {
    return {
      ...response,
      data: transformer(response.data),
    } as ApiResponseType<U>;
  }
  return response as ApiResponseType<U>;
}

// API response error handling
export function handleApiResponse<T>(
  response: ApiResponseType<T>,
  onSuccess: (data: T) => void,
  onError?: (error: ErrorResponse) => void
): void {
  if (isSuccessResponse(response)) {
    onSuccess(response.data);
  } else if (onError) {
    onError(response);
  } else {
    throw new Error(`API Error: ${response.error.message}`);
  }
}

// API response async handling
export async function handleApiResponseAsync<T>(
  response: ApiResponseType<T>,
  onSuccess: (data: T) => Promise<void>,
  onError?: (error: ErrorResponse) => Promise<void>
): Promise<void> {
  if (isSuccessResponse(response)) {
    await onSuccess(response.data);
  } else if (onError) {
    await onError(response);
  } else {
    throw new Error(`API Error: ${response.error.message}`);
  }
}
