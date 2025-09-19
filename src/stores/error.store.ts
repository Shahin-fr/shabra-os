/**
 * Error State Management Store
 *
 * This store manages global error tracking and management including error metrics,
 * notifications, and resolution tracking. It's separated from the main consolidated
 * store to improve maintainability and reduce complexity.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { logApp } from '@/lib/logger';
import { ErrorCategory, ErrorPriority } from '@/types/error';

// ============================================================================
// ERROR STATE INTERFACES
// ============================================================================

export interface ErrorEntry {
  id: string;
  error: Error;
  category: ErrorCategory;
  priority: ErrorPriority;
  component: string;
  action: string;
  timestamp: Date;
  resolved: boolean;
  resolutionTime?: Date;
  resolutionMethod?: string;
  retryable: boolean;
  retryCount: number;
  maxRetries: number;
  userMessage: string;
  suggestions: string[];
  metadata?: Record<string, unknown>;
}

export interface ErrorMetrics {
  totalErrors: number;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsByPriority: Record<ErrorPriority, number>;
  errorsByComponent: Record<string, number>;
  averageResolutionTime: number;
  errorRate: number; // errors per minute
  lastErrorTime: Date | null;
  criticalErrorCount: number;
  retryableErrorCount: number;
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
  metadata?: Record<string, unknown>;
}

export interface ErrorState {
  // Error tracking
  errors: Map<string, ErrorEntry>;
  notifications: Map<string, ErrorNotification>;

  // Error metrics
  metrics: ErrorMetrics;

  // Configuration
  maxErrors: number;
  maxNotifications: number;
  autoResolveErrors: boolean;
  autoResolveDelay: number; // milliseconds
}

export interface ErrorActions {
  // Error management
  addError: (
    error: Error,
    context: {
      category: ErrorCategory;
      priority: ErrorPriority;
      component: string;
      action: string;
      retryable: boolean;
      userMessage: string;
      suggestions: string[];
      metadata?: Record<string, unknown>;
    }
  ) => string;

  resolveError: (errorId: string, method: string) => void;
  clearError: (errorId: string) => void;
  clearAllErrors: () => void;

  // Notification management
  addNotification: (notification: ErrorNotification) => void;
  removeNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;

  // Metrics and monitoring
  updateMetrics: () => void;
  getErrorMetrics: () => ErrorMetrics;
  getErrorsByComponent: (component: string) => ErrorEntry[];
  getErrorsByCategory: (category: ErrorCategory) => ErrorEntry[];
  getErrorsByPriority: (priority: ErrorPriority) => ErrorEntry[];

  // Configuration
  setMaxErrors: (max: number) => void;
  setMaxNotifications: (max: number) => void;
  setAutoResolveErrors: (enabled: boolean) => void;
  setAutoResolveDelay: (delay: number) => void;

  // Utility actions
  reset: () => void;
}

export type ErrorStore = ErrorState & ErrorActions;

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialErrorState: ErrorState = {
  errors: new Map(),
  notifications: new Map(),
  metrics: {
    totalErrors: 0,
    errorsByCategory: {} as Record<ErrorCategory, number>,
    errorsByPriority: {} as Record<ErrorPriority, number>,
    errorsByComponent: {},
    averageResolutionTime: 0,
    errorRate: 0,
    lastErrorTime: null,
    criticalErrorCount: 0,
    retryableErrorCount: 0,
  },
  maxErrors: 1000,
  maxNotifications: 100,
  autoResolveErrors: true,
  autoResolveDelay: 24 * 60 * 60 * 1000, // 24 hours
};

// ============================================================================
// STORE CREATION
// ============================================================================

export const useErrorStore = create<ErrorStore>()(
  persist(
    subscribeWithSelector(
      immer(set => ({
        // ========================================================================
        // INITIAL STATE
        // ========================================================================
        ...initialErrorState,

        // ========================================================================
        // ERROR MANAGEMENT
        // ========================================================================
        addError: (error, context) => {
          const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          set(state => {
            const errorEntry: ErrorEntry = {
              id: errorId,
              error,
              category: context.category,
              priority: context.priority,
              component: context.component,
              action: context.action,
              timestamp: new Date(),
              resolved: false,
              retryable: context.retryable,
              retryCount: 0,
              maxRetries: context.retryable ? 3 : 0,
              userMessage: context.userMessage,
              suggestions: context.suggestions,
              metadata: context.metadata,
            };

            // Remove old errors if we exceed the limit
            if (state.errors.size >= state.maxErrors) {
              const oldestError = Array.from(state.errors.values()).sort(
                (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
              )[0];
              if (oldestError) {
                state.errors.delete(oldestError.id);
              }
            }

            state.errors.set(errorId, errorEntry);

            // Update metrics
            state.metrics.totalErrors++;
            state.metrics.lastErrorTime = new Date();
            state.metrics.errorsByCategory[context.category] =
              (state.metrics.errorsByCategory[context.category] || 0) + 1;
            state.metrics.errorsByPriority[context.priority] =
              (state.metrics.errorsByPriority[context.priority] || 0) + 1;
            state.metrics.errorsByComponent[context.component] =
              (state.metrics.errorsByComponent[context.component] || 0) + 1;

            if (context.priority === 'CRITICAL') {
              state.metrics.criticalErrorCount++;
            }

            if (context.retryable) {
              state.metrics.retryableErrorCount++;
            }

            // Auto-resolve errors after delay if enabled
            if (state.autoResolveErrors) {
              setTimeout(() => {
                useErrorStore.getState().resolveError(errorId, 'auto-resolve');
              }, state.autoResolveDelay);
            }

            logApp('Error added to store', {
              errorId,
              category: context.category,
              priority: context.priority,
              component: context.component,
            });
          });

          return errorId;
        },

        resolveError: (errorId, method) =>
          set(state => {
            const errorEntry = state.errors.get(errorId);
            if (errorEntry && !errorEntry.resolved) {
              errorEntry.resolved = true;
              errorEntry.resolutionTime = new Date();
              errorEntry.resolutionMethod = method;

              logApp('Error resolved', { errorId, method });
            }
          }),

        clearError: errorId =>
          set(state => {
            if (state.errors.delete(errorId)) {
              logApp('Error cleared', { errorId });
            }
          }),

        clearAllErrors: () =>
          set(state => {
            state.errors.clear();
            state.metrics.totalErrors = 0;
            state.metrics.errorsByCategory = {} as Record<
              ErrorCategory,
              number
            >;
            state.metrics.errorsByPriority = {} as Record<
              ErrorPriority,
              number
            >;
            state.metrics.errorsByComponent = {};
            state.metrics.criticalErrorCount = 0;
            state.metrics.retryableErrorCount = 0;
            state.metrics.lastErrorTime = null;
            logApp('All errors cleared');
          }),

        // ========================================================================
        // NOTIFICATION MANAGEMENT
        // ========================================================================
        addNotification: notification =>
          set(state => {
            // Remove old notifications if we exceed the limit
            if (state.notifications.size >= state.maxNotifications) {
              const oldestNotification = Array.from(
                state.notifications.values()
              ).sort(
                (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
              )[0];
              if (oldestNotification) {
                state.notifications.delete(oldestNotification.id);
              }
            }

            state.notifications.set(notification.id, notification);
            logApp('Error notification added', {
              notificationId: notification.id,
              type: notification.type,
              category: notification.category,
            });
          }),

        removeNotification: notificationId =>
          set(state => {
            if (state.notifications.delete(notificationId)) {
              logApp('Error notification removed', { notificationId });
            }
          }),

        clearAllNotifications: () =>
          set(state => {
            state.notifications.clear();
            logApp('All error notifications cleared');
          }),

        // ========================================================================
        // METRICS AND MONITORING
        // ========================================================================
        updateMetrics: () =>
          set(state => {
            const now = Date.now();
            const resolvedErrors = Array.from(state.errors.values()).filter(
              e => e.resolved
            );

            if (resolvedErrors.length > 0) {
              const totalResolutionTime = resolvedErrors.reduce(
                (sum, error) => {
                  if (error.resolutionTime) {
                    return (
                      sum +
                      (error.resolutionTime.getTime() -
                        error.timestamp.getTime())
                    );
                  }
                  return sum;
                },
                0
              );

              state.metrics.averageResolutionTime =
                totalResolutionTime / resolvedErrors.length;
            }

            // Calculate error rate (errors per minute)
            if (state.metrics.lastErrorTime) {
              const timeSinceLastError =
                now - state.metrics.lastErrorTime.getTime();
              const minutesSinceLastError = timeSinceLastError / (1000 * 60);
              state.metrics.errorRate =
                minutesSinceLastError > 0 ? 1 / minutesSinceLastError : 0;
            }
          }),

        getErrorMetrics: (): ErrorMetrics => {
          useErrorStore.getState().updateMetrics();
          return useErrorStore.getState().metrics;
        },

        getErrorsByComponent: (component: string): ErrorEntry[] => {
          return Array.from(useErrorStore.getState().errors.values()).filter(
            (e: ErrorEntry) => e.component === component
          );
        },

        getErrorsByCategory: (category: ErrorCategory): ErrorEntry[] => {
          return Array.from(useErrorStore.getState().errors.values()).filter(
            (e: ErrorEntry) => e.category === category
          );
        },

        getErrorsByPriority: (priority: ErrorPriority): ErrorEntry[] => {
          return Array.from(useErrorStore.getState().errors.values()).filter(
            (e: ErrorEntry) => e.priority === priority
          );
        },

        // ========================================================================
        // CONFIGURATION
        // ========================================================================
        setMaxErrors: (max: number) =>
          set(state => {
            state.maxErrors = max;
            if (state.errors.size > max) {
              // Remove oldest errors
              const sortedErrors = Array.from(state.errors.values()).sort(
                (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
              );

              const toRemove = sortedErrors.slice(0, state.errors.size - max);
              toRemove.forEach(error => {
                state.errors.delete(error.id);
              });
            }
          }),

        setMaxNotifications: (max: number) =>
          set(state => {
            state.maxNotifications = max;
            if (state.notifications.size > max) {
              // Remove oldest notifications
              const sortedNotifications = Array.from(
                state.notifications.values()
              ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

              const toRemove = sortedNotifications.slice(
                0,
                state.notifications.size - max
              );
              toRemove.forEach(notification => {
                state.notifications.delete(notification.id);
              });
            }
          }),

        setAutoResolveErrors: (enabled: boolean) =>
          set(state => {
            state.autoResolveErrors = enabled;
          }),

        setAutoResolveDelay: (delay: number) =>
          set(state => {
            state.autoResolveDelay = delay;
          }),

        // ========================================================================
        // UTILITY ACTIONS
        // ========================================================================
        reset: () =>
          set(state => {
            Object.assign(state, initialErrorState);
            logApp('Error state reset');
          }),
      }))
    ),
    {
      name: 'shabra-os-error-store',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        // Only persist configuration, not the actual errors
        maxErrors: state.maxErrors,
        maxNotifications: state.maxNotifications,
        autoResolveErrors: state.autoResolveErrors,
        autoResolveDelay: state.autoResolveDelay,
      }),
    }
  )
);

// ============================================================================
// SELECTORS FOR OPTIMIZED STATE ACCESS
// ============================================================================

// Error metrics selectors
export const useErrorMetrics = () => useErrorStore((state: any) => state.getErrorMetrics());
export const useTotalErrors = () => useErrorStore((state: any) => state.metrics.totalErrors);
export const useCriticalErrorCount = () => useErrorStore((state: any) => state.metrics.criticalErrorCount);
export const useRetryableErrorCount = () => useErrorStore((state: any) => state.metrics.retryableErrorCount);
export const useErrorRate = () => useErrorStore((state: any) => state.metrics.errorRate);
export const useLastErrorTime = () => useErrorStore((state: any) => state.metrics.lastErrorTime);

// Error by category/priority/component selectors
export const useErrorsByComponent = (component: string) =>
  useErrorStore((state: any) => state.getErrorsByComponent(component));
export const useErrorsByCategory = (category: ErrorCategory) =>
  useErrorStore((state: any) => state.getErrorsByCategory(category));
export const useErrorsByPriority = (priority: ErrorPriority) =>
  useErrorStore((state: any) => state.getErrorsByPriority(priority));

// Notification selectors
export const useErrorNotifications = () =>
  useErrorStore((state: any) => Array.from(state.notifications.values()));
export const useErrorNotificationCount = () =>
  useErrorStore((state: any) => state.notifications.size);

// Configuration selectors
export const useMaxErrors = () => useErrorStore((state: any) => state.maxErrors);
export const useMaxNotifications = () => useErrorStore((state: any) => state.maxNotifications);
export const useAutoResolveErrors = () => useErrorStore((state: any) => state.autoResolveErrors);
export const useAutoResolveDelay = () => useErrorStore((state: any) => state.autoResolveDelay);

// Individual action selectors to prevent infinite re-renders
export const useAddError = () => useErrorStore((state: any) => state.addError);
export const useResolveError = () => useErrorStore((state: any) => state.resolveError);
export const useClearError = () => useErrorStore((state: any) => state.clearError);
export const useClearAllErrors = () => useErrorStore((state: any) => state.clearAllErrors);
export const useAddNotification = () => useErrorStore((state: any) => state.addNotification);
export const useRemoveNotification = () => useErrorStore((state: any) => state.removeNotification);
export const useClearAllNotifications = () => useErrorStore((state: any) => state.clearAllNotifications);
export const useUpdateMetrics = () => useErrorStore((state: any) => state.updateMetrics);
export const useSetMaxErrors = () => useErrorStore((state: any) => state.setMaxErrors);
export const useSetMaxNotifications = () => useErrorStore((state: any) => state.setMaxNotifications);
export const useSetAutoResolveErrors = () => useErrorStore((state: any) => state.setAutoResolveErrors);
export const useSetAutoResolveDelay = () => useErrorStore((state: any) => state.setAutoResolveDelay);
export const useResetError = () => useErrorStore((state: any) => state.reset);

// Action selector for backward compatibility (use individual selectors for better performance)
export const useErrorActions = () => {
  const addError = useAddError();
  const resolveError = useResolveError();
  const clearError = useClearError();
  const clearAllErrors = useClearAllErrors();
  const addNotification = useAddNotification();
  const removeNotification = useRemoveNotification();
  const clearAllNotifications = useClearAllNotifications();
  const updateMetrics = useUpdateMetrics();
  const setMaxErrors = useSetMaxErrors();
  const setMaxNotifications = useSetMaxNotifications();
  const setAutoResolveErrors = useSetAutoResolveErrors();
  const setAutoResolveDelay = useSetAutoResolveDelay();
  const reset = useResetError();

  return {
    addError,
    resolveError,
    clearError,
    clearAllErrors,
    addNotification,
    removeNotification,
    clearAllNotifications,
    updateMetrics,
    setMaxErrors,
    setMaxNotifications,
    setAutoResolveErrors,
    setAutoResolveDelay,
    reset,
  };
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create an error entry with default values
 */
