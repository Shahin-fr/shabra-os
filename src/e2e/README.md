# 🧪 Shabra OS - End-to-End (E2E) Testing Suite

This directory contains comprehensive End-to-End tests for Shabra OS using Playwright. These tests simulate real user interactions and ensure the application works correctly from a user's perspective.

## 📁 Test Structure

```
src/e2e/
├── README.md                    # This documentation file
├── test-utils.ts               # Common test utilities and helper functions
├── run-e2e-tests.ts            # Test runner script with CLI interface
├── auth.e2e.spec.ts            # Authentication flow tests
├── project-management.e2e.spec.ts  # Project management tests
└── content-creation.e2e.spec.ts   # Content creation (storyboard) tests
```

## 🎯 Test Coverage

### 1. Authentication - Critical User Journey

- **Login Form Display**: Verifies login form elements are properly displayed
- **Form Validation**: Tests empty form submission and validation errors
- **Email Validation**: Checks invalid email format handling
- **Successful Login**: Tests valid credentials and dashboard redirect
- **Invalid Credentials**: Verifies error handling for wrong credentials
- **Form State Persistence**: Ensures form data is maintained on validation errors
- **Loading States**: Tests loading indicators during authentication
- **Accessibility**: Keyboard navigation and ARIA attributes
- **Network Error Handling**: Graceful handling of API failures
- **Security Features**: Protection against sensitive data exposure
- **Route Protection**: Redirects unauthenticated users from protected routes

### 2. Project Management - Critical User Journey

- **Projects Page Display**: Verifies projects page loads correctly
- **Create Project Dialog**: Tests project creation form opening
- **Project Creation**: End-to-end project creation workflow
- **Form Validation**: Tests required field validation
- **Project List Display**: Verifies pagination and project cards
- **Project Details**: Tests project detail viewing
- **Project Deletion**: Tests project removal with confirmation
- **Search and Filtering**: Tests project search and filter functionality
- **Project Editing**: Tests project update workflow
- **Error Handling**: Network failures and loading states

### 3. Content Creation (Storyboard) - Critical User Journey

- **Storyboard Page Display**: Verifies storyboard interface elements
- **Date Selection**: Tests calendar navigation and date picking
- **Create Story Dialog**: Tests story creation form
- **Story Creation**: End-to-end story creation workflow
- **Form Validation**: Tests required field validation
- **Story Display**: Verifies stories appear on canvas for selected dates
- **Story Editing**: Tests story update functionality
- **Story Deletion**: Tests story removal with confirmation
- **Search and Filtering**: Tests story search and filter options
- **Status Management**: Tests story status changes
- **Scheduling**: Tests story scheduling and publishing
- **Error Handling**: Network failures, loading states, and validation

## 🚀 Running the Tests

### Prerequisites

- Node.js 18+ installed
- Playwright browsers installed: `npx playwright install`
- Development server running on `http://localhost:3000`

### Basic Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test src/e2e/auth.e2e.spec.ts

# Run with UI mode
npx playwright test --ui

# Run with headed browser (visible browser)
npx playwright test --headed

# Run with specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Advanced Options

```bash
# Run with debugging
npm run test:e2e -- --debug

# Run in headed mode
npm run test:e2e -- --headed

# Run with specific browser
npx playwright test --project=firefox

# Show help
npm run test:e2e -- --help
```

### Test Runner Script

The `run-e2e-tests.ts` script provides additional functionality:

```bash
# Run all tests with custom runner
npx tsx src/e2e/run-e2e-tests.ts

# Run with specific browser
npx tsx src/e2e/run-e2e-tests.ts --browser webkit

# Run in headed mode
npx tsx src/e2e/run-e2e-tests.ts --headed

# Run with debugging
npx tsx src/e2e/run-e2e-tests.ts --debug
```

## 🛠️ Test Utilities

The `test-utils.ts` file provides common helper functions:

### Authentication Helpers

- `loginUser(page, user)` - Authenticates a user
- `logoutUser(page)` - Logs out the current user

### Navigation Helpers

- `navigateToProjects(page)` - Navigates to projects page
- `navigateToStoryboard(page)` - Navigates to storyboard page
- `navigateToDashboard(page)` - Navigates to dashboard

### Form Interaction Helpers

- `fillFormField(page, label, value)` - Fills form fields
- `selectFormOption(page, label, option)` - Selects form options
- `submitForm(page, buttonText)` - Submits forms

### Dialog Helpers

- `openDialog(page, buttonText)` - Opens dialogs
- `closeDialog(page)` - Closes dialogs

### Element Helpers

- `checkElementVisible(page, selector, fallbacks)` - Checks element visibility
- `waitForElement(page, selector, timeout)` - Waits for elements

### Data Validation Helpers

- `expectTextContent(page, text, selector)` - Asserts text content
- `expectElementValue(page, selector, value)` - Asserts element values
- `expectElementAttribute(page, selector, attr, value)` - Asserts attributes

### Error Handling Helpers

- `mockApiFailure(page, pattern)` - Mocks API failures
- `mockApiResponse(page, pattern, response)` - Mocks API responses

### Test Data Generators

- `generateTestProject(overrides)` - Generates test project data
- `generateTestStory(overrides)` - Generates test story data

## 📋 Test Data

### Test User Credentials

```typescript
const TEST_USER = {
  email: 'test@shabra.com',
  password: 'testpassword123',
  invalidEmail: 'invalid-email',
  invalidPassword: 'wrongpassword',
};
```

### Test Project Data

```typescript
const TEST_PROJECT = {
  name: 'Test Project E2E',
  description: 'This is a test project created during E2E testing',
  startDate: '2024-01-15',
  endDate: '2024-12-31',
  status: 'active',
  priority: 'medium',
};
```

### Test Story Data

