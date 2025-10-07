/**
 * Client-side error reporting and analytics integration
 */

import { ClientError } from '@/contexts/ErrorContext';

export interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  type: ClientError['type'];
  severity: ClientError['severity'];
  context: Record<string, any>;
  timestamp: string;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId?: string;
  component?: string;
  retryCount: number;
  maxRetries: number;
  retryable: boolean;
}

export interface ErrorAnalytics {
  trackError: (error: ErrorReport) => void;
  trackErrorRecovery: (errorId: string, recoveryMethod: string) => void;
  trackErrorRetry: (errorId: string, attempt: number) => void;
  trackErrorDismissal: (errorId: string, reason: string) => void;
}

export class ErrorReporter {
  private apiEndpoint: string;
  private analytics?: ErrorAnalytics;
  private batchSize: number;
  private flushInterval: number;
  private pendingReports: ErrorReport[] = [];
  private flushTimer?: NodeJS.Timeout;

  constructor(
    apiEndpoint: string = '/api/errors/report',
    analytics?: ErrorAnalytics,
    options: {
      batchSize?: number;
      flushInterval?: number;
    } = {}
  ) {
    this.apiEndpoint = apiEndpoint;
    this.analytics = analytics;
    this.batchSize = options.batchSize || 10;
    this.flushInterval = options.flushInterval || 30000; // 30 seconds

    // Start periodic flush
    this.startFlushTimer();
  }

  /**
   * Report a single error
   */
  async reportError(error: ClientError, additionalContext: Record<string, any> = {}): Promise<void> {
    const report: ErrorReport = {
      id: error.id,
      message: error.message,
      stack: error.context?.stack,
      type: error.type,
      severity: error.severity,
      context: {
        ...error.context,
        ...additionalContext,
      },
      timestamp: error.timestamp.toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
      component: error.component,
      retryCount: error.retryCount,
      maxRetries: error.maxRetries,
      retryable: error.retryable,
    };

    // Add to pending reports
    this.pendingReports.push(report);

    // Track in analytics
    this.analytics?.trackError(report);

    // Flush if batch size reached
    if (this.pendingReports.length >= this.batchSize) {
      await this.flush();
    }
  }

  /**
   * Report multiple errors in batch
   */
  async reportErrors(errors: ClientError[], additionalContext: Record<string, any> = {}): Promise<void> {
    const reports = errors.map(error => ({
      id: error.id,
      message: error.message,
      stack: error.context?.stack,
      type: error.type,
      severity: error.severity,
      context: {
        ...error.context,
        ...additionalContext,
      },
      timestamp: error.timestamp.toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
      component: error.component,
      retryCount: error.retryCount,
      maxRetries: error.maxRetries,
      retryable: error.retryable,
    }));

    this.pendingReports.push(...reports);

    // Track in analytics
    reports.forEach(report => this.analytics?.trackError(report));

    // Flush if batch size reached
    if (this.pendingReports.length >= this.batchSize) {
      await this.flush();
    }
  }

  /**
   * Track error recovery
   */
  trackRecovery(errorId: string, recoveryMethod: string): void {
    this.analytics?.trackErrorRecovery(errorId, recoveryMethod);
  }

  /**
   * Track error retry
   */
  trackRetry(errorId: string, attempt: number): void {
    this.analytics?.trackErrorRetry(errorId, attempt);
  }

  /**
   * Track error dismissal
   */
  trackDismissal(errorId: string, reason: string): void {
    this.analytics?.trackErrorDismissal(errorId, reason);
  }

  /**
   * Flush pending reports to server
   */
  async flush(): Promise<void> {
    if (this.pendingReports.length === 0) {
      return;
    }

    const reports = [...this.pendingReports];
    this.pendingReports = [];

    try {
      await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reports }),
      });
    } catch (error) {
      console.error('Failed to report errors:', error);
      // Re-add reports to pending queue for retry
      this.pendingReports.unshift(...reports);
    }
  }

  /**
   * Start periodic flush timer
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * Stop periodic flush timer
   */
  stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }
  }

  /**
   * Get user ID from session or local storage
   */
  private getUserId(): string | undefined {
    // Try to get from session storage first
    const sessionUserId = sessionStorage.getItem('userId');
    if (sessionUserId) {
      return sessionUserId;
    }

    // Try to get from local storage
    const localUserId = localStorage.getItem('userId');
    if (localUserId) {
      return localUserId;
    }

    return undefined;
  }

  /**
   * Get session ID
   */
  private getSessionId(): string | undefined {
    let sessionId = sessionStorage.getItem('sessionId');
    
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('sessionId', sessionId);
    }

    return sessionId;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopFlushTimer();
    // Flush any remaining reports
    this.flush();
  }
}

