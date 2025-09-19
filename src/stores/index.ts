/**
 * Store Index - Centralized Export
 *
 * This file provides centralized exports for all domain-specific stores,
 * making it easier to import and use stores throughout the application.
 */

// ============================================================================
// STORE EXPORTS
// ============================================================================

// App Store
export * from './app.store';

// Cache Store
export * from './cache.store';

// Error Store
export * from './error.store';

// UI Store
export * from './uiStore';

// User Store - export individual items to avoid conflicts
export {
  useUserStore,
  useUserProfile,
  useIsAuthenticated,
  useUserPreferences,
  useUserActions,
  useIsLoading as useUserIsLoading,
  useTheme as useUserTheme,
} from './userStore';

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

// Re-export commonly used store hooks for convenience
export {
  // App Store
  useAppStore,
  useAppSettings,
  useIsOnline,
  useIsInitialized,
  usePerformanceMetrics,
  useFeatureFlag,
  useAppActions,
} from './app.store';

export {
  // Cache Store
  useCacheStore,
  useCacheStats,
  useCacheEntry,
  useHasCacheEntry,
  useCacheActions,
} from './cache.store';

export {
  // Error Store
  useErrorStore,
  useErrorMetrics,
  useErrorNotifications,
  useErrorActions,
} from './error.store';

export {
  // UI Store
  useUIStore,
  useSidebarCollapsed,
  useModals,
  useUINotifications,
  useUIActions,
  // Rename conflicting exports
  useIsLoading as useUIIsLoading,
  useTheme as useUITheme,
} from './uiStore';

// User Store exports are handled above