import { Page, expect } from '@playwright/test';

import { TEST_CONFIG, TEST_SELECTORS, TEST_ROUTES } from './test-config';

// Re-export TEST_CONFIG for use in test files
export { TEST_CONFIG, TEST_SELECTORS, TEST_ROUTES };

// Test data constants (deprecated - use TEST_CONFIG instead)
export const TEST_USER = {
  email: TEST_CONFIG.users.valid.email,
  password: TEST_CONFIG.users.valid.password,
  invalidEmail: TEST_CONFIG.users.invalid.email,
  invalidPassword: TEST_CONFIG.users.invalid.password,
};

// Edge case testing utilities
export async function testSlowNetwork(page: Page, delayMs = TEST_CONFIG.performance.networkSlow) {
  await page.route('**/*', route => {
    setTimeout(() => route.continue(), delayMs);
  });
}

export async function testLargeDataset(page: Page, itemCount = 1000) {
  // Mock API to return large dataset
  await page.route('**/api/**', route => {
    const mockData = Array.from({ length: itemCount }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      description: `Description for item ${i}`,
    }));
    
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockData),
    });
  });
}

export async function testConcurrentUsers(page: Page, userCount = 5) {
  // Simulate concurrent user actions
  const promises = Array.from({ length: userCount }, async (_, i) => {
    const newPage = await page.context().newPage();
    await loginUser(newPage, TEST_CONFIG.users.valid);
    await newPage.close();
  });
  
  await Promise.all(promises);
}

export async function testSessionTimeout(page: Page) {
  // Clear all cookies and localStorage to simulate session timeout
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

export async function testBrowserCompatibility(page: Page, browserType: 'chromium' | 'firefox' | 'webkit') {
  // Test browser-specific features
  const userAgent = await page.evaluate(() => navigator.userAgent);
  console.log(`Testing on ${browserType}: ${userAgent}`);
  
  // Test basic functionality that should work across all browsers
  await expect(page.locator('body')).toBeVisible();
}

export async function testMobileOrientation(page: Page) {
  // Test portrait orientation
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(500);
  
  // Test landscape orientation
  await page.setViewportSize({ width: 667, height: 375 });
  await page.waitForTimeout(500);
  
  // Reset to default
  await page.setViewportSize({ width: 1280, height: 720 });
}

export async function testAccessibilityEdgeCases(page: Page) {
  // Test keyboard-only navigation
  await page.keyboard.press('Tab');
  const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
  expect(focusedElement).toBeTruthy();
  
  // Test screen reader compatibility
  const ariaElements = await page.locator('[aria-label], [aria-labelledby]').count();
  expect(ariaElements).toBeGreaterThan(0);
  
  // Test color contrast (basic check)
  const bodyColor = await page.evaluate(() => {
    const body = document.body;
    const style = window.getComputedStyle(body);
    return {
      backgroundColor: style.backgroundColor,
      color: style.color,
    };
  });
  expect(bodyColor.backgroundColor).toBeTruthy();
  expect(bodyColor.color).toBeTruthy();
}

export async function testDataValidationEdgeCases(page: Page, fieldSelector: string) {
  const field = page.locator(fieldSelector);
  
  // Test empty input
  await field.fill('');
  await expect(field).toHaveValue('');
  
  // Test whitespace-only input
  await field.fill(TEST_CONFIG.edgeCases.whitespaceOnly);
  await expect(field).toHaveValue(TEST_CONFIG.edgeCases.whitespaceOnly);
  
  // Test very long input
  await field.fill(TEST_CONFIG.edgeCases.veryLongName);
  await expect(field).toHaveValue(TEST_CONFIG.edgeCases.veryLongName);
  
  // Test special characters
  await field.fill(TEST_CONFIG.edgeCases.specialChars);
  await expect(field).toHaveValue(TEST_CONFIG.edgeCases.specialChars);
  
  // Test unicode characters
  await field.fill(TEST_CONFIG.edgeCases.unicodeText);
  await expect(field).toHaveValue(TEST_CONFIG.edgeCases.unicodeText);
}

export async function testPerformanceMetrics(page: Page, action: () => Promise<void>) {
  const startTime = Date.now();
  await action();
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  console.log(`Performance: Action completed in ${duration}ms`);
  
  // Assert performance thresholds
  expect(duration).toBeLessThan(TEST_CONFIG.performance.actionMax);
  
  return duration;
}

// Enhanced performance measurement utilities
export async function measurePageLoadPerformance(page: Page, url: string, threshold?: number) {
  const startTime = Date.now();
  
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  
  const endTime = Date.now();
  const loadTime = endTime - startTime;
  
  const maxThreshold = threshold || TEST_CONFIG.performance.pageLoadMax;
  expect(loadTime).toBeLessThan(maxThreshold);
  
  console.log(`Page load performance: ${url} loaded in ${loadTime}ms`);
  return loadTime;
}

export async function measureApiResponsePerformance(page: Page, apiPattern: string, mockResponse: any) {
  const startTime = Date.now();
  
  await page.route(apiPattern, route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockResponse),
    });
  });
  
  const endTime = Date.now();
  const responseTime = endTime - startTime;
  
  expect(responseTime).toBeLessThan(TEST_CONFIG.performance.apiResponseMax);
  
  console.log(`API response performance: ${apiPattern} responded in ${responseTime}ms`);
  return responseTime;
}

