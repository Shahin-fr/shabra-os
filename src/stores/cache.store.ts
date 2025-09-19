/**
 * Cache State Management Store
 *
 * This store manages optimized caching with TanStack Query integration.
 * It's separated from the main consolidated store to improve maintainability
 * and reduce complexity.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { logApp } from '@/lib/logger';

// ============================================================================
// CACHE STATE INTERFACES
// ============================================================================

export interface CacheEntry<T = unknown> {
  key: string;
  data: T;
  timestamp: Date;
  ttl: number; // Time to live in milliseconds
  dependencies: string[];
  metadata?: Record<string, unknown>;
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number; // Estimated size in bytes
  lastCleanup: Date;
  hitCount: number;
  missCount: number;
}

export interface CacheState {
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

export interface CacheActions {
  // Cache operations
  set: <T>(
    key: string,
    data: T,
    options?: {
      ttl?: number;
      dependencies?: string[];
      metadata?: Record<string, unknown>;
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

  // Utility actions
  reset: () => void;
}

export type CacheStore = CacheState & CacheActions;

// ============================================================================
// INITIAL STATE
// ============================================================================

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

// ============================================================================
// STORE CREATION
// ============================================================================

export const useCacheStore = create<CacheStore>()(
  persist(
    subscribeWithSelector(
      immer(set => ({
        // ========================================================================
        // INITIAL STATE
        // ========================================================================
        ...initialCacheState,

        // ========================================================================
        // CACHE OPERATIONS
        // ========================================================================
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
              useCacheStore.getState().cleanup();
            }
          }),

        get: (key: string): any => {
          const state = useCacheStore.getState();
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

        has: (key: string) => {
          const state = useCacheStore.getState();
          const entry = state.entries.get(key);
          if (!entry) return false;

          // Check if entry has expired
          if (Date.now() - entry.timestamp.getTime() > entry.ttl) {
            state.entries.delete(key);
            return false;
          }

          return true;
        },

        delete: (key: string) => {
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

        // ========================================================================
        // CACHE MANAGEMENT
        // ========================================================================
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

        invalidateByDependency: (dependency: string) =>
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

        getStats: (): CacheStats => {
          return useCacheStore.getState().stats;
        },

        // ========================================================================
        // CONFIGURATION
        // ========================================================================
        setMaxEntries: (max: number) =>
          set(state => {
            state.maxEntries = max;
            if (state.entries.size > max) {
              useCacheStore.getState().cleanup();
            }
          }),

        setMaxSize: (max: number) =>
          set(state => {
            state.maxSize = max;
            if (state.stats.totalSize > max) {
              useCacheStore.getState().cleanup();
            }
          }),

        setCleanupInterval: (interval: number) =>
          set(state => {
            state.cleanupInterval = interval;
          }),

        setDefaultTTL: (ttl: number) =>
          set(state => {
            state.defaultTTL = ttl;
          }),

        // ========================================================================
        // UTILITY ACTIONS
        // ========================================================================
        reset: () =>
          set(state => {
            Object.assign(state, initialCacheState);
            logApp('Cache state reset');
          }),
      }))
    ),
    {
      name: 'shabra-os-cache-store',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        // Only persist configuration, not the actual cache data
        maxEntries: state.maxEntries,
        maxSize: state.maxSize,
        cleanupInterval: state.cleanupInterval,
        defaultTTL: state.defaultTTL,
      }),
    }
  )
);

// ============================================================================
// SELECTORS FOR OPTIMIZED STATE ACCESS
// ============================================================================

// Cache stats selectors
export const useCacheStats = () => useCacheStore((state: CacheStore) => state.getStats());
export const useCacheTotalEntries = () => useCacheStore((state: CacheStore) => state.stats.totalEntries);
export const useCacheTotalSize = () => useCacheStore((state: CacheStore) => state.stats.totalSize);
export const useCacheHitCount = () => useCacheStore((state: CacheStore) => state.stats.hitCount);
export const useCacheMissCount = () => useCacheStore((state: CacheStore) => state.stats.missCount);
export const useCacheLastCleanup = () => useCacheStore((state: CacheStore) => state.stats.lastCleanup);

// Cache entry selectors
export const useCacheEntry = (key: string) => useCacheStore((state: CacheStore) => state.get(key));
export const useHasCacheEntry = (key: string) => useCacheStore((state: CacheStore) => state.has(key));

// Configuration selectors
export const useCacheMaxEntries = () => useCacheStore((state: CacheStore) => state.maxEntries);
export const useCacheMaxSize = () => useCacheStore((state: CacheStore) => state.maxSize);
export const useCacheCleanupInterval = () => useCacheStore((state: CacheStore) => state.cleanupInterval);
export const useCacheDefaultTTL = () => useCacheStore((state: CacheStore) => state.defaultTTL);

// Individual action selectors to prevent infinite re-renders
export const useCacheSet = () => useCacheStore((state: CacheStore) => state.set);
export const useCacheGet = () => useCacheStore((state: CacheStore) => state.get);
export const useCacheHas = () => useCacheStore((state: CacheStore) => state.has);
export const useCacheDelete = () => useCacheStore((state: CacheStore) => state.delete);
export const useCacheClear = () => useCacheStore((state: CacheStore) => state.clear);
export const useCacheCleanup = () => useCacheStore((state: CacheStore) => state.cleanup);
export const useCacheInvalidateByDependency = () => useCacheStore((state: CacheStore) => state.invalidateByDependency);
export const useCacheGetStats = () => useCacheStore((state: CacheStore) => state.getStats);
export const useCacheSetMaxEntries = () => useCacheStore((state: CacheStore) => state.setMaxEntries);
export const useCacheSetMaxSize = () => useCacheStore((state: CacheStore) => state.setMaxSize);
export const useCacheSetCleanupInterval = () => useCacheStore((state: CacheStore) => state.setCleanupInterval);
export const useCacheSetDefaultTTL = () => useCacheStore((state: CacheStore) => state.setDefaultTTL);
export const useCacheReset = () => useCacheStore((state: CacheStore) => state.reset);

// Action selector for backward compatibility (use individual selectors for better performance)
export const useCacheActions = () => {
  const set = useCacheSet();
  const get = useCacheGet();
  const has = useCacheHas();
  const deleteEntry = useCacheDelete();
  const clear = useCacheClear();
  const cleanup = useCacheCleanup();
  const invalidateByDependency = useCacheInvalidateByDependency();
  const getStats = useCacheGetStats();
  const setMaxEntries = useCacheSetMaxEntries();
  const setMaxSize = useCacheSetMaxSize();
  const setCleanupInterval = useCacheSetCleanupInterval();
  const setDefaultTTL = useCacheSetDefaultTTL();
  const reset = useCacheReset();

  return {
    set,
    get,
    has,
    delete: deleteEntry,
    clear,
    cleanup,
    invalidateByDependency,
    getStats,
    setMaxEntries,
    setMaxSize,
    setCleanupInterval,
    setDefaultTTL,
    reset,
  };
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a cache entry with default values
 */
export const createCacheEntry = <T>(
  key: string,
  data: T,
  options?: {
    ttl?: number;
    dependencies?: string[];
    metadata?: Record<string, unknown>;
  }
): CacheEntry<T> => ({
  key,
  data,
  timestamp: new Date(),
  ttl: options?.ttl || 5 * 60 * 1000, // 5 minutes default
  dependencies: options?.dependencies || [],
  metadata: options?.metadata,
});

/**
 * Create cache stats with default values
 */
export const createCacheStats = (overrides: Partial<CacheStats> = {}): CacheStats => ({
  totalEntries: 0,
  totalSize: 0,
  lastCleanup: new Date(),
  hitCount: 0,
  missCount: 0,
  ...overrides,
});

// ============================================================================
// AUTOMATIC CLEANUP
// ============================================================================

// Set up automatic cache cleanup
if (typeof window !== 'undefined') {
  setInterval(() => {
    useCacheStore.getState().cleanup();
  }, useCacheStore.getState().cleanupInterval);
}
