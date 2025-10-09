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

describe('Attendance Stats API Route', () => {
  const mockSession = {
    user: {
      id: 'user-123',
      email: 'test@example.com',
      roles: ['EMPLOYEE'],
    },
  };

  const mockAttendanceRecords = [
    {
      id: 'attendance-1',
      userId: 'user-123',
      checkIn: new Date('2024-01-15T09:00:00Z'),
      checkOut: new Date('2024-01-15T17:00:00Z'),
      createdAt: new Date('2024-01-15T09:00:00Z'),
      updatedAt: new Date('2024-01-15T17:00:00Z'),
    },
    {
      id: 'attendance-2',
      userId: 'user-123',
      checkIn: new Date('2024-01-14T08:30:00Z'),
      checkOut: new Date('2024-01-14T16:30:00Z'),
      createdAt: new Date('2024-01-14T08:30:00Z'),
      updatedAt: new Date('2024-01-14T16:30:00Z'),
    },
    {
      id: 'attendance-3',
      userId: 'user-123',
      checkIn: new Date('2024-01-13T09:15:00Z'),
      checkOut: null, // Still clocked in
      createdAt: new Date('2024-01-13T09:15:00Z'),
      updatedAt: new Date('2024-01-13T09:15:00Z'),
    },
  ];

  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup default mocks
    const { auth } = await import('@/auth');
    const { prisma } = await import('@/lib/prisma');

    vi.mocked(auth).mockResolvedValue(mockSession);
    vi.mocked(prisma.attendance.findMany).mockResolvedValue(mockAttendanceRecords as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/attendance/stats', () => {
    it('returns attendance statistics for authenticated user', async () => {
      const request = new NextRequest('http://localhost:3000/api/attendance/stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('today');
      expect(data.data).toHaveProperty('thisWeek');
      expect(data.data).toHaveProperty('thisMonth');
      expect(data.data).toHaveProperty('thisYear');
      expect(data.data).toHaveProperty('recentRecords');
    });

    it('calculates correct total hours', async () => {
      const request = new NextRequest('http://localhost:3000/api/attendance/stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      // Check that total hours are calculated correctly
      expect(data.data.today.totalHours).toBeGreaterThan(0);
      expect(data.data.thisWeek.totalHours).toBeGreaterThan(0);
      expect(data.data.thisMonth.totalHours).toBeGreaterThan(0);
      expect(data.data.thisYear.totalHours).toBeGreaterThan(0);
    });

    it('includes recent records in correct format', async () => {
      const request = new NextRequest('http://localhost:3000/api/attendance/stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data.recentRecords)).toBe(true);
      
      if (data.data.recentRecords.length > 0) {
        const record = data.data.recentRecords[0];
        expect(record).toHaveProperty('id');
        expect(record).toHaveProperty('date');
        expect(record).toHaveProperty('checkIn');
        expect(record).toHaveProperty('status');
      }
    });

    it('returns 401 when user is not authenticated', async () => {
      const { auth } = await import('@/auth');
      vi.mocked(auth).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/attendance/stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.message).toBe('Unauthorized');
    });

    it('handles database errors gracefully', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { DatabaseError } = await import('@/lib/utils/error-handler');
      vi.mocked(prisma.attendance.findMany).mockRejectedValue(
        new DatabaseError('Database error')
      );

      const request = new NextRequest('http://localhost:3000/api/attendance/stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.message).toBe('Database error');
    });

    it('calculates working days correctly', async () => {
      const request = new NextRequest('http://localhost:3000/api/attendance/stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      // Check that working days are calculated
      expect(data.data.thisWeek.workingDays).toBeGreaterThan(0);
      expect(data.data.thisMonth.workingDays).toBeGreaterThan(0);
      expect(data.data.thisYear.workingDays).toBeGreaterThan(0);
    });

    it('handles empty attendance records', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.attendance.findMany).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/attendance/stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.today.totalHours).toBe(0);
      expect(data.data.thisWeek.totalHours).toBe(0);
      expect(data.data.thisMonth.totalHours).toBe(0);
      expect(data.data.thisYear.totalHours).toBe(0);
      expect(data.data.recentRecords).toEqual([]);
    });
  });
});
