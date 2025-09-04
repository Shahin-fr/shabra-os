import { logger } from '../logger';

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface CacheStats {
  hitCount: number;
  missCount: number;
  hitRate: number;
  totalItems: number;
  memoryUsage: number;
  lastCleanup: number;
}

export interface CacheManager<T> {
  get(key: string): T | null;
  set(key: string, value: T, ttl?: number): void;
  delete(key: string): void;
  clear(): void;
  getStats(): CacheStats;
}

export class GenericCache<T> implements CacheManager<T> {
  private cache: Map<string, CacheItem<T>>;
  private stats: CacheStats;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private isDestroyed = false;

  constructor(private defaultTTL: number = 5 * 60 * 1000) {
    this.cache = new Map();
    this.stats = {
      hitCount: 0,
      missCount: 0,
      hitRate: 0,
      totalItems: 0,
      memoryUsage: 0,
      lastCleanup: Date.now(),
    };
    this.startCleanup();
  }

  get(key: string): T | null {
    if (this.isDestroyed) return null;

    const item = this.cache.get(key);
    if (!item) {
      this.stats.missCount++;
      this.updateHitRate();
      return null;
    }

    // Check if item has expired
    if (Date.now() > item.timestamp + item.ttl) {
      this.cache.delete(key);
      this.stats.missCount++;
      this.updateHitRate();
      return null;
    }

    this.stats.hitCount++;
    this.updateHitRate();
    return item.data;
  }

  set(key: string, value: T, ttl?: number): void {
    if (this.isDestroyed) return;

    const item: CacheItem<T> = {
      data: value,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    };

    this.cache.set(key, item);
    this.updateStats();
  }

  delete(key: string): void {
    if (this.isDestroyed) return;

    this.cache.delete(key);
    this.updateStats();
  }

  clear(): void {
    if (this.isDestroyed) return;

    this.cache.clear();
    this.updateStats();
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  private updateHitRate(): void {
    const total = this.stats.hitCount + this.stats.missCount;
    this.stats.hitRate = total > 0 ? this.stats.hitCount / total : 0;
  }

  private updateStats(): void {
    this.stats.totalItems = this.cache.size;
    this.stats.memoryUsage = this.estimateMemoryUsage();
  }

  private estimateMemoryUsage(): number {
    // Rough estimation of memory usage
    let totalSize = 0;
    for (const [key, item] of this.cache) {
      totalSize += key.length * 2; // UTF-16 characters
      totalSize += JSON.stringify(item.data).length * 2;
      totalSize += 24; // timestamp + ttl overhead
    }
    return totalSize;
  }

  private startCleanup(): void {
    if (this.isDestroyed) return;

    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // Every minute
  }

  private cleanup(): void {
    if (this.isDestroyed) return;

    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, item] of this.cache) {
      if (now > item.timestamp + item.ttl) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.stats.lastCleanup = now;
      this.updateStats();
      logger.debug(`Cleaned up ${cleanedCount} expired cache items`);
    }
  }

  destroy(): void {
    if (this.isDestroyed) return;

    this.isDestroyed = true;
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.cache.clear();
  }
}

export class DatabaseCacheManager {
  private projectCache: GenericCache<any>;
  private storyCache: GenericCache<any>;
  private userCache: GenericCache<any>;
  private storyTypeCache: GenericCache<any>;
  private cacheStatus: {
    status: 'clean' | 'dirty' | 'updating';
    lastUpdate: number;
    serviceWorkerStatus: string;
  };
  private isDestroyed = false;

  constructor() {
    this.projectCache = new GenericCache(10 * 60 * 1000); // 10 minutes
    this.storyCache = new GenericCache(5 * 60 * 1000); // 5 minutes
    this.userCache = new GenericCache(15 * 60 * 1000); // 15 minutes
    this.storyTypeCache = new GenericCache(30 * 60 * 1000); // 30 minutes

    this.cacheStatus = {
      status: 'clean',
      lastUpdate: Date.now(),
      serviceWorkerStatus: 'unknown',
    };

    this.updateServiceWorkerStatus();
  }

