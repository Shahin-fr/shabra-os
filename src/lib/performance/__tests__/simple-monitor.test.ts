/**
 * Simple Performance Monitor Tests
 * 
 * Basic tests for the simplified performance monitoring system.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { simplePerformanceMonitor } from '../simple-monitor';

// Mock performance object
Object.defineProperty(global, 'performance', {
  writable: true,
  value: {
    memory: {
      usedJSHeapSize: 50 * 1024 * 1024,
    },
    getEntriesByType: vi.fn(() => []),
  },
});

// Mock PerformanceObserver
const mockPerformanceObserver = vi.fn();
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

Object.defineProperty(global, 'PerformanceObserver', {
  writable: true,
  value: mockPerformanceObserver,
});

describe('SimplePerformanceMonitor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPerformanceObserver.mockImplementation(() => ({
      observe: mockObserve,
      disconnect: mockDisconnect,
    }));
  });

  afterEach(() => {
    simplePerformanceMonitor.stopMonitoring();
  });

  describe('Initialization', () => {
    it('should initialize with default metrics', () => {
      const metrics = simplePerformanceMonitor.getMetrics();
      
      expect(metrics).toMatchObject({
        lcp: null,
        fid: null,
        cls: null,
        fcp: null,
        ttfb: null,
        memoryUsed: 0,
        cacheHitRate: 0,
        timestamp: expect.any(Number),
      });
    });
  });

  describe('Monitoring Control', () => {
    it('should start and stop monitoring', () => {
      simplePerformanceMonitor.startMonitoring();
      expect(mockPerformanceObserver).toHaveBeenCalled();

      simplePerformanceMonitor.stopMonitoring();
      // Should not throw errors
    });

    it('should not start monitoring twice', () => {
      simplePerformanceMonitor.startMonitoring();
      simplePerformanceMonitor.startMonitoring();
      
      // Should only create observers once
      expect(mockPerformanceObserver).toHaveBeenCalledTimes(4); // LCP, FID, CLS, FCP
    });
  });

  describe('Cache Hit Rate', () => {
    it('should update cache hit rate', () => {
      simplePerformanceMonitor.updateCacheHitRate(75.5);
      
      const metrics = simplePerformanceMonitor.getMetrics();
      expect(metrics.cacheHitRate).toBe(75.5);
    });
  });

  describe('Error Handling', () => {
    it('should handle PerformanceObserver errors gracefully', () => {
      mockPerformanceObserver.mockImplementation(() => {
        throw new Error('PerformanceObserver not supported');
      });

      expect(() => {
        simplePerformanceMonitor.startMonitoring();
      }).not.toThrow();
    });

    it('should handle missing performance.memory gracefully', () => {
      Object.defineProperty(global, 'performance', {
        writable: true,
        value: {
          getEntriesByType: vi.fn(),
        },
      });

      // Start monitoring to trigger memory collection
      simplePerformanceMonitor.startMonitoring();
      const metrics = simplePerformanceMonitor.getMetrics();
      expect(metrics.memoryUsed).toBe(0);
    });
  });
});
