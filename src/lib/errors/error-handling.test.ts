import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    auditLog: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

// Mock advanced security
vi.mock('@/lib/advanced-security', () => ({
  AuditLogger: {
    logSecurityEvent: vi.fn(),
  },
  AUDIT_EVENT_TYPES: {
    SYSTEM_ERROR: 'SYSTEM_ERROR',
  },
  SECURITY_RISK_LEVELS: {
    CRITICAL: 'CRITICAL',
    HIGH: 'HIGH',
    MEDIUM: 'MEDIUM',
  },
}));

import {
  BaseError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  SecurityError,
  BusinessLogicError,
  InternalServerError,
  ErrorFactory,
  ErrorCategorizer,
  ErrorContextBuilder,
  ErrorCategory,
  ErrorSeverity,
  ErrorType,
} from './domain-errors';

import {
  ErrorHandler,
  ErrorUtils,
} from './error-handler';

import {
  ApiResponse,
  ResponseValidator,
  ResponseTransformer,
} from './api-responses';

import {
  withApiErrorHandling,
  ErrorLogger,
  ErrorRecovery,
} from './error-middleware';

describe('Domain Errors', () => {
  describe('BaseError', () => {
    it('should create a base error with all properties', () => {
      const error = new BaseError(
        'Test error',
        400,
        'TEST_ERROR',
        true,
        { test: 'context' }
      );

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe('TEST_ERROR');
      expect(error.isOperational).toBe(true);
      expect(error.context).toEqual({ test: 'context' });
      expect(error.timestamp).toBeInstanceOf(Date);
      expect(error.name).toBe('BaseError');
    });

    it('should serialize to JSON correctly', () => {
      const error = new BaseError('Test error', 400, 'TEST_ERROR');
      const json = error.toJSON();

      expect(json).toMatchObject({
        name: 'BaseError',
        message: 'Test error',
        statusCode: 400,
        errorCode: 'TEST_ERROR',
        isOperational: true,
        timestamp: expect.any(String),
      });
    });
  });

  describe('Specific Error Types', () => {
    it('should create validation error', () => {
      const error = new ValidationError('Invalid input', undefined, 'email');
      
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe(ErrorType.VALIDATION_FAILED);
      expect(error.context?.field).toBe('email');
    });

    it('should create authentication error', () => {
      const error = new AuthenticationError('Invalid credentials');
      
      expect(error.statusCode).toBe(401);
      expect(error.errorCode).toBe(ErrorType.INVALID_CREDENTIALS);
    });

    it('should create authorization error', () => {
      const error = new AuthorizationError('Access denied');
      
      expect(error.statusCode).toBe(403);
      expect(error.errorCode).toBe(ErrorType.ACCESS_DENIED);
    });

    it('should create not found error', () => {
      const error = new NotFoundError('User not found');
      
      expect(error.statusCode).toBe(404);
      expect(error.errorCode).toBe(ErrorType.RESOURCE_NOT_FOUND);
    });

    it('should create conflict error', () => {
      const error = new ConflictError('User already exists');
      
      expect(error.statusCode).toBe(409);
      expect(error.errorCode).toBe(ErrorType.RESOURCE_ALREADY_EXISTS);
    });

    it('should create rate limit error', () => {
      const error = new RateLimitError('Too many requests', 900);
      
      expect(error.statusCode).toBe(429);
      expect(error.errorCode).toBe(ErrorType.RATE_LIMIT_EXCEEDED);
      expect(error.context?.retryAfter).toBe(900);
    });

    it('should create database error', () => {
      const error = new DatabaseError('Query failed');
      
      expect(error.statusCode).toBe(500);
      expect(error.errorCode).toBe(ErrorType.QUERY_FAILED);
    });

    it('should create security error', () => {
      const error = new SecurityError('Security violation');
      
      expect(error.statusCode).toBe(403);
      expect(error.errorCode).toBe(ErrorType.SECURITY_VIOLATION);
    });

    it('should create business logic error', () => {
      const error = new BusinessLogicError('Business rule violated');
      
      expect(error.statusCode).toBe(422);
      expect(error.errorCode).toBe(ErrorType.BUSINESS_RULE_VIOLATION);
    });

    it('should create internal server error', () => {
      const error = new InternalServerError('Internal error');
      
      expect(error.statusCode).toBe(500);
      expect(error.errorCode).toBe(ErrorType.INTERNAL_SERVER_ERROR);
      expect(error.isOperational).toBe(false);
    });
  });

  describe('ErrorFactory', () => {
    it('should create validation error', () => {
      const error = ErrorFactory.createValidationError('Invalid input', 'email');
      
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.context?.field).toBe('email');
    });

    it('should create authentication error', () => {
      const error = ErrorFactory.createAuthenticationError('Invalid credentials');
      
      expect(error).toBeInstanceOf(AuthenticationError);
      expect(error.errorCode).toBe(ErrorType.INVALID_CREDENTIALS);
    });

    it('should create authorization error', () => {
      const error = ErrorFactory.createAuthorizationError('Access denied');
      
      expect(error).toBeInstanceOf(AuthorizationError);
      expect(error.errorCode).toBe(ErrorType.ACCESS_DENIED);
    });

    it('should create not found error', () => {
      const error = ErrorFactory.createNotFoundError('User not found');
      
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.errorCode).toBe(ErrorType.RESOURCE_NOT_FOUND);
    });

    it('should create conflict error', () => {
      const error = ErrorFactory.createConflictError('User already exists');
      
      expect(error).toBeInstanceOf(ConflictError);
      expect(error.errorCode).toBe(ErrorType.RESOURCE_ALREADY_EXISTS);
    });

    it('should create rate limit error', () => {
      const error = ErrorFactory.createRateLimitError('Too many requests', 900);
      
      expect(error).toBeInstanceOf(RateLimitError);
      expect(error.context?.retryAfter).toBe(900);
    });

    it('should create database error', () => {
      const error = ErrorFactory.createDatabaseError('Query failed');
      
      expect(error).toBeInstanceOf(DatabaseError);
      expect(error.errorCode).toBe(ErrorType.QUERY_FAILED);
    });

    it('should create security error', () => {
      const error = ErrorFactory.createSecurityError('Security violation');
      
      expect(error).toBeInstanceOf(SecurityError);
      expect(error.errorCode).toBe(ErrorType.SECURITY_VIOLATION);
    });

    it('should create business logic error', () => {
      const error = ErrorFactory.createBusinessLogicError('Business rule violated');
      
      expect(error).toBeInstanceOf(BusinessLogicError);
      expect(error.errorCode).toBe(ErrorType.BUSINESS_RULE_VIOLATION);
    });

    it('should create internal server error', () => {
      const error = ErrorFactory.createInternalServerError('Internal error');
      
      expect(error).toBeInstanceOf(InternalServerError);
      expect(error.errorCode).toBe(ErrorType.INTERNAL_SERVER_ERROR);
    });
  });

  describe('ErrorCategorizer', () => {
    it('should categorize validation error', () => {
      const error = new ValidationError('Invalid input');
      const category = ErrorCategorizer.getCategory(error);
      const severity = ErrorCategorizer.getSeverity(error);
      
      expect(category).toBe(ErrorCategory.VALIDATION);
      expect(severity).toBe(ErrorSeverity.LOW);
    });

    it('should categorize authentication error', () => {
      const error = new AuthenticationError('Invalid credentials');
      const category = ErrorCategorizer.getCategory(error);
      const severity = ErrorCategorizer.getSeverity(error);
      
      expect(category).toBe(ErrorCategory.AUTHENTICATION);
      expect(severity).toBe(ErrorSeverity.MEDIUM);
    });

    it('should categorize authorization error', () => {
      const error = new AuthorizationError('Access denied');
      const category = ErrorCategorizer.getCategory(error);
      const severity = ErrorCategorizer.getSeverity(error);
      
      expect(category).toBe(ErrorCategory.AUTHORIZATION);
      expect(severity).toBe(ErrorSeverity.HIGH);
    });

    it('should categorize not found error', () => {
      const error = new NotFoundError('User not found');
      const category = ErrorCategorizer.getCategory(error);
      const severity = ErrorCategorizer.getSeverity(error);
      
      expect(category).toBe(ErrorCategory.NOT_FOUND);
      expect(severity).toBe(ErrorSeverity.LOW);
    });

    it('should categorize conflict error', () => {
      const error = new ConflictError('User already exists');
      const category = ErrorCategorizer.getCategory(error);
      const severity = ErrorCategorizer.getSeverity(error);
      
      expect(category).toBe(ErrorCategory.CONFLICT);
      expect(severity).toBe(ErrorSeverity.MEDIUM);
    });

    it('should categorize rate limit error', () => {
      const error = new RateLimitError('Too many requests');
      const category = ErrorCategorizer.getCategory(error);
      const severity = ErrorCategorizer.getSeverity(error);
      
      expect(category).toBe(ErrorCategory.RATE_LIMIT);
      expect(severity).toBe(ErrorSeverity.HIGH);
    });

    it('should categorize database error', () => {
      const error = new DatabaseError('Query failed');
      const category = ErrorCategorizer.getCategory(error);
      const severity = ErrorCategorizer.getSeverity(error);
      
      expect(category).toBe(ErrorCategory.DATABASE);
      expect(severity).toBe(ErrorSeverity.CRITICAL);
    });

    it('should categorize security error', () => {
      const error = new SecurityError('Security violation');
      const category = ErrorCategorizer.getCategory(error);
      const severity = ErrorCategorizer.getSeverity(error);
      
      expect(category).toBe(ErrorCategory.SECURITY);
      expect(severity).toBe(ErrorSeverity.HIGH);
    });

    it('should categorize business logic error', () => {
      const error = new BusinessLogicError('Business rule violated');
      const category = ErrorCategorizer.getCategory(error);
      const severity = ErrorCategorizer.getSeverity(error);
      
      expect(category).toBe(ErrorCategory.BUSINESS_LOGIC);
      expect(severity).toBe(ErrorSeverity.MEDIUM);
    });

    it('should categorize internal server error', () => {
      const error = new InternalServerError('Internal error');
      const category = ErrorCategorizer.getCategory(error);
      const severity = ErrorCategorizer.getSeverity(error);
      
      expect(category).toBe(ErrorCategory.INTERNAL);
      expect(severity).toBe(ErrorSeverity.CRITICAL);
    });
  });

  describe('ErrorContextBuilder', () => {
    it('should build error context with user info', () => {
      const context = new ErrorContextBuilder()
        .addUser('user123', 'user@example.com')
        .build();

      expect(context.user).toEqual({
        userId: 'user123',
        email: 'user@example.com',
      });
    });

    it('should build error context with request info', () => {
      const context = new ErrorContextBuilder()
        .addRequest('req123', 'POST', '/api/users')
        .build();

      expect(context.request).toEqual({
        requestId: 'req123',
        method: 'POST',
        path: '/api/users',
      });
    });

    it('should build error context with resource info', () => {
      const context = new ErrorContextBuilder()
        .addResource('User', 'user123')
        .build();

      expect(context.resource).toEqual({
        resourceType: 'User',
        resourceId: 'user123',
      });
    });

    it('should build error context with field info', () => {
      const context = new ErrorContextBuilder()
        .addField('email', 'user@example.com')
        .addField('name', 'John Doe')
        .build();

      expect(context.fields).toEqual({
        email: 'user@example.com',
        name: 'John Doe',
      });
    });

    it('should build error context with metadata', () => {
      const context = new ErrorContextBuilder()
        .addMetadata('operation', 'create')
        .addMetadata('source', 'api')
        .build();

      expect(context.metadata).toEqual({
        operation: 'create',
        source: 'api',
      });
    });

    it('should build complex error context', () => {
      const context = new ErrorContextBuilder()
        .addUser('user123', 'user@example.com')
        .addRequest('req123', 'POST', '/api/users')
        .addResource('User', 'user123')
        .addField('email', 'user@example.com')
        .addMetadata('operation', 'create')
        .build();

      expect(context).toEqual({
        user: { userId: 'user123', email: 'user@example.com' },
        request: { requestId: 'req123', method: 'POST', path: '/api/users' },
        resource: { resourceType: 'User', resourceId: 'user123' },
        fields: { email: 'user@example.com' },
        metadata: { operation: 'create' },
      });
    });
  });
});

