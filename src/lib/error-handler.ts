// Implements: [CRITICAL PRIORITY 7: Error Handling & Recovery Systems]
// See: docs/ROADMAP/PHASE_2_STRATEGIC_PLAN.md, Section 3.2

import { logger } from '@/lib/logger';

import { ErrorCategory, ErrorPriority, ErrorContext } from '../types/error';

export interface ErrorHandlerOptions {
  component: string;
  action?: string;
  autoTrack?: boolean;
  autoRecover?: boolean;
  maxRetries?: number;
  onError?: (error: Error, context: ErrorContext) => void;
  enableNotifications?: boolean;
  enableRetry?: boolean;
}

export interface ErrorHandlingResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  errorResponse?: {
    category: ErrorCategory;
    priority: ErrorPriority;
    retryable: boolean;
    suggestions: string[];
    userMessage: string;
    errorId: string;
  };
}

export interface ErrorNotification {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  category: ErrorCategory;
  priority: ErrorPriority;
  timestamp: Date;
  dismissible: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export class ErrorHandler {
  private options: ErrorHandlerOptions;
  private errorCount: Map<string, number> = new Map();
  private lastErrorTime: Map<string, Date> = new Map();

  constructor(options: ErrorHandlerOptions) {
    this.options = {
      autoTrack: true,
      autoRecover: false,
      maxRetries: 3,
      enableNotifications: true,
      enableRetry: true,
      ...options,
    };
  }

  /**
   * Handles any type of error with comprehensive tracking and recovery
   */
  handleError(
    error: Error | string | unknown,
    context?: Partial<ErrorContext>
  ): string {
    const errorObj = this.normalizeError(error);
    const fullContext = this.buildContext(context);

    // Generate error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Track error frequency
    this.trackError(fullContext.component, fullContext.action);

    // Log error for tracking
    logger.error('Error captured', errorObj, {
      component: fullContext.component,
      action: fullContext.action,
      errorId,
      frequency: this.getErrorFrequency(
        fullContext.component,
        fullContext.action
      ),
    });

    // Call custom error handler
    if (this.options.onError) {
      this.options.onError(errorObj, fullContext);
    }

    return errorId;
  }

  /**
   * Executes an operation with comprehensive error handling
   */
  async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    context?: Partial<ErrorContext>
  ): Promise<ErrorHandlingResult<T>> {
    try {
      const result = await operation();
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      const errorId = this.handleError(errorObj, context);

      const category = this.getErrorCategory(errorObj);
      const priority = this.getErrorPriority(errorObj, category);
      const suggestions = this.getErrorSuggestions(errorObj, category);
      const userMessage = this.getUserMessage(errorObj, category);

      return {
        success: false,
        error: errorObj,
        errorResponse: {
          category,
          priority,
          retryable: this.isRetryable(errorObj, category),
          suggestions,
          userMessage,
          errorId,
        },
      };
    }
  }

  /**
   * Executes an operation with automatic retry logic
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    context?: Partial<ErrorContext>
  ): Promise<T> {
    if (!this.options.enableRetry) {
      return operation();
    }

    let lastError: Error;
    let attempt = 0;

    while (attempt < this.options.maxRetries!) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        attempt++;

        // Handle the error
        this.handleError(lastError, context);

        // Check if we should retry
        const category = this.getErrorCategory(lastError);
        if (
          !this.isRetryable(lastError, category) ||
          attempt >= this.options.maxRetries!
        ) {
          throw lastError;
        }

        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));

        logger.warn(
          `Retry attempt ${attempt}/${this.options.maxRetries} for ${this.options.component}`
        );
      }
    }

    throw lastError!;
  }

  /**
   * Handles API-specific errors with automatic retry and categorization
   */
  async executeApiCall<T>(
    apiCall: () => Promise<T>,
    apiContext: { [key: string]: any }
  ): Promise<ErrorHandlingResult<T>> {
    const fullContext = {
      ...apiContext,
      component: this.options.component,
      action: this.options.action || 'ApiCall',
    };

    try {
      const result = await apiCall();
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      const errorId = this.handleError(errorObj, fullContext);

      const category = this.getErrorCategory(errorObj);
      const priority = this.getErrorPriority(errorObj, category);
      const suggestions = this.getErrorSuggestions(errorObj, category);
      const userMessage = this.getUserMessage(errorObj, category);

      return {
        success: false,
        error: errorObj,
        errorResponse: {
          category,
          priority,
          retryable: this.isRetryable(errorObj, category),
          suggestions,
          userMessage,
          errorId,
        },
      };
    }
  }

