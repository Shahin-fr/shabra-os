/**
 * Simple Performance Monitor
 * 
 * Basic performance monitoring for Core Web Vitals and cache metrics.
 * Focuses on essential metrics only.
 */

export interface SimpleMetrics {
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  fcp: number | null;
  ttfb: number | null;
  memoryUsed: number;
  cacheHitRate: number;
  timestamp: number;
}

class SimplePerformanceMonitor {
  private static instance: SimplePerformanceMonitor;
  private metrics: SimpleMetrics;
  private isMonitoring = false;

  private constructor() {
    this.metrics = {
      lcp: null,
      fid: null,
      cls: null,
      fcp: null,
      ttfb: null,
      memoryUsed: 0,
      cacheHitRate: 0,
      timestamp: Date.now(),
    };
  }

  static getInstance(): SimplePerformanceMonitor {
    if (!SimplePerformanceMonitor.instance) {
      SimplePerformanceMonitor.instance = new SimplePerformanceMonitor();
    }
    return SimplePerformanceMonitor.instance;
  }

  startMonitoring(): void {
    if (this.isMonitoring) return;
    this.isMonitoring = true;
    this.collectMetrics();
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
  }

  getMetrics(): SimpleMetrics {
    return { ...this.metrics };
  }

  private collectMetrics(): void {
    if (typeof window === 'undefined') return;

    // Collect Web Vitals
    this.collectWebVitals();
    
    // Collect memory usage
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      this.metrics.memoryUsed = (performance as any).memory.usedJSHeapSize;
    }

    // Update timestamp
    this.metrics.timestamp = Date.now();
  }

  private collectWebVitals(): void {
    // Simple LCP collection
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEventTiming;
          this.metrics.lcp = lastEntry.startTime;
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (error) {
        console.warn('LCP monitoring not supported');
      }

      // Simple FID collection
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            const fidEntry = entry as PerformanceEventTiming;
            this.metrics.fid = fidEntry.processingStart - fidEntry.startTime;
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (error) {
        console.warn('FID monitoring not supported');
      }

      // Simple CLS collection
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
              this.metrics.cls = clsValue;
            }
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.warn('CLS monitoring not supported');
      }

      // Simple FCP collection
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
          if (fcpEntry) {
            this.metrics.fcp = fcpEntry.startTime;
          }
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
      } catch (error) {
        console.warn('FCP monitoring not supported');
      }
    }

    // Simple TTFB collection
    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.metrics.ttfb = navigation.responseStart - navigation.requestStart;
      }
    } catch (error) {
      console.warn('TTFB monitoring failed');
    }
  }

  updateCacheHitRate(hitRate: number): void {
    this.metrics.cacheHitRate = hitRate;
  }
}

export const simplePerformanceMonitor = SimplePerformanceMonitor.getInstance();