describe('Error Handler', () => {
  let errorHandler: ErrorHandler;
  let mockRequest: NextRequest;

  beforeEach(() => {
    errorHandler = new ErrorHandler();
    mockRequest = {
      url: 'http://localhost:3000/api/users',
      nextUrl: {
        pathname: '/api/users',
        origin: 'http://localhost:3000',
      },
      headers: new Map([
        ['x-forwarded-for', '127.0.0.1'],
        ['user-agent', 'Mozilla/5.0 Test Browser'],
      ]),
    } as NextRequest;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Error Normalization', () => {
    it('should normalize BaseError', async () => {
      const error = new ValidationError('Invalid input');
      const response = await errorHandler.handleError(error, mockRequest);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error.code).toBe(ErrorType.VALIDATION_FAILED);
    });

    it('should normalize generic Error', async () => {
      const error = new Error('Generic error');
      const response = await errorHandler.handleError(error, mockRequest);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error.code).toBe(ErrorType.INTERNAL_SERVER_ERROR);
    });

    it('should normalize Prisma errors', async () => {
      const prismaError = {
        name: 'PrismaClientKnownRequestError',
        code: 'P2002',
        message: 'Unique constraint failed',
        meta: { target: ['email'] },
      };

      const response = await errorHandler.handleError(prismaError as any, mockRequest);

      expect(response.status).toBe(409);
      const body = await response.json();
      expect(body.error.code).toBe(ErrorType.DUPLICATE_ENTRY);
    });

    it('should normalize network errors', async () => {
      const networkError = {
        name: 'FetchError',
        message: 'Network request failed',
      };

      const response = await errorHandler.handleError(networkError as any, mockRequest);

      expect(response.status).toBe(502);
      const body = await response.json();
      expect(body.error.code).toBe(ErrorType.NETWORK_ERROR);
    });

    it('should normalize timeout errors', async () => {
      const timeoutError = {
        name: 'TimeoutError',
        message: 'Request timeout',
      };

      const response = await errorHandler.handleError(timeoutError as any, mockRequest);

      expect(response.status).toBe(408);
      const body = await response.json();
      expect(body.error.code).toBe(ErrorType.TIMEOUT);
    });
  });

  describe('Error Response Creation', () => {
    it('should create error response with all fields', async () => {
      const error = new ValidationError('Invalid input', { field: 'email' });
      const response = await errorHandler.handleError(error, mockRequest);

      expect(response.status).toBe(400);
      const body = await response.json();
      
      expect(body).toMatchObject({
        success: false,
        error: {
          code: ErrorType.VALIDATION_FAILED,
          message: 'Invalid input',
          type: 'ValidationError',
          category: 'VALIDATION',
          severity: 'LOW',
          timestamp: expect.any(String),
          requestId: expect.any(String),
          details: expect.any(Object),
        },
      });
    });

    it('should add retry-after header for rate limit errors', async () => {
      const error = new RateLimitError('Too many requests', 900);
      const response = await errorHandler.handleError(error, mockRequest);

      expect(response.status).toBe(429);
      expect(response.headers.get('Retry-After')).toBe('900');
    });

    it('should add security headers to error response', async () => {
      const error = new ValidationError('Invalid input');
      const response = await errorHandler.handleError(error, mockRequest);

      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
      expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block');
    });
  });

  describe('Error Sanitization', () => {
    it('should sanitize sensitive information in production', async () => {
      const errorHandler = new ErrorHandler({ sanitizeErrors: true });
      const error = new ValidationError('Password=secret123 is invalid');
      const response = await errorHandler.handleError(error, mockRequest);

      const body = await response.json();
      expect(body.error.message).toBe('password=*** is invalid');
    });

    it('should not sanitize in development', async () => {
      const errorHandler = new ErrorHandler({ sanitizeErrors: false });
      const error = new ValidationError('Password=secret123 is invalid');
      const response = await errorHandler.handleError(error, mockRequest);

      const body = await response.json();
      expect(body.error.message).toBe('Password=secret123 is invalid');
    });
  });
});

