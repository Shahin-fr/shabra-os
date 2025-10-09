import { test, expect } from '@playwright/test';
import {
  loginUser,
  testPerformanceMetrics,
  testSlowNetwork,
  testLargeDataset,
  navigateToProjects,
  navigateToStoryboard,
  measurePageLoadPerformance,
  measureApiResponsePerformance,
  measureFormSubmissionPerformance,
  measureMemoryUsage,
  measureBundleSize,
  TEST_CONFIG,
} from './test-utils';

test.describe('E2E Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
  });

  test('should load pages within performance thresholds', async ({ page }) => {
    // Test dashboard load time
    const dashboardLoadTime = await testPerformanceMetrics(page, async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });
    
    expect(dashboardLoadTime).toBeLessThan(TEST_CONFIG.performance.pageLoadMax);
  });

  test('should handle projects page load efficiently', async ({ page }) => {
    const projectsLoadTime = await testPerformanceMetrics(page, async () => {
      await navigateToProjects(page);
    });
    
    expect(projectsLoadTime).toBeLessThan(TEST_CONFIG.performance.pageLoadMax);
  });

  test('should handle storyboard page load efficiently', async ({ page }) => {
    const storyboardLoadTime = await testPerformanceMetrics(page, async () => {
      await navigateToStoryboard(page);
    });
    
    expect(storyboardLoadTime).toBeLessThan(TEST_CONFIG.performance.pageLoadMax);
  });

  test('should handle form submissions efficiently', async ({ page }) => {
    await navigateToProjects(page);
    
    const createButton = page.locator('button:has-text("ایجاد پروژه"), [data-testid="create-project"]');
    if (await createButton.isVisible()) {
      const formOpenTime = await testPerformanceMetrics(page, async () => {
        await createButton.click();
        await page.waitForSelector('form, [role="dialog"]');
      });
      
      expect(formOpenTime).toBeLessThan(TEST_CONFIG.performance.actionMax);
    }
  });

  test('should handle slow network gracefully', async ({ page }) => {
    await testSlowNetwork(page, TEST_CONFIG.performance.networkSlow);
    
    const slowNetworkTime = await testPerformanceMetrics(page, async () => {
      await navigateToProjects(page);
    });
    
    // Should still complete within reasonable time even with slow network
    expect(slowNetworkTime).toBeLessThan(TEST_CONFIG.performance.pageLoadMax * 2);
  });

  test('should handle large datasets efficiently', async ({ page }) => {
    await testLargeDataset(page, 500);
    
    const largeDataTime = await testPerformanceMetrics(page, async () => {
      await navigateToProjects(page);
      await page.waitForSelector('[data-testid="projects-list"], .projects-list');
    });
    
    expect(largeDataTime).toBeLessThan(TEST_CONFIG.performance.actionMax);
  });

  test('should handle page navigation efficiently', async ({ page }) => {
    const navigationTime = await testPerformanceMetrics(page, async () => {
      await navigateToProjects(page);
      await navigateToStoryboard(page);
      await page.goto('/');
    });
    
    expect(navigationTime).toBeLessThan(TEST_CONFIG.performance.pageLoadMax * 3);
  });

  test('should handle concurrent operations efficiently', async ({ page }) => {
    const concurrentTime = await testPerformanceMetrics(page, async () => {
      // Simulate concurrent operations
      const promises = [
        navigateToProjects(page),
        navigateToStoryboard(page),
        page.goto('/'),
      ];
      
      await Promise.all(promises);
    });
    
    expect(concurrentTime).toBeLessThan(TEST_CONFIG.performance.pageLoadMax * 2);
  });

  test('should handle memory usage efficiently', async ({ page }) => {
    // Test memory usage by performing multiple operations
    for (let i = 0; i < 5; i++) {
      await navigateToProjects(page);
      await navigateToStoryboard(page);
      await page.goto('/');
    }
    
    // Check that page still functions after multiple operations
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle resource loading efficiently', async ({ page }) => {
    const resourceLoadTime = await testPerformanceMetrics(page, async () => {
      await page.goto('/');
      
      // Wait for all resources to load
      await page.waitForLoadState('networkidle');
      
      // Check for any failed resources
      const failedResources = await page.evaluate(() => {
        return performance.getEntriesByType('resource')
          .filter((entry: any) => entry.transferSize === 0 && entry.decodedBodySize === 0)
          .length;
      });
      
      expect(failedResources).toBe(0);
    });
    
    expect(resourceLoadTime).toBeLessThan(TEST_CONFIG.performance.pageLoadMax);
  });

  // Enhanced performance tests
  test('should load critical pages within strict thresholds', async ({ page }) => {
    const criticalPages = [
      { url: '/', name: 'Dashboard' },
      { url: '/projects', name: 'Projects' },
      { url: '/storyboard', name: 'Storyboard' },
    ];

    for (const pageInfo of criticalPages) {
      const loadTime = await measurePageLoadPerformance(
        page, 
        pageInfo.url, 
        TEST_CONFIG.performance.criticalPageLoadMax
      );
      
      console.log(`${pageInfo.name} loaded in ${loadTime}ms`);
      expect(loadTime).toBeLessThan(TEST_CONFIG.performance.criticalPageLoadMax);
    }
  });

  test('should handle API responses efficiently', async ({ page }) => {
    const mockApiResponses = {
      '/api/projects': { projects: Array.from({ length: 50 }, (_, i) => ({ id: i, name: `Project ${i}` })) },
      '/api/stories': { stories: Array.from({ length: 100 }, (_, i) => ({ id: i, title: `Story ${i}` })) },
      '/api/users': { users: Array.from({ length: 25 }, (_, i) => ({ id: i, name: `User ${i}` })) },
    };

    for (const [apiPattern, mockResponse] of Object.entries(mockApiResponses)) {
      const responseTime = await measureApiResponsePerformance(page, apiPattern, mockResponse);
      expect(responseTime).toBeLessThan(TEST_CONFIG.performance.apiResponseMax);
    }
  });

  test('should handle form submissions efficiently', async ({ page }) => {
    await navigateToProjects(page);
    
    const createButton = page.locator('button:has-text("ایجاد پروژه"), [data-testid="create-project"]');
    if (await createButton.isVisible()) {
      await createButton.click();
      
      const formData = {
        name: 'Performance Test Project',
        description: 'This is a test project for performance testing',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };
      
      const submissionTime = await measureFormSubmissionPerformance(
        page, 
        'form, [role="dialog"]', 
        formData
      );
      
      expect(submissionTime).toBeLessThan(TEST_CONFIG.performance.formSubmissionMax);
    }
  });

  test('should maintain acceptable memory usage', async ({ page }) => {
    // Perform multiple operations to test memory usage
    for (let i = 0; i < 5; i++) {
      await navigateToProjects(page);
      await navigateToStoryboard(page);
      await page.goto('/');
    }
    
    const memoryUsage = await measureMemoryUsage(page);
    expect(memoryUsage).toBeTruthy();
    
    if (memoryUsage) {
      const usedMB = memoryUsage.used / (1024 * 1024);
      expect(usedMB).toBeLessThan(TEST_CONFIG.performance.memoryUsageMax);
    }
  });

  test('should have acceptable bundle size', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const bundleSize = await measureBundleSize(page);
    expect(bundleSize).toBeLessThan(TEST_CONFIG.performance.bundleSizeMax);
  });

  test('should handle navigation efficiently', async ({ page }) => {
    const navigationTime = await testPerformanceMetrics(page, async () => {
      await navigateToProjects(page);
      await navigateToStoryboard(page);
      await page.goto('/');
    });
    
    expect(navigationTime).toBeLessThan(TEST_CONFIG.performance.navigationMax);
  });

  test('should handle concurrent user actions efficiently', async ({ page }) => {
    const concurrentTime = await testPerformanceMetrics(page, async () => {
      // Simulate concurrent actions
      const actions = [
        navigateToProjects(page),
        navigateToStoryboard(page),
        page.goto('/'),
      ];
      
      await Promise.all(actions);
    });
    
    expect(concurrentTime).toBeLessThan(TEST_CONFIG.performance.pageLoadMax * 2);
  });

  test('should handle large datasets without performance degradation', async ({ page }) => {
    await testLargeDataset(page, 1000);
    
    const largeDataTime = await testPerformanceMetrics(page, async () => {
      await navigateToProjects(page);
      await page.waitForSelector('[data-testid="projects-list"], .projects-list');
    });
    
    expect(largeDataTime).toBeLessThan(TEST_CONFIG.performance.actionMax * 2);
  });

  test('should handle slow network conditions gracefully', async ({ page }) => {
    await testSlowNetwork(page, TEST_CONFIG.performance.networkSlow);
    
    const slowNetworkTime = await testPerformanceMetrics(page, async () => {
      await navigateToProjects(page);
    });
    
    // Should still complete within reasonable time even with slow network
    expect(slowNetworkTime).toBeLessThan(TEST_CONFIG.performance.pageLoadMax * 3);
  });
});
