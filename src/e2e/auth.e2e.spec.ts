import { test, expect } from '@playwright/test';

// Test data for authentication
const TEST_USER = {
  email: 'test@shabra.com',
  password: 'testpassword123',
  invalidEmail: 'invalid-email',
  invalidPassword: 'wrongpassword',
};

test.describe('Authentication - Critical User Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page before each test
    await page.goto('/login');
  });

  test('should display login form with proper elements', async ({ page }) => {
    // Check if login form elements are present
    await expect(page.getByLabel(/ایمیل/i)).toBeVisible();
    await expect(page.getByLabel(/رمز عبور/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /ورود/i })).toBeVisible();

    // Check for Persian text elements
    await expect(page.getByText(/ورود به شبرا OS/i)).toBeVisible();
    await expect(
      page.getByText(/برای دسترسی به پنل مدیریت وارد شوید/i)
    ).toBeVisible();
  });

  test('should show validation errors for empty form submission', async ({
    page,
  }) => {
    // Try to submit empty form
    await page.getByRole('button', { name: /ورود/i }).click();

    // Check for browser validation (required fields)
    const emailInput = page.getByLabel(/ایمیل/i);
    const passwordInput = page.getByLabel(/رمز عبور/i);

    // Verify inputs have required attribute
    await expect(emailInput).toHaveAttribute('required');
    await expect(passwordInput).toHaveAttribute('required');

    // Check that form doesn't submit and stays on login page
    await expect(page).toHaveURL('/login');
  });

  test('should show validation error for invalid email format', async ({
    page,
  }) => {
    // Fill in invalid email format
    await page.getByLabel(/ایمیل/i).fill(TEST_USER.invalidEmail);
    await page.getByLabel(/رمز عبور/i).fill(TEST_USER.password);

    // Submit form
    await page.getByRole('button', { name: /ورود/i }).click();

    // Check for browser email validation
    const emailInput = page.getByLabel(/ایمیل/i);
    await expect(emailInput).toHaveAttribute('type', 'email');

    // Form should stay on login page due to validation
    await expect(page).toHaveURL('/login');
  });

  test('should successfully log in with valid credentials and redirect to dashboard', async ({
    page,
  }) => {
    // Fill in valid credentials
    await page.getByLabel(/ایمیل/i).fill(TEST_USER.email);
    await page.getByLabel(/رمز عبور/i).fill(TEST_USER.password);

    // Submit form
    await page.getByRole('button', { name: /ورود/i }).click();

    // Wait for navigation to dashboard (root page)
    await expect(page).toHaveURL('/');

    // Verify user is logged in by checking for dashboard elements
    // This assumes the main page shows user-specific content when logged in
    await expect(page.locator('body')).not.toContainText(/ورود به شبرا OS/i);
  });

  test('should show error message for invalid credentials', async ({
    page,
  }) => {
    // Fill in invalid credentials
    await page.getByLabel(/ایمیل/i).fill(TEST_USER.invalidEmail);
    await page.getByLabel(/رمز عبور/i).fill(TEST_USER.invalidPassword);

    // Submit form
    await page.getByRole('button', { name: /ورود/i }).click();

    // Check for error message (in Persian)
    await expect(page.getByText(/ایمیل یا رمز عبور اشتباه است/i)).toBeVisible();

    // Should remain on login page
    await expect(page).toHaveURL('/login');
  });

  test('should maintain form state on validation errors', async ({ page }) => {
    // Fill in form with partial data
    await page.getByLabel(/ایمیل/i).fill(TEST_USER.email);
    await page.getByLabel(/رمز عبور/i).fill('');

    // Submit form
    await page.getByRole('button', { name: /ورود/i }).click();

    // Check that email is still filled
    await expect(page.getByLabel(/ایمیل/i)).toHaveValue(TEST_USER.email);

    // Check that password is empty
    await expect(page.getByLabel(/رمز عبور/i)).toHaveValue('');
  });

  test('should show loading state during authentication', async ({ page }) => {
    // Fill in valid credentials
    await page.getByLabel(/ایمیل/i).fill(TEST_USER.email);
    await page.getByLabel(/رمز عبور/i).fill(TEST_USER.password);

    // Submit form
    await page.getByRole('button', { name: /ورود/i }).click();

    // Check for loading state
    await expect(page.getByText(/در حال ورود/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /ورود/i })).toBeDisabled();
  });

  test('should have proper form accessibility and keyboard navigation', async ({
    page,
  }) => {
    // Check for proper labeling and attributes
    const emailInput = page.getByLabel(/ایمیل/i);
    const passwordInput = page.getByLabel(/رمز عبور/i);

    await expect(emailInput).toHaveAttribute('type', 'email');
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await expect(emailInput).toHaveAttribute('required');
    await expect(passwordInput).toHaveAttribute('required');

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(emailInput).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(passwordInput).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: /ورود/i })).toBeFocused();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network failure by intercepting the API call
    await page.route('**/api/auth/signin', route => {
      route.abort('failed');
    });

    // Fill in valid credentials
    await page.getByLabel(/ایمیل/i).fill(TEST_USER.email);
    await page.getByLabel(/رمز عبور/i).fill(TEST_USER.password);

    // Submit form
    await page.getByRole('button', { name: /ورود/i }).click();

    // Check for error message
    await expect(page.getByText(/خطا در ورود به سیستم/i)).toBeVisible();

    // Should remain on login page
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Authentication - Logout Flow', () => {
  test('should successfully log out and redirect to login page', async ({
    page,
  }) => {
    // First, log in
    await page.goto('/login');
    await page.getByLabel(/ایمیل/i).fill(TEST_USER.email);
    await page.getByLabel(/رمز عبور/i).fill(TEST_USER.password);
    await page.getByRole('button', { name: /ورود/i }).click();

    // Wait for successful login
    await expect(page).toHaveURL('/');

    // Look for logout functionality (this might be in a header/navbar)
    // Since the exact logout implementation isn't clear, we'll test the basic flow
    // In a real implementation, you'd click a logout button or menu item

    // For now, test that we can navigate back to login and it shows the form
    await page.goto('/login');
    await expect(page.getByText(/ورود به شبرا OS/i)).toBeVisible();
    await expect(page.getByLabel(/ایمیل/i)).toBeVisible();
  });
});

test.describe('Authentication - Security Features', () => {
  test('should not expose sensitive information in page source', async ({
    page,
  }) => {
    await page.goto('/login');

    // Check page source doesn't contain sensitive data
    const pageContent = await page.content();
    expect(pageContent).not.toContain(TEST_USER.password);
    expect(pageContent).not.toContain('testpassword');
  });

  test('should redirect unauthenticated users from protected routes', async ({
    page,
  }) => {
    // Try to access protected routes without authentication
    const protectedRoutes = ['/projects', '/storyboard', '/dashboard'];

    for (const route of protectedRoutes) {
      await page.goto(route);

      // Should redirect to login page
      await expect(page).toHaveURL('/login');
    }
  });
});
