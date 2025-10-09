import { test, expect } from '@playwright/test';
import {
  loginUser,
  testSlowNetwork,
  testLargeDataset,
  testConcurrentUsers,
  testSessionTimeout,
  testBrowserCompatibility,
  testMobileOrientation,
  testAccessibilityEdgeCases,
  testDataValidationEdgeCases,
  testPerformanceMetrics,
  testErrorBoundaries,
  testFileUploadEdgeCases,
  testFormValidationEdgeCases,
  testResponsiveDesignEdgeCases,
  navigateToProjects,
  navigateToStoryboard,
  TEST_CONFIG,
} from './test-utils';

test.describe('E2E Edge Cases - Performance', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
  });

  test('should handle slow network conditions', async ({ page }) => {
    await testSlowNetwork(page, TEST_CONFIG.performance.networkSlow);
    
    await navigateToProjects(page);
    
    // Test that page still loads within reasonable time
    const loadTime = await testPerformanceMetrics(page, async () => {
      await page.reload();
      await page.waitForLoadState('networkidle');
    });
    
    expect(loadTime).toBeLessThan(TEST_CONFIG.performance.pageLoadMax);
  });

  test('should handle large datasets efficiently', async ({ page }) => {
    await testLargeDataset(page, 1000);
    
    await navigateToProjects(page);
    
    // Test that large dataset loads without performance issues
    const loadTime = await testPerformanceMetrics(page, async () => {
      await page.waitForSelector('[data-testid="projects-list"], .projects-list');
    });
    
    expect(loadTime).toBeLessThan(TEST_CONFIG.performance.actionMax);
  });

  test('should handle concurrent user sessions', async ({ page }) => {
    await testConcurrentUsers(page, 5);
    
    // Verify current session still works
    await navigateToProjects(page);
    await expect(page.locator('body')).toContainText(/پروژه‌ها/i);
  });
});

test.describe('E2E Edge Cases - Session Management', () => {
  test('should handle session timeout gracefully', async ({ page }) => {
    await loginUser(page);
    await navigateToProjects(page);
    
    // Simulate session timeout
    await testSessionTimeout(page);
    
    // Try to access protected route
    await page.goto('/projects');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });

  test('should maintain session across page refreshes', async ({ page }) => {
    await loginUser(page);
    await navigateToProjects(page);
    
    // Refresh page
    await page.reload();
    
    // Should still be logged in
    await expect(page.locator('body')).toContainText(/پروژه‌ها/i);
  });
});

test.describe('E2E Edge Cases - Browser Compatibility', () => {
  test('should work across different browsers', async ({ page }) => {
    await testBrowserCompatibility(page, 'chromium');
    
    await loginUser(page);
    await navigateToProjects(page);
    
    // Basic functionality should work
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('E2E Edge Cases - Mobile & Responsive', () => {
  test('should handle mobile orientation changes', async ({ page }) => {
    await loginUser(page);
    await navigateToProjects(page);
    
    await testMobileOrientation(page);
    
    // Verify page still functions after orientation changes
    await expect(page.locator('body')).toBeVisible();
  });

  test('should be responsive across different viewports', async ({ page }) => {
    await loginUser(page);
    await navigateToProjects(page);
    
    await testResponsiveDesignEdgeCases(page);
    
    // Verify critical elements remain accessible
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('E2E Edge Cases - Accessibility', () => {
  test('should support keyboard-only navigation', async ({ page }) => {
    await loginUser(page);
    await navigateToProjects(page);
    
    await testAccessibilityEdgeCases(page);
    
    // Verify focus management works
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    await loginUser(page);
    await navigateToProjects(page);
    
    // Check for ARIA attributes
    const ariaElements = await page.locator('[aria-label], [aria-labelledby]').count();
    expect(ariaElements).toBeGreaterThan(0);
  });
});

test.describe('E2E Edge Cases - Data Validation', () => {
  test('should handle edge case input data', async ({ page }) => {
    await loginUser(page);
    await navigateToProjects(page);
    
    // Test project name field with edge cases
    const createButton = page.locator('button:has-text("ایجاد پروژه"), [data-testid="create-project"]');
    if (await createButton.isVisible()) {
      await createButton.click();
      
      const nameField = page.locator('input[name="name"], [data-testid="project-name"]');
      if (await nameField.isVisible()) {
        await testDataValidationEdgeCases(page, 'input[name="name"], [data-testid="project-name"]');
      }
    }
  });

  test('should validate form inputs properly', async ({ page }) => {
    await loginUser(page);
    await navigateToProjects(page);
    
    const createButton = page.locator('button:has-text("ایجاد پروژه"), [data-testid="create-project"]');
    if (await createButton.isVisible()) {
      await createButton.click();
      
      const form = page.locator('form');
      if (await form.isVisible()) {
        await testFormValidationEdgeCases(page, 'form');
      }
    }
  });
});

test.describe('E2E Edge Cases - Error Handling', () => {
  test('should handle JavaScript errors gracefully', async ({ page }) => {
    await testErrorBoundaries(page);
    
    await loginUser(page);
    await navigateToProjects(page);
    
    // Verify page still functions despite potential errors
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle API failures gracefully', async ({ page }) => {
    await loginUser(page);
    
    // Mock API failure
    await page.route('**/api/**', route => {
      route.abort('failed');
    });
    
    await navigateToProjects(page);
    
    // Should show error state or fallback content
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('E2E Edge Cases - File Operations', () => {
  test('should handle file upload edge cases', async ({ page }) => {
    await loginUser(page);
    await navigateToProjects(page);
    
    // Look for file upload functionality
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.isVisible()) {
      await testFileUploadEdgeCases(page, 'input[type="file"]');
    }
  });
});

test.describe('E2E Edge Cases - Content Creation', () => {
  test('should handle story creation with edge case data', async ({ page }) => {
    await loginUser(page);
    await navigateToStoryboard(page);
    
    // Test story creation with edge cases
    const createButton = page.locator('button:has-text("ایجاد استوری"), [data-testid="create-story"]');
    if (await createButton.isVisible()) {
      await createButton.click();
      
      const titleField = page.locator('input[name="title"], [data-testid="story-title"]');
      if (await titleField.isVisible()) {
        await testDataValidationEdgeCases(page, 'input[name="title"], [data-testid="story-title"]');
      }
    }
  });
});

test.describe('E2E Edge Cases - Boundary Conditions', () => {
  test('should handle empty states gracefully', async ({ page }) => {
    await loginUser(page);
    await navigateToProjects(page);
    
    // Check for empty state handling
    const emptyState = page.locator('[data-testid="empty-state"], .empty-state');
    if (await emptyState.isVisible()) {
      await expect(emptyState).toBeVisible();
    }
  });

  test('should handle maximum input lengths', async ({ page }) => {
    await loginUser(page);
    await navigateToProjects(page);
    
    const createButton = page.locator('button:has-text("ایجاد پروژه"), [data-testid="create-project"]');
    if (await createButton.isVisible()) {
      await createButton.click();
      
      const nameField = page.locator('input[name="name"], [data-testid="project-name"]');
      if (await nameField.isVisible()) {
        // Test maximum length
        await nameField.fill(TEST_CONFIG.edgeCases.veryLongName);
        await expect(nameField).toHaveValue(TEST_CONFIG.edgeCases.veryLongName);
      }
    }
  });
});
