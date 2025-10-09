/**
 * Performance Test Configuration
 * 
 * Centralized configuration for performance testing across the application.
 */

export const PERFORMANCE_CONFIG = {
  // Test timeouts
  timeouts: {
    unit: 10000,      // 10 seconds for unit tests
    e2e: 60000,       // 60 seconds for E2E tests
    api: 5000,        // 5 seconds for API tests
    integration: 30000, // 30 seconds for integration tests
  },

  // Performance thresholds (in milliseconds)
  thresholds: {
    pageLoad: {
      critical: 3000,    // 3 seconds for critical pages
      standard: 5000,    // 5 seconds for standard pages
      slow: 10000,       // 10 seconds for slow pages
    },
    apiResponse: {
      fast: 500,         // 500ms for fast APIs
      standard: 1000,    // 1 second for standard APIs
      slow: 2000,        // 2 seconds for slow APIs
    },
    formSubmission: {
      simple: 1000,      // 1 second for simple forms
      complex: 2000,     // 2 seconds for complex forms
      fileUpload: 5000,  // 5 seconds for file uploads
    },
    navigation: {
      instant: 500,      // 500ms for instant navigation
      standard: 2000,    // 2 seconds for standard navigation
      slow: 5000,        // 5 seconds for slow navigation
    },
  },

  // Memory usage thresholds (in MB)
  memory: {
    maxUsage: 100,      // 100MB max memory usage
    warningUsage: 75,    // 75MB warning threshold
    criticalUsage: 150, // 150MB critical threshold
  },

  // Bundle size thresholds (in bytes)
  bundleSize: {
    maxSize: 2 * 1024 * 1024,        // 2MB max bundle size
    warningSize: 1.5 * 1024 * 1024,    // 1.5MB warning threshold
    criticalSize: 3 * 1024 * 1024,     // 3MB critical threshold
  },

  // Test data sizes
  testData: {
    small: 10,          // 10 items for small datasets
    medium: 100,        // 100 items for medium datasets
    large: 1000,        // 1000 items for large datasets
    xlarge: 10000,      // 10000 items for extra large datasets
  },

  // Network simulation
  network: {
    fast: 0,            // No delay for fast network
    slow: 1000,         // 1 second delay for slow network
    verySlow: 3000,     // 3 seconds delay for very slow network
    offline: -1,        // Simulate offline (will fail)
  },

  // Test scenarios
  scenarios: {
    singleUser: 1,      // Single user scenario
    concurrent: 5,      // 5 concurrent users
    stress: 20,         // 20 users for stress testing
    load: 100,          // 100 users for load testing
  },

  // Performance monitoring
  monitoring: {
    enabled: true,
    sampleRate: 1.0,    // 100% sampling rate for tests
    retention: 24 * 60 * 60 * 1000, // 24 hours retention
  },

  // Test environments
  environments: {
    local: {
      baseUrl: 'http://localhost:3000',
      timeout: 30000,
    },
    staging: {
      baseUrl: process.env.STAGING_URL || 'https://staging.shabra.com',
      timeout: 60000,
    },
    production: {
      baseUrl: process.env.PRODUCTION_URL || 'https://shabra.com',
      timeout: 120000,
    },
  },
};

// Helper functions for performance testing
export const PerformanceHelpers = {
  /**
   * Get threshold for a specific performance metric
   */
  getThreshold(type: keyof typeof PERFORMANCE_CONFIG.thresholds, level: 'critical' | 'standard' | 'slow' = 'standard'): number {
    const thresholds = PERFORMANCE_CONFIG.thresholds[type];
    if ('critical' in thresholds) {
      return thresholds[level as keyof typeof thresholds];
    }
    return thresholds.standard;
  },

  /**
   * Check if a performance metric meets the threshold
   */
  meetsThreshold(value: number, type: keyof typeof PERFORMANCE_CONFIG.thresholds, level: 'critical' | 'standard' | 'slow' = 'standard'): boolean {
    const threshold = PerformanceHelpers.getThreshold(type, level);
    return value <= threshold;
  },

  /**
   * Format performance metric for display
   */
  formatMetric(value: number, unit: 'ms' | 'MB' | 'KB' = 'ms'): string {
    if (unit === 'ms') {
      return `${value}ms`;
    } else if (unit === 'MB') {
      return `${(value / (1024 * 1024)).toFixed(2)}MB`;
    } else if (unit === 'KB') {
      return `${(value / 1024).toFixed(2)}KB`;
    }
    return `${value}${unit}`;
  },

  /**
   * Generate test data of specified size
   */
  generateTestData(size: number, prefix: string = 'item'): Array<{ id: number; name: string }> {
    return Array.from({ length: size }, (_, i) => ({
      id: i + 1,
      name: `${prefix} ${i + 1}`,
    }));
  },

  /**
   * Simulate network delay
   */
  async simulateNetworkDelay(delay: number): Promise<void> {
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  },
};

export default PERFORMANCE_CONFIG;