describe('API Responses', () => {
  describe('Success Responses', () => {
    it('should create success response', () => {
      const response = ApiResponse.success({ id: 1, name: 'Test' });

      expect(response.status).toBe(200);
      expect(response.json()).resolves.toMatchObject({
        success: true,
        data: { id: 1, name: 'Test' },
        meta: {
          timestamp: expect.any(String),
        },
      });
    });

    it('should create created response', () => {
      const response = ApiResponse.created({ id: 1, name: 'Test' });

      expect(response.status).toBe(201);
    });

    it('should create accepted response', () => {
      const response = ApiResponse.accepted({ id: 1, name: 'Test' });

      expect(response.status).toBe(202);
    });

    it('should create no content response', () => {
      const response = ApiResponse.noContent();

      expect(response.status).toBe(204);
    });

    it('should create paginated response', () => {
      const response = ApiResponse.paginated(
        [{ id: 1 }, { id: 2 }],
        { page: 1, limit: 10, total: 25 }
      );

      expect(response.status).toBe(200);
      expect(response.json()).resolves.toMatchObject({
        success: true,
        data: [{ id: 1 }, { id: 2 }],
        meta: {
          pagination: {
            page: 1,
            limit: 10,
            total: 25,
            totalPages: 3,
            hasNext: true,
            hasPrev: false,
          },
        },
      });
    });
  });

  describe('Error Responses', () => {
    it('should create validation error response', () => {
      const response = ApiResponse.validationError('Invalid input', 'email');

      expect(response.status).toBe(400);
      expect(response.json()).resolves.toMatchObject({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Invalid input',
          type: 'ValidationError',
          category: 'VALIDATION',
          severity: 'LOW',
        },
      });
    });

    it('should create authentication error response', () => {
      const response = ApiResponse.authenticationError();

      expect(response.status).toBe(401);
      expect(response.json()).resolves.toMatchObject({
        success: false,
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          type: 'AuthenticationError',
          category: 'AUTHENTICATION',
          severity: 'MEDIUM',
        },
      });
    });

    it('should create authorization error response', () => {
      const response = ApiResponse.authorizationError();

      expect(response.status).toBe(403);
      expect(response.json()).resolves.toMatchObject({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          type: 'AuthorizationError',
          category: 'AUTHORIZATION',
          severity: 'HIGH',
        },
      });
    });

    it('should create not found error response', () => {
      const response = ApiResponse.notFound();

      expect(response.status).toBe(404);
      expect(response.json()).resolves.toMatchObject({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          type: 'NotFoundError',
          category: 'NOT_FOUND',
          severity: 'LOW',
        },
      });
    });

    it('should create conflict error response', () => {
      const response = ApiResponse.conflict();

      expect(response.status).toBe(409);
      expect(response.json()).resolves.toMatchObject({
        success: false,
        error: {
          code: 'RESOURCE_CONFLICT',
          type: 'ConflictError',
          category: 'CONFLICT',
          severity: 'MEDIUM',
        },
      });
    });

    it('should create rate limit error response', () => {
      const response = ApiResponse.rateLimit('Too many requests', 900);

      expect(response.status).toBe(429);
      expect(response.headers.get('Retry-After')).toBe('900');
      expect(response.json()).resolves.toMatchObject({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          type: 'RateLimitError',
          category: 'RATE_LIMIT',
          severity: 'HIGH',
        },
      });
    });

    it('should create internal server error response', () => {
      const response = ApiResponse.internalError();

      expect(response.status).toBe(500);
      expect(response.json()).resolves.toMatchObject({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          type: 'InternalServerError',
          category: 'INTERNAL',
          severity: 'CRITICAL',
        },
      });
    });

    it('should create service unavailable error response', () => {
      const response = ApiResponse.serviceUnavailable();

      expect(response.status).toBe(503);
      expect(response.json()).resolves.toMatchObject({
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          type: 'ServiceUnavailableError',
          category: 'EXTERNAL_SERVICE',
          severity: 'HIGH',
        },
      });
    });
  });

  describe('Response Validation', () => {
    it('should validate success response', () => {
      const response = { success: true, data: { id: 1 } };
      expect(ResponseValidator.isValidSuccessResponse(response)).toBe(true);
    });

    it('should validate paginated response', () => {
      const response = {
        success: true,
        data: [{ id: 1 }],
        meta: {
          pagination: {
            page: 1,
            limit: 10,
            total: 25,
            totalPages: 3,
            hasNext: true,
            hasPrev: false,
          },
        },
      };
      expect(ResponseValidator.isValidPaginatedResponse(response)).toBe(true);
    });

    it('should validate error response', () => {
      const response = {
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Invalid input',
          type: 'ValidationError',
          category: 'VALIDATION',
          severity: 'LOW',
          timestamp: new Date().toISOString(),
        },
      };
      expect(ResponseValidator.isValidErrorResponse(response)).toBe(true);
    });
  });

  describe('Response Transformation', () => {
    it('should transform data to remove sensitive fields', () => {
      const data = {
        id: 1,
        email: 'user@example.com',
        password: 'secret123',
        token: 'abc123',
        secret: 'secret456',
        profile: {
          name: 'John Doe',
          password: 'secret789',
        },
      };

      const transformed = ResponseTransformer.transformData(data);

      expect(transformed).toEqual({
        id: 1,
        email: 'user@example.com',
        profile: {
          name: 'John Doe',
        },
      });
    });

    it('should add metadata to response', () => {
      const response = {
        success: true,
        data: { id: 1 },
        meta: { timestamp: '2023-01-01T00:00:00Z' },
      };

      const enhanced = ResponseTransformer.addMetadata(response, {
        requestId: 'req123',
        version: '1.0.0',
      });

      expect(enhanced.meta).toEqual({
        timestamp: '2023-01-01T00:00:00Z',
        requestId: 'req123',
        version: '1.0.0',
      });
    });
  });
});