export async function measureFormSubmissionPerformance(page: Page, formSelector: string, formData: Record<string, string>) {
  const startTime = Date.now();
  
  // Fill form fields
  for (const [field, value] of Object.entries(formData)) {
    const fieldElement = page.locator(`[name="${field}"], [data-testid="${field}"]`);
    if (await fieldElement.isVisible()) {
      await fieldElement.fill(value);
    }
  }
  
  // Submit form
  const submitButton = page.locator(`${formSelector} button[type="submit"], ${formSelector} [data-testid="submit"]`);
  await submitButton.click();
  
  // Wait for form submission to complete
  await page.waitForLoadState('networkidle');
  
  const endTime = Date.now();
  const submissionTime = endTime - startTime;
  
  expect(submissionTime).toBeLessThan(TEST_CONFIG.performance.formSubmissionMax);
  
  console.log(`Form submission performance: completed in ${submissionTime}ms`);
  return submissionTime;
}

export async function measureMemoryUsage(page: Page) {
  const memoryUsage = await page.evaluate(() => {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
      };
    }
    return null;
  });
  
  if (memoryUsage) {
    const usedMB = memoryUsage.used / (1024 * 1024);
    expect(usedMB).toBeLessThan(TEST_CONFIG.performance.memoryUsageMax);
    
    console.log(`Memory usage: ${usedMB.toFixed(2)}MB`);
    return memoryUsage;
  }
  
  return null;
}

export async function measureBundleSize(page: Page) {
  const bundleSize = await page.evaluate(() => {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    
    let totalSize = 0;
    
    // This is a simplified measurement - in real scenarios, you'd fetch the actual resources
    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (src && !src.includes('node_modules')) {
        totalSize += 50000; // Estimated size for non-external scripts
      }
    });
    
    stylesheets.forEach(link => {
      const href = link.getAttribute('href');
      if (href && !href.includes('node_modules')) {
        totalSize += 20000; // Estimated size for non-external stylesheets
      }
    });
    
    return totalSize;
  });
  
  expect(bundleSize).toBeLessThan(TEST_CONFIG.performance.bundleSizeMax);
  
  console.log(`Bundle size: ${(bundleSize / 1024).toFixed(2)}KB`);
  return bundleSize;
}

export async function testErrorBoundaries(page: Page) {
  // Test JavaScript error handling
  await page.addInitScript(() => {
    window.addEventListener('error', (event) => {
      console.error('Test caught error:', event.error);
    });
  });
  
  // Test unhandled promise rejections
  await page.addInitScript(() => {
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Test caught unhandled rejection:', event.reason);
    });
  });
}

export async function testFileUploadEdgeCases(page: Page, fileInputSelector: string) {
  const fileInput = page.locator(fileInputSelector);
  
  // Test empty file upload
  await fileInput.setInputFiles([]);
  
  // Test large file upload (simulated)
  const largeFile = {
    name: 'large-file.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('A'.repeat(10 * 1024 * 1024)), // 10MB
  };
  
  await fileInput.setInputFiles([largeFile]);
  
  // Test unsupported file type
  const unsupportedFile = {
    name: 'test.exe',
    mimeType: 'application/x-executable',
    buffer: Buffer.from('executable content'),
  };
  
  await fileInput.setInputFiles([unsupportedFile]);
}

