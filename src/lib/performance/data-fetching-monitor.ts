import { logger } from '../logger';

export interface DataFetchingMetrics {
  queryKey: string;
  fetchCount: number;
  lastFetchTime: Date;
  totalNetworkTime: number;
  averageNetworkTime: number;
  cacheHitRate: number;
  networkRequests: number;
  cacheHits: number;
  userActivityTriggers: number;
  windowFocusTriggers: number;
  manualRefreshTriggers: number;
}

export interface PerformanceComparison {
  before: {
    totalRequests: number;
    averageInterval: number; // 30 seconds for old polling
    estimatedNetworkLoad: number; // MB per hour
  };
  after: {
    totalRequests: number;
    averageInterval: number; // Calculated from actual usage
    estimatedNetworkLoad: number; // MB per hour
  };
  improvement: {
    requestReduction: number; // Percentage
    networkLoadReduction: number; // Percentage
    userExperienceImprovement: string;
  };
}

class DataFetchingMonitor {
  private static instance: DataFetchingMonitor;
  private metrics: Map<string, DataFetchingMetrics> = new Map();
  private startTime: Date = new Date();
  private isMonitoring = false;

  private constructor() {}

  static getInstance(): DataFetchingMonitor {
    if (!DataFetchingMonitor.instance) {
      DataFetchingMonitor.instance = new DataFetchingMonitor();
    }
    return DataFetchingMonitor.instance;
  }

  /**
   * Start monitoring data fetching performance
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.startTime = new Date();

    logger.info('Data fetching performance monitoring started', {
      startTime: this.startTime.toISOString(),
      context: 'DataFetchingMonitor',
    });
  }

  /**
   * Stop monitoring and generate report
   */
  stopMonitoring(): PerformanceComparison {
    this.isMonitoring = false;
    return this.generatePerformanceReport();
  }

  /**
   * Record a data fetch operation
   */
  recordFetch(
    queryKey: string,
    networkTime: number,
    trigger:
      | 'userActivity'
      | 'windowFocus'
      | 'manualRefresh'
      | 'mount'
      | 'reconnect'
  ): void {
    if (!this.isMonitoring) return;

    const existing = this.metrics.get(queryKey);
    const now = new Date();

    if (existing) {
      existing.fetchCount++;
      existing.lastFetchTime = now;
      existing.totalNetworkTime += networkTime;
      existing.averageNetworkTime =
        existing.totalNetworkTime / existing.fetchCount;
      existing.networkRequests++;

      // Track trigger types
      switch (trigger) {
        case 'userActivity':
          existing.userActivityTriggers++;
          break;
        case 'windowFocus':
          existing.windowFocusTriggers++;
          break;
        case 'manualRefresh':
          existing.manualRefreshTriggers++;
          break;
      }
    } else {
      this.metrics.set(queryKey, {
        queryKey,
        fetchCount: 1,
        lastFetchTime: now,
        totalNetworkTime: networkTime,
        averageNetworkTime: networkTime,
        cacheHitRate: 0,
        networkRequests: 1,
        cacheHits: 0,
        userActivityTriggers: trigger === 'userActivity' ? 1 : 0,
        windowFocusTriggers: trigger === 'windowFocus' ? 1 : 0,
        manualRefreshTriggers: trigger === 'manualRefresh' ? 1 : 0,
      });
    }
  }

  /**
   * Record a cache hit
   */
  recordCacheHit(queryKey: string): void {
    if (!this.isMonitoring) return;

    const existing = this.metrics.get(queryKey);
    if (existing) {
      existing.cacheHits++;
      existing.cacheHitRate =
        existing.cacheHits / (existing.cacheHits + existing.networkRequests);
    }
  }

  /**
   * Get current metrics for a specific query
   */
  getMetrics(queryKey: string): DataFetchingMetrics | undefined {
    return this.metrics.get(queryKey);
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): DataFetchingMetrics[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Calculate performance improvements
   */
  private generatePerformanceReport(): PerformanceComparison {
    const totalRequests = Array.from(this.metrics.values()).reduce(
      (sum, metric) => sum + metric.networkRequests,
      0
    );

    const totalTime = Date.now() - this.startTime.getTime();
    const averageInterval = totalTime / totalRequests; // Average time between requests

    // Estimate network load (assuming average response size of 2KB)
    const estimatedNetworkLoad = (totalRequests * 2) / 1024; // MB

    // Old polling system: 30 seconds = 120 requests per hour = 240KB per hour
    const oldRequestsPerHour = 120;
    const oldNetworkLoadPerHour = (oldRequestsPerHour * 2) / 1024; // MB per hour

    // Current system: calculate requests per hour
    const hoursElapsed = totalTime / (1000 * 60 * 60);
    const currentRequestsPerHour = totalRequests / hoursElapsed;
    const currentNetworkLoadPerHour = estimatedNetworkLoad / hoursElapsed;

    const requestReduction =
      ((oldRequestsPerHour - currentRequestsPerHour) / oldRequestsPerHour) *
      100;
    const networkLoadReduction =
      ((oldNetworkLoadPerHour - currentNetworkLoadPerHour) /
        oldNetworkLoadPerHour) *
      100;

    const report: PerformanceComparison = {
      before: {
        totalRequests: oldRequestsPerHour,
        averageInterval: 30000, // 30 seconds
        estimatedNetworkLoad: oldNetworkLoadPerHour,
      },
      after: {
        totalRequests: Math.round(currentRequestsPerHour),
        averageInterval: Math.round(averageInterval),
        estimatedNetworkLoad: Math.round(currentNetworkLoadPerHour * 100) / 100,
      },
      improvement: {
        requestReduction: Math.round(requestReduction * 100) / 100,
        networkLoadReduction: Math.round(networkLoadReduction * 100) / 100,
        userExperienceImprovement:
          this.getUserExperienceImprovement(requestReduction),
      },
    };

    logger.info('Data fetching performance report generated', {
      report,
      context: 'DataFetchingMonitor',
    });

    return report;
  }

  /**
   * Get user experience improvement description
   */
  private getUserExperienceImprovement(requestReduction: number): string {
    if (requestReduction >= 80) {
      return 'Exceptional - Minimal background activity, excellent battery life';
    } else if (requestReduction >= 60) {
      return 'Excellent - Significantly reduced background activity';
    } else if (requestReduction >= 40) {
      return 'Good - Noticeable reduction in background activity';
    } else if (requestReduction >= 20) {
      return 'Moderate - Some reduction in background activity';
    } else {
      return 'Minimal - Limited improvement in background activity';
    }
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics.clear();
    this.startTime = new Date();
    logger.info('Data fetching metrics reset', {
      context: 'DataFetchingMonitor',
    });
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): string {
    const data = {
      startTime: this.startTime.toISOString(),
      metrics: this.getAllMetrics(),
      summary: {
        totalQueries: this.metrics.size,
        totalRequests: Array.from(this.metrics.values()).reduce(
          (sum, metric) => sum + metric.networkRequests,
          0
        ),
        totalCacheHits: Array.from(this.metrics.values()).reduce(
          (sum, metric) => sum + metric.cacheHits,
          0
        ),
      },
    };

    return JSON.stringify(data, null, 2);
  }
}

// Export singleton instance
export const dataFetchingMonitor = DataFetchingMonitor.getInstance();

// Export utility functions for easy use
export function startDataFetchingMonitoring(): void {
  dataFetchingMonitor.startMonitoring();
}

export function stopDataFetchingMonitoring(): PerformanceComparison {
  return dataFetchingMonitor.stopMonitoring();
}

export function recordDataFetch(
  queryKey: string,
  networkTime: number,
  trigger:
    | 'userActivity'
    | 'windowFocus'
    | 'manualRefresh'
    | 'mount'
    | 'reconnect'
): void {
  dataFetchingMonitor.recordFetch(queryKey, networkTime, trigger);
}

export function recordDataCacheHit(queryKey: string): void {
  dataFetchingMonitor.recordCacheHit(queryKey);
}
