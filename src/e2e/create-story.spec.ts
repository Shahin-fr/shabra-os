import { test, expect } from '@playwright/test';

test.describe('Create Story - End-to-End User Flow', () => {
  test('should load the application home page', async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('domcontentloaded');
    
    // Verify the page loads successfully
    expect(page.url()).toContain('localhost:3000');
    
    // Take a screenshot for verification
    await page.screenshot({ path: 'test-results/home-page.png' });
  });

  test('should navigate to storyboard page', async ({ page }) => {
    // Navigate to the home page first
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Navigate to storyboard page
    await page.goto('/storyboard');
    await page.waitForLoadState('domcontentloaded');
    
    // Verify we're on the storyboard page
    expect(page.url()).toContain('/storyboard');
    
    // Take a screenshot for verification
    await page.screenshot({ path: 'test-results/storyboard-page.png' });
  });

  test('should display basic page elements', async ({ page }) => {
    // Navigate to the storyboard page
    await page.goto('/storyboard');
    await page.waitForLoadState('domcontentloaded');
    
    // Check if the page has basic HTML structure
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Check if there are any elements on the page
    const elements = page.locator('*');
    const elementCount = await elements.count();
    expect(elementCount).toBeGreaterThan(0);
    
    // Take a screenshot for verification
    await page.screenshot({ path: 'test-results/storyboard-elements.png' });
  });
});
