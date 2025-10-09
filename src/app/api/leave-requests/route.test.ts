import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the dependencies
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    leaveRequest: {
      findMany: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
    },
  },
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

describe('Leave Requests API Route', () => {
  const mockSession = {
    user: {
      id: 'user-123',
      email: 'user@example.com',
      roles: ['EMPLOYEE'],
    },
  };

  const mockLeaveRequest = {
    id: 'leave-123',
    userId: 'user-123',
    leaveType: 'ANNUAL',
    startDate: new Date('2024-02-01T00:00:00Z'),
    endDate: new Date('2024-02-05T00:00:00Z'),
    reason: 'Annual vacation with family',
    status: 'PENDING',
    createdAt: new Date('2024-01-15T00:00:00Z'),
    updatedAt: new Date('2024-01-15T00:00:00Z'),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup default mocks
    const { auth } = await import('@/auth');
    const { prisma } = await import('@/lib/prisma');

    vi.mocked(auth).mockResolvedValue(mockSession);
    vi.mocked(prisma.leaveRequest.findMany).mockResolvedValue([mockLeaveRequest] as any);
    vi.mocked(prisma.leaveRequest.create).mockResolvedValue(mockLeaveRequest as any);
    vi.mocked(prisma.leaveRequest.findFirst).mockResolvedValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/leave-requests', () => {
    it('returns leave requests for authenticated user', async () => {
      const request = new NextRequest('http://localhost:3000/api/leave-requests');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].id).toBe('leave-123');
    });

    it('returns 401 when user is not authenticated', async () => {
      const { auth } = await import('@/auth');
      vi.mocked(auth).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/leave-requests');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.message).toBe('Unauthorized');
    });

    it('handles database errors gracefully', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { DatabaseError } = await import('@/lib/utils/error-handler');
      vi.mocked(prisma.leaveRequest.findMany).mockRejectedValue(new DatabaseError('DB Error'));

      const request = new NextRequest('http://localhost:3000/api/leave-requests');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.message).toBe('DB Error');
    });
  });

  describe('POST /api/leave-requests', () => {
    it('creates a new leave request for authenticated user', async () => {
      const requestBody = {
        leaveType: 'ANNUAL',
        startDate: '2024-02-01T00:00:00Z',
        endDate: '2024-02-05T00:00:00Z',
        reason: 'Annual vacation with family',
      };

      const request = new NextRequest('http://localhost:3000/api/leave-requests', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('leave-123');
    });

    it('returns 401 when user is not authenticated', async () => {
      const { auth } = await import('@/auth');
      vi.mocked(auth).mockResolvedValue(null);

      const requestBody = {
        leaveType: 'ANNUAL',
        startDate: '2024-02-01T00:00:00Z',
        endDate: '2024-02-05T00:00:00Z',
        reason: 'Annual vacation with family',
      };

      const request = new NextRequest('http://localhost:3000/api/leave-requests', {
        method: 'POST',
        body: JSON.stringify(requestBody),
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

    it('validates request body correctly', async () => {
      const invalidRequestBody = {
        leaveType: 'INVALID_TYPE',
        startDate: 'invalid-date',
        endDate: '2024-02-05T00:00:00Z',
        reason: 'Short',
      };

      const request = new NextRequest('http://localhost:3000/api/leave-requests', {
        method: 'POST',
        body: JSON.stringify(invalidRequestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toBe('Create DTO validation failed: Required, Required');
    });

    it('prevents overlapping leave requests', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.leaveRequest.findFirst).mockResolvedValue(mockLeaveRequest as any);

      const requestBody = {
        leaveType: 'ANNUAL',
        startDate: '2024-02-01T00:00:00Z',
        endDate: '2024-02-05T00:00:00Z',
        reason: 'Annual vacation with family',
      };

      const request = new NextRequest('http://localhost:3000/api/leave-requests', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('pending or approved leave request');
    });

    it('validates end date is after start date', async () => {
      const requestBody = {
        leaveType: 'ANNUAL',
        startDate: '2024-02-05T00:00:00Z',
        endDate: '2024-02-01T00:00:00Z', // End before start
        reason: 'Annual vacation with family',
      };

      const request = new NextRequest('http://localhost:3000/api/leave-requests', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toBe('Create DTO validation failed: Required, Required');
    });
  });
});
