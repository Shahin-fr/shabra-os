import { logger } from './logger';

export interface CacheStatus {
  status: 'clean' | 'dirty' | 'updating' | 'unknown';
  lastUpdate: number;
  serviceWorkerStatus: string;
  lastCleared?: Date;
}

export interface CacheManager {
  clearAllCaches: () => Promise<boolean>;
  invalidateContentCache: (contentType: ContentType) => Promise<boolean>;
  updateCacheVersion: (newVersion: string) => Promise<boolean>;
  getCacheStatus: () => Promise<CacheStatus>;
  forceRefresh: (contentType: ContentType) => Promise<boolean>;
}

export type ContentType =
  | 'calendar'
  | 'projects'
  | 'stories'
  | 'tasks'
  | 'users'
  | 'attendance';

// Cache invalidation triggers for different content types
export const CACHE_INVALIDATION_TRIGGERS: Record<
  ContentType,
  { triggers: string[]; relatedQueries: string[] }
> = {
  calendar: {
    triggers: ['content-slots', 'stories'],
    relatedQueries: ['contentCalendar', 'stories'],
  },
  projects: {
    triggers: ['projects', 'tasks'],
    relatedQueries: ['projects', 'tasks'],
  },
  stories: {
    triggers: ['stories', 'story-types'],
    relatedQueries: ['stories', 'storyTypes'],
  },
  tasks: {
    triggers: ['tasks', 'attendance'],
    relatedQueries: ['tasks', 'attendance'],
  },
  users: {
    triggers: ['users', 'attendance'],
    relatedQueries: ['users', 'attendance'],
  },
  attendance: {
    triggers: ['attendance'],
    relatedQueries: ['attendance'],
  },
};

// Main cache manager class
class ApplicationCacheManager implements CacheManager {
  private cacheStatus: CacheStatus = {
    status: 'clean',
    lastUpdate: Date.now(),
    serviceWorkerStatus: 'unregistered',
  };
  private isDestroyed = false;
  private cleanupCallbacks: (() => void)[] = [];

  constructor() {
    this.initializeCacheManager();
  }

