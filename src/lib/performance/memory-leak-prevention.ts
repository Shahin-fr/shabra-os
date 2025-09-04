// Memory Leak Prevention Utility
// Implements: [CRITICAL PRIORITY 8: Memory Leak Prevention]
// See: docs/ROADMAP/PHASE_2_STRATEGIC_PLAN.md, Section 3.2

import { logger } from '../logger';

export interface MemoryMetrics {
  used: number;
  total: number;
  external: number;
  heapUsed: number;
  heapTotal: number;
  heapExternal: number;
  rss: number;
  externalMemory: number;
  arrayBuffers: number;
  heapSizeLimit: number;
}

export interface MemoryLeakDetection {
  isLeaking: boolean;
  confidence: number;
  growthRate: number;
  trend: 'stable' | 'growing' | 'declining';
  recommendations: string[];
}

export interface ResourceTracker {
  timers: Set<NodeJS.Timeout>;
  intervals: Set<NodeJS.Timeout>;
  eventListeners: Map<string, Set<EventListener>>;
  promises: Set<Promise<unknown>>;
  observers: Set<MutationObserver | IntersectionObserver | ResizeObserver>;
}

export class MemoryLeakPrevention {
  private static instance: MemoryLeakPrevention;
  private isMonitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private memoryHistory: MemoryMetrics[] = [];
  private resourceTracker: ResourceTracker;
  private maxHistorySize = 100;
  // private baselineMemory: MemoryMetrics | null = null;
  private leakThreshold = 0.1; // 10% growth threshold
  private monitoringFrequency = 30000; // 30 seconds

  private constructor() {
    this.resourceTracker = {
      timers: new Set(),
      intervals: new Set(),
      eventListeners: new Map(),
      promises: new Set(),
      observers: new Set(),
    };

    // Set up global error handlers
    this.setupGlobalErrorHandlers();
  }

  public static getInstance(): MemoryLeakPrevention {
    if (!MemoryLeakPrevention.instance) {
      MemoryLeakPrevention.instance = new MemoryLeakPrevention();
    }
    return MemoryLeakPrevention.instance;
  }

  /**
   * Start monitoring memory usage and resource leaks
   */
  public startMonitoring(): void {
    if (this.isMonitoring) {
      logger.warn('Memory monitoring is already active');
      return;
    }

    logger.info('Starting memory leak monitoring');
    this.isMonitoring = true;

    // Capture baseline memory
    // this.baselineMemory = this.getMemoryMetrics();

    // Start periodic monitoring
    this.monitoringInterval = setInterval(() => {
      this.performMemoryCheck();
    }, this.monitoringFrequency);

    // Initial check
    this.performMemoryCheck();
  }

  /**
   * Stop monitoring memory usage
   */
  public stopMonitoring(): void {
    if (!this.isMonitoring) {
      logger.warn('Memory monitoring is not active');
      return;
    }

    logger.info('Stopping memory leak monitoring');
    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Get current memory metrics
   */
  public getMemoryMetrics(): MemoryMetrics {
    if (typeof performance === 'undefined' || !(performance as any).memory) {
      // Fallback for environments without performance.memory
      return {
        used: 0,
        total: 0,
        external: 0,
        heapUsed: 0,
        heapTotal: 0,
        heapExternal: 0,
        rss: 0,
        externalMemory: 0,
        arrayBuffers: 0,
        heapSizeLimit: 0,
      };
    }

    const memory = (performance as any).memory;

    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      external: memory.totalJSHeapSize - memory.usedJSHeapSize,
      heapUsed: memory.usedJSHeapSize,
      heapTotal: memory.totalJSHeapSize,
      heapExternal: memory.totalJSHeapSize - memory.usedJSHeapSize,
      rss: memory.usedJSHeapSize,
      externalMemory: memory.totalJSHeapSize - memory.usedJSHeapSize,
      arrayBuffers: 0, // Not available in browser
      heapSizeLimit: memory.jsHeapSizeLimit,
    };
  }

  /**
   * Perform memory leak detection
   */
  public detectMemoryLeaks(): MemoryLeakDetection {
    if (this.memoryHistory.length < 3) {
      return {
        isLeaking: false,
        confidence: 0,
        growthRate: 0,
        trend: 'stable',
        recommendations: [
          'Insufficient data for leak detection. Continue monitoring.',
        ],
      };
    }

    const recent = this.memoryHistory.slice(-10);
    const growthRate = this.calculateGrowthRate(recent);
    const trend = this.determineTrend(growthRate);
    const isLeaking = growthRate > this.leakThreshold && trend === 'growing';

    const recommendations: string[] = [];

    if (isLeaking) {
      recommendations.push(
        'Memory usage is growing rapidly. Check for resource leaks.'
      );
      recommendations.push('Review timer and interval usage in components.');
      recommendations.push(
        'Check for event listener cleanup in unmounted components.'
      );
      recommendations.push('Verify proper cleanup of observers and promises.');
    } else if (growthRate > this.leakThreshold * 0.5) {
      recommendations.push(
        'Memory usage is growing moderately. Monitor closely.'
      );
    } else {
      recommendations.push('Memory usage is stable. Continue monitoring.');
    }

    return {
      isLeaking,
      confidence: Math.min(0.95, Math.abs(growthRate) * 10),
      growthRate,
      trend,
      recommendations,
    };
  }

  /**
   * Track a timer for cleanup
   */
  public trackTimer(timer: NodeJS.Timeout): void {
    this.resourceTracker.timers.add(timer);
  }

  /**
   * Track an interval for cleanup
   */
  public trackInterval(interval: NodeJS.Timeout): void {
    this.resourceTracker.intervals.add(interval);
  }

  /**
   * Track an event listener for cleanup
   */
  public trackEventListener(element: string, listener: EventListener): void {
    if (!this.resourceTracker.eventListeners.has(element)) {
      this.resourceTracker.eventListeners.set(element, new Set());
    }
    this.resourceTracker.eventListeners.get(element)!.add(listener);
  }

  /**
   * Track a promise for cleanup
   */
  public trackPromise(promise: Promise<unknown>): void {
    this.resourceTracker.promises.add(promise);
  }

  /**
   * Track an observer for cleanup
   */
  public trackObserver(
    observer: MutationObserver | IntersectionObserver | ResizeObserver
  ): void {
    this.resourceTracker.observers.add(observer);
  }

  /**
   * Clean up tracked resources
   */
  public cleanupResources(): void {
    logger.info('Cleaning up tracked resources');

    // Clear timers
    this.resourceTracker.timers.forEach(timer => {
      try {
        clearTimeout(timer);
      } catch (error) {
        logger.warn('Error clearing timer', error as Error);
      }
    });
    this.resourceTracker.timers.clear();

    // Clear intervals
    this.resourceTracker.intervals.forEach(interval => {
      try {
        clearInterval(interval);
      } catch (error) {
        logger.warn('Error clearing interval', error as Error);
      }
    });
    this.resourceTracker.intervals.clear();

    // Disconnect observers
    this.resourceTracker.observers.forEach(observer => {
      try {
        if ('disconnect' in observer) {
          observer.disconnect();
        }
      } catch (error) {
        logger.warn('Error disconnecting observer', error as Error);
      }
    });
    this.resourceTracker.observers.clear();

    // Clear promises (they can't be cancelled, but we can stop tracking)
    this.resourceTracker.promises.clear();

    // Clear event listeners (they need to be removed manually)
    this.resourceTracker.eventListeners.clear();

    logger.info('Resource cleanup completed');
  }

  /**
   * Force garbage collection (development only)
   */
  public forceGarbageCollection(): void {
    if (typeof window !== 'undefined' && (window as any).gc) {
      try {
        (window as any).gc();
        logger.info('Garbage collection triggered');
      } catch (error) {
        logger.warn('Failed to trigger garbage collection', error as Error);
      }
    } else {
      logger.warn('Garbage collection not available in this environment');
    }
  }

  /**
   * Get resource usage statistics
   */
  public getResourceStats(): {
    timers: number;
    intervals: number;
    eventListeners: number;
    promises: number;
    observers: number;
  } {
    let totalEventListeners = 0;
    this.resourceTracker.eventListeners.forEach(listeners => {
      totalEventListeners += listeners.size;
    });

    return {
      timers: this.resourceTracker.timers.size,
      intervals: this.resourceTracker.intervals.size,
      eventListeners: totalEventListeners,
      promises: this.resourceTracker.promises.size,
      observers: this.resourceTracker.observers.size,
    };
  }

  /**
   * Perform memory check and update history
   */
  private performMemoryCheck(): void {
    try {
      const metrics = this.getMemoryMetrics();
      this.memoryHistory.push(metrics);

      // Limit history size
      if (this.memoryHistory.length > this.maxHistorySize) {
        this.memoryHistory.shift();
      }

      // Check for potential leaks
      const leakDetection = this.detectMemoryLeaks();

      if (leakDetection.isLeaking) {
        logger.warn('Potential memory leak detected', {
          growthRate: leakDetection.growthRate,
          confidence: leakDetection.confidence,
          recommendations: leakDetection.recommendations,
        });

        // Auto-cleanup if confidence is high
        if (leakDetection.confidence > 0.8) {
          logger.info(
            'Auto-triggering resource cleanup due to high leak confidence'
          );
          this.cleanupResources();
        }
      }

      // Log memory usage periodically
      if (this.memoryHistory.length % 10 === 0) {
        logger.debug('Memory usage snapshot', {
          current: metrics.heapUsed,
          total: metrics.heapTotal,
          trend: leakDetection.trend,
        });
      }
    } catch (error) {
      logger.error('Error during memory check', error as Error);
    }
  }

  /**
   * Calculate memory growth rate
   */
  private calculateGrowthRate(history: MemoryMetrics[]): number {
    if (history.length < 2) return 0;

    const first = history[0]!.heapUsed;
    const last = history[history.length - 1]!.heapUsed;
    const timeSpan = history.length * (this.monitoringFrequency / 1000); // seconds

    return (last - first) / first / timeSpan;
  }

  /**
   * Determine memory trend
   */
  private determineTrend(
    growthRate: number
  ): 'stable' | 'growing' | 'declining' {
    const threshold = this.leakThreshold * 0.1; // 1% threshold for trend

    if (Math.abs(growthRate) < threshold) return 'stable';
    if (growthRate > threshold) return 'growing';
    return 'declining';
  }

  /**
   * Set up global error handlers for memory-related issues
   */
  private setupGlobalErrorHandlers(): void {
    if (typeof window !== 'undefined') {
      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', event => {
        logger.error('Unhandled promise rejection', {
          reason: event.reason,
          promise: event.promise,
        } as any);
      });

      // Handle memory-related error
      window.addEventListener('error', event => {
        if (
          event.message.includes('memory') ||
          event.message.includes('allocation')
        ) {
          logger.error('Memory-related error detected', {
            message: event.message,
            filename: (event as any).filename,
            lineno: event.lineno,
            colno: event.colno,
          } as any);
        }
      });
    }
  }

  /**
   * Get memory leak prevention recommendations
   */
  public getRecommendations(): string[] {
    return [
      'Always clear timers and intervals in component cleanup',
      'Remove event listeners when components unmount',
      'Disconnect observers before destroying components',
      'Avoid creating closures that capture large objects',
      'Use WeakMap/WeakSet for object references when possible',
      'Implement proper cleanup in useEffect cleanup functions',
      'Monitor memory usage in development tools',
      'Use React DevTools Profiler to identify memory leaks',
      'Consider using React.memo for expensive components',
      'Implement proper error boundaries to prevent memory leaks',
    ];
  }

  /**
   * Destroy the memory leak prevention instance
   */
  public destroy(): void {
    logger.info('Destroying MemoryLeakPrevention instance');

    this.stopMonitoring();
    this.cleanupResources();

    // Clear history
    this.memoryHistory = [];
    // this.baselineMemory = null;

    // Clear resource tracker
    this.resourceTracker.timers.clear();
    this.resourceTracker.intervals.clear();
    this.resourceTracker.eventListeners.clear();
    this.resourceTracker.promises.clear();
    this.resourceTracker.observers.clear();

    logger.info('MemoryLeakPrevention instance destroyed');
  }
}

// Export singleton instance
export const memoryLeakPrevention = MemoryLeakPrevention.getInstance();

// Export utility functions for easy use
export function trackTimer(timer: NodeJS.Timeout): void {
  memoryLeakPrevention.trackTimer(timer);
}

export function trackInterval(interval: NodeJS.Timeout): void {
  memoryLeakPrevention.trackInterval(interval);
}

export function trackEventListener(
  element: string,
  listener: EventListener
): void {
  memoryLeakPrevention.trackEventListener(element, listener);
}

export function trackPromise(promise: Promise<unknown>): void {
  memoryLeakPrevention.trackPromise(promise);
}

export function trackObserver(
  observer: MutationObserver | IntersectionObserver | ResizeObserver
): void {
  memoryLeakPrevention.trackObserver(observer);
}

export function startMemoryMonitoring(): void {
  memoryLeakPrevention.startMonitoring();
}

export function stopMemoryMonitoring(): void {
  memoryLeakPrevention.stopMonitoring();
}

export function detectMemoryLeaks(): MemoryLeakDetection {
  return memoryLeakPrevention.detectMemoryLeaks();
}

export function cleanupResources(): void {
  memoryLeakPrevention.cleanupResources();
}
