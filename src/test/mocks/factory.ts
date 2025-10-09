import { vi } from 'vitest';

/**
 * Centralized Mock Factory System
 * 
 * This provides a simple, consistent way to create mocks across all tests.
 * Following YAGNI principle - only what we need, nothing more.
 */

// Base mock data generators
export const createMockUser = (overrides: Partial<any> = {}) => ({
  id: 'clh1234567890123456789012',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  password: 'hashed-password-123',
  avatar: 'https://example.com/avatar.jpg',
  isActive: true,
  roles: ['USER'],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockProject = (overrides: Partial<any> = {}) => ({
  id: 'clh1234567890123456789013',
  name: 'Test Project',
  description: 'Test Project Description',
  status: 'ACTIVE',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockTask = (overrides: Partial<any> = {}) => ({
  id: 'clh1234567890123456789014',
  title: 'Test Task',
  description: 'Test Task Description',
  status: 'PENDING',
  priority: 'MEDIUM',
  dueDate: new Date('2024-12-31'),
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  projectId: 'clh1234567890123456789013',
  assignedTo: 'clh1234567890123456789012',
  createdBy: 'clh1234567890123456789012',
  ...overrides,
});

export const createMockStory = (overrides: Partial<any> = {}) => ({
  id: 'story-123',
  title: 'Test Story',
  notes: 'Test notes',
  visualNotes: 'Test visual notes',
  link: 'https://example.com',
  day: '2024-01-01T00:00:00Z',
  order: 1,
  status: 'DRAFT',
  projectId: 'project-1',
  storyTypeId: 'type-1',
  ...overrides,
});

export const createMockSession = (overrides: Partial<any> = {}) => ({
  user: {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    roles: ['USER'],
    ...overrides.user,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  ...overrides,
});

// Authentication-specific mock data
export const createMockCredentials = (overrides: Partial<any> = {}) => ({
  email: 'test@example.com',
  password: 'password123',
  ...overrides,
});

export const createMockAuthUser = (overrides: Partial<any> = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  avatar: 'https://example.com/avatar.jpg',
  isActive: true,
  roles: ['USER', 'ADMIN'],
  password: 'hashed-password-123',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

// Predefined user scenarios for common test cases
export const createTestUsers = {
  admin: (overrides: Partial<any> = {}) => createMockUser({ 
    roles: ['ADMIN'], 
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    ...overrides
  }),
  manager: (overrides: Partial<any> = {}) => createMockUser({ 
    roles: ['MANAGER'], 
    email: 'manager@example.com',
    firstName: 'Manager',
    lastName: 'User',
    ...overrides
  }),
  employee: (overrides: Partial<any> = {}) => createMockUser({ 
    roles: ['EMPLOYEE'], 
    email: 'employee@example.com',
    firstName: 'Employee',
    lastName: 'User',
    ...overrides
  }),
  inactive: (overrides: Partial<any> = {}) => createMockUser({ 
    isActive: false,
    email: 'inactive@example.com',
    ...overrides
  }),
  noRoles: (overrides: Partial<any> = {}) => createMockUser({ 
    roles: [],
    email: 'noroles@example.com',
    ...overrides
  }),
};

// Mock response helpers
export const createMockResponse = (data: any, ok: boolean = true, status: number = 200) => ({
  ok,
  status,
  statusText: ok ? 'OK' : 'Not Found',
  json: vi.fn().mockResolvedValue(data),
  headers: new Headers(),
  redirected: false,
  type: 'default' as ResponseType,
  url: '',
  body: null,
  bodyUsed: false,
  arrayBuffer: vi.fn(),
  blob: vi.fn(),
  formData: vi.fn(),
  text: vi.fn(),
  clone: vi.fn(),
  bytes: vi.fn(),
});

// Prisma mock factory
export const createPrismaMock = () => {
  const baseMock = {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    aggregate: vi.fn(),
  };

  return {
    user: { ...baseMock },
    project: { ...baseMock },
    task: { ...baseMock },
    story: { ...baseMock },
    storyType: { ...baseMock },
    wiki: { ...baseMock },
    contentSlot: { ...baseMock },
    document: { ...baseMock },
    storyIdea: { ...baseMock },
    attendance: { ...baseMock },
    $transaction: vi.fn(),
  };
};

// Service mock factory
export const createServiceMock = (methods: string[]) => {
  const mock: Record<string, any> = {};
  methods.forEach(method => {
    mock[method] = vi.fn();
  });
  return mock;
};