```typescript
const TEST_STORY = {
  title: 'Test Story E2E',
  content: 'This is a test story created during E2E testing',
  type: 'article',
  status: 'draft',
  priority: 'medium',
  tags: ['test', 'e2e'],
  publishDate: '2024-01-15',
};
```

## 🔧 Configuration

### Playwright Configuration

The tests use the configuration in `playwright.config.ts`:

- **Test Directory**: `./src/e2e`
- **Base URL**: `http://localhost:3000`
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Parallel Execution**: Enabled for faster test runs
- **Retries**: 2 retries in CI, 0 in development
- **Timeouts**: 60s global, 10s for actions, 30s for navigation

### Environment Variables

```bash
# Set specific browser
PLAYWRIGHT_BROWSER=firefox

# Enable headed mode
PLAYWRIGHT_HEADED=true

# Enable debugging
PLAYWRIGHT_DEBUG=true
```

## 📊 Test Results

### HTML Report

After running tests, view the HTML report:

```bash
npx playwright show-report
```

### Console Output

Tests provide detailed console output including:

- Test execution progress
- Pass/fail status
- Execution time
- Error details
- Performance metrics

### Test Summary

The test runner provides a comprehensive summary:

- Total test count
- Passed/failed/skipped counts
- Total execution time
- Detailed error information

## 🐛 Debugging

### Debug Mode

```bash
# Run with debugging enabled
npm run test:e2e -- --debug
```

### Headed Mode

```bash
# Run with visible browser
npm run test:e2e -- --headed
```

### UI Mode

```bash
# Run with Playwright UI
npx playwright test --ui
```

### Step-by-Step Debugging

```bash
# Run specific test with debugging
npx playwright test --debug src/e2e/auth.e2e.spec.ts
```

## 📝 Writing New Tests

### Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { loginUser, navigateToProjects } from './test-utils';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: login, navigation, etc.
    await loginUser(page);
    await navigateToProjects(page);
  });

  test('should perform specific action', async ({ page }) => {
    // Test implementation
    await expect(page.getByText('Expected Text')).toBeVisible();
  });
});
```

### Best Practices

1. **Use test utilities** for common operations
2. **Test one thing at a time** - keep tests focused
3. **Use descriptive test names** that explain the expected behavior
4. **Handle conditional elements** with proper fallbacks
5. **Mock external dependencies** when appropriate
6. **Test error scenarios** and edge cases
7. **Use data-testid attributes** for reliable element selection
8. **Wait for elements** before interacting with them

### Adding Test Data

```typescript
// In test-utils.ts
export function generateTestData(overrides: Partial<any> = {}) {
  return {
    name: `Test ${Date.now()}`,
    description: 'Test description',
    ...overrides,
  };
}
```

## 🚨 Troubleshooting

### Common Issues

#### Tests Failing on CI

- Ensure Playwright browsers are installed: `npx playwright install`
- Check that the development server is running
- Verify environment variables are set correctly

#### Element Not Found

- Use fallback selectors in test utilities
- Check if elements are conditionally rendered
- Verify page has fully loaded before interactions

#### Authentication Issues

- Ensure test user credentials are valid
- Check that the login API is working
- Verify redirect behavior after login

#### Network Errors

- Check API endpoints are accessible
- Verify mock implementations are correct
- Ensure proper error handling in tests

### Getting Help

1. Check the test output for detailed error messages
2. Review the HTML report for visual debugging
3. Use debug mode to step through tests
4. Check the application logs for server-side issues
5. Verify the development environment is properly configured

## 📈 Performance Considerations

### Test Execution Time

- **Target**: Complete test suite under 5 minutes
- **Individual Tests**: Each test under 30 seconds
- **Page Loads**: Under 10 seconds per page

### Optimization Strategies

- **Parallel Execution**: Tests run in parallel when possible
- **Efficient Selectors**: Use data-testid attributes for reliable selection
- **Smart Waiting**: Wait for specific elements rather than arbitrary delays
- **Resource Mocking**: Mock heavy resources when appropriate

## 🔒 Security Testing

The E2E tests include security validation:

- **Authentication**: Tests proper login/logout flows
- **Authorization**: Verifies protected route access
- **Data Exposure**: Ensures sensitive data isn't exposed
- **Input Validation**: Tests form validation and sanitization
- **Session Management**: Verifies proper session handling

## 🌐 Cross-Browser Testing

Tests run on multiple browsers:

- **Chromium**: Primary development browser
- **Firefox**: Secondary browser for compatibility
- **WebKit**: Safari compatibility testing
- **Mobile**: Mobile Chrome and Safari testing

## 📱 Mobile Testing

Mobile-specific tests ensure responsive design:

- **Touch Interactions**: Tap, swipe, pinch gestures
- **Viewport Testing**: Different screen sizes and orientations
- **Performance**: Mobile-specific performance metrics
- **Accessibility**: Mobile accessibility features

## 🎯 Future Enhancements

### Planned Features

- **Visual Regression Testing**: Screenshot comparison testing
- **Performance Testing**: Load time and performance metrics
- **Accessibility Testing**: Automated accessibility validation
- **Internationalization**: Multi-language testing support
- **API Testing**: Direct API endpoint testing
- **Database Testing**: Test data cleanup and validation

### Integration Opportunities

- **CI/CD Pipeline**: Automated testing in deployment
- **Test Reporting**: Integration with reporting tools
- **Performance Monitoring**: Integration with monitoring tools
- **Error Tracking**: Integration with error tracking services

---

## 📞 Support

For questions or issues with the E2E testing suite:

1. Check this documentation first
2. Review test output and error messages
3. Check the application logs
4. Review the Playwright documentation
5. Create an issue with detailed reproduction steps

**Happy Testing! 🧪✨**