  /**
   * Creates a user-friendly error notification
   */
  createErrorNotification(
    error: Error,
    _context?: Partial<ErrorContext>
  ): ErrorNotification {
    const category = this.getErrorCategory(error);
    const priority = this.getErrorPriority(error, category);
    const userMessage = this.getUserMessage(error, category);

    return {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type:
        priority === 'CRITICAL'
          ? 'error'
          : priority === 'HIGH'
            ? 'warning'
            : 'info',
      title: this.getNotificationTitle(category),
      message: userMessage,
      category,
      priority,
      timestamp: new Date(),
      dismissible: priority !== 'CRITICAL',
      action: this.getNotificationAction(category, priority),
    };
  }

  /**
   * Gets current error metrics for the component
   */
  getErrorMetrics() {
    const totalErrors = Array.from(this.errorCount.values()).reduce(
      (sum, count) => sum + count,
      0
    );
    const errorsByComponent = Object.fromEntries(this.errorCount);

    return {
      totalErrors,
      errorsByComponent,
      lastErrorTime: Object.fromEntries(this.lastErrorTime),
      errorRate: this.calculateErrorRate(),
    };
  }

  /**
   * Gets error logs for the component
   */
  getErrorLogs(filters?: {
    category?: ErrorCategory;
    priority?: ErrorPriority;
    component?: string;
    limit?: number;
  }) {
    // This would integrate with a proper error tracking system
    // For now, return basic metrics
    return {
      metrics: this.getErrorMetrics(),
      filters,
    };
  }

  /**
   * Gets monitoring status
   */
  getMonitoringStatus() {
    const errorRate = this.calculateErrorRate();
    const isHealthy = errorRate < 0.1; // Less than 10% error rate

    return {
      isActive: true,
      lastCheck: new Date(),
      errorCount: Array.from(this.errorCount.values()).reduce(
        (sum, count) => sum + count,
        0
      ),
      errorRate,
      isHealthy,
      recommendations: this.getHealthRecommendations(errorRate),
    };
  }

  /**
   * Gets recovery guidance for a specific error
   */
  getRecoveryGuidance(_error: Error) {
    const category = this.getErrorCategory(_error);
    const priority = this.getErrorPriority(_error, category);

    logger.info('Recovery guidance requested', {
      category,
      priority,
      error: _error.message,
    });

    return {
      message: this.getUserMessage(_error, category),
      actions: this.getErrorSuggestions(_error, category),
      nextSteps: this.getNextSteps(category, priority),
    };
  }

  /**
   * Marks an error as resolved
   */
  resolveError(errorId: string, resolutionMethod: string): boolean {
    logger.info(`Error ${errorId} resolved with method: ${resolutionMethod}`);
    return true;
  }

  /**
   * Normalizes different error types into a standard Error object
   */
  private normalizeError(error: Error | string | unknown): Error {
    if (error instanceof Error) {
      return error;
    }

    if (typeof error === 'string') {
      return new Error(error);
    }

    if (error && typeof error === 'object') {
      const errorObj = error as Record<string, unknown>;
      if (errorObj.message && typeof errorObj.message === 'string') {
        return new Error(errorObj.message);
      }
      if (errorObj.error && typeof errorObj.error === 'string') {
        return new Error(errorObj.error);
      }
      if (errorObj.statusText && typeof errorObj.statusText === 'string') {
        return new Error(errorObj.statusText);
      }
    }

    return new Error('An unknown error occurred');
  }

