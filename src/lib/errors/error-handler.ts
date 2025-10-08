/**
 * Unified error handling system for Shabra OS
 * Provides centralized error processing, logging, and response formatting
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  BaseError, 
  ErrorCategory, 
  ErrorSeverity, 
  ErrorCategorizer,
  InternalServerError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  SecurityError,
  ErrorType 
} from './domain-errors';
import { AuditLogger } from '@/lib/advanced-security';
import { AUDIT_EVENT_TYPES, SECURITY_RISK_LEVELS } from '@/lib/advanced-security';

// Error response interface
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    type: string;
    category: string;
    severity: string;
    timestamp: string;
    requestId?: string;
    details?: Record<string, any>;
  };
}

// Error handler configuration
export interface ErrorHandlerConfig {
  includeStackTrace: boolean;
  logErrors: boolean;
  logLevel: 'error' | 'warn' | 'info';
  sanitizeErrors: boolean;
  rateLimitRetryAfter: number;
}

const defaultConfig: ErrorHandlerConfig = {
  includeStackTrace: process.env.NODE_ENV === 'development',
  logErrors: true,
  logLevel: 'error',
  sanitizeErrors: process.env.NODE_ENV === 'production',
  rateLimitRetryAfter: 900, // 15 minutes
};

export class ErrorHandler {
  private config: ErrorHandlerConfig;

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Handle and process errors
   */
  async handleError(
    error: Error | BaseError,
    request?: NextRequest,
    _context?: Record<string, any>
  ): Promise<NextResponse<ErrorResponse>> {
    // Convert unknown errors to BaseError
    let baseError = this.normalizeError(error);
    
    // Add request context if available
    // TODO: Fix context assignment - context property is read-only
    // if (request) {
    //   this.addRequestContext(baseError, request);
    // }
    
    // Add additional context
    // TODO: Fix context assignment - context property is read-only
    // if (context) {
    //   if (!baseError.context) {
    //     baseError.context = {};
    //   }
    //   Object.assign(baseError.context, context);
    // }

    // Log the error
    if (this.config.logErrors) {
      await this.logError(baseError, request);
    }

    // Create error response
    const response = this.createErrorResponse(baseError, request);
    
    // Add security headers
    this.addSecurityHeaders(response);

    return response;
  }

  /**
   * Normalize unknown errors to BaseError
   */
  private normalizeError(error: Error | BaseError): BaseError {
    if (error instanceof BaseError) {
      return error;
    }

    // Handle specific error types
    if (error.name === 'ValidationError') {
      return new ValidationError(
        error.message,
        { originalError: error.name, stack: error.stack }
      );
    }

    if (error.name === 'UnauthorizedError') {
      return new AuthenticationError(
        error.message,
        ErrorType.INVALID_CREDENTIALS,
        { originalError: error.name, stack: error.stack }
      );
    }

    if (error.name === 'ForbiddenError') {
      return new AuthorizationError(
        error.message,
        ErrorType.ACCESS_DENIED,
        { originalError: error.name, stack: error.stack }
      );
    }

    if (error.name === 'NotFoundError') {
      return new NotFoundError(
        error.message,
        ErrorType.RESOURCE_NOT_FOUND,
        { originalError: error.name, stack: error.stack }
      );
    }

    if (error.name === 'ConflictError') {
      return new ConflictError(
        error.message,
        ErrorType.RESOURCE_ALREADY_EXISTS,
        { originalError: error.name, stack: error.stack }
      );
    }

    if (error.name === 'RateLimitError') {
      return new RateLimitError(
        error.message,
        undefined,
        { originalError: error.name, stack: error.stack }
      );
    }

    // Handle Prisma errors
    if (error.name === 'PrismaClientKnownRequestError') {
      return this.handlePrismaError(error);
    }

    if (error.name === 'PrismaClientUnknownRequestError') {
      return new DatabaseError(
        'Database operation failed',
        ErrorType.QUERY_FAILED,
        { originalError: error.name, message: error.message }
      );
    }

    if (error.name === 'PrismaClientValidationError') {
      return new ValidationError(
        'Database validation failed',
        { originalError: error.name, message: error.message }
      );
    }

    // Handle network errors
    if (error.name === 'FetchError' || error.name === 'NetworkError') {
      return new InternalServerError(
        'Network request failed',
        { originalError: error.name, message: error.message, stack: error.stack }
      );
    }

    // Handle timeout errors
    if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
      return new InternalServerError(
        'Request timeout',
        { originalError: error.name, message: error.message, stack: error.stack }
      );
    }

    // Default to internal server error
    return new InternalServerError(
      this.config.sanitizeErrors ? 'An internal error occurred' : error.message,
      { 
        originalError: error.name, 
        message: error.message,
        stack: error.stack 
      }
    );
  }

  /**
   * Handle Prisma-specific errors
   */
  private handlePrismaError(error: any): BaseError {
    const { code, meta } = error;
    
    switch (code) {
      case 'P2002':
        return new ConflictError(
          'Resource already exists',
          ErrorType.DUPLICATE_ENTRY,
          { prismaCode: code, target: meta?.target }
        );
      
      case 'P2025':
        return new NotFoundError(
          'Record not found',
          ErrorType.RESOURCE_NOT_FOUND,
          { prismaCode: code }
        );
      
      case 'P2003':
        return new ValidationError(
          'Foreign key constraint failed',
          { prismaCode: code, field: meta?.field_name }
        );
      
      case 'P2014':
        return new ValidationError(
          'Invalid relation operation',
          { prismaCode: code, relation: meta?.relation_name }
        );
      
      case 'P2021':
        return new DatabaseError(
          'Table does not exist',
          ErrorType.QUERY_FAILED,
          { prismaCode: code, table: meta?.table }
        );
      
      case 'P2022':
        return new DatabaseError(
          'Column does not exist',
          ErrorType.QUERY_FAILED,
          { prismaCode: code, column: meta?.column }
        );
      
      default:
        return new DatabaseError(
          'Database operation failed',
          ErrorType.QUERY_FAILED,
          { prismaCode: code, message: error.message }
        );
    }
  }

  /**
   * Add request context to error
   * TODO: Fix context assignment - context property is read-only
   */
  // private addRequestContext(_error: BaseError, request: NextRequest): void {
  //   const _requestId = request.headers.get('x-request-id') || 
  //                    request.headers.get('x-correlation-id') ||
  //                    crypto.randomUUID();
  //   
  //   // TODO: Fix context assignment - context property is read-only
  //   // error.context = {
  //   //   ...error.context,
  //   //   request: {
  //   //     id: requestId,
  //   //     method: request.method,
  //   //     url: request.url,
  //   //     pathname: request.nextUrl.pathname,
  //   //     userAgent: request.headers.get('user-agent'),
  //   //     ip: request.headers.get('x-forwarded-for') || 
  //   //         request.headers.get('x-real-ip') || 
  //   //         'unknown',
  //   //   },
  //   // };
  // }

  /**
   * Log error with appropriate level and context
   */
  private async logError(error: BaseError, _request?: NextRequest): Promise<void> {
    const category = ErrorCategorizer.getCategory(error);
    const severity = ErrorCategorizer.getSeverity(error);
    
    const logData = {
      error: error.toJSON(),
      category,
      severity,
      timestamp: new Date().toISOString(),
      requestId: error.context?.request?.id,
      userId: error.context?.user?.userId,
    };

    // Log to console based on severity
    if (severity === ErrorSeverity.CRITICAL) {
      console.error('CRITICAL ERROR:', logData);
    } else if (severity === ErrorSeverity.HIGH) {
      console.error('HIGH SEVERITY ERROR:', logData);
    } else if (severity === ErrorSeverity.MEDIUM) {
      console.warn('MEDIUM SEVERITY ERROR:', logData);
    } else {
      console.info('LOW SEVERITY ERROR:', logData);
    }

    // Log to audit system for security-related errors
    if (category === ErrorCategory.SECURITY || category === ErrorCategory.AUTHENTICATION) {
      try {
        await AuditLogger.logSecurityEvent(
          AUDIT_EVENT_TYPES.SYSTEM_ERROR,
          {
            error: error.errorCode,
            message: error.message,
            category,
            severity,
            context: error.context,
          },
          severity === ErrorSeverity.CRITICAL ? SECURITY_RISK_LEVELS.CRITICAL : 
          severity === ErrorSeverity.HIGH ? SECURITY_RISK_LEVELS.HIGH :
          SECURITY_RISK_LEVELS.MEDIUM,
          error.context?.user?.userId,
          error.context?.request?.ip
        );
      } catch (auditError) {
        console.error('Failed to log security error to audit system:', auditError);
      }
    }
  }

  /**
   * Create standardized error response
   */
  private createErrorResponse(error: BaseError, _request?: NextRequest): NextResponse<ErrorResponse> {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: error.errorCode,
        message: this.sanitizeMessage(error.message),
        type: error.constructor.name,
        category: ErrorCategorizer.getCategory(error),
        severity: ErrorCategorizer.getSeverity(error),
        timestamp: error.timestamp.toISOString(),
        requestId: error.context?.request?.id,
        details: this.sanitizeDetails(error.context),
      },
    };

    // Add stack trace in development
    if (this.config.includeStackTrace && error.stack) {
      (response.error as any).stack = error.stack;
    }

    // Add retry-after header for rate limit errors
    if (error.errorCode === ErrorType.RATE_LIMIT_EXCEEDED) {
      const retryAfter = error.context?.retryAfter || this.config.rateLimitRetryAfter;
      return NextResponse.json(response, {
        status: error.statusCode,
        headers: {
          'Retry-After': retryAfter.toString(),
        },
      });
    }

    return NextResponse.json(response, { status: error.statusCode });
  }

  /**
   * Sanitize error message for production
   */
  private sanitizeMessage(message: string): string {
    if (!this.config.sanitizeErrors) {
      return message;
    }

    // Remove sensitive information from error messages
    return message
      .replace(/password[=:]\s*[^\s,]+/gi, 'password=***')
      .replace(/token[=:]\s*[^\s,]+/gi, 'token=***')
      .replace(/key[=:]\s*[^\s,]+/gi, 'key=***')
      .replace(/secret[=:]\s*[^\s,]+/gi, 'secret=***');
  }

  /**
   * Sanitize error details for production
   */
  private sanitizeDetails(context?: Record<string, any>): Record<string, any> | undefined {
    if (!context || !this.config.sanitizeErrors) {
      return context;
    }

    const sanitized = { ...context };
    
    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'key', 'secret', 'authorization'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '***';
      }
    });

    // Sanitize nested objects
    if (sanitized.user) {
      sanitized.user = {
        ...sanitized.user,
        password: undefined,
        token: undefined,
      };
    }

    return sanitized;
  }

  /**
   * Add security headers to error response
   */
  private addSecurityHeaders(response: NextResponse): void {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  }
}