  async getProjectsWithCache(
    page: number,
    limit: number,
    fetchFn: () => Promise<any>
  ) {
    if (this.isDestroyed) return fetchFn();

    const cacheKey = `projects:${page}:${limit}`;
    const cached = this.projectCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const data = await fetchFn();
      this.projectCache.set(cacheKey, data);
      return data;
    } catch (error) {
      logger.error('Failed to fetch projects:', error as Error);
      throw error;
    }
  }

  async getStoriesByDayWithCache(day: string, fetchFn: () => Promise<any>) {
    if (this.isDestroyed) return fetchFn();

    const cacheKey = `stories:${day}`;
    const cached = this.storyCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const data = await fetchFn();
      this.storyCache.set(cacheKey, data);
      return data;
    } catch (error) {
      logger.error('Failed to fetch stories:', error as Error);
      throw error;
    }
  }

  async getStoryTypesWithCache(fetchFn: () => Promise<any>) {
    if (this.isDestroyed) return fetchFn();

    const cacheKey = 'storyTypes';
    const cached = this.storyTypeCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const data = await fetchFn();
      this.storyTypeCache.set(cacheKey, data);
      return data;
    } catch (error) {
      logger.error('Failed to fetch story types:', error as Error);
      throw error;
    }
  }

  invalidateProjectCache(): void {
    if (this.isDestroyed) return;
    this.projectCache.clear();
    this.cacheStatus.status = 'dirty';
    this.cacheStatus.lastUpdate = Date.now();
  }

  invalidateStoryCache(): void {
    if (this.isDestroyed) return;
    this.storyCache.clear();
    this.cacheStatus.status = 'dirty';
    this.cacheStatus.lastUpdate = Date.now();
  }

  invalidateUserCache(): void {
    if (this.isDestroyed) return;
    this.userCache.clear();
    this.cacheStatus.status = 'dirty';
    this.cacheStatus.lastUpdate = Date.now();
  }

  invalidateStoryTypeCache(): void {
    if (this.isDestroyed) return;
    this.storyTypeCache.clear();
    this.cacheStatus.status = 'dirty';
    this.cacheStatus.lastUpdate = Date.now();
  }

  getAllCacheStats() {
    return {
      projects: this.projectCache.getStats(),
      stories: this.storyCache.getStats(),
      users: this.userCache.getStats(),
      storyTypes: this.storyTypeCache.getStats(),
      status: this.cacheStatus,
    };
  }

  clearAllCaches(): void {
    if (this.isDestroyed) return;

    this.projectCache.clear();
    this.storyCache.clear();
    this.userCache.clear();
    this.storyTypeCache.clear();

    this.cacheStatus.status = 'clean';
    this.cacheStatus.lastUpdate = Date.now();
  }

  private async updateServiceWorkerStatus(): Promise<void> {
    if (this.isDestroyed) return;

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        this.cacheStatus.serviceWorkerStatus = registration?.active
          ? 'active'
          : 'unregistered';
      } else {
        this.cacheStatus.serviceWorkerStatus = 'unsupported';
      }
    } catch (error) {
      logger.warn('Failed to get service worker status:', error as Error);
      this.cacheStatus.serviceWorkerStatus = 'error';
    }
  }

  destroy(): void {
    if (this.isDestroyed) return;

    this.isDestroyed = true;
    this.projectCache.destroy();
    this.storyCache.destroy();
    this.userCache.destroy();
    this.storyTypeCache.destroy();
  }
}

// Export a singleton instance
export const databaseCacheManager = new DatabaseCacheManager();

// Export the withCache decorator function
export function withCache(cacheKey: string, ttl?: number) {
  return function (
    _target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cache = databaseCacheManager as any;
      const cacheMethod = cache[`${propertyName}Cache`];

      if (cacheMethod && typeof cacheMethod.get === 'function') {
        const key = `${cacheKey}:${JSON.stringify(args)}`;
        const cached = cacheMethod.get(key);
        if (cached) {
          return cached;
        }

        const result = await method.apply(this, args);
        cacheMethod.set(key, result, ttl);
        return result;
      }

      return method.apply(this, args);
    };

    return descriptor;
  };
}
