/**
 * Centralized E2E Test Configuration
 * Simple, direct configuration management following YAGNI principles
 */

export const TEST_CONFIG = {
  // Test environment settings
  baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
  timeout: {
    action: 10000,
    navigation: 30000,
    global: 60000,
  },
  
  // Test data
  users: {
    valid: {
      email: process.env.TEST_USER_EMAIL || 'test@shabra.com',
      password: process.env.TEST_USER_PASSWORD || 'testpassword123',
    },
    invalid: {
      email: 'invalid-email',
      password: 'wrongpassword',
    },
  },
  
  // Test project data
  project: {
    name: 'Test Project E2E',
    description: 'This is a test project created during E2E testing',
    startDate: '2024-01-15',
    endDate: '2024-12-31',
    status: 'active',
    priority: 'medium',
  },
  
  // Test story data
  story: {
    title: 'Test Story E2E',
    content: 'This is a test story created during E2E testing',
    type: 'article',
    status: 'draft',
    priority: 'medium',
    tags: ['test', 'e2e'],
    publishDate: '2024-01-15',
  },
  
  // Edge case test data
  edgeCases: {
    longText: 'A'.repeat(1000),
    specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    unicodeText: 'مرحبا بالعالم 🌍',
    emptyString: '',
    whitespaceOnly: '   ',
    veryLongName: 'A'.repeat(255),
  },
  
  // Performance thresholds
  performance: {
    pageLoadMax: 5000, // 5 seconds
    actionMax: 2000,   // 2 seconds
    networkSlow: 3000, // 3 seconds delay
    // Enhanced performance thresholds
    criticalPageLoadMax: 3000, // 3 seconds for critical pages
    apiResponseMax: 1000,      // 1 second for API responses
    formSubmissionMax: 1500,   // 1.5 seconds for form submissions
    navigationMax: 2000,       // 2 seconds for page navigation
    memoryUsageMax: 100,        // 100MB max memory usage
    bundleSizeMax: 2 * 1024 * 1024, // 2MB max bundle size
  },
  
  // Accessibility test selectors
  accessibility: {
    focusableElements: [
      'button',
      'input',
      'select',
      'textarea',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
    ],
    requiredAriaAttributes: ['aria-label', 'aria-labelledby', 'aria-describedby'],
  },
};

export const TEST_SELECTORS = {
  // Common selectors with fallbacks
  login: {
    emailInput: 'input[type="email"], [data-testid="email-input"]',
    passwordInput: 'input[type="password"], [data-testid="password-input"]',
    submitButton: 'button[type="submit"], [data-testid="login-button"]',
    errorMessage: '[data-testid="error-message"], .error-message',
  },
  
  projects: {
    createButton: 'button:has-text("ایجاد پروژه"), [data-testid="create-project"]',
    projectList: '[data-testid="projects-list"], .projects-list',
    projectCard: '[data-testid="project-card"], .project-card',
  },
  
  storyboard: {
    calendar: '[data-testid="calendar"], .calendar',
    createStoryButton: 'button:has-text("ایجاد استوری"), [data-testid="create-story"]',
    storyList: '[data-testid="stories-list"], .stories-list',
  },
  
  meetings: {
    createButton: 'button:has-text("جلسه جدید"), [data-testid="create-meeting"]',
    meetingList: '[data-testid="meetings-list"], .meetings-list',
  },
};

export const TEST_ROUTES = {
  login: '/login',
  dashboard: '/',
  projects: '/projects',
  storyboard: '/storyboard',
  meetings: '/meetings',
  protected: ['/projects', '/storyboard', '/meetings', '/dashboard'],
};