  /**
   * Builds complete error context with defaults
   */
  private buildContext(partialContext?: Partial<ErrorContext>): ErrorContext {
    return {
      component: partialContext?.component || this.options.component,
      action: partialContext?.action || this.options.action || 'Unknown',
      userId: partialContext?.userId,
      sessionId: partialContext?.sessionId || this.generateSessionId(),
      timestamp: new Date(),
      userAgent:
        typeof window !== 'undefined' ? window.navigator.userAgent : 'Server',
      url: typeof window !== 'undefined' ? window.location.href : 'Server',
      stackTrace:
        partialContext?.stackTrace || new Error().stack || 'No stack trace',
      additionalData: partialContext?.additionalData,
    };
  }

  /**
   * Tracks error frequency for monitoring
   */
  private trackError(component: string, action: string): void {
    const key = `${component}:${action}`;
    const currentCount = this.errorCount.get(key) || 0;
    this.errorCount.set(key, currentCount + 1);
    this.lastErrorTime.set(key, new Date());
  }

  /**
   * Gets error frequency for a component/action
   */
  private getErrorFrequency(component: string, action: string): number {
    const key = `${component}:${action}`;
    return this.errorCount.get(key) || 0;
  }

  /**
   * Calculates overall error rate
   */
  private calculateErrorRate(): number {
    const totalErrors = Array.from(this.errorCount.values()).reduce(
      (sum, count) => sum + count,
      0
    );
    const totalTime =
      Date.now() -
      Math.min(
        ...Array.from(this.lastErrorTime.values()).map(d => d.getTime())
      );
    return totalTime > 0 ? totalErrors / (totalTime / 1000 / 60) : 0; // errors per minute
  }

  /**
   * Gets health recommendations based on error rate
   */
  private getHealthRecommendations(errorRate: number): string[] {
    if (errorRate > 0.5) {
      return [
        'High error rate detected. Review error logs immediately.',
        'Check system health and dependencies.',
      ];
    } else if (errorRate > 0.2) {
      return [
        'Moderate error rate. Monitor closely.',
        'Review recent changes that might have introduced errors.',
      ];
    } else if (errorRate > 0.1) {
      return ['Slightly elevated error rate.', 'Continue monitoring.'];
    }
    return ['System is healthy.', 'Continue normal operations.'];
  }

  /**
   * Gets error category
   */
  getErrorCategory(error: Error): ErrorCategory {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    if (name.includes('validation') || message.includes('validation')) {
      return 'VALIDATION_ERROR';
    }
    if (name.includes('auth') || message.includes('unauthorized')) {
      return 'AUTHENTICATION_ERROR';
    }
    if (name.includes('database') || message.includes('prisma')) {
      return 'DATABASE_ERROR';
    }
    if (name.includes('network') || message.includes('fetch')) {
      return 'NETWORK_ERROR';
    }
    if (name.includes('api')) {
      return 'API_ERROR';
    }
    if (name.includes('performance')) {
      return 'PERFORMANCE_ERROR';
    }
    if (name.includes('build')) {
      return 'BUILD_ERROR';
    }

    return 'UI_ERROR';
  }

  /**
   * Gets error priority
   */
  getErrorPriority(_error: Error, category: ErrorCategory): ErrorPriority {
    if (category === 'AUTHENTICATION_ERROR' || category === 'DATABASE_ERROR') {
      return 'CRITICAL';
    }
    if (category === 'API_ERROR' || category === 'NETWORK_ERROR') {
      return 'HIGH';
    }
    if (category === 'VALIDATION_ERROR') {
      return 'MEDIUM';
    }
    return 'LOW';
  }

  /**
   * Determines if an error is retryable
   */
  isRetryable(_error: Error, category: ErrorCategory): boolean {
    // Don't retry critical errors
    if (category === 'AUTHENTICATION_ERROR' || category === 'DATABASE_ERROR') {
      return false;
    }

    // Don't retry validation errors
    if (category === 'VALIDATION_ERROR') {
      return false;
    }

    // Retry transient errors
    return category === 'NETWORK_ERROR' || category === 'API_ERROR';
  }

