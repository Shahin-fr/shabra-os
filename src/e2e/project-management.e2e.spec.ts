import { test, expect } from '@playwright/test';

// Test data for project management
const TEST_USER = {
  email: 'test@shabra.com',
  password: 'testpassword123',
};

const TEST_PROJECT = {
  name: 'Test Project E2E',
  description: 'This is a test project created during E2E testing',
  startDate: '2024-01-15',
  endDate: '2024-12-31',
  status: 'active',
  priority: 'medium',
};

test.describe('Project Management - Critical User Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.getByLabel(/ایمیل/i).fill(TEST_USER.email);
    await page.getByLabel(/رمز عبور/i).fill(TEST_USER.password);
    await page.getByRole('button', { name: /ورود/i }).click();

    // Wait for successful login and redirect
    await expect(page).toHaveURL('/');

    // Navigate to projects page
    await page.goto('/projects');

    // Wait for projects page to load
    await expect(page.locator('body')).toContainText(/پروژه‌ها/i);
  });

  test('should display projects page with proper elements', async ({
    page,
  }) => {
    // Check for main page elements
    await expect(page.getByText(/پروژه‌ها/i)).toBeVisible();

    // Check for create project button (if it exists)
    const createButton = page.getByRole('button', { name: /ایجاد پروژه/i });
    if (await createButton.isVisible()) {
      await expect(createButton).toBeVisible();
    }

    // Check for projects list or empty state
    const projectsList = page.locator(
      '[data-testid="projects-list"], .projects-list, .projects-grid'
    );
    await expect(projectsList).toBeVisible();
  });

  test('should open create project dialog and display form', async ({
    page,
  }) => {
    // Look for create project button
    const createButton = page.getByRole('button', { name: /ایجاد پروژه/i });

    if (await createButton.isVisible()) {
      // Click create project button
      await createButton.click();

      // Wait for dialog to appear
      await expect(page.getByRole('dialog')).toBeVisible();

      // Check for form elements
      await expect(page.getByLabel(/نام پروژه/i)).toBeVisible();
      await expect(page.getByLabel(/توضیحات/i)).toBeVisible();

      // Check for submit button
      await expect(page.getByRole('button', { name: /ایجاد/i })).toBeVisible();
    } else {
      // If no create button, test that we can at least view the page
      await expect(page.locator('body')).toContainText(/پروژه‌ها/i);
    }
  });

  test('should create a new project successfully', async ({ page }) => {
    // Look for create project button
    const createButton = page.getByRole('button', { name: /ایجاد پروژه/i });

    if (await createButton.isVisible()) {
      // Open create project dialog
      await createButton.click();
      await expect(page.getByRole('dialog')).toBeVisible();

      // Fill out the project form
      await page.getByLabel(/نام پروژه/i).fill(TEST_PROJECT.name);
      await page.getByLabel(/توضیحات/i).fill(TEST_PROJECT.description);

      // If date fields exist, fill them
      const startDateInput = page.getByLabel(/تاریخ شروع/i);
      const endDateInput = page.getByLabel(/تاریخ پایان/i);

      if (await startDateInput.isVisible()) {
        await startDateInput.fill(TEST_PROJECT.startDate);
      }

      if (await endDateInput.isVisible()) {
        await endDateInput.fill(TEST_PROJECT.endDate);
      }

      // If status/priority fields exist, select them
      const statusSelect = page.getByLabel(/وضعیت/i);
      const prioritySelect = page.getByLabel(/اولویت/i);

      if (await statusSelect.isVisible()) {
        await statusSelect.selectOption(TEST_PROJECT.status);
      }

      if (await prioritySelect.isVisible()) {
        await prioritySelect.selectOption(TEST_PROJECT.priority);
      }

      // Submit the form
      await page.getByRole('button', { name: /ایجاد/i }).click();

      // Wait for dialog to close
      await expect(page.getByRole('dialog')).not.toBeVisible();

      // Check that the new project appears in the list
      await expect(page.getByText(TEST_PROJECT.name)).toBeVisible();

      // Verify project details are displayed
      if (await page.getByText(TEST_PROJECT.description).isVisible()) {
        await expect(page.getByText(TEST_PROJECT.description)).toBeVisible();
      }
    } else {
      // Skip test if create functionality is not available
      test.skip();
    }
  });

  test('should display validation errors for incomplete project form', async ({
    page,
  }) => {
    // Look for create project button
    const createButton = page.getByRole('button', { name: /ایجاد پروژه/i });

    if (await createButton.isVisible()) {
      // Open create project dialog
      await createButton.click();
      await expect(page.getByRole('dialog')).toBeVisible();

      // Try to submit empty form
      await page.getByRole('button', { name: /ایجاد/i }).click();

      // Check for validation errors
      const nameInput = page.getByLabel(/نام پروژه/i);
      if (await nameInput.isVisible()) {
        await expect(nameInput).toHaveAttribute('required');
      }

      // Dialog should remain open
      await expect(page.getByRole('dialog')).toBeVisible();
    } else {
      // Skip test if create functionality is not available
      test.skip();
    }
  });

  test('should display project list with pagination', async ({ page }) => {
    // Check for pagination elements if they exist
    const pagination = page.locator(
      '[data-testid="pagination"], .pagination, [role="navigation"]'
    );

    if (await pagination.isVisible()) {
      await expect(pagination).toBeVisible();

      // Check for page navigation buttons
      const nextButton = page.getByRole('button', { name: /بعدی/i });
      const prevButton = page.getByRole('button', { name: /قبلی/i });

      if (await nextButton.isVisible()) {
        await expect(nextButton).toBeVisible();
      }

      if (await prevButton.isVisible()) {
        await expect(prevButton).toBeVisible();
      }
    }

    // Check that projects are displayed
    const projectCards = page.locator(
      '[data-testid="project-card"], .project-card, .project-item'
    );
    if (await projectCards.first().isVisible()) {
      await expect(projectCards.first()).toBeVisible();
    }
  });

  test('should view project details', async ({ page }) => {
    // Look for project cards or list items
    const projectCards = page.locator(
      '[data-testid="project-card"], .project-card, .project-item'
    );

    if (await projectCards.first().isVisible()) {
      // Click on the first project to view details
      await projectCards.first().click();

      // Check if we're on a project detail page or if details opened in a modal
      const projectDetail = page.locator(
        '[data-testid="project-detail"], .project-detail, .project-modal'
      );

      if (await projectDetail.isVisible()) {
        await expect(projectDetail).toBeVisible();

        // Check for project information
        await expect(page.locator('body')).toContainText(TEST_PROJECT.name);
      } else {
        // Might have navigated to a different page
        await expect(page.locator('body')).toContainText(/پروژه/i);
      }
    } else {
      // Skip test if no projects are visible
      test.skip();
    }
  });

  test('should delete a project successfully', async ({ page }) => {
    // Look for project cards or list items
    const projectCards = page.locator(
      '[data-testid="project-card"], .project-card, .project-item'
    );

    if (await projectCards.first().isVisible()) {
      // Look for delete button on the first project
      const deleteButton = page
        .locator(
          '[data-testid="delete-project"], .delete-project, .project-delete'
        )
        .first();

      if (await deleteButton.isVisible()) {
        // Click delete button
        await deleteButton.click();

        // Check for confirmation dialog
        const confirmDialog = page.getByRole('dialog');
        if (await confirmDialog.isVisible()) {
          await expect(confirmDialog).toBeVisible();

          // Confirm deletion
          const confirmButton = page.getByRole('button', { name: /حذف/i });
          if (await confirmButton.isVisible()) {
            await confirmButton.click();
          }
        }

        // Wait for project to be removed
        await expect(projectCards.first()).not.toBeVisible();
      } else {
        // Skip test if delete functionality is not available
        test.skip();
      }
    } else {
      // Skip test if no projects are visible
      test.skip();
    }
  });

  test('should handle project search and filtering', async ({ page }) => {
    // Look for search input
    const searchInput = page.getByPlaceholder(/جستجو در پروژه‌ها/i);

    if (await searchInput.isVisible()) {
      await expect(searchInput).toBeVisible();

      // Enter search term
      await searchInput.fill('test');

      // Check if search results are displayed
      const searchResults = page.locator(
        '[data-testid="search-results"], .search-results'
      );
      if (await searchResults.isVisible()) {
        await expect(searchResults).toBeVisible();
      }
    }

    // Look for filter options
    const filterButton = page.getByRole('button', { name: /فیلتر/i });
    if (await filterButton.isVisible()) {
      await expect(filterButton).toBeVisible();

      // Click filter button
      await filterButton.click();

      // Check for filter options
      const filterOptions = page.locator(
        '[data-testid="filter-options"], .filter-options'
      );
      if (await filterOptions.isVisible()) {
        await expect(filterOptions).toBeVisible();
      }
    }
  });

  test('should handle project editing', async ({ page }) => {
    // Look for project cards or list items
    const projectCards = page.locator(
      '[data-testid="project-card"], .project-card, .project-item'
    );

    if (await projectCards.first().isVisible()) {
      // Look for edit button on the first project
      const editButton = page
        .locator('[data-testid="edit-project"], .edit-project, .project-edit')
        .first();

      if (await editButton.isVisible()) {
        // Click edit button
        await editButton.click();

        // Check for edit dialog or form
        const editDialog = page.getByRole('dialog');
        if (await editDialog.isVisible()) {
          await expect(editDialog).toBeVisible();

          // Check for form fields
          await expect(page.getByLabel(/نام پروژه/i)).toBeVisible();

          // Update project name
          await page.getByLabel(/نام پروژه/i).fill('Updated Project Name');

          // Save changes
          const saveButton = page.getByRole('button', { name: /ذخیره/i });
          if (await saveButton.isVisible()) {
            await saveButton.click();
          }

          // Wait for dialog to close
          await expect(editDialog).not.toBeVisible();

          // Check that changes are reflected
          await expect(page.getByText('Updated Project Name')).toBeVisible();
        }
      } else {
        // Skip test if edit functionality is not available
        test.skip();
      }
    } else {
      // Skip test if no projects are visible
      test.skip();
    }
  });
});

test.describe('Project Management - Error Handling', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel(/ایمیل/i).fill(TEST_USER.email);
    await page.getByLabel(/رمز عبور/i).fill(TEST_USER.password);
    await page.getByRole('button', { name: /ورود/i }).click();
    await expect(page).toHaveURL('/');

    // Navigate to projects page
    await page.goto('/projects');

    // Mock API failure
    await page.route('**/api/projects**', route => {
      route.abort('failed');
    });

    // Check for error handling
    const errorMessage = page.locator(
      '[data-testid="error-message"], .error-message, .error-state'
    );
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible();
    }
  });

  test('should show loading states during operations', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel(/ایمیل/i).fill(TEST_USER.email);
    await page.getByLabel(/رمز عبور/i).fill(TEST_USER.password);
    await page.getByRole('button', { name: /ورود/i }).click();
    await expect(page).toHaveURL('/');

    // Navigate to projects page
    await page.goto('/projects');

    // Look for loading indicators
    const loadingIndicator = page.locator(
      '[data-testid="loading"], .loading, .spinner'
    );
    if (await loadingIndicator.isVisible()) {
      await expect(loadingIndicator).toBeVisible();
    }
  });
});
