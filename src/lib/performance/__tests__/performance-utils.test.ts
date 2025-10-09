/**
 * Performance Utils Tests
 * 
 * Tests for performance utility functions and monitoring.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { debounce, throttle, markPerformance, measurePerformance } from '../../performance-utils';

// Mock performance object
Object.defineProperty(global, 'performance', {
  writable: true,
  value: {
    mark: vi.fn(),
    measure: vi.fn(),
    memory: {
      usedJSHeapSize: 50 * 1024 * 1024,
    },
  },
});

describe('Performance Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('debounce', () => {
    it('should debounce function calls', async () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      // Function should not be called immediately
      expect(mockFn).not.toHaveBeenCalled();

      // Wait for debounce delay
      await new Promise(resolve => setTimeout(resolve, 150));

      // Function should be called only once
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should handle debounce with different delays', async () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 50);

      debouncedFn();
      await new Promise(resolve => setTimeout(resolve, 60));

      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('throttle', () => {
    it('should throttle function calls', async () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn();
      throttledFn();
      throttledFn();

      // First call should be immediate
      expect(mockFn).toHaveBeenCalledTimes(1);

      // Wait for throttle period
      await new Promise(resolve => setTimeout(resolve, 150));

      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should handle throttle with different limits', async () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 50);

      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(1);

      await new Promise(resolve => setTimeout(resolve, 60));
      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('markPerformance', () => {
    it('should mark performance when window is available', () => {
      markPerformance('test-mark');
      expect(global.performance.mark).toHaveBeenCalledWith('test-mark');
    });

    it('should handle missing window gracefully', () => {
      const originalWindow = global.window;
      delete (global as any).window;

      expect(() => markPerformance('test-mark')).not.toThrow();

      global.window = originalWindow;
    });
  });

  describe('measurePerformance', () => {
    it('should measure performance when window is available', () => {
      measurePerformance('test-measure', 'start-mark', 'end-mark');
      expect(global.performance.measure).toHaveBeenCalledWith('test-measure', 'start-mark', 'end-mark');
    });

    it('should handle missing window gracefully', () => {
      const originalWindow = global.window;
      delete (global as any).window;

      expect(() => measurePerformance('test-measure', 'start-mark', 'end-mark')).not.toThrow();

      global.window = originalWindow;
    });

    it('should handle performance.measure errors gracefully', () => {
      global.performance.measure = vi.fn().mockImplementation(() => {
        throw new Error('Mark not found');
      });

      expect(() => measurePerformance('test-measure', 'start-mark', 'end-mark')).not.toThrow();
    });
  });
});
