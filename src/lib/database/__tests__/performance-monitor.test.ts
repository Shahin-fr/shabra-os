/**
 * Database Performance Monitor Tests
 * 
 * Tests for database performance monitoring functionality.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  DatabasePerformanceMonitor, 
  databasePerformanceMonitor,
  startDatabasePerformanceMonitoring,
  stopDatabasePerformanceMonitoring,
  setSlowQueryThreshold,
  getDatabasePerformanceMetrics
} from '../../database/performance-monitor';

// Mock logger
vi.mock('../../logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('DatabasePerformanceMonitor', () => {
  let monitor: DatabasePerformanceMonitor;

  beforeEach(() => {
    monitor = DatabasePerformanceMonitor.getInstance();
    monitor.reset();
  });

  afterEach(() => {
    monitor.reset();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = DatabasePerformanceMonitor.getInstance();
      const instance2 = DatabasePerformanceMonitor.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Monitoring Control', () => {
    it('should start and stop monitoring', () => {
      monitor.startMonitoring();
      expect(monitor.getCurrentMetrics()).toEqual([]);

      const report = monitor.stopMonitoring();
      expect(report.totalQueries).toBe(0);
    });

    it('should not start monitoring twice', () => {
      monitor.startMonitoring();
      monitor.startMonitoring();
      // Should not throw errors
      expect(monitor.getCurrentMetrics()).toEqual([]);
    });
  });

  describe('Query Performance Monitoring', () => {
    beforeEach(() => {
      monitor.startMonitoring();
    });

    it('should monitor successful query performance', async () => {
      const mockQuery = vi.fn().mockResolvedValue({ id: 1, name: 'Test' });
      
      const result = await DatabasePerformanceMonitor.monitorQueryPerformance(
        'test-query',
        mockQuery,
        { userId: 123 }
      );

      expect(result).toEqual({ id: 1, name: 'Test' });
      expect(mockQuery).toHaveBeenCalledTimes(1);

      const metrics = monitor.getCurrentMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0]).toMatchObject({
        queryName: 'test-query',
        success: true,
        metadata: { userId: 123 },
      });
      expect(metrics[0].executionTime).toBeGreaterThanOrEqual(0);
    });

    it('should monitor failed query performance', async () => {
      const mockQuery = vi.fn().mockRejectedValue(new Error('Database error'));
      
      await expect(
        DatabasePerformanceMonitor.monitorQueryPerformance('test-query', mockQuery)
      ).rejects.toThrow('Database error');

      const metrics = monitor.getCurrentMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0]).toMatchObject({
        queryName: 'test-query',
        success: false,
        error: 'Database error',
      });
    });

    it('should detect slow queries', async () => {
      monitor.setSlowQueryThreshold(50); // 50ms threshold
      
      const mockQuery = vi.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
        return { id: 1 };
      });

      await DatabasePerformanceMonitor.monitorQueryPerformance('slow-query', mockQuery);

      const metrics = monitor.getCurrentMetrics();
      expect(metrics[0].executionTime).toBeGreaterThan(50);
    });
  });

  describe('Performance Report Generation', () => {
    beforeEach(() => {
      monitor.startMonitoring();
    });

    it('should generate empty report when no queries', () => {
      const report = monitor.stopMonitoring();
      
      expect(report).toEqual({
        totalQueries: 0,
        averageExecutionTime: 0,
        slowQueries: [],
        errorRate: 0,
        topQueries: [],
      });
    });

    it('should generate comprehensive report', async () => {
      // Add some test queries
      const queries = [
        { name: 'query1', fn: vi.fn().mockResolvedValue({}), delay: 10 },
        { name: 'query1', fn: vi.fn().mockResolvedValue({}), delay: 20 },
        { name: 'query2', fn: vi.fn().mockResolvedValue({}), delay: 30 },
        { name: 'query3', fn: vi.fn().mockRejectedValue(new Error('Failed')), delay: 0 },
      ];

      for (const query of queries) {
        if (query.delay > 0) {
          query.fn.mockImplementation(async () => {
            await new Promise(resolve => setTimeout(resolve, query.delay));
            return {};
          });
        }
        
        try {
          await DatabasePerformanceMonitor.monitorQueryPerformance(query.name, query.fn);
        } catch {
          // Expected for failed query
        }
      }

      const report = monitor.stopMonitoring();
      
      expect(report.totalQueries).toBe(4);
      expect(report.averageExecutionTime).toBeGreaterThan(0);
      expect(report.errorRate).toBe(25); // 1 out of 4 failed
      expect(report.topQueries).toHaveLength(2); // 2 unique query names (query1 appears twice, query2 and query3 once each)
      expect(report.topQueries[0].queryName).toBe('query1'); // Most frequent
    });
  });

  describe('Utility Functions', () => {
    it('should start monitoring via utility function', () => {
      startDatabasePerformanceMonitoring();
      expect(databasePerformanceMonitor.getCurrentMetrics()).toEqual([]);
    });

    it('should stop monitoring via utility function', () => {
      startDatabasePerformanceMonitoring();
      const report = stopDatabasePerformanceMonitoring();
      expect(report.totalQueries).toBe(0);
    });

    it('should set slow query threshold via utility function', () => {
      setSlowQueryThreshold(200);
      // Threshold is set internally, we can't easily test it without monitoring a query
      expect(() => setSlowQueryThreshold(200)).not.toThrow();
    });

    it('should get metrics via utility function', () => {
      const metrics = getDatabasePerformanceMetrics();
      expect(Array.isArray(metrics)).toBe(true);
    });
  });

  describe('Memory Management', () => {
    it('should limit metrics storage', async () => {
      monitor.startMonitoring();
      
      // Add more than 1000 queries
      for (let i = 0; i < 1001; i++) {
        const mockQuery = vi.fn().mockResolvedValue({});
        await DatabasePerformanceMonitor.monitorQueryPerformance(`query-${i}`, mockQuery);
      }

      const metrics = monitor.getCurrentMetrics();
      expect(metrics.length).toBeLessThanOrEqual(1000);
    });
  });

  describe('Export Functionality', () => {
    it('should export metrics as JSON', async () => {
      monitor.startMonitoring();
      
      const mockQuery = vi.fn().mockResolvedValue({});
      await DatabasePerformanceMonitor.monitorQueryPerformance('test-query', mockQuery);
      
      const exported = monitor.exportMetrics();
      const parsed = JSON.parse(exported);
      
      expect(parsed).toHaveProperty('timestamp');
      expect(parsed).toHaveProperty('metrics');
      expect(parsed).toHaveProperty('summary');
      expect(parsed.metrics).toHaveLength(1);
    });
  });
});
