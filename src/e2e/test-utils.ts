import { Page, expect } from '@playwright/test';

import { config } from '@/lib/config/env';
import { logger } from '@/lib/logger';

// Test data constants
export const TEST_USER = {
  email: config.testing.userEmail,
  password: config.testing.userPassword,
  invalidEmail: 'invalid-email',
  invalidPassword: 'wrongpassword',
};

// Authentication helper functions
export async function loginUser(page: Page, user = TEST_USER) {
  await page.goto('/login');
  await page.getByLabel(/ایمیل/i).fill(user.email);
  await page.getByLabel(/رمز عبور/i).fill(user.password);
  await page.getByRole('button', { name: /ورود/i }).click();

  // Wait for successful login and redirect
  await expect(page).toHaveURL('/');

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
    await expect(page).toHaveURL('/login');
  } else {
    // If no logout button found, navigate to login page
    await page.goto('/login');
  }
}

// Navigation helper functions
export async function navigateToProjects(page: Page) {
  await page.goto('/projects');
  await expect(page.locator('body')).toContainText(/پروژه‌ها/i);
  await page.waitForLoadState('networkidle');
}

export async function navigateToStoryboard(page: Page) {
  await page.goto('/storyboard');
  await expect(page.locator('body')).toContainText(/استوری‌بورد/i);
  await page.waitForLoadState('networkidle');
}

export async function navigateToDashboard(page: Page) {
  await page.goto('/');
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
  timeout = 10000
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
    name: `Test Project ${Date.now()}`,
    description: 'This is a test project created during E2E testing',
    startDate: '2024-01-15',
    endDate: '2024-12-31',
    status: 'active',
    priority: 'medium',
    ...overrides,
  };
}

export function generateTestStory(overrides: Partial<any> = {}) {
  return {
    title: `Test Story ${Date.now()}`,
    content: 'This is a test story created during E2E testing',
    type: 'article',
    status: 'draft',
    priority: 'medium',
    tags: ['test', 'e2e'],
    publishDate: '2024-01-15',
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
  logger.info('Page load time: ${loadTime}ms');

  // Assert reasonable performance (adjust threshold as needed)
  expect(loadTime).toBeLessThan(10000); // 10 seconds

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
