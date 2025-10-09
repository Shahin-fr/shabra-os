import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the dependencies
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    attendance: {
      findMany: vi.fn(),
    },
    user: {
      count: vi.fn(),
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
import { GET } from './route';

describe('Admin Attendance Stats API Route', () => {
  const mockSession = {
    user: {
      id: 'admin-123',
      email: 'admin@example.com',
      roles: ['ADMIN'],
    },
  };

  const mockAttendanceRecords = [
    {
      id: 'attendance-1',
      userId: 'user-1',
      checkIn: new Date('2024-01-15T09:00:00Z'),
      checkOut: new Date('2024-01-15T17:00:00Z'),
      user: {
        id: 'user-1',
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice@example.com',
      },
    },
    {
      id: 'attendance-2',
      userId: 'user-2',
      checkIn: new Date('2024-01-15T08:30:00Z'),
      checkOut: new Date('2024-01-15T16:30:00Z'),
      user: {
        id: 'user-2',
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob@example.com',
      },
    },
    {
      id: 'attendance-3',
      userId: 'user-3',
      checkIn: new Date('2024-01-15T09:15:00Z'),
      checkOut: null, // Still clocked in
      user: {
        id: 'user-3',
        firstName: 'Charlie',
        lastName: 'Brown',
        email: 'charlie@example.com',
      },
    },
  ];

  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup default mocks
    const { auth } = await import('@/auth');
    const { prisma } = await import('@/lib/prisma');

    vi.mocked(auth).mockResolvedValue(mockSession);
    vi.mocked(prisma.attendance.findMany).mockResolvedValue(mockAttendanceRecords as any);
    vi.mocked(prisma.user.count).mockResolvedValue(10);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/admin/attendance/stats', () => {
    it('returns attendance statistics for admin users', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/attendance/stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('today');
      expect(data.data).toHaveProperty('week');
      expect(data.data).toHaveProperty('overall');
    });

    it('calculates correct today statistics', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/attendance/stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      expect(data.data.today.totalEmployeesPresent).toBe(3);
      expect(data.data.today.totalHoursLogged).toBeGreaterThan(0);
      expect(data.data.today.currentlyClockedIn).toBe(1);
      expect(data.data.today.attendanceRate).toBe(30); // 3 out of 10 employees
    });

    it('returns 401 when user is not authenticated', async () => {
      const { auth } = await import('@/auth');
      vi.mocked(auth).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/admin/attendance/stats');
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
          id: 'user-123',
          email: 'employee@example.com',
          roles: ['EMPLOYEE'],
        },
      });

      const request = new NextRequest('http://localhost:3000/api/admin/attendance/stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('Insufficient permissions');
    });

    it('handles database errors gracefully', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { DatabaseError } = await import('@/lib/utils/error-handler');
      vi.mocked(prisma.attendance.findMany).mockRejectedValue(
        new DatabaseError('Database error')
      );

      const request = new NextRequest('http://localhost:3000/api/admin/attendance/stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.message).toBe('Database error');
    });

    it('calculates average clock-in time correctly', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/attendance/stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      // Should have a valid time format (HH:MM)
      expect(data.data.today.averageClockInTime).toMatch(/^\d{2}:\d{2}$/);
    });

    it('handles empty attendance records', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.attendance.findMany).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/admin/attendance/stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.today.totalEmployeesPresent).toBe(0);
      expect(data.data.today.totalHoursLogged).toBe(0);
      expect(data.data.today.currentlyClockedIn).toBe(0);
    });
  });
});