export const createErrorEntry = (
  error: Error,
  context: {
    category: ErrorCategory;
    priority: ErrorPriority;
    component: string;
    action: string;
    retryable: boolean;
    userMessage: string;
    suggestions: string[];
    metadata?: Record<string, unknown>;
  }
): ErrorEntry => ({
  id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  error,
  category: context.category,
  priority: context.priority,
  component: context.component,
  action: context.action,
  timestamp: new Date(),
  resolved: false,
  retryable: context.retryable,
  retryCount: 0,
  maxRetries: context.retryable ? 3 : 0,
  userMessage: context.userMessage,
  suggestions: context.suggestions,
  metadata: context.metadata,
});

/**
 * Create an error notification with default values
 */
export const createErrorNotification = (
  type: ErrorNotification['type'],
  title: string,
  message: string,
  category: ErrorCategory,
  priority: ErrorPriority,
  options?: Partial<Omit<ErrorNotification, 'id' | 'type' | 'title' | 'message' | 'category' | 'priority' | 'timestamp'>>
): ErrorNotification => ({
  id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  type,
  title,
  message,
  category,
  priority,
  timestamp: new Date(),
  dismissible: true,
  ...options,
});

/**
 * Create error metrics with default values
 */
export const createErrorMetrics = (overrides: Partial<ErrorMetrics> = {}): ErrorMetrics => ({
  totalErrors: 0,
  errorsByCategory: {} as Record<ErrorCategory, number>,
  errorsByPriority: {} as Record<ErrorPriority, number>,
  errorsByComponent: {},
  averageResolutionTime: 0,
  errorRate: 0,
  lastErrorTime: null,
  criticalErrorCount: 0,
  retryableErrorCount: 0,
  ...overrides,
});