// Analytics implementations
export class ConsoleAnalytics implements ErrorAnalytics {
  trackError(error: ErrorReport): void {
    console.group(`🚨 Error Report: ${error.type.toUpperCase()}`);
    console.error('Message:', error.message);
    console.error('Severity:', error.severity);
    console.error('Context:', error.context);
    console.error('URL:', error.url);
    console.error('Timestamp:', error.timestamp);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    console.groupEnd();
  }

  trackErrorRecovery(errorId: string, recoveryMethod: string): void {
    console.log(`✅ Error Recovery: ${errorId} via ${recoveryMethod}`);
  }

  trackErrorRetry(errorId: string, attempt: number): void {
    console.log(`🔄 Error Retry: ${errorId} (attempt ${attempt})`);
  }

  trackErrorDismissal(errorId: string, reason: string): void {
    console.log(`❌ Error Dismissed: ${errorId} (${reason})`);
  }
}

export class GoogleAnalytics4 implements ErrorAnalytics {
  private measurementId: string;

  constructor(measurementId: string) {
    this.measurementId = measurementId;
  }

  trackError(error: ErrorReport): void {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'error', {
        event_category: 'error',
        event_label: error.type,
        custom_map: {
          error_id: error.id,
          error_message: error.message,
          error_severity: error.severity,
          error_component: error.component,
          error_retry_count: error.retryCount,
        },
      });
    }
  }

  trackErrorRecovery(errorId: string, recoveryMethod: string): void {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'error_recovery', {
        event_category: 'error',
        event_label: recoveryMethod,
        custom_map: {
          error_id: errorId,
        },
      });
    }
  }

  trackErrorRetry(errorId: string, attempt: number): void {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'error_retry', {
        event_category: 'error',
        event_label: `attempt_${attempt}`,
        custom_map: {
          error_id: errorId,
          attempt_number: attempt,
        },
      });
    }
  }

  trackErrorDismissal(errorId: string, reason: string): void {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'error_dismissal', {
        event_category: 'error',
        event_label: reason,
        custom_map: {
          error_id: errorId,
        },
      });
    }
  }
}

export class SentryAnalytics implements ErrorAnalytics {
  private sentry: any;

  constructor(sentry: any) {
    this.sentry = sentry;
  }

  trackError(error: ErrorReport): void {
    this.sentry.captureException(new Error(error.message), {
      tags: {
        errorType: error.type,
        severity: error.severity,
        component: error.component,
      },
      extra: {
        errorId: error.id,
        context: error.context,
        retryCount: error.retryCount,
        retryable: error.retryable,
      },
    });
  }

  trackErrorRecovery(errorId: string, recoveryMethod: string): void {
    this.sentry.addBreadcrumb({
      message: 'Error recovery attempted',
      category: 'error',
      data: {
        errorId,
        recoveryMethod,
      },
    });
  }

  trackErrorRetry(errorId: string, attempt: number): void {
    this.sentry.addBreadcrumb({
      message: 'Error retry attempted',
      category: 'error',
      data: {
        errorId,
        attempt,
      },
    });
  }

  trackErrorDismissal(errorId: string, reason: string): void {
    this.sentry.addBreadcrumb({
      message: 'Error dismissed',
      category: 'error',
      data: {
        errorId,
        reason,
      },
    });
  }
}

// Global error reporter instance
export const errorReporter = new ErrorReporter(
  '/api/errors/report',
  new ConsoleAnalytics(),
  {
    batchSize: 5,
    flushInterval: 15000, // 15 seconds
  }
);

// Export utility functions
export const {
  reportError,
  reportErrors,
  trackRecovery,
  trackRetry,
  trackDismissal,
  flush,
} = errorReporter;