  /**
   * Gets user-friendly error suggestions
   */
  getErrorSuggestions(_error: Error, category: ErrorCategory): string[] {
    switch (category) {
      case 'VALIDATION_ERROR':
        return [
          'Please check your input and try again.',
          'Ensure all required fields are filled.',
        ];
      case 'AUTHENTICATION_ERROR':
        return ['Please log in again.', 'Check your credentials.'];
      case 'DATABASE_ERROR':
        return [
          'Please try again later.',
          'Contact support if the problem persists.',
        ];
      case 'NETWORK_ERROR':
        return [
          'Please check your internet connection.',
          'Try again in a moment.',
        ];
      case 'API_ERROR':
        return [
          'Please try again.',
          'Contact support if the problem persists.',
        ];
      default:
        return ['Please try again or contact support.'];
    }
  }

  /**
   * Gets user-friendly error messages
   */
  getUserMessage(_error: Error, category: ErrorCategory): string {
    switch (category) {
      case 'VALIDATION_ERROR':
        return 'Please check your input and try again.';
      case 'AUTHENTICATION_ERROR':
        return 'Authentication required. Please log in again.';
      case 'DATABASE_ERROR':
        return 'A database error occurred. Please try again later.';
      case 'NETWORK_ERROR':
        return 'Network error. Please check your connection and try again.';
      case 'API_ERROR':
        return 'An API error occurred. Please try again.';
      case 'PERFORMANCE_ERROR':
        return 'Performance issue detected. Please try again.';
      case 'BUILD_ERROR':
        return 'A system error occurred. Please refresh the page.';
      default:
        return 'An error occurred. Please try again or contact support.';
    }
  }

  /**
   * Gets notification title based on error category
   */
  private getNotificationTitle(category: ErrorCategory): string {
    switch (category) {
      case 'VALIDATION_ERROR':
        return 'Input Error';
      case 'AUTHENTICATION_ERROR':
        return 'Authentication Error';
      case 'DATABASE_ERROR':
        return 'Database Error';
      case 'NETWORK_ERROR':
        return 'Network Error';
      case 'API_ERROR':
        return 'API Error';
      case 'PERFORMANCE_ERROR':
        return 'Performance Issue';
      case 'BUILD_ERROR':
        return 'System Error';
      default:
        return 'Error';
    }
  }

  /**
   * Gets notification action based on error category and priority
   */
  private getNotificationAction(
    category: ErrorCategory,
    priority: ErrorPriority
  ): { label: string; onClick: () => void } | undefined {
    if (priority === 'CRITICAL') {
      return {
        label: 'Contact Support',
        onClick: () => {
          // This would integrate with support system
          // TODO: Implement support system integration
        },
      };
    }

    if (category === 'NETWORK_ERROR' || category === 'API_ERROR') {
      return {
        label: 'Retry',
        onClick: () => {
          // This would trigger a retry
          // TODO: Implement retry functionality
        },
      };
    }

    return undefined;
  }

  /**
   * Gets next steps for error recovery
   */
  private getNextSteps(
    category: ErrorCategory,
    priority: ErrorPriority
  ): string[] {
    if (priority === 'CRITICAL') {
      return ['Contact support immediately', 'Document the error details'];
    }

    switch (category) {
      case 'VALIDATION_ERROR':
        return ['Review your input', 'Check field requirements'];
      case 'NETWORK_ERROR':
        return ['Wait a moment', 'Check your connection'];
      case 'API_ERROR':
        return ['Try again', 'Check system status'];
      default:
        return ['Try again', 'Contact support if needed'];
    }
  }

  /**
   * Generates a session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export a default error handler instance
export const defaultErrorHandler = new ErrorHandler({
  component: 'System',
  action: 'General',
});
