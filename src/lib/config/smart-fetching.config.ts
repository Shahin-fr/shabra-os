import { SmartFetchingOptions } from '@/hooks/useSmartDataFetching';

/**
 * Configuration for different data fetching strategies
 * This replaces the inefficient 30-second polling with intelligent, event-driven fetching
 */

// Critical data that needs frequent updates (like attendance, real-time status)
export const CRITICAL_DATA_CONFIG: Partial<SmartFetchingOptions> = {
  staleTime: 2 * 60 * 1000, // 2 minutes
  gcTime: 5 * 60 * 1000, // 5 minutes
  refetchOnWindowFocus: true,
  refetchOnMount: true,
  refetchOnReconnect: true,
  manualRefresh: true,
  userActivityDetection: true,
  criticalData: true,
};

// Semi-critical data that needs moderate updates (like tasks, notifications)
export const SEMI_CRITICAL_DATA_CONFIG: Partial<SmartFetchingOptions> = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
  refetchOnWindowFocus: true,
  refetchOnMount: true,
  refetchOnReconnect: true,
  manualRefresh: true,
  userActivityDetection: true,
  criticalData: false,
};

// Static data that rarely changes (like user profile, team info, settings)
export const STATIC_DATA_CONFIG: Partial<SmartFetchingOptions> = {
  staleTime: 30 * 60 * 1000, // 30 minutes
  gcTime: 60 * 60 * 1000, // 1 hour
  refetchOnWindowFocus: false,
  refetchOnMount: true,
  refetchOnReconnect: false,
  manualRefresh: false,
  userActivityDetection: false,
  criticalData: false,
};

// Analytics data that can be cached longer (like charts, reports)
export const ANALYTICS_DATA_CONFIG: Partial<SmartFetchingOptions> = {
  staleTime: 15 * 60 * 1000, // 15 minutes
  gcTime: 30 * 60 * 1000, // 30 minutes
  refetchOnWindowFocus: false,
  refetchOnMount: true,
  refetchOnReconnect: false,
  manualRefresh: true,
  userActivityDetection: false,
  criticalData: false,
};

// Data type mappings for easy configuration
export const DATA_TYPE_CONFIGS = {
  // Attendance and real-time status
  attendance: CRITICAL_DATA_CONFIG,
  clockInOut: CRITICAL_DATA_CONFIG,
  userStatus: CRITICAL_DATA_CONFIG,

  // Tasks and work items
  tasks: SEMI_CRITICAL_DATA_CONFIG,
  projects: SEMI_CRITICAL_DATA_CONFIG,
  notifications: SEMI_CRITICAL_DATA_CONFIG,

  // User and team information
  userProfile: STATIC_DATA_CONFIG,
  teamMembers: STATIC_DATA_CONFIG,
  roles: STATIC_DATA_CONFIG,
  settings: STATIC_DATA_CONFIG,

  // Analytics and reports
  activityChart: ANALYTICS_DATA_CONFIG,
  performanceMetrics: ANALYTICS_DATA_CONFIG,
  reports: ANALYTICS_DATA_CONFIG,

  // Content and documents
  stories: SEMI_CRITICAL_DATA_CONFIG,
  storyTypes: STATIC_DATA_CONFIG,
  wiki: STATIC_DATA_CONFIG,
  documents: STATIC_DATA_CONFIG,
} as const;

// Helper function to get config for a specific data type
export function getDataConfig(
  dataType: keyof typeof DATA_TYPE_CONFIGS
): Partial<SmartFetchingOptions> {
  return DATA_TYPE_CONFIGS[dataType] || SEMI_CRITICAL_DATA_CONFIG;
}

// Network-aware configuration adjustments
export function getNetworkAwareConfig(
  baseConfig: Partial<SmartFetchingOptions>,
  isSlowNetwork: boolean = false
): Partial<SmartFetchingOptions> {
  if (isSlowNetwork) {
    return {
      ...baseConfig,
      staleTime: Math.min(
        baseConfig.staleTime || 5 * 60 * 1000,
        10 * 60 * 1000
      ), // Cap at 10 minutes
      gcTime: Math.min(baseConfig.gcTime || 10 * 60 * 1000, 20 * 60 * 1000), // Cap at 20 minutes
      userActivityDetection: false, // Disable activity detection on slow networks
    };
  }

  return baseConfig;
}

// User preference-aware configuration
export function getUserPreferenceConfig(
  baseConfig: Partial<SmartFetchingOptions>,
  userPreferences: {
    dataFreshness: 'high' | 'medium' | 'low';
    networkOptimization: boolean;
  }
): Partial<SmartFetchingOptions> {
  let config = { ...baseConfig };

  switch (userPreferences.dataFreshness) {
    case 'high':
      config.staleTime = Math.min(
        (config.staleTime || 5 * 60 * 1000) * 0.5,
        2 * 60 * 1000
      );
      config.userActivityDetection = true;
      break;
    case 'medium':
      // Keep default settings
      break;
    case 'low':
      config.staleTime = Math.max(
        (config.staleTime || 5 * 60 * 1000) * 2,
        10 * 60 * 1000
      );
      config.userActivityDetection = false;
      break;
  }

  if (userPreferences.networkOptimization) {
    config = getNetworkAwareConfig(config, true);
  }

  return config;
}