describe('Error Middleware', () => {
  describe('API Error Handling', () => {
    it('should handle successful API calls', async () => {
      const handler = withApiErrorHandling(async () => {
        return ApiResponse.success({ id: 1 });
      });

      const mockRequest = {
        headers: new Map(),
        nextUrl: {
          pathname: '/api/test',
        },
        url: 'http://localhost:3000/api/test',
        method: 'GET',
      } as NextRequest;

      const response = await handler(mockRequest);
      expect(response.status).toBe(200);
    });

    it('should handle API errors', async () => {
      const handler = withApiErrorHandling(async () => {
        throw new ValidationError('Invalid input');
      });

      const mockRequest = {
        headers: new Map(),
        nextUrl: {
          pathname: '/api/test',
        },
        url: 'http://localhost:3000/api/test',
        method: 'GET',
      } as NextRequest;

      const response = await handler(mockRequest);
      expect(response.status).toBe(400);
    });

    it('should handle unknown errors', async () => {
      const handler = withApiErrorHandling(async () => {
        throw new Error('Unknown error');
      });

      const mockRequest = {
        headers: new Map(),
        nextUrl: {
          pathname: '/api/test',
        },
        url: 'http://localhost:3000/api/test',
        method: 'GET',
      } as NextRequest;

      const response = await handler(mockRequest);
      expect(response.status).toBe(500);
    });
  });

  describe('Error Recovery', () => {
    it('should retry operation with exponential backoff', async () => {
      let attempts = 0;
      const operation = async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Temporary failure');
        }
        return 'success';
      };

      const result = await ErrorRecovery.retry(operation, 3, 10);
      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });

    it('should use fallback when primary operation fails', async () => {
      const primary = async () => {
        throw new Error('Primary failed');
      };
      const fallback = async () => 'fallback success';

      const result = await ErrorRecovery.withFallback(primary, fallback);
      expect(result).toBe('fallback success');
    });

    it('should timeout operation', async () => {
      const operation = async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return 'success';
      };

      await expect(
        ErrorRecovery.withTimeout(operation, 100)
      ).rejects.toThrow('Operation timeout');
    });
  });
});

