# Test Mocking Strategy

This document outlines the new, simplified test mocking strategy for the Shabra OS project.

## Overview

The new mocking strategy follows the YAGNI (You Ain't Gonna Need It) principle, providing a simple, consistent approach to test mocking without over-engineering.

## Key Principles

1. **Centralized**: All mocks are defined in one place
2. **Consistent**: Same patterns across all tests
3. **Simple**: Easy to understand and maintain
4. **Reusable**: Common patterns are shared

## Structure

```
src/test/
├── mocks/
│   ├── index.ts          # Main exports
│   ├── factory.ts        # Mock data factories
│   ├── prisma.ts         # Prisma mocks
│   ├── services.ts       # Service mocks
│   └── auth.ts           # Auth mocks
├── utils/
│   └── test-helpers.ts   # Test utilities
└── setup.tsx            # Global test setup
```

## Usage

### Basic Mock Data

```typescript
import { createMockUser, createMockProject, createMockTask } from '@/test/mocks';

// Create basic mock data
const user = createMockUser();
const project = createMockProject();
const task = createMockTask();

// Override specific fields
const adminUser = createMockUser({ role: 'ADMIN' });
const activeProject = createMockProject({ status: 'ACTIVE' });
```

### Test Helpers

```typescript
import { createTestData, setupMockAuth, resetAllMocks } from '@/test/utils/test-helpers';

// Use predefined test scenarios
const adminUser = createTestData.adminUser();
const pendingTask = createTestData.pendingTask();

// Setup auth for specific tests
setupMockAuth({ user: { role: 'MANAGER' } });

// Reset mocks between tests
beforeEach(() => {
  resetAllMocks();
});
```

### Service Mocks

```typescript
import { mockStoryService, mockProjectService } from '@/test/mocks';

// Services are automatically mocked globally
// Customize behavior in individual tests
mockStoryService.createStory.mockResolvedValue(customStory);
mockProjectService.getProjects.mockResolvedValue(customProjects);
```

### Prisma Mocks

```typescript
import { mockPrisma } from '@/test/mocks';

// Prisma is automatically mocked globally
// Customize behavior in individual tests
mockPrisma.user.findUnique.mockResolvedValue(customUser);
mockPrisma.project.create.mockResolvedValue(customProject);
```

## Migration Guide

### Before (Old Approach)

```typescript
// Scattered mock definitions
const mockUser = {
  id: 'user-123',
  firstName: 'John',
  // ... hardcoded data
};

// Inconsistent mock setup
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn().mockResolvedValue(mockUser),
    },
  },
}));
```

### After (New Approach)

```typescript
// Centralized mock data
import { createMockUser } from '@/test/mocks';

const mockUser = createMockUser({ firstName: 'John' });

// Automatic global mocking
// Customize only when needed
mockPrisma.user.findUnique.mockResolvedValue(mockUser);
```

## Best Practices

1. **Use factory functions** for creating mock data
2. **Override only what you need** in individual tests
3. **Reset mocks** between tests using `resetAllMocks()`
4. **Use test helpers** for common patterns
5. **Keep mocks simple** - don't over-engineer

## Common Patterns

### Testing API Routes

```typescript
import { createMockSession, createTestData } from '@/test/mocks';

describe('API Route', () => {
  beforeEach(() => {
    setupMockAuth(createMockSession());
    mockPrisma.task.findMany.mockResolvedValue([createTestData.pendingTask()]);
  });

  it('should return tasks', async () => {
    // Test implementation
  });
});
```

### Testing Components

```typescript
import { createTestData } from '@/test/mocks';

describe('Component', () => {
  it('should render user data', () => {
    const user = createTestData.regularUser();
    render(<UserComponent user={user} />);
    // Assertions
  });
});
```

## Benefits

1. **Reduced duplication** - Common mock patterns are shared
2. **Easier maintenance** - Changes in one place affect all tests
3. **Better consistency** - All tests use the same patterns
4. **Simpler tests** - Less boilerplate code
5. **Type safety** - TypeScript support for mock data

## Troubleshooting

### Mock not working?

1. Check if the mock is imported correctly
2. Ensure `resetAllMocks()` is called in `beforeEach`
3. Verify the mock is set up before the code under test runs

### Need custom behavior?

1. Use factory functions with overrides
2. Set up mocks in individual test `beforeEach` blocks
3. Use `vi.mocked()` for type-safe mock access

## Future Improvements

- Add more predefined test scenarios
- Create mock data generators for edge cases
- Add integration test helpers
- Consider mock data validation
