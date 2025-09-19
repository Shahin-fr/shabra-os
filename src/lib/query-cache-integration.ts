/**
 * TanStack Query Cache Integration
 *
 * This module integrates the consolidated cache system with TanStack Query
 * to eliminate duplication and provide a unified caching strategy.
 */

import { QueryClient, QueryKey } from '@tanstack/react-query';

// ============================================================================
// CACHE INTEGRATION TYPES
// ============================================================================

export interface CacheIntegrationConfig {
  // Cache strategy for different query types
  strategy: 'aggressive' | 'balanced' | 'minimal';

  // Default TTL for different data types
  defaultTTLs: {
    stories: number;
    projects: number;
    users: number;
    tasks: number;
    content: number;
    analytics: number;
  };

  // Dependencies for cache invalidation
  dependencies: {
    [key: string]: string[];
  };

  // Enable/disable features
  enablePersistentCache: boolean;
  enableBackgroundSync: boolean;
  enableOptimisticUpdates: boolean;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const defaultCacheConfig: CacheIntegrationConfig = {
  strategy: 'balanced',
  defaultTTLs: {
    stories: 5 * 60 * 1000, // 5 minutes
    projects: 10 * 60 * 1000, // 10 minutes
    users: 30 * 60 * 1000, // 30 minutes
    tasks: 2 * 60 * 1000, // 2 minutes
    content: 15 * 60 * 1000, // 15 minutes
    analytics: 60 * 60 * 1000, // 1 hour
  },
  dependencies: {
    stories: ['projects', 'users'],
    projects: ['users'],
    tasks: ['projects', 'users'],
    content: ['projects', 'users'],
  },
  enablePersistentCache: true,
  enableBackgroundSync: true,
  enableOptimisticUpdates: true,
};

// ============================================================================
// CACHE UTILITIES
// ============================================================================

/**
 * Get default TTL based on query key
 */
function getDefaultTTL(queryKey: QueryKey): number {
  const key = Array.isArray(queryKey) ? queryKey[0] : queryKey;

  if (typeof key === 'string') {
    const config = defaultCacheConfig.defaultTTLs;

    if (key.includes('stories')) return config.stories;
    if (key.includes('projects')) return config.projects;
    if (key.includes('users')) return config.users;
    if (key.includes('tasks')) return config.tasks;
    if (key.includes('content')) return config.content;
    if (key.includes('analytics')) return config.analytics;
  }

  return defaultCacheConfig.defaultTTLs.content; // Default fallback
}

// ============================================================================
// QUERY CLIENT CREATION
// ============================================================================

/**
 * Create a query client with cache integration
 */
export function createIntegratedQueryClient(
  config: Partial<CacheIntegrationConfig> = {}
) {
  const finalConfig = { ...defaultCacheConfig, ...config };

  return new QueryClient({
    defaultOptions: {
      queries: {
        // Enhanced stale time based on cache strategy
        staleTime:
          finalConfig.strategy === 'aggressive'
            ? 10 * 60 * 1000
            : 5 * 60 * 1000,

        // Enhanced cache time based on strategy
        gcTime:
          finalConfig.strategy === 'aggressive'
            ? 30 * 60 * 1000
            : 15 * 60 * 1000,

        // Retry configuration
        retry: (failureCount, error: any) => {
          // Don't retry on 4xx errors
          if (error?.status >= 400 && error?.status < 500) {
            return false;
          }

          // Retry up to 3 times for other errors
          return failureCount < 3;
        },

        // Background refetch
        refetchOnWindowFocus: finalConfig.enableBackgroundSync,
        refetchOnReconnect: finalConfig.enableBackgroundSync,
      },

      mutations: {
        // Retry configuration
        retry: (failureCount, error: any) => {
          // Don't retry mutations on 4xx errors
          if (error?.status >= 400 && error?.status < 500) {
            return false;
          }

          // Retry up to 2 times for other errors
          return failureCount < 2;
        },
      },
    },
  });
}

// ============================================================================
// CACHE PRELOADING
// ============================================================================

/**
 * Preload data into cache for better performance
 */
export function preloadCacheData<T>(
  cacheKey: string,
  data: T,
  setCache: (key: string, data: any, options: any) => void,
  options?: {
    ttl?: number;
    dependencies?: string[];
  }
) {
  setCache(cacheKey, data, {
    ttl: options?.ttl || getDefaultTTL([cacheKey]),
    dependencies: options?.dependencies || [],
  });
}

/**
 * Preload multiple cache entries
 */
export function preloadMultipleCacheEntries(
  entries: Array<{
    key: string;
    data: any;
    ttl?: number;
    dependencies?: string[];
  }>,
  setCache: (key: string, data: any, options: any) => void
) {
  entries.forEach(({ key, data, ttl, dependencies }) => {
    setCache(key, data, {
      ttl: ttl || getDefaultTTL([key]),
      dependencies: dependencies || [],
    });
  });
}

// Export the default config for external use
export { defaultCacheConfig };