describe('Error Utils', () => {
  it('should create missing field error', () => {
    const error = ErrorUtils.missingField('email');
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.message).toBe('Missing required field: email');
    expect(error.context?.field).toBe('email');
  });

  it('should create invalid format error', () => {
    const error = ErrorUtils.invalidFormat('email', 'valid email address');
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.message).toBe("Invalid format for field 'email'. Expected: valid email address");
    expect(error.context?.field).toBe('email');
  });

  it('should create invalid credentials error', () => {
    const error = ErrorUtils.invalidCredentials();
    expect(error).toBeInstanceOf(AuthenticationError);
    expect(error.message).toBe('Invalid credentials');
  });

  it('should create insufficient permissions error', () => {
    const error = ErrorUtils.insufficientPermissions('users');
    expect(error).toBeInstanceOf(AuthorizationError);
    expect(error.message).toBe('Insufficient permissions');
    expect(error.context?.resource).toBe('users');
  });

  it('should create resource not found error', () => {
    const error = ErrorUtils.resourceNotFound('User', 'user123');
    expect(error).toBeInstanceOf(NotFoundError);
    expect(error.message).toBe('User not found');
    expect(error.context?.resourceType).toBe('User');
    expect(error.context?.resourceId).toBe('user123');
  });

  it('should create resource exists error', () => {
    const error = ErrorUtils.resourceExists('User', 'user123');
    expect(error).toBeInstanceOf(ConflictError);
    expect(error.message).toBe('User already exists');
    expect(error.context?.resourceType).toBe('User');
    expect(error.context?.resourceId).toBe('user123');
  });

  it('should create rate limit error', () => {
    const error = ErrorUtils.rateLimitExceeded(900);
    expect(error).toBeInstanceOf(RateLimitError);
    expect(error.message).toBe('Rate limit exceeded');
    expect(error.context?.retryAfter).toBe(900);
  });

  it('should create database error', () => {
    const error = ErrorUtils.databaseError('create', { table: 'users' });
    expect(error).toBeInstanceOf(DatabaseError);
    expect(error.message).toBe('Database create failed');
    expect(error.context?.operation).toBe('create');
    expect(error.context?.table).toBe('users');
  });

  it('should create security error', () => {
    const error = ErrorUtils.securityViolation('brute force attempt');
    expect(error).toBeInstanceOf(SecurityError);
    expect(error.message).toBe('Security violation: brute force attempt');
    expect(error.context?.violation).toBe('brute force attempt');
  });
});
