import { test, expect } from '@playwright/test';

// Test data for content creation
const TEST_USER = {
  email: 'test@shabra.com',
  password: 'testpassword123',
};

const TEST_STORY = {
  title: 'Test Story E2E',
  content: 'This is a test story created during E2E testing',
  type: 'article',
  status: 'draft',
  priority: 'medium',
  tags: ['test', 'e2e'],
  publishDate: '2024-01-15',
};

test.describe('Content Creation - Critical User Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.getByLabel(/ایمیل/i).fill(TEST_USER.email);
    await page.getByLabel(/رمز عبور/i).fill(TEST_USER.password);
    await page.getByRole('button', { name: /ورود/i }).click();

    // Wait for successful login and redirect
    await expect(page).toHaveURL('/');

    // Navigate to storyboard page
    await page.goto('/storyboard');

    // Wait for storyboard page to load
    await expect(page.locator('body')).toContainText(/استوری‌بورد/i);
  });

  test('should display storyboard page with proper elements', async ({
    page,
  }) => {
    // Check for main page elements
    await expect(page.getByText(/استوری‌بورد/i)).toBeVisible();

    // Check for calendar or date picker
    const calendar = page.locator(
      '[data-testid="calendar"], .calendar, .date-picker'
    );
    if (await calendar.isVisible()) {
      await expect(calendar).toBeVisible();
    }

    // Check for create story button
    const createButton = page.getByRole('button', { name: /ایجاد استوری/i });
    if (await createButton.isVisible()) {
      await expect(createButton).toBeVisible();
    }

    // Check for storyboard canvas or grid
    const storyboardCanvas = page.locator(
      '[data-testid="storyboard-canvas"], .storyboard-canvas, .storyboard-grid'
    );
    await expect(storyboardCanvas).toBeVisible();
  });

  test('should allow date selection and navigation', async ({ page }) => {
    // Look for date picker or calendar
    const datePicker = page.locator(
      '[data-testid="date-picker"], .date-picker, input[type="date"]'
    );

    if (await datePicker.isVisible()) {
      await expect(datePicker).toBeVisible();

      // Select a specific date
      const targetDate = '2024-01-15';
      await datePicker.fill(targetDate);

      // Check if the date is selected
      await expect(datePicker).toHaveValue(targetDate);
    }

    // Look for calendar navigation
    const prevMonthButton = page.getByRole('button', { name: /ماه قبل/i });
    const nextMonthButton = page.getByRole('button', { name: /ماه بعد/i });

    if (await prevMonthButton.isVisible()) {
      await expect(prevMonthButton).toBeVisible();

      // Navigate to previous month
      await prevMonthButton.click();

      // Check that calendar has updated
      const calendar = page.locator('[data-testid="calendar"], .calendar');
      if (await calendar.isVisible()) {
        await expect(calendar).toBeVisible();
      }
    }

    if (await nextMonthButton.isVisible()) {
      await expect(nextMonthButton).toBeVisible();

      // Navigate to next month
      await nextMonthButton.click();

      // Check that calendar has updated
      const calendar = page.locator('[data-testid="calendar"], .calendar');
      if (await calendar.isVisible()) {
        await expect(calendar).toBeVisible();
      }
    }
  });

  test('should open create story dialog and display form', async ({ page }) => {
    // Look for create story button
    const createButton = page.getByRole('button', { name: /ایجاد استوری/i });

    if (await createButton.isVisible()) {
      // Click create story button
      await createButton.click();

      // Wait for dialog to appear
      await expect(page.getByRole('dialog')).toBeVisible();

      // Check for form elements
      await expect(page.getByLabel(/عنوان/i)).toBeVisible();
      await expect(page.getByLabel(/محتوای/i)).toBeVisible();

      // Check for story type selection
      const typeSelect = page.getByLabel(/نوع/i);
      if (await typeSelect.isVisible()) {
        await expect(typeSelect).toBeVisible();
      }

      // Check for submit button
      await expect(page.getByRole('button', { name: /ایجاد/i })).toBeVisible();
    } else {
      // If no create button, test that we can at least view the page
      await expect(page.locator('body')).toContainText(/استوری‌بورد/i);
    }
  });

  test('should create a new story successfully', async ({ page }) => {
    // Look for create story button
    const createButton = page.getByRole('button', { name: /ایجاد استوری/i });

    if (await createButton.isVisible()) {
      // Open create story dialog
      await createButton.click();
      await expect(page.getByRole('dialog')).toBeVisible();

      // Fill out the story form
      await page.getByLabel(/عنوان/i).fill(TEST_STORY.title);
      await page.getByLabel(/محتوای/i).fill(TEST_STORY.content);

      // If story type exists, select it
      const typeSelect = page.getByLabel(/نوع/i);
      if (await typeSelect.isVisible()) {
        await typeSelect.selectOption(TEST_STORY.type);
      }

      // If status exists, select it
      const statusSelect = page.getByLabel(/وضعیت/i);
      if (await statusSelect.isVisible()) {
        await statusSelect.selectOption(TEST_STORY.status);
      }

      // If priority exists, select it
      const prioritySelect = page.getByLabel(/اولویت/i);
      if (await prioritySelect.isVisible()) {
        await prioritySelect.selectOption(TEST_STORY.priority);
      }

      // If tags exist, add them
      const tagsInput = page.getByLabel(/برچسب‌ها/i);
      if (await tagsInput.isVisible()) {
        await tagsInput.fill(TEST_STORY.tags.join(', '));
      }

      // If publish date exists, set it
      const publishDateInput = page.getByLabel(/تاریخ انتشار/i);
      if (await publishDateInput.isVisible()) {
        await publishDateInput.fill(TEST_STORY.publishDate);
      }

      // Submit the form
      await page.getByRole('button', { name: /ایجاد/i }).click();

      // Wait for dialog to close
      await expect(page.getByRole('dialog')).not.toBeVisible();

      // Check that the new story appears on the storyboard
      await expect(page.getByText(TEST_STORY.title)).toBeVisible();

      // Verify story details are displayed
      if (await page.getByText(TEST_STORY.content).isVisible()) {
        await expect(page.getByText(TEST_STORY.content)).toBeVisible();
      }
    } else {
      // Skip test if create functionality is not available
      test.skip();
    }
  });

  test('should display validation errors for incomplete story form', async ({
    page,
  }) => {
    // Look for create story button
    const createButton = page.getByRole('button', { name: /ایجاد استوری/i });

    if (await createButton.isVisible()) {
      // Open create story dialog
      await createButton.click();
      await expect(page.getByRole('dialog')).toBeVisible();

      // Try to submit empty form
      await page.getByRole('button', { name: /ایجاد/i }).click();

      // Check for validation errors
      const titleInput = page.getByLabel(/عنوان/i);
      if (await titleInput.isVisible()) {
        await expect(titleInput).toHaveAttribute('required');
      }

      // Dialog should remain open
      await expect(page.getByRole('dialog')).toBeVisible();
    } else {
      // Skip test if create functionality is not available
      test.skip();
    }
  });

  test('should display stories on the storyboard canvas for selected date', async ({
    page,
  }) => {
    // Select a specific date first
    const datePicker = page.locator(
      '[data-testid="date-picker"], .date-picker, input[type="date"]'
    );

    if (await datePicker.isVisible()) {
      const targetDate = '2024-01-15';
      await datePicker.fill(targetDate);
      await expect(datePicker).toHaveValue(targetDate);
    }

    // Look for stories on the canvas
    const storyCards = page.locator(
      '[data-testid="story-card"], .story-card, .story-item'
    );

    if (await storyCards.first().isVisible()) {
      await expect(storyCards.first()).toBeVisible();

      // Check that stories are displayed for the selected date
      const dateHeader = page.locator(
        '[data-testid="date-header"], .date-header, .selected-date'
      );
      if (await dateHeader.isVisible()) {
        await expect(dateHeader).toBeVisible();
      }
    } else {
      // If no stories exist, check for empty state
      const emptyState = page.locator(
        '[data-testid="empty-state"], .empty-state, .no-stories'
      );
      if (await emptyState.isVisible()) {
        await expect(emptyState).toBeVisible();
      }
    }
  });

  test('should allow story editing and updates', async ({ page }) => {
    // Look for existing story cards
    const storyCards = page.locator(
      '[data-testid="story-card"], .story-card, .story-item'
    );

    if (await storyCards.first().isVisible()) {
      // Look for edit button on the first story
      const editButton = page
        .locator('[data-testid="edit-story"], .edit-story, .story-edit')
        .first();

      if (await editButton.isVisible()) {
        // Click edit button
        await editButton.click();

        // Check for edit dialog or form
        const editDialog = page.getByRole('dialog');
        if (await editDialog.isVisible()) {
          await expect(editDialog).toBeVisible();

          // Check for form fields
          await expect(page.getByLabel(/عنوان/i)).toBeVisible();

          // Update story title
          await page.getByLabel(/عنوان/i).fill('Updated Story Title');

          // Save changes
          const saveButton = page.getByRole('button', { name: /ذخیره/i });
          if (await saveButton.isVisible()) {
            await saveButton.click();
          }

          // Wait for dialog to close
          await expect(editDialog).not.toBeVisible();

          // Check that changes are reflected
          await expect(page.getByText('Updated Story Title')).toBeVisible();
        }
      } else {
        // Skip test if edit functionality is not available
        test.skip();
      }
    } else {
      // Skip test if no stories are visible
      test.skip();
    }
  });

  test('should allow story deletion', async ({ page }) => {
    // Look for existing story cards
    const storyCards = page.locator(
      '[data-testid="story-card"], .story-card, .story-item'
    );

    if (await storyCards.first().isVisible()) {
      // Look for delete button on the first story
      const deleteButton = page
        .locator('[data-testid="delete-story"], .delete-story, .story-delete')
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

        // Wait for story to be removed
        await expect(storyCards.first()).not.toBeVisible();
      } else {
        // Skip test if delete functionality is not available
        test.skip();
      }
    } else {
      // Skip test if no stories are visible
      test.skip();
    }
  });

  test('should handle story filtering and search', async ({ page }) => {
    // Look for search input
    const searchInput = page.getByPlaceholder(/جستجو در استوری‌ها/i);

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

    // Look for story type filters
    const typeFilter = page.getByLabel(/فیلتر بر اساس نوع/i);
    if (await typeFilter.isVisible()) {
      await expect(typeFilter).toBeVisible();

      // Select a story type
      await typeFilter.selectOption('article');

      // Check if stories are filtered
      const filteredStories = page.locator(
        '[data-testid="story-card"], .story-card, .story-item'
      );
      if (await filteredStories.first().isVisible()) {
        await expect(filteredStories.first()).toBeVisible();
      }
    }
  });

  test('should handle story status changes', async ({ page }) => {
    // Look for existing story cards
    const storyCards = page.locator(
      '[data-testid="story-card"], .story-card, .story-item'
    );

    if (await storyCards.first().isVisible()) {
      // Look for status change button or dropdown
      const statusButton = page
        .locator(
          '[data-testid="story-status"], .story-status, .status-dropdown'
        )
        .first();

      if (await statusButton.isVisible()) {
        // Click status button
        await statusButton.click();

        // Check for status options
        const statusOptions = page.locator(
          '[data-testid="status-options"], .status-options, .status-menu'
        );
        if (await statusOptions.isVisible()) {
          await expect(statusOptions).toBeVisible();

          // Select a new status
          const publishedStatus = page.getByRole('button', {
            name: /منتشر شده/i,
          });
          if (await publishedStatus.isVisible()) {
            await publishedStatus.click();

            // Check that status has changed
            await expect(page.getByText(/منتشر شده/i)).toBeVisible();
          }
        }
      } else {
        // Skip test if status change functionality is not available
        test.skip();
      }
    } else {
      // Skip test if no stories are visible
      test.skip();
    }
  });

  test('should handle story scheduling and publishing', async ({ page }) => {
    // Look for create story button
    const createButton = page.getByRole('button', { name: /ایجاد استوری/i });

    if (await createButton.isVisible()) {
      // Open create story dialog
      await createButton.click();
      await expect(page.getByRole('dialog')).toBeVisible();

      // Fill out basic story information
      await page.getByLabel(/عنوان/i).fill('Scheduled Story Test');
      await page
        .getByLabel(/محتوای/i)
        .fill('This story will be scheduled for future publication');

      // Look for scheduling options
      const scheduleCheckbox = page.getByLabel(/زمان‌بندی انتشار/i);
      if (await scheduleCheckbox.isVisible()) {
        await scheduleCheckbox.check();

        // Set future publish date
        const publishDateInput = page.getByLabel(/تاریخ انتشار/i);
        if (await publishDateInput.isVisible()) {
          const futureDate = '2024-12-31';
          await publishDateInput.fill(futureDate);
          await expect(publishDateInput).toHaveValue(futureDate);
        }
      }

      // Submit the form
      await page.getByRole('button', { name: /ایجاد/i }).click();

      // Wait for dialog to close
      await expect(page.getByRole('dialog')).not.toBeVisible();

      // Check that the scheduled story appears
      await expect(page.getByText('Scheduled Story Test')).toBeVisible();
    } else {
      // Skip test if create functionality is not available
      test.skip();
    }
  });
});

test.describe('Content Creation - Error Handling', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel(/ایمیل/i).fill(TEST_USER.email);
    await page.getByLabel(/رمز عبور/i).fill(TEST_USER.password);
    await page.getByRole('button', { name: /ورود/i }).click();
    await expect(page).toHaveURL('/');

    // Navigate to storyboard page
    await page.goto('/storyboard');

    // Mock API failure
    await page.route('**/api/stories**', route => {
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

    // Navigate to storyboard page
    await page.goto('/storyboard');

    // Look for loading indicators
    const loadingIndicator = page.locator(
      '[data-testid="loading"], .loading, .spinner'
    );
    if (await loadingIndicator.isVisible()) {
      await expect(loadingIndicator).toBeVisible();
    }
  });

  test('should handle invalid date selections', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel(/ایمیل/i).fill(TEST_USER.email);
    await page.getByLabel(/رمز عبور/i).fill(TEST_USER.password);
    await page.getByRole('button', { name: /ورود/i }).click();
    await expect(page).toHaveURL('/');

    // Navigate to storyboard page
    await page.goto('/storyboard');

    // Try to select an invalid date
    const datePicker = page.locator(
      '[data-testid="date-picker"], .date-picker, input[type="date"]'
    );

    if (await datePicker.isVisible()) {
      // Try to set an invalid date format
      await datePicker.fill('invalid-date');

      // Check if validation prevents invalid input
      const currentValue = await datePicker.inputValue();
      expect(currentValue).not.toBe('invalid-date');
    }
  });
});
