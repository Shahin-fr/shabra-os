// Implements: [CRITICAL PRIORITY 7: Error Handling & Recovery Systems]
// See: docs/ROADMAP/PHASE_2_STRATEGIC_PLAN.md, Section 3.2

export interface ErrorContext {
  component: string;
  action: string;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  userAgent: string;
  url: string;
  stackTrace: string;
  additionalData?: Record<string, string | number | boolean | null | undefined>;
}

export interface ErrorLog {
  id: string;
  error: Error;
  context: ErrorContext;
  category: ErrorCategory;
  priority: ErrorPriority;
  timestamp: Date;
  resolved: boolean;
  resolutionTime?: Date;
  resolutionMethod?: string;
}

export type ErrorCategory =
  | 'API_ERROR'
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'DATABASE_ERROR'
  | 'NETWORK_ERROR'
  | 'UI_ERROR'
  | 'PERFORMANCE_ERROR'
  | 'BUILD_ERROR'
  | 'UNKNOWN_ERROR';

export type ErrorPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface ErrorRecoverySuggestion {
  id: string;
  title: string;
  description: string;
  action: string;
  priority: ErrorPriority;
  applicable: boolean;
}

export interface ErrorFallbackStrategy {
  type:
    | 'RETRY'
    | 'FALLBACK_UI'
    | 'OFFLINE_MODE'
    | 'DEFAULT_VALUE'
    | 'USER_GUIDANCE';
  description: string;
  implementation: () => void | Promise<void>;
}

export interface ErrorRetryStrategy {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier: number;
  shouldRetry: (error: Error, attempt: number) => boolean;
}

export interface ErrorMetrics {
  totalErrors: number;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsByPriority: Record<ErrorPriority, number>;
  averageResolutionTime: number;
  errorRate: number; // errors per minute
  lastErrorTime: Date;
}

export interface ErrorAlert {
  id: string;
  type:
    | 'ERROR_RATE_SPIKE'
    | 'CRITICAL_ERROR'
    | 'ERROR_TREND'
    | 'PERFORMANCE_IMPACT';
  message: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}