  private async initializeCacheManager() {
    // Check if service worker is available
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          this.cacheStatus.serviceWorkerStatus = registration.active
            ? 'active'
            : 'waiting';
        }
      } catch (error) {
        logger.warn(
          'Failed to get service worker registration:',
          error as Error
        );
      }
    }

    // Set up message listener for cache status updates
    this.setupMessageListener();
  }

  private setupMessageListener() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data && event.data.type === 'CACHE_STATUS_UPDATE') {
          this.cacheStatus = event.data.status;
        }
      });
    }
  }

  // Memory leak prevention and cleanup
  public destroy(): void {
    if (this.isDestroyed) return;

    logger.info('Destroying ApplicationCacheManager and cleaning up resources');

    // Mark as destroyed
    this.isDestroyed = true;

    // Execute cleanup callbacks
    this.cleanupCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        logger.error('Error during cleanup callback execution', error as Error);
      }
    });
    this.cleanupCallbacks = [];

    logger.info('ApplicationCacheManager destroyed successfully');
  }

  // Check if manager is destroyed
  public isDestroyedState(): boolean {
    return this.isDestroyed;
  }

  async clearAllCaches(): Promise<boolean> {
    if (this.isDestroyed) return false;

    try {
      // Clear service worker cache
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      // Clear localStorage cache
      if (typeof window !== 'undefined') {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('cache_') || key.startsWith('state_')) {
            localStorage.removeItem(key);
          }
        });
      }

      this.cacheStatus.status = 'clean';
      this.cacheStatus.lastUpdate = Date.now();

      logger.info('All caches cleared successfully');
      return true;
    } catch (error) {
      logger.error('Failed to clear all caches', error as Error);
      return false;
    }
  }

  async invalidateContentCache(contentType: ContentType): Promise<boolean> {
    if (this.isDestroyed) return false;

    try {
      const triggers = CACHE_INVALIDATION_TRIGGERS[contentType];
      if (!triggers) {
        logger.warn(
          `No cache invalidation triggers found for content type: ${contentType}`
        );
        return false;
      }

      // Invalidate related caches
      const invalidationPromises = triggers.triggers.map(trigger =>
        this.invalidateCacheByTrigger(trigger)
      );

      await Promise.all(invalidationPromises);

      this.cacheStatus.status = 'dirty';
      logger.info(`Cache invalidated for content type: ${contentType}`);

      return true;
    } catch (error) {
      logger.error(
        `Failed to invalidate cache for content type: ${contentType}`,
        error as Error
      );
      return false;
    }
  }

  private async invalidateCacheByTrigger(trigger: string): Promise<void> {
    try {
      // Clear localStorage items related to this trigger
      if (typeof window !== 'undefined') {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.includes(trigger)) {
            localStorage.removeItem(key);
          }
        });
      }

      // Clear service worker cache for this trigger
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        const relevantCaches = cacheNames.filter(name =>
          name.includes(trigger)
        );

        await Promise.all(relevantCaches.map(name => caches.delete(name)));
      }
    } catch (error) {
      logger.error(
        `Failed to invalidate cache for trigger: ${trigger}`,
        error as Error
      );
    }
  }

  async updateCacheVersion(newVersion: string): Promise<boolean> {
    if (this.isDestroyed) return false;

    try {
      // Clear all caches when version changes
      await this.clearAllCaches();

      logger.info(`Cache version updated to: ${newVersion}`);
      return true;
    } catch (error) {
      logger.error(
        `Failed to update cache version to: ${newVersion}`,
        error as Error
      );
      return false;
    }
  }

  async forceRefresh(contentType: ContentType): Promise<boolean> {
    if (this.isDestroyed) return false;

    try {
      // Force refresh by invalidating cache and triggering a fresh fetch
      await this.invalidateContentCache(contentType);

      // Update cache status to indicate refresh
      this.cacheStatus.status = 'updating';
      this.cacheStatus.lastUpdate = Date.now();

      logger.info(`Force refresh triggered for content type: ${contentType}`);
      return true;
    } catch (error) {
      logger.error(
        `Failed to force refresh for content type: ${contentType}`,
        error as Error
      );
      return false;
    }
  }

  async getCacheStatus(): Promise<CacheStatus> {
    if (this.isDestroyed) {
      return {
        status: 'unknown',
        lastUpdate: 0,
        serviceWorkerStatus: 'destroyed',
        lastCleared: undefined,
      };
    }

    try {
      // Update service worker status
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          this.cacheStatus.serviceWorkerStatus = registration.active
            ? 'active'
            : registration.waiting
              ? 'waiting'
              : 'unregistered';
        }
      }

      return { ...this.cacheStatus };
    } catch (error) {
      logger.error('Failed to get cache status', error as Error);
      return {
        status: 'unknown',
        lastUpdate: 0,
        serviceWorkerStatus: 'error',
        lastCleared: undefined,
      };
    }
  }

  // Add cleanup callback for proper resource management
  public addCleanupCallback(callback: () => void): void {
    if (!this.isDestroyed) {
      this.cleanupCallbacks.push(callback);
    }
  }
}

// Export singleton instance
export const cacheManager = new ApplicationCacheManager();

// Export utility functions for backward compatibility
export const getCacheStatus = () => cacheManager.getCacheStatus();
export const getCacheStats = async () => {
  const status = await cacheManager.getCacheStatus();
  return {
    totalCaches: 1, // Placeholder - could be enhanced to count actual caches
    totalSize: 0, // Placeholder - could be enhanced to calculate actual size
    lastCleared: status.lastCleared,
    version: '1.0.0', // Placeholder - could be enhanced to get actual version
  };
};