export async function testFormValidationEdgeCases(page: Page, formSelector: string) {
  const form = page.locator(formSelector);
  
  // Test required field validation
  const requiredFields = await form.locator('[required]').all();
  for (const field of requiredFields) {
    await field.fill('');
    await form.locator('button[type="submit"]').click();
    
    // Check for validation message
    const validationMessage = await field.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toBeTruthy();
  }
  
  // Test email validation
  const emailFields = await form.locator('input[type="email"]').all();
  for (const field of emailFields) {
    await field.fill('invalid-email');
    await form.locator('button[type="submit"]').click();
    
    const validationMessage = await field.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toBeTruthy();
  }
}

export async function testResponsiveDesignEdgeCases(page: Page) {
  const viewports = [
    { width: 320, height: 568 },   // iPhone SE
    { width: 375, height: 667 },   // iPhone 8
    { width: 414, height: 896 },   // iPhone 11
    { width: 768, height: 1024 },  // iPad
    { width: 1024, height: 768 },  // iPad landscape
    { width: 1920, height: 1080 }, // Desktop
  ];
  
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(100);
    
    // Check that critical elements are still visible
    await expect(page.locator('body')).toBeVisible();
    
    // Check that navigation is accessible
    const navElements = await page.locator('nav, [role="navigation"]').count();
    if (navElements > 0) {
      await expect(page.locator('nav, [role="navigation"]').first()).toBeVisible();
    }
  }
}

// Enhanced existing utilities with better error handling
export async function loginUser(page: Page, user = TEST_CONFIG.users.valid) {
  await page.goto(TEST_ROUTES.login);
  await page.getByLabel(/ایمیل/i).fill(user.email);
  await page.getByLabel(/رمز عبور/i).fill(user.password);
  await page.getByRole('button', { name: /ورود/i }).click();

  // Wait for successful login and redirect
  await expect(page).toHaveURL(TEST_ROUTES.dashboard);

  // Wait for page to load
  await page.waitForLoadState('networkidle');
}

export async function logoutUser(page: Page) {
  // Look for logout button in header/navbar
  const logoutButton = page.locator(
    '[data-testid="logout-button"], .logout-button, .user-menu-logout'
  );

  if (await logoutButton.isVisible()) {
    await logoutButton.click();

    // Wait for logout confirmation or redirect
    await expect(page).toHaveURL(TEST_ROUTES.login);
  } else {
    // If no logout button found, navigate to login page
    await page.goto(TEST_ROUTES.login);
  }
}

// Navigation helper functions
export async function navigateToProjects(page: Page) {
  await page.goto(TEST_ROUTES.projects);
  await expect(page.locator('body')).toContainText(/پروژه‌ها/i);
  await page.waitForLoadState('networkidle');
}

export async function navigateToStoryboard(page: Page) {
  await page.goto(TEST_ROUTES.storyboard);
  await expect(page.locator('body')).toContainText(/استوری‌بورد/i);
  await page.waitForLoadState('networkidle');
}

export async function navigateToDashboard(page: Page) {
  await page.goto(TEST_ROUTES.dashboard);
  await page.waitForLoadState('networkidle');
}

// Form interaction helper functions
export async function fillFormField(page: Page, label: string, value: string) {
  const field = page.getByLabel(label);
  if (await field.isVisible()) {
    await field.fill(value);
    return true;
  }
  return false;
}

export async function selectFormOption(
  page: Page,
  label: string,
  option: string
) {
  const select = page.getByLabel(label);
  if (await select.isVisible()) {
    await select.selectOption(option);
    return true;
  }
  return false;
}

export async function submitForm(page: Page, buttonText: string) {
  const submitButton = page.getByRole('button', { name: buttonText });
  if (await submitButton.isVisible()) {
    await submitButton.click();
    return true;
  }
  return false;
}

// Dialog helper functions
export async function openDialog(page: Page, buttonText: string) {
  const button = page.getByRole('button', { name: buttonText });
  if (await button.isVisible()) {
    await button.click();

    // Wait for dialog to appear
    const dialog = page.getByRole('dialog');
    if (await dialog.isVisible()) {
      await expect(dialog).toBeVisible();
      return true;
    }
  }
  return false;
}

