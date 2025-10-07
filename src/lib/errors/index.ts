/**
 * Unified error handling system exports
 * Central entry point for all error handling utilities
 */

// Domain errors
export {
  BaseError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ExternalServiceError,
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

// Error handler
export {
  errorHandler,
  ErrorHandler,
  ErrorUtils,
  type ErrorResponse,
  type ErrorHandlerConfig,
} from './error-handler';

// Error middleware
export {
  withErrorHandling,
  withApiErrorHandling,
  ErrorBoundary,
  ErrorResponseUtils,
  ErrorLogger,
  ErrorRecovery,
  ErrorValidator,
} from './error-middleware';

// API responses
export {
  ApiResponse,
  ResponseValidator,
  ResponseTransformer,
  type SuccessResponse,
  type PaginatedResponse,
} from './api-responses';

// Re-export commonly used utilities
export { ApiResponse as Response } from './api-responses';
export { ErrorUtils as Errors } from './error-handler';
export { ErrorLogger as Logger } from './error-middleware';
export { ErrorRecovery as Recovery } from './error-middleware';
