/**
 * Domain-specific error classes and error types for Shabra OS
 * Provides structured error handling with proper categorization and context
 */

// Base error class with common properties
export abstract class BaseError extends Error {
  public readonly isOperational: boolean;
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly context?: Record<string, any>;
  public readonly timestamp: Date;
  public readonly stack?: string;

  constructor(
    message: string,
    statusCode: number,
    errorCode: string,
    isOperational: boolean = true,
    context?: Record<string, any>
  ) {
    super(message);
    
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    this.context = context;
    this.timestamp = new Date();
    
    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      errorCode: this.errorCode,
      isOperational: this.isOperational,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    };
  }
}

// Error categories
export enum ErrorCategory {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT = 'RATE_LIMIT',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
  INTERNAL = 'INTERNAL',
  DATABASE = 'DATABASE',
  NETWORK = 'NETWORK',
  SECURITY = 'SECURITY',
  BUSINESS_LOGIC = 'BUSINESS_LOGIC',
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// Error types for different domains
export enum ErrorType {
  // Validation errors
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  
  // Authentication errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
  
  // Authorization errors
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  ACCESS_DENIED = 'ACCESS_DENIED',
  RESOURCE_FORBIDDEN = 'RESOURCE_FORBIDDEN',
  
  // Not found errors
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  ENDPOINT_NOT_FOUND = 'ENDPOINT_NOT_FOUND',
  
  // Conflict errors
  RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  CONCURRENT_MODIFICATION = 'CONCURRENT_MODIFICATION',
  
  // Rate limiting errors
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  
  // External service errors
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  TIMEOUT = 'TIMEOUT',
  
  // Database errors
  DATABASE_CONNECTION_ERROR = 'DATABASE_CONNECTION_ERROR',
  QUERY_FAILED = 'QUERY_FAILED',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  CONSTRAINT_VIOLATION = 'CONSTRAINT_VIOLATION',
  
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  CONNECTION_TIMEOUT = 'CONNECTION_TIMEOUT',
  DNS_ERROR = 'DNS_ERROR',
  
  // Security errors
  SECURITY_VIOLATION = 'SECURITY_VIOLATION',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  BRUTE_FORCE_ATTEMPT = 'BRUTE_FORCE_ATTEMPT',
  
  // Business logic errors
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  INVALID_OPERATION = 'INVALID_OPERATION',
  DEPENDENCY_NOT_MET = 'DEPENDENCY_NOT_MET',
  
  // Internal errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// Validation Error
export class ValidationError extends BaseError {
  constructor(
    message: string,
    context?: Record<string, any>,
    field?: string
  ) {
    super(
      message,
      400,
      ErrorType.VALIDATION_FAILED,
      true,
      { ...context, field }
    );
  }
}

// Authentication Error
export class AuthenticationError extends BaseError {
  constructor(
    message: string,
    errorType: ErrorType = ErrorType.INVALID_CREDENTIALS,
    context?: Record<string, any>
  ) {
    super(message, 401, errorType, true, context);
  }
}

// Authorization Error
export class AuthorizationError extends BaseError {
  constructor(
    message: string,
    errorType: ErrorType = ErrorType.ACCESS_DENIED,
    context?: Record<string, any>
  ) {
    super(message, 403, errorType, true, context);
  }
}

// Not Found Error
export class NotFoundError extends BaseError {
  constructor(
    message: string,
    errorType: ErrorType = ErrorType.RESOURCE_NOT_FOUND,
    context?: Record<string, any>
  ) {
    super(message, 404, errorType, true, context);
  }
}

// Conflict Error
export class ConflictError extends BaseError {
  constructor(
    message: string,
    errorType: ErrorType = ErrorType.RESOURCE_ALREADY_EXISTS,
    context?: Record<string, any>
  ) {
    super(message, 409, errorType, true, context);
  }
}

// Rate Limit Error
export class RateLimitError extends BaseError {
  constructor(
    message: string,
    retryAfter?: number,
    context?: Record<string, any>
  ) {
    super(
      message,
      429,
      ErrorType.RATE_LIMIT_EXCEEDED,
      true,
      { ...context, retryAfter }
    );
  }
}

// External Service Error
export class ExternalServiceError extends BaseError {
  constructor(
    message: string,
    serviceName: string,
    context?: Record<string, any>
  ) {
    super(
      message,
      502,
      ErrorType.EXTERNAL_API_ERROR,
      true,
      { ...context, serviceName }
    );
  }
}

// Database Error
export class DatabaseError extends BaseError {
  constructor(
    message: string,
    errorType: ErrorType = ErrorType.QUERY_FAILED,
    context?: Record<string, any>
  ) {
    super(message, 500, errorType, true, context);
  }
}

// Security Error
export class SecurityError extends BaseError {
  constructor(
    message: string,
    errorType: ErrorType = ErrorType.SECURITY_VIOLATION,
    context?: Record<string, any>
  ) {
    super(message, 403, errorType, true, context);
  }
}

// Business Logic Error
export class BusinessLogicError extends BaseError {
  constructor(
    message: string,
    errorType: ErrorType = ErrorType.BUSINESS_RULE_VIOLATION,
    context?: Record<string, any>
  ) {
    super(message, 422, errorType, true, context);
  }
}

// Internal Server Error
export class InternalServerError extends BaseError {
  constructor(
    message: string,
    context?: Record<string, any>
  ) {
    super(
      message,
      500,
      ErrorType.INTERNAL_SERVER_ERROR,
      false,
      context
    );
  }
}

export class NetworkError extends BaseError {
  constructor(
    message: string,
    context?: Record<string, any>
  ) {
    super(
      message,
      502,
      ErrorType.NETWORK_ERROR,
      true,
      context
    );
  }
}

export class TimeoutError extends BaseError {
  constructor(
    message: string,
    context?: Record<string, any>
  ) {
    super(
      message,
      408,
      ErrorType.TIMEOUT,
      true,
      context
    );
  }
}

// Error factory for creating errors based on type
export class ErrorFactory {
  static createValidationError(
    message: string,
    field?: string,
    context?: Record<string, any>
  ): ValidationError {
    return new ValidationError(message, context, field);
  }

  static createAuthenticationError(
    message: string,
    errorType: ErrorType = ErrorType.INVALID_CREDENTIALS,
    context?: Record<string, any>
  ): AuthenticationError {
    return new AuthenticationError(message, errorType, context);
  }

  static createAuthorizationError(
    message: string,
    errorType: ErrorType = ErrorType.ACCESS_DENIED,
    context?: Record<string, any>
  ): AuthorizationError {
    return new AuthorizationError(message, errorType, context);
  }

  static createNotFoundError(
    message: string,
    errorType: ErrorType = ErrorType.RESOURCE_NOT_FOUND,
    context?: Record<string, any>
  ): NotFoundError {
    return new NotFoundError(message, errorType, context);
  }

  static createConflictError(
    message: string,
    errorType: ErrorType = ErrorType.RESOURCE_ALREADY_EXISTS,
    context?: Record<string, any>
  ): ConflictError {
    return new ConflictError(message, errorType, context);
  }

  static createRateLimitError(
    message: string,
    retryAfter?: number,
    context?: Record<string, any>
  ): RateLimitError {
    return new RateLimitError(message, retryAfter, context);
  }

  static createExternalServiceError(
    message: string,
    serviceName: string,
    context?: Record<string, any>
  ): ExternalServiceError {
    return new ExternalServiceError(message, serviceName, context);
  }

  static createDatabaseError(
    message: string,
    errorType: ErrorType = ErrorType.QUERY_FAILED,
    context?: Record<string, any>
  ): DatabaseError {
    return new DatabaseError(message, errorType, context);
  }

  static createSecurityError(
    message: string,
    errorType: ErrorType = ErrorType.SECURITY_VIOLATION,
    context?: Record<string, any>
  ): SecurityError {
    return new SecurityError(message, errorType, context);
  }

  static createBusinessLogicError(
    message: string,
    errorType: ErrorType = ErrorType.BUSINESS_RULE_VIOLATION,
    context?: Record<string, any>
  ): BusinessLogicError {
    return new BusinessLogicError(message, errorType, context);
  }

  static createInternalServerError(
    message: string,
    context?: Record<string, any>
  ): InternalServerError {
    return new InternalServerError(message, context);
  }
}

// Error categorization utility
export class ErrorCategorizer {
  static getCategory(error: BaseError): ErrorCategory {
    if (error instanceof ValidationError) return ErrorCategory.VALIDATION;
    if (error instanceof AuthenticationError) return ErrorCategory.AUTHENTICATION;
    if (error instanceof AuthorizationError) return ErrorCategory.AUTHORIZATION;
    if (error instanceof NotFoundError) return ErrorCategory.NOT_FOUND;
    if (error instanceof ConflictError) return ErrorCategory.CONFLICT;
    if (error instanceof RateLimitError) return ErrorCategory.RATE_LIMIT;
    if (error instanceof ExternalServiceError) return ErrorCategory.EXTERNAL_SERVICE;
    if (error instanceof DatabaseError) return ErrorCategory.DATABASE;
    if (error instanceof SecurityError) return ErrorCategory.SECURITY;
    if (error instanceof BusinessLogicError) return ErrorCategory.BUSINESS_LOGIC;
    return ErrorCategory.INTERNAL;
  }

  static getSeverity(error: BaseError): ErrorSeverity {
    // Critical errors
    if (error.statusCode >= 500) return ErrorSeverity.CRITICAL;
    
    // High severity errors
    if (error.statusCode === 429 || error.statusCode === 403) return ErrorSeverity.HIGH;
    
    // Medium severity errors
    if (error.statusCode === 401 || error.statusCode === 409 || error.statusCode === 422) {
      return ErrorSeverity.MEDIUM;
    }
    
    // Low severity errors (400, 404, etc.)
    return ErrorSeverity.LOW;
  }
}

// Error context builder for adding additional context
export class ErrorContextBuilder {
  private context: Record<string, any> = {};

  addUser(userId: string, email?: string): this {
    this.context.user = { userId, email };
    return this;
  }

  addRequest(requestId: string, method?: string, path?: string): this {
    this.context.request = { requestId, method, path };
    return this;
  }

  addResource(resourceType: string, resourceId: string): this {
    this.context.resource = { resourceType, resourceId };
    return this;
  }

  addField(field: string, value: any): this {
    this.context.fields = { ...this.context.fields, [field]: value };
    return this;
  }

  addMetadata(key: string, value: any): this {
    this.context.metadata = { ...this.context.metadata, [key]: value };
    return this;
  }

  build(): Record<string, any> {
    return { ...this.context };
  }
}