// Global error handler instance
export const errorHandler = new ErrorHandler();

// Utility functions for common error scenarios
export const ErrorUtils = {
  /**
   * Create a validation error for missing required fields
   */
  missingField: (field: string) => 
    new ValidationError(`Missing required field: ${field}`, undefined, field),

  /**
   * Create a validation error for invalid format
   */
  invalidFormat: (field: string, expectedFormat: string) =>
    new ValidationError(`Invalid format for field '${field}'. Expected: ${expectedFormat}`, { expectedFormat }, field),

  /**
   * Create an authentication error for invalid credentials
   */
  invalidCredentials: (context?: Record<string, any>) =>
    new AuthenticationError('Invalid credentials', ErrorType.INVALID_CREDENTIALS, context),

  /**
   * Create an authorization error for insufficient permissions
   */
  insufficientPermissions: (resource?: string) =>
    new AuthorizationError('Insufficient permissions', ErrorType.INSUFFICIENT_PERMISSIONS, { resource }),

  /**
   * Create a not found error for missing resources
   */
  resourceNotFound: (resourceType: string, resourceId?: string) =>
    new NotFoundError(`${resourceType} not found`, ErrorType.RESOURCE_NOT_FOUND, { resourceType, resourceId }),

  /**
   * Create a conflict error for duplicate resources
   */
  resourceExists: (resourceType: string, resourceId?: string) =>
    new ConflictError(`${resourceType} already exists`, ErrorType.RESOURCE_ALREADY_EXISTS, { resourceType, resourceId }),

  /**
   * Create a rate limit error
   */
  rateLimitExceeded: (retryAfter?: number) =>
    new RateLimitError('Rate limit exceeded', retryAfter),

  /**
   * Create a database error
   */
  databaseError: (operation: string, context?: Record<string, any>) =>
    new DatabaseError(`Database ${operation} failed`, ErrorType.QUERY_FAILED, { operation, ...context }),

  /**
   * Create a security error
   */
  securityViolation: (violation: string, context?: Record<string, any>) =>
    new SecurityError(`Security violation: ${violation}`, ErrorType.SECURITY_VIOLATION, { violation, ...context }),
};
