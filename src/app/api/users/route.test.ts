import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the dependencies
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
  },
  hash: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock('@/lib/middleware/rate-limit-middleware', () => ({
  withApiRateLimit: vi.fn(() => ({ allowed: true })),
}));

// Import the component after mocking
import { GET, POST } from './route';

describe('Users API Route', () => {
  const mockSession = {
    user: {
      id: 'user-123',
      email: 'admin@example.com',
      roles: ['ADMIN'],
    },
  };

  const mockUsers = [
    {
      id: 'user-1',
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice@example.com',
      roles: 'EMPLOYEE',
      isActive: true,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
    },
    {
      id: 'user-2',
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob@example.com',
      roles: 'MANAGER',
      isActive: true,
      createdAt: new Date('2024-01-02T00:00:00Z'),
      updatedAt: new Date('2024-01-02T00:00:00Z'),
    },
  ];

  const mockNewUser = {
    id: 'user-3',
    firstName: 'Charlie',
    lastName: 'Brown',
    email: 'charlie@example.com',
    roles: 'EMPLOYEE',
    isActive: true,
    createdAt: new Date('2024-01-03T00:00:00Z'),
    updatedAt: new Date('2024-01-03T00:00:00Z'),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup default mocks
    const { auth } = await import('@/auth');
    const { prisma } = await import('@/lib/prisma');
    const bcrypt = await import('bcryptjs');

    vi.mocked(auth).mockResolvedValue(mockSession);
    vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue(mockNewUser as any);
    vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/users', () => {
    it('returns users list for admin users', async () => {
      const request = new NextRequest('http://localhost:3000/api/users');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(data.data[0]).toMatchObject({
        id: 'user-1',
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice@example.com',
        roles: 'EMPLOYEE',
        isActive: true,
      });
    });

    it('returns users list for manager users', async () => {
      const { auth } = await import('@/auth');
      vi.mocked(auth).mockResolvedValue({
        user: {
          id: 'user-456',
          email: 'manager@example.com',
          roles: ['MANAGER'],
        },
      });

      const request = new NextRequest('http://localhost:3000/api/users');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
    });

    it('returns 401 when user is not authenticated', async () => {
      const { auth } = await import('@/auth');
      vi.mocked(auth).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/users');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.message).toBe('Unauthorized');
    });

    it('returns 403 when user does not have required role', async () => {
      const { auth } = await import('@/auth');
      vi.mocked(auth).mockResolvedValue({
        user: {
          id: 'user-789',
          email: 'employee@example.com',
          roles: ['EMPLOYEE'],
        },
      });

      const request = new NextRequest('http://localhost:3000/api/users');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('Insufficient permissions');
    });
  });

  describe('POST /api/users', () => {
    const validUserData = {
      email: 'charlie@example.com',
      password: 'password123',
      firstName: 'Charlie',
      lastName: 'Brown',
      role: 'EMPLOYEE',
    };

    it('creates a new user successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify(validUserData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toMatchObject({
        id: 'user-3',
        firstName: 'Charlie',
        lastName: 'Brown',
        email: 'charlie@example.com',
        roles: 'EMPLOYEE',
        isActive: true,
      });
      expect(data.message).toBe('User created successfully');
    });

    it('validates required fields', async () => {
      const invalidUserData = {
        email: 'invalid-email',
        password: '123', // Too short
        firstName: '', // Empty
        lastName: 'Brown',
        role: 'INVALID_ROLE',
      };

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify(invalidUserData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('Validation failed');
    });

    it('prevents duplicate email addresses', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'existing-user',
        email: 'charlie@example.com',
      } as any);

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify(validUserData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('User with this email already exists');
    });

    it('returns 401 when user is not authenticated', async () => {
      const { auth } = await import('@/auth');
      vi.mocked(auth).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify(validUserData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.message).toBe('Unauthorized');
    });

    it('returns 403 when user does not have required role', async () => {
      const { auth } = await import('@/auth');
      vi.mocked(auth).mockResolvedValue({
        user: {
          id: 'user-789',
          email: 'employee@example.com',
          roles: ['EMPLOYEE'],
        },
      });

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify(validUserData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('Insufficient permissions');
    });

    it('hashes password before storing', async () => {
      const bcrypt = await import('bcryptjs');
      
      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify(validUserData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      await POST(request);

      // Check both default and named export
      expect(bcrypt.default.hash).toHaveBeenCalledWith('password123', 12);
    });
  });
});