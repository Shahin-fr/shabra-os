import { test, expect } from '@playwright/test';

test.describe('Meetings Module - End-to-End Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to meetings page
    await page.goto('/meetings');
  });

  test('should display meetings page with proper navigation', async ({ page }) => {
    // Check if meetings page loads
    await expect(page.locator('h1')).toContainText('جلسات');
    
    // Check if create meeting button is visible
    await expect(page.locator('button:has-text("جلسه جدید")')).toBeVisible();
  });

  test('should show empty state when no meetings exist', async ({ page }) => {
    // Check for empty state elements
    await expect(page.locator('text=هنوز جلسه‌ای برنامه‌ریزی نشده')).toBeVisible();
    await expect(page.locator('text=ایجاد اولین جلسه')).toBeVisible();
  });

  test('should open create meeting modal', async ({ page }) => {
    // Click create meeting button
    await page.click('button:has-text("جلسه جدید")');
    
    // Check if modal opens
    await expect(page.locator('text=ایجاد جلسه جدید')).toBeVisible();
    
    // Check if form fields are present
    await expect(page.locator('input[placeholder="عنوان جلسه را وارد کنید"]')).toBeVisible();
    await expect(page.locator('text=انتخاب زمان شروع')).toBeVisible();
    await expect(page.locator('text=انتخاب زمان پایان')).toBeVisible();
  });

  test('should create a new meeting', async ({ page }) => {
    // Open create meeting modal
    await page.click('button:has-text("جلسه جدید")');
    
    // Fill in meeting details
    await page.fill('input[placeholder="عنوان جلسه را وارد کنید"]', 'جلسه تست');
    
    // Select meeting type
    await page.click('text=نوع جلسه');
    await page.click('text=جلسه یک به یک');
    
    // Select attendees (if any are available)
    const attendeeCheckbox = page.locator('input[type="checkbox"]').first();
    if (await attendeeCheckbox.isVisible()) {
      await attendeeCheckbox.check();
    }
    
    // Submit form
    await page.click('button:has-text("ایجاد جلسه")');
    
    // Check for success message
    await expect(page.locator('text=جلسه با موفقیت ایجاد شد')).toBeVisible();
  });

  test('should navigate to meeting details page', async ({ page }) => {
    // This test assumes there's at least one meeting
    // Click on a meeting event if it exists
    const meetingEvent = page.locator('.rbc-event').first();
    if (await meetingEvent.isVisible()) {
      await meetingEvent.click();
      
      // Check if meeting details modal opens
      await expect(page.locator('text=جزئیات جلسه')).toBeVisible();
    }
  });

  test('should display meeting workspace with all sections', async ({ page }) => {
    // Navigate to a specific meeting (assuming meeting ID exists)
    await page.goto('/meetings/test-meeting-id');
    
    // Check if meeting workspace loads
    await expect(page.locator('text=نکات گفتگو')).toBeVisible();
    await expect(page.locator('text=یادداشت‌های مشترک')).toBeVisible();
    await expect(page.locator('text=موارد اقدام')).toBeVisible();
  });

  test('should add talking point', async ({ page }) => {
    await page.goto('/meetings/test-meeting-id');
    
    // Add a talking point
    await page.fill('input[placeholder="نکته گفتگو جدید..."]', 'نکته تست');
    await page.click('button:has-text("+")');
    
    // Check if talking point appears
    await expect(page.locator('text=نکته تست')).toBeVisible();
  });

  test('should add action item', async ({ page }) => {
    await page.goto('/meetings/test-meeting-id');
    
    // Add an action item
    await page.fill('input[placeholder="مورد اقدام جدید..."]', 'اقدام تست');
    
    // Select assignee if available
    const assigneeSelect = page.locator('text=انتخاب مسئول...');
    if (await assigneeSelect.isVisible()) {
      await assigneeSelect.click();
      const firstAssignee = page.locator('[role="option"]').first();
      if (await firstAssignee.isVisible()) {
        await firstAssignee.click();
      }
    }
    
    await page.click('button:has-text("+")');
    
    // Check if action item appears
    await expect(page.locator('text=اقدام تست')).toBeVisible();
  });

  test('should convert action item to task', async ({ page }) => {
    await page.goto('/meetings/test-meeting-id');
    
    // Find an action item with convert to task button
    const convertButton = page.locator('button:has-text("تسک")').first();
    if (await convertButton.isVisible()) {
      await convertButton.click();
      
      // Check for success message
      await expect(page.locator('text=تسک با موفقیت ایجاد شد')).toBeVisible();
    }
  });

  test('should update meeting notes', async ({ page }) => {
    await page.goto('/meetings/test-meeting-id');
    
    // Click edit notes button
    await page.click('button:has-text("ویرایش")');
    
    // Add notes
    await page.fill('textarea[placeholder="یادداشت‌های جلسه..."]', 'یادداشت تست');
    
    // Save notes
    await page.click('button:has-text("ذخیره")');
    
    // Check for success message
    await expect(page.locator('text=یادداشت‌ها به‌روزرسانی شد')).toBeVisible();
  });

  test('should display progress indicators', async ({ page }) => {
    await page.goto('/meetings/test-meeting-id');
    
    // Check if progress cards are visible
    await expect(page.locator('text=نکات گفتگو')).toBeVisible();
    await expect(page.locator('text=موارد اقدام')).toBeVisible();
    
    // Check if progress percentages are displayed
    await expect(page.locator('text=%')).toBeVisible();
  });

  test('should handle responsive design', async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if elements are still visible and properly laid out
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('button:has-text("جلسه جدید")')).toBeVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Check if layout adapts
    await expect(page.locator('h1')).toBeVisible();
  });
});
