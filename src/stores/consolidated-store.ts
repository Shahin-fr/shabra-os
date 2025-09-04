/**
 * Consolidated State Management System
 *
 * This system consolidates all state management into a single, well-organized structure
 * that eliminates overlapping responsibilities and improves performance.
 *
 * Architecture:
 * - User State: Moved to userStore.ts (Authentication, user preferences, profile)
 * - UI State: Moved to uiStore.ts (Navigation, modals, notifications)
 * - App State: Global application state, settings
 * - Cache State: Optimized caching with TanStack Query integration
 * - Error State: Global error tracking and management
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';
import { enableMapSet } from 'immer';

import { logApp } from '@/lib/logger';
import { ErrorCategory, ErrorPriority } from '@/types/error';

// Enable Immer MapSet plugin
enableMapSet();

// ============================================================================
// USER STATE - Moved to userStore.ts
// ============================================================================

// User state has been moved to src/stores/userStore.ts
// Import user-related types and hooks from there instead

// ============================================================================
// UI STATE - Moved to uiStore.ts
// ============================================================================

// UI state has been moved to src/stores/uiStore.ts
// Import UI-related types and hooks from there instead

// ============================================================================
// ERROR STATE - Global Error Tracking and Management
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
  metadata?: Record<string, any>;
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
  metadata?: Record<string, any>;
}

// UI state and actions moved to uiStore.ts

// ============================================================================
// APP STATE - Global Application State, Settings
// ============================================================================

export interface AppSettings {
  // Performance
  enableCaching: boolean;
  enableOptimizations: boolean;
  enableMonitoring: boolean;
  cacheStrategy: 'aggressive' | 'balanced' | 'minimal';

  // Features
  enableAnalytics: boolean;
  enableErrorTracking: boolean;
  enablePerformanceMonitoring: boolean;

  // Development
  enableDebugMode: boolean;
  enableLogging: boolean;
  enableHotReload: boolean;
}

interface AppState {
  // Settings
  settings: AppSettings;

  // System state
  isOnline: boolean;
  isInitialized: boolean;
  lastUpdate: Date;

  // Performance metrics
  performanceMetrics: {
    pageLoadTime: number;
    memoryUsage: number;
    cpuUsage: number;
    networkLatency: number;
  };

  // Feature flags
  featureFlags: Map<string, boolean>;
}

interface AppActions {
  // Settings
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetSettings: () => void;

  // System state
  setOnlineStatus: (online: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  updateLastUpdate: () => void;

  // Performance
  updatePerformanceMetrics: (
    metrics: Partial<AppState['performanceMetrics']>
  ) => void;

  // Feature flags
  setFeatureFlag: (flag: string, enabled: boolean) => void;
  getFeatureFlag: (flag: string) => boolean;
}

// ============================================================================
// CACHE STATE - Optimized Caching with TanStack Query Integration
// ============================================================================

export interface CacheEntry<T = any> {
  key: string;
  data: T;
  timestamp: Date;
  ttl: number; // Time to live in milliseconds
  dependencies: string[];
  metadata?: Record<string, any>;
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number; // Estimated size in bytes
  lastCleanup: Date;
  hitCount: number;
  missCount: number;
}

interface CacheState {
  // Cache storage
  entries: Map<string, CacheEntry>;

  // Statistics
  stats: CacheStats;

  // Configuration
  maxEntries: number;
  maxSize: number; // Maximum cache size in bytes
  cleanupInterval: number; // Cleanup interval in milliseconds
  defaultTTL: number; // Default TTL in milliseconds
}

interface CacheActions {
  // Cache operations
  set: <T>(
    key: string,
    data: T,
    options?: {
      ttl?: number;
      dependencies?: string[];
      metadata?: Record<string, any>;
    }
  ) => void;

  get: <T>(key: string) => T | null;
  has: (key: string) => boolean;
  delete: (key: string) => boolean;
  clear: () => void;

  // Cache management
  cleanup: () => void;
  invalidateByDependency: (dependency: string) => void;
  getStats: () => CacheStats;

  // Configuration
  setMaxEntries: (max: number) => void;
  setMaxSize: (max: number) => void;
  setCleanupInterval: (interval: number) => void;
  setDefaultTTL: (ttl: number) => void;
}

// ============================================================================
// ERROR STATE & ACTIONS
// ============================================================================

interface ErrorState {
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

interface ErrorActions {
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
      metadata?: Record<string, any>;
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
}

// ============================================================================
// MAIN STORE INTERFACE
// ============================================================================

interface AppStore
  extends AppState,
    AppActions,
    CacheState,
    CacheActions,
    ErrorState,
    ErrorActions {
  // Global actions
  reset: () => void;
  getStateSnapshot: () => {
    app: {
      isOnline: boolean;
      isInitialized: boolean;
      settings: AppSettings;
    };
    cache: CacheStats;
    errors: ErrorMetrics;
  };
}

// ============================================================================
// INITIAL STATE
// ============================================================================

// User state moved to userStore.ts

// UI state moved to uiStore.ts

const initialAppState: AppState = {
  settings: {
    enableCaching: true,
    enableOptimizations: true,
    enableMonitoring: true,
    cacheStrategy: 'balanced',
    enableAnalytics: false,
    enableErrorTracking: true,
    enablePerformanceMonitoring: true,
    enableDebugMode: process.env.NODE_ENV === 'development',
    enableLogging: true,
    enableHotReload: process.env.NODE_ENV === 'development',
  },
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isInitialized: false,
  lastUpdate: new Date(),
  performanceMetrics: {
    pageLoadTime: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    networkLatency: 0,
  },
  featureFlags: new Map(),
};

const initialCacheState: CacheState = {
  entries: new Map(),
  stats: {
    totalEntries: 0,
    totalSize: 0,
    lastCleanup: new Date(),
    hitCount: 0,
    missCount: 0,
  },
  maxEntries: 1000,
  maxSize: 50 * 1024 * 1024, // 50MB
  cleanupInterval: 5 * 60 * 1000, // 5 minutes
  defaultTTL: 5 * 60 * 1000, // 5 minutes
};

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

export const useAppStore = create<AppStore>()(
  persist(
    subscribeWithSelector(
      immer((set, get) => ({
        // ========================================================================
        // USER STATE & ACTIONS - Moved to userStore.ts
        // ========================================================================

        // ========================================================================
        // UI STATE & ACTIONS - Moved to uiStore.ts
        // ========================================================================

        // UI actions moved to uiStore.ts

        // ========================================================================
        // APP STATE & ACTIONS
        // ========================================================================
        ...initialAppState,

        updateSettings: settings =>
          set(state => {
            state.settings = { ...state.settings, ...settings };
            logApp('Settings updated', { settings });
          }),

        resetSettings: () =>
          set(state => {
            state.settings = initialAppState.settings;
            logApp('Settings reset');
          }),

        setOnlineStatus: online =>
          set(state => {
            state.isOnline = online;
            logApp('Online status changed', { online });
          }),

        setInitialized: initialized =>
          set(state => {
            state.isInitialized = initialized;
            logApp('App initialization status changed', { initialized });
          }),

        updateLastUpdate: () =>
          set(state => {
            state.lastUpdate = new Date();
          }),

        updatePerformanceMetrics: metrics =>
          set(state => {
            state.performanceMetrics = {
              ...state.performanceMetrics,
              ...metrics,
            };
          }),

        setFeatureFlag: (flag, enabled) =>
          set(state => {
            state.featureFlags.set(flag, enabled);
            logApp('Feature flag updated', { flag, enabled });
          }),

        getFeatureFlag: flag => {
          return get().featureFlags.get(flag) ?? false;
        },

        // ========================================================================
        // CACHE STATE & ACTIONS
        // ========================================================================
        ...initialCacheState,

        // ========================================================================
        // ERROR STATE & ACTIONS
        // ========================================================================
        ...initialErrorState,

        set: (key, data, options = {}) =>
          set(state => {
            const {
              ttl = state.defaultTTL,
              dependencies = [],
              metadata,
            } = options;

            // Remove old entry if it exists
            if (state.entries.has(key)) {
              const oldEntry = state.entries.get(key)!;
              state.stats.totalSize -= JSON.stringify(oldEntry.data).length;
              state.entries.delete(key);
            }

            // Add new entry
            const entry: CacheEntry = {
              key,
              data,
              timestamp: new Date(),
              ttl,
              dependencies,
              metadata,
            };

            state.entries.set(key, entry);
            state.stats.totalEntries = state.entries.size;
            state.stats.totalSize += JSON.stringify(data).length;

            // Cleanup if needed
            if (
              state.entries.size > state.maxEntries ||
              state.stats.totalSize > state.maxSize
            ) {
              get().cleanup();
            }
          }),

        get: key => {
          const state = get();
          const entry = state.entries.get(key);

          if (!entry) {
            state.stats.missCount++;
            return null;
          }

          // Check if entry has expired
          if (Date.now() - entry.timestamp.getTime() > entry.ttl) {
            state.entries.delete(key);
            state.stats.totalEntries = state.entries.size;
            state.stats.missCount++;
            return null;
          }

          state.stats.hitCount++;
          return entry.data;
        },

        has: key => {
          const entry = get().entries.get(key);
          if (!entry) return false;

          // Check if entry has expired
          if (Date.now() - entry.timestamp.getTime() > entry.ttl) {
            get().entries.delete(key);
            return false;
          }

          return true;
        },

        delete: key => {
          let deleted = false;
          set(state => {
            const entry = state.entries.get(key);
            if (entry) {
              state.stats.totalSize -= JSON.stringify(entry.data).length;
              state.entries.delete(key);
              state.stats.totalEntries = state.entries.size;
              deleted = true;
            }
          });
          return deleted;
        },

        clear: () =>
          set(state => {
            state.entries.clear();
            state.stats.totalEntries = 0;
            state.stats.totalSize = 0;
            logApp('Cache cleared');
          }),

        cleanup: () =>
          set(state => {
            const now = Date.now();
            let cleanedCount = 0;
            let cleanedSize = 0;

            // Remove expired entries
            for (const [key, entry] of state.entries.entries()) {
              if (now - entry.timestamp.getTime() > entry.ttl) {
                cleanedSize += JSON.stringify(entry.data).length;
                state.entries.delete(key);
                cleanedCount++;
              }
            }

            // Remove oldest entries if we still exceed limits
            if (state.entries.size > state.maxEntries) {
              const sortedEntries = Array.from(state.entries.entries()).sort(
                (a, b) => a[1].timestamp.getTime() - b[1].timestamp.getTime()
              );

              const toRemove = sortedEntries.slice(
                0,
                state.entries.size - state.maxEntries
              );
              toRemove.forEach(([key, entry]) => {
                cleanedSize += JSON.stringify(entry.data).length;
                state.entries.delete(key);
                cleanedCount++;
              });
            }

            if (cleanedCount > 0) {
              state.stats.totalEntries = state.entries.size;
              state.stats.totalSize = Math.max(
                0,
                state.stats.totalSize - cleanedSize
              );
              state.stats.lastCleanup = new Date();
              logApp('Cache cleanup completed', { cleanedCount, cleanedSize });
            }
          }),

        invalidateByDependency: dependency =>
          set(state => {
            let invalidatedCount = 0;

            for (const [key, entry] of state.entries.entries()) {
              if (entry.dependencies.includes(dependency)) {
                state.stats.totalSize -= JSON.stringify(entry.data).length;
                state.entries.delete(key);
                invalidatedCount++;
              }
            }

            if (invalidatedCount > 0) {
              state.stats.totalEntries = state.entries.size;
              logApp('Cache invalidated by dependency', {
                dependency,
                invalidatedCount,
              });
            }
          }),

        getStats: () => {
          return get().stats;
        },

        setMaxEntries: max =>
          set(state => {
            state.maxEntries = max;
            if (state.entries.size > max) {
              get().cleanup();
            }
          }),

        setMaxSize: max =>
          set(state => {
            state.maxSize = max;
            if (state.stats.totalSize > max) {
              get().cleanup();
            }
          }),

        setCleanupInterval: interval =>
          set(state => {
            state.cleanupInterval = interval;
          }),

        setDefaultTTL: ttl =>
          set(state => {
            state.defaultTTL = ttl;
          }),

        // ========================================================================
        // ERROR STATE & ACTIONS
        // ========================================================================
        ...initialErrorState,

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
                get().resolveError(errorId, 'auto-resolve');
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

        getErrorMetrics: () => {
          get().updateMetrics();
          return get().metrics;
        },

        getErrorsByComponent: component => {
          return Array.from(get().errors.values()).filter(
            e => e.component === component
          );
        },

        getErrorsByCategory: category => {
          return Array.from(get().errors.values()).filter(
            e => e.category === category
          );
        },

        getErrorsByPriority: priority => {
          return Array.from(get().errors.values()).filter(
            e => e.priority === priority
          );
        },

        setMaxErrors: max =>
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

        setMaxNotifications: max =>
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

        setAutoResolveErrors: enabled =>
          set(state => {
            state.autoResolveErrors = enabled;
          }),

        setAutoResolveDelay: delay =>
          set(state => {
            state.autoResolveDelay = delay;
          }),

        // ========================================================================
        // GLOBAL ACTIONS
        // ========================================================================
        reset: () =>
          set(() => ({
            ...initialAppState,
            ...initialCacheState,
            ...initialErrorState,
          })),

        getStateSnapshot: () => {
          const state = get();
          return {
            app: {
              isOnline: state.isOnline,
              isInitialized: state.isInitialized,
              settings: state.settings,
            },
            cache: state.getStats(),
            errors: state.getErrorMetrics(),
          };
        },
      }))
    ),
    {
      name: 'shabra-os-store',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        // Only persist non-sensitive, application-specific data
        app: {
          settings: state.settings,
          featureFlags: Object.fromEntries(state.featureFlags),
        },
        cache: {
          maxEntries: state.maxEntries,
          maxSize: state.maxSize,
          cleanupInterval: state.cleanupInterval,
          defaultTTL: state.defaultTTL,
        },
        errors: {
          maxErrors: state.maxErrors,
          maxNotifications: state.maxNotifications,
          autoResolveErrors: state.autoResolveErrors,
          autoResolveDelay: state.autoResolveDelay,
        },
      }),
    }
  )
);

// ============================================================================
// SELECTORS FOR OPTIMIZED STATE ACCESS
// ============================================================================

// User selectors moved to userStore.ts

// UI selectors moved to uiStore.ts

// App selectors
export const useAppSettings = () => useAppStore(state => state.settings);
export const useIsOnline = () => useAppStore(state => state.isOnline);
export const useIsInitialized = () => useAppStore(state => state.isInitialized);
export const usePerformanceMetrics = () =>
  useAppStore(state => state.performanceMetrics);
export const useFeatureFlag = (flag: string) =>
  useAppStore(state => state.getFeatureFlag(flag));

// Cache selectors
export const useCacheStats = () => useAppStore(state => state.getStats());
export const useCacheEntry = (key: string) =>
  useAppStore(state => state.get(key));
export const useHasCacheEntry = (key: string) =>
  useAppStore(state => state.has(key));

// Error selectors
export const useErrorMetrics = () =>
  useAppStore(state => state.getErrorMetrics());
export const useErrorsByComponent = (component: string) =>
  useAppStore(state => state.getErrorsByComponent(component));
export const useErrorsByCategory = (category: ErrorCategory) =>
  useAppStore(state => state.getErrorsByCategory(category));
export const useErrorsByPriority = (priority: ErrorPriority) =>
  useAppStore(state => state.getErrorsByPriority(priority));
export const useErrorNotifications = () =>
  useAppStore(state => Array.from(state.notifications.values()));

// Action selectors
// User actions moved to userStore.ts

// UI actions moved to uiStore.ts

export const useAppActions = () =>
  useAppStore(state => ({
    updateSettings: state.updateSettings,
    resetSettings: state.resetSettings,
    setOnlineStatus: state.setOnlineStatus,
    setInitialized: state.setInitialized,
    updateLastUpdate: state.updateLastUpdate,
    updatePerformanceMetrics: state.updatePerformanceMetrics,
    setFeatureFlag: state.setFeatureFlag,
  }));

export const useCacheActions = () =>
  useAppStore(state => ({
    set: state.set,
    get: state.get,
    has: state.has,
    delete: state.delete,
    clear: state.clear,
    cleanup: state.cleanup,
    invalidateByDependency: state.invalidateByDependency,
    getStats: state.getStats,
    setMaxEntries: state.setMaxEntries,
    setMaxSize: state.setMaxSize,
    setCleanupInterval: state.setCleanupInterval,
    setDefaultTTL: state.setDefaultTTL,
  }));

export const useErrorActions = () =>
  useAppStore(state => ({
    addError: state.addError,
    resolveError: state.resolveError,
    clearError: state.clearError,
    clearAllErrors: state.clearAllErrors,
    addNotification: state.addNotification,
    removeNotification: state.removeNotification,
    clearAllNotifications: state.clearAllNotifications,
    updateMetrics: state.updateMetrics,
    getErrorMetrics: state.getErrorMetrics,
    getErrorsByComponent: state.getErrorsByComponent,
    getErrorsByCategory: state.getErrorsByCategory,
    getErrorsByPriority: state.getErrorsByPriority,
    setMaxErrors: state.setMaxErrors,
    setMaxNotifications: state.setMaxNotifications,
    setAutoResolveErrors: state.setAutoResolveErrors,
    setAutoResolveDelay: state.setAutoResolveDelay,
  }));

// ============================================================================
// AUTOMATIC CLEANUP AND MAINTENANCE
// ============================================================================

// Set up automatic cache cleanup
if (typeof window !== 'undefined') {
  setInterval(() => {
    useAppStore.getState().cleanup();
  }, useAppStore.getState().cleanupInterval);

  // Set up online/offline detection
  window.addEventListener('online', () => {
    useAppStore.getState().setOnlineStatus(true);
  });

  window.addEventListener('offline', () => {
    useAppStore.getState().setOnlineStatus(false);
  });
}