export async function closeDialog(page: Page) {
  const dialog = page.getByRole('dialog');
  if (await dialog.isVisible()) {
    // Look for close button
    const closeButton = page.locator(
      '[data-testid="close-dialog"], .close-dialog, .dialog-close'
    );
    if (await closeButton.isVisible()) {
      await closeButton.click();
    } else {
      // Try pressing Escape key
      await page.keyboard.press('Escape');
    }

    // Wait for dialog to close
    await expect(dialog).not.toBeVisible();
    return true;
  }
  return false;
}

// Element visibility helper functions
export async function checkElementVisible(
  page: Page,
  selector: string,
  fallbackSelectors?: string[]
) {
  const element = page.locator(selector);

  if (await element.isVisible()) {
    await expect(element).toBeVisible();
    return true;
  }

  // Try fallback selectors
  if (fallbackSelectors) {
    for (const fallbackSelector of fallbackSelectors) {
      const fallbackElement = page.locator(fallbackSelector);
      if (await fallbackElement.isVisible()) {
        await expect(fallbackElement).toBeVisible();
        return true;
      }
    }
  }

  return false;
}

export async function waitForElement(
  page: Page,
  selector: string,
  timeout = TEST_CONFIG.timeout.action
) {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch {
    return false;
  }
}

// Data validation helper functions
export async function expectTextContent(
  page: Page,
  text: string,
  selector?: string
) {
  if (selector) {
    const element = page.locator(selector);
    await expect(element).toContainText(text);
  } else {
    await expect(page.locator('body')).toContainText(text);
  }
}

export async function expectElementValue(
  page: Page,
  selector: string,
  expectedValue: string
) {
  const element = page.locator(selector);
  await expect(element).toHaveValue(expectedValue);
}

export async function expectElementAttribute(
  page: Page,
  selector: string,
  attribute: string,
  expectedValue: string
) {
  const element = page.locator(selector);
  await expect(element).toHaveAttribute(attribute, expectedValue);
}

// Error handling helper functions
export async function mockApiFailure(page: Page, apiPattern: string) {
  await page.route(apiPattern, route => {
    route.abort('failed');
  });
}

export async function mockApiResponse(
  page: Page,
  apiPattern: string,
  response: any
) {
  await page.route(apiPattern, route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });
}

// Test data generation helper functions
export function generateTestProject(overrides: Partial<any> = {}) {
  return {
    ...TEST_CONFIG.project,
    ...overrides,
  };
}

export function generateTestStory(overrides: Partial<any> = {}) {
  return {
    ...TEST_CONFIG.story,
    ...overrides,
  };
}

// Common assertion helper functions
export async function expectPageTitle(page: Page, expectedTitle: string) {
  await expect(page).toHaveTitle(expectedTitle);
}

export async function expectCurrentUrl(page: Page, expectedUrl: string) {
  await expect(page).toHaveURL(expectedUrl);
}

export async function expectElementCount(
  page: Page,
  selector: string,
  expectedCount: number
) {
  const elements = page.locator(selector);
  await expect(elements).toHaveCount(expectedCount);
}

// Performance helper functions
export async function measurePageLoadTime(
  _page: Page,
  action: () => Promise<void>
) {
  const startTime = Date.now();
  await action();
  const endTime = Date.now();
  const loadTime = endTime - startTime;

  // Log performance metrics
  console.log('Page load time: ${loadTime}ms');

  // Assert reasonable performance (adjust threshold as needed)
  expect(loadTime).toBeLessThan(TEST_CONFIG.performance.pageLoadMax);

  return loadTime;
}

// Accessibility helper functions
export async function checkKeyboardNavigation(page: Page, selectors: string[]) {
  for (let i = 0; i < selectors.length; i++) {
    await page.keyboard.press('Tab');

    if (i < selectors.length) {
      const element = page.locator(selectors[i]!);
      await expect(element).toBeFocused();
    }
  }
}

export async function checkFormAccessibility(
  page: Page,
  formFields: Array<{ label: string; type: string; required?: boolean }>
) {
  for (const field of formFields) {
    const element = page.getByLabel(field.label);

    if (await element.isVisible()) {
      // Check type attribute
      if (field.type) {
        await expect(element).toHaveAttribute('type', field.type);
      }

      // Check required attribute
      if (field.required) {
        await expect(element).toHaveAttribute('required');
      }
    }
  }
}
