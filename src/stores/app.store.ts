/**
 * App State Management Store
 *
 * This store manages global application state including settings, performance metrics,
 * feature flags, and system status. It's separated from the main consolidated store
 * to improve maintainability and reduce complexity.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { logApp } from '@/lib/logger';

// ============================================================================
// APP STATE INTERFACES
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

export interface PerformanceMetrics {
  pageLoadTime: number;
  memoryUsage: number;
  cpuUsage: number;
  networkLatency: number;
}

export interface AppState {
  // Settings
  settings: AppSettings;

  // System state
  isOnline: boolean;
  isInitialized: boolean;
  lastUpdate: Date;

  // Performance metrics
  performanceMetrics: PerformanceMetrics;

  // Feature flags
  featureFlags: Map<string, boolean>;
}

export interface AppActions {
  // Settings
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetSettings: () => void;

  // System state
  setOnlineStatus: (online: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  updateLastUpdate: () => void;

  // Performance
  updatePerformanceMetrics: (metrics: Partial<PerformanceMetrics>) => void;

  // Feature flags
  setFeatureFlag: (flag: string, enabled: boolean) => void;
  getFeatureFlag: (flag: string) => boolean;

  // Utility actions
  reset: () => void;
}

export type AppStore = AppState & AppActions;

// ============================================================================
// INITIAL STATE
// ============================================================================

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

// ============================================================================
// STORE CREATION
// ============================================================================

export const useAppStore = create<AppStore>()(
  persist(
    subscribeWithSelector(
      immer(set => ({
        // ========================================================================
        // INITIAL STATE
        // ========================================================================
        ...initialAppState,

        // ========================================================================
        // SETTINGS ACTIONS
        // ========================================================================
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

        // ========================================================================
        // SYSTEM STATE ACTIONS
        // ========================================================================
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

        // ========================================================================
        // PERFORMANCE ACTIONS
        // ========================================================================
        updatePerformanceMetrics: metrics =>
          set(state => {
            state.performanceMetrics = {
              ...state.performanceMetrics,
              ...metrics,
            };
          }),

        // ========================================================================
        // FEATURE FLAGS ACTIONS
        // ========================================================================
        setFeatureFlag: (flag, enabled) =>
          set(state => {
            state.featureFlags.set(flag, enabled);
            logApp('Feature flag updated', { flag, enabled });
          }),

        getFeatureFlag: (flag: string): boolean => {
          return useAppStore.getState().featureFlags.get(flag) ?? false;
        },

        // ========================================================================
        // UTILITY ACTIONS
        // ========================================================================
        reset: () =>
          set(state => {
            Object.assign(state, initialAppState);
            logApp('App state reset');
          }),
      }))
    ),
    {
      name: 'shabra-os-app-store',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        // Only persist non-sensitive, application-specific data
        settings: state.settings,
        featureFlags: Object.fromEntries(state.featureFlags),
      }),
    }
  )
);

// ============================================================================
// SELECTORS FOR OPTIMIZED STATE ACCESS
// ============================================================================

// Settings selectors
export const useAppSettings = () => useAppStore((state: AppStore) => state.settings);
export const useCacheStrategy = () => useAppStore((state: AppStore) => state.settings.cacheStrategy);
export const useIsDebugMode = () => useAppStore((state: AppStore) => state.settings.enableDebugMode);
export const useIsLoggingEnabled = () => useAppStore((state: AppStore) => state.settings.enableLogging);

// System state selectors
export const useIsOnline = () => useAppStore((state: AppStore) => state.isOnline);
export const useIsInitialized = () => useAppStore((state: AppStore) => state.isInitialized);
export const useLastUpdate = () => useAppStore((state: AppStore) => state.lastUpdate);

// Performance selectors
export const usePerformanceMetrics = () => useAppStore((state: AppStore) => state.performanceMetrics);
export const usePageLoadTime = () => useAppStore((state: AppStore) => state.performanceMetrics.pageLoadTime);
export const useMemoryUsage = () => useAppStore((state: AppStore) => state.performanceMetrics.memoryUsage);
export const useCpuUsage = () => useAppStore((state: AppStore) => state.performanceMetrics.cpuUsage);
export const useNetworkLatency = () => useAppStore((state: AppStore) => state.performanceMetrics.networkLatency);

// Feature flag selectors
export const useFeatureFlag = (flag: string) => useAppStore((state: AppStore) => state.getFeatureFlag(flag));
export const useFeatureFlags = () => useAppStore((state: AppStore) => Object.fromEntries(state.featureFlags));

// Individual action selectors to prevent infinite re-renders
export const useUpdateSettings = () => useAppStore((state: AppStore) => state.updateSettings);
export const useResetSettings = () => useAppStore((state: AppStore) => state.resetSettings);
export const useSetOnlineStatus = () => useAppStore((state: AppStore) => state.setOnlineStatus);
export const useSetInitialized = () => useAppStore((state: AppStore) => state.setInitialized);
export const useUpdateLastUpdate = () => useAppStore((state: AppStore) => state.updateLastUpdate);
export const useUpdatePerformanceMetrics = () => useAppStore((state: AppStore) => state.updatePerformanceMetrics);
export const useSetFeatureFlag = () => useAppStore((state: AppStore) => state.setFeatureFlag);
export const useResetApp = () => useAppStore((state: AppStore) => state.reset);

// Action selector for backward compatibility (use individual selectors for better performance)
export const useAppActions = () => {
  const updateSettings = useUpdateSettings();
  const resetSettings = useResetSettings();
  const setOnlineStatus = useSetOnlineStatus();
  const setInitialized = useSetInitialized();
  const updateLastUpdate = useUpdateLastUpdate();
  const updatePerformanceMetrics = useUpdatePerformanceMetrics();
  const setFeatureFlag = useSetFeatureFlag();
  const reset = useResetApp();

  return {
    updateSettings,
    resetSettings,
    setOnlineStatus,
    setInitialized,
    updateLastUpdate,
    updatePerformanceMetrics,
    setFeatureFlag,
    reset,
  };
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create app settings with default values
 */
export const createAppSettings = (
  overrides: Partial<AppSettings> = {}
): AppSettings => ({
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
  ...overrides,
});

/**
 * Create performance metrics with default values
 */
export const createPerformanceMetrics = (
  overrides: Partial<PerformanceMetrics> = {}
): PerformanceMetrics => ({
  pageLoadTime: 0,
  memoryUsage: 0,
  cpuUsage: 0,
  networkLatency: 0,
  ...overrides,
});

// ============================================================================
// AUTOMATIC SYSTEM MANAGEMENT
// ============================================================================

// Set up online/offline detection
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useAppStore.getState().setOnlineStatus(true);
  });

  window.addEventListener('offline', () => {
    useAppStore.getState().setOnlineStatus(false);
  });
}
