import { logger } from '../logger';

export interface QueryPerformanceMetrics {
  queryName: string;
  executionTime: number;
  timestamp: Date;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export interface PerformanceReport {
  totalQueries: number;
  averageExecutionTime: number;
  slowQueries: QueryPerformanceMetrics[];
  errorRate: number;
  topQueries: Array<{
    queryName: string;
    count: number;
    averageTime: number;
  }>;
}

class DatabasePerformanceMonitor {
  private static instance: DatabasePerformanceMonitor;
  private metrics: QueryPerformanceMetrics[] = [];
  private isMonitoring = false;
  private slowQueryThreshold = 1000; // 1 second

  private constructor() {}

  static getInstance(): DatabasePerformanceMonitor {
    if (!DatabasePerformanceMonitor.instance) {
      DatabasePerformanceMonitor.instance = new DatabasePerformanceMonitor();
    }
    return DatabasePerformanceMonitor.instance;
  }

  /**
   * Start performance monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    logger.info('Database performance monitoring started', {
      context: 'DatabasePerformanceMonitor',
    });
  }

  /**
   * Stop monitoring and generate report
   */
  stopMonitoring(): PerformanceReport {
    this.isMonitoring = false;
    return this.generatePerformanceReport();
  }

  /**
   * Monitor query performance with automatic timing
   */
  static async monitorQueryPerformance<T>(
    queryName: string,
    queryFn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const monitor = DatabasePerformanceMonitor.getInstance();
    const startTime = Date.now();

    try {
      const result = await queryFn();
      const executionTime = Date.now() - startTime;

      monitor.recordQuery({
        queryName,
        executionTime,
        timestamp: new Date(),
        success: true,
        metadata,
      });

      // Log slow queries
      if (executionTime > monitor.slowQueryThreshold) {
        logger.warn('Slow database query detected', {
          queryName,
          executionTime,
          threshold: monitor.slowQueryThreshold,
          context: 'DatabasePerformanceMonitor',
        });
      }

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;

      monitor.recordQuery({
        queryName,
        executionTime,
        timestamp: new Date(),
        success: false,
        error: error instanceof Error ? error.message : String(error),
        metadata,
      });

      logger.error('Database query failed', {
        queryName,
        executionTime,
        error: error instanceof Error ? error.message : String(error),
        context: 'DatabasePerformanceMonitor',
      } as any);

      throw error;
    }
  }

  /**
   * Record a query performance metric
   */
  private recordQuery(metric: QueryPerformanceMetrics): void {
    if (!this.isMonitoring) return;

    this.metrics.push(metric);

    // Keep only last 1000 metrics to prevent memory issues
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  /**
   * Generate performance report
   */
  private generatePerformanceReport(): PerformanceReport {
    if (this.metrics.length === 0) {
      return {
        totalQueries: 0,
        averageExecutionTime: 0,
        slowQueries: [],
        errorRate: 0,
        topQueries: [],
      };
    }

    const totalQueries = this.metrics.length;
    const successfulQueries = this.metrics.filter(m => m.success);
    const failedQueries = this.metrics.filter(m => !m.success);

    const averageExecutionTime =
      successfulQueries.reduce((sum, m) => sum + m.executionTime, 0) /
      successfulQueries.length;

    const slowQueries = this.metrics.filter(
      m => m.executionTime > this.slowQueryThreshold
    );

    const errorRate = (failedQueries.length / totalQueries) * 100;

    // Group queries by name and calculate statistics
    const queryStats = new Map<string, { count: number; totalTime: number }>();

    successfulQueries.forEach(metric => {
      const existing = queryStats.get(metric.queryName);
      if (existing) {
        existing.count++;
        existing.totalTime += metric.executionTime;
      } else {
        queryStats.set(metric.queryName, {
          count: 1,
          totalTime: metric.executionTime,
        });
      }
    });

    const topQueries = Array.from(queryStats.entries())
      .map(([queryName, stats]) => ({
        queryName,
        count: stats.count,
        averageTime: stats.totalTime / stats.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalQueries,
      averageExecutionTime: Math.round(averageExecutionTime),
      slowQueries,
      errorRate: Math.round(errorRate * 100) / 100,
      topQueries,
    };
  }

  /**
   * Get current metrics
   */
  getCurrentMetrics(): QueryPerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Set slow query threshold
   */
  setSlowQueryThreshold(threshold: number): void {
    this.slowQueryThreshold = threshold;
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics = [];
    logger.info('Database performance metrics reset', {
      context: 'DatabasePerformanceMonitor',
    });
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): string {
    const data = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      summary: {
        totalQueries: this.metrics.length,
        slowQueries: this.metrics.filter(
          m => m.executionTime > this.slowQueryThreshold
        ).length,
        errorRate:
          (this.metrics.filter(m => !m.success).length / this.metrics.length) *
          100,
      },
    };

    return JSON.stringify(data, null, 2);
  }
}

// Export the class for static method access
export { DatabasePerformanceMonitor };

// Export singleton instance
export const databasePerformanceMonitor =
  DatabasePerformanceMonitor.getInstance();

// Export utility functions for easy use
export function startDatabasePerformanceMonitoring(): void {
  databasePerformanceMonitor.startMonitoring();
}

export function stopDatabasePerformanceMonitoring(): PerformanceReport {
  return databasePerformanceMonitor.stopMonitoring();
}

export function setSlowQueryThreshold(threshold: number): void {
  databasePerformanceMonitor.setSlowQueryThreshold(threshold);
}

export function getDatabasePerformanceMetrics(): QueryPerformanceMetrics[] {
  return databasePerformanceMonitor.getCurrentMetrics();
}
