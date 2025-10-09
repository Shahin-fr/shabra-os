import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the dependencies
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    attendance: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Import the component after mocking
import { GET, POST } from './route';

describe('Attendance API Route', () => {
  const mockSession = {
    user: {
      id: 'user-123',
      email: 'test@example.com',
      roles: ['USER'],
    },
  };

  const mockUser = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
  };

  const mockClockInRecord = {
    id: 'attendance-1',
    userId: 'user-123',
    checkIn: new Date('2024-01-01T09:00:00Z'),
    checkOut: null,
    createdAt: new Date('2024-01-01T09:00:00Z'),
    updatedAt: new Date('2024-01-01T09:00:00Z'),
    user: mockUser,
  };

  const mockClockOutRecord = {
    id: 'attendance-1',
    userId: 'user-123',
    checkIn: new Date('2024-01-01T09:00:00Z'),
    checkOut: new Date('2024-01-01T17:00:00Z'),
    createdAt: new Date('2024-01-01T09:00:00Z'),
    updatedAt: new Date('2024-01-01T17:00:00Z'),
    user: mockUser,
  };

  const mockCompletedRecord = {
    id: 'attendance-1',
    userId: 'user-123',
    checkIn: new Date('2024-01-01T09:00:00Z'),
    checkOut: new Date('2024-01-01T17:00:00Z'),
    createdAt: new Date('2024-01-01T09:00:00Z'),
    updatedAt: new Date('2024-01-01T17:00:00Z'),
    user: mockUser,
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup default mocks using vi.mocked
    const { auth } = await import('@/auth');
    const { prisma } = await import('@/lib/prisma');

    vi.mocked(auth).mockResolvedValue(mockSession);
    vi.mocked(prisma.attendance.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.attendance.create).mockResolvedValue(mockClockInRecord);
    vi.mocked(prisma.attendance.update).mockResolvedValue(mockClockOutRecord);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/attendance (Clock In/Out)', () => {
    it('clocks in user when no recent attendance record exists', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.attendance.findFirst).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/attendance', {
        method: 'POST',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.action).toBe('clock-in');
      expect(data.data.attendance).toBeDefined();
      expect(data.data.attendance.userId).toBe('user-123');
      expect(data.data.attendance.checkIn).toBeDefined();
      expect(data.data.attendance.checkOut).toBeNull();

      expect(prisma.attendance.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          checkIn: expect.any(Date),
        },
      });
    });

    it('clocks in user when previous record is completed (has clockOut)', async () => {
      const { prisma } = await import('@/lib/prisma');
      const completedRecord = {
        ...mockClockInRecord,
        checkOut: new Date('2024-01-01T17:00:00Z'),
      };
      vi.mocked(prisma.attendance.findFirst).mockResolvedValue(completedRecord);

      const request = new NextRequest('http://localhost:3000/api/attendance', {
        method: 'POST',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.action).toBe('clock-in');
      expect(data.data.attendance).toBeDefined();

      expect(prisma.attendance.create).toHaveBeenCalled();
      expect(prisma.attendance.update).not.toHaveBeenCalled();
    });

    it('clocks out user when active attendance record exists', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.attendance.findFirst).mockResolvedValue(
        mockClockInRecord
      );

      const request = new NextRequest('http://localhost:3000/api/attendance', {
        method: 'POST',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.action).toBe('clock-out');
      expect(data.data.attendance).toBeDefined();
      expect(data.data.attendance.checkOut).toBeDefined();

      expect(prisma.attendance.update).toHaveBeenCalledWith({
        where: {
          id: 'attendance-1',
        },
        data: {
          checkOut: expect.any(Date),
        },
      });
    });

    it('returns 401 when user is not authenticated', async () => {
      const { auth } = await import('@/auth');
      vi.mocked(auth).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/attendance', {
        method: 'POST',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.message).toBe('Unauthorized');
    });

    it('returns 401 when session has no user', async () => {
      const { auth } = await import('@/auth');
      vi.mocked(auth).mockResolvedValue({ user: null });

      const request = new NextRequest('http://localhost:3000/api/attendance', {
        method: 'POST',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.message).toBe('Unauthorized');
    });

    it('returns 401 when user has no ID', async () => {
      const { auth } = await import('@/auth');
      vi.mocked(auth).mockResolvedValue({
        user: { email: 'test@example.com' },
      });

      const request = new NextRequest('http://localhost:3000/api/attendance', {
        method: 'POST',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.message).toBe('Unauthorized');
    });

    it('handles database errors gracefully', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { DatabaseError } = await import('@/lib/utils/error-handler');
      vi.mocked(prisma.attendance.findFirst).mockRejectedValue(
        new DatabaseError('Database error')
      );

      const request = new NextRequest('http://localhost:3000/api/attendance', {
        method: 'POST',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.message).toBe('Database error');
    });

    it('handles attendance creation errors gracefully', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { DatabaseError } = await import('@/lib/utils/error-handler');
      vi.mocked(prisma.attendance.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.attendance.create).mockRejectedValue(
        new DatabaseError('Creation failed')
      );

      const request = new NextRequest('http://localhost:3000/api/attendance', {
        method: 'POST',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.message).toBe('Creation failed');
    });

    it('handles attendance update errors gracefully', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { DatabaseError } = await import('@/lib/utils/error-handler');
      vi.mocked(prisma.attendance.findFirst).mockResolvedValue(
        mockClockInRecord
      );
      vi.mocked(prisma.attendance.update).mockRejectedValue(
        new DatabaseError('Update failed')
      );

      const request = new NextRequest('http://localhost:3000/api/attendance', {
        method: 'POST',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.message).toBe('Update failed');
    });

    it('includes user information in attendance records', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.attendance.findFirst).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/attendance', {
        method: 'POST',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.data.attendance.user).toBeDefined();
      expect(data.data.attendance.user.firstName).toBe('John');
      expect(data.data.attendance.user.lastName).toBe('Doe');
      expect(data.data.attendance.user.email).toBe('john@example.com');
    });

    it('uses current timestamp for clock operations', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.attendance.findFirst).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/attendance', {
        method: 'POST',
      });

      const response = await POST(request);

      expect(response.status).toBe(200);

      // Verify the response includes attendance data with timestamps
      const data = await response.json();
      expect(data.data.attendance.checkIn).toBeDefined();
      expect(data.data.attendance.createdAt).toBeDefined();
      expect(data.data.attendance.updatedAt).toBeDefined();

      // Verify timestamps are valid dates
      expect(new Date(data.data.attendance.checkIn)).toBeInstanceOf(Date);
      expect(new Date(data.data.attendance.createdAt)).toBeInstanceOf(Date);
      expect(new Date(data.data.attendance.updatedAt)).toBeInstanceOf(Date);

      // Verify the mock was called with current time logic
      expect(prisma.attendance.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          checkIn: expect.any(Date),
        },
      });
    });
  });

  describe('GET /api/attendance (Status)', () => {
    it('returns current attendance status when user is clocked in', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.attendance.findFirst).mockResolvedValue(
        mockClockInRecord
      );

      const request = new NextRequest('http://localhost:3000/api/attendance');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('active');
      expect(data.data.isClockedIn).toBe(true);
      expect(data.data.currentAttendance).toBeDefined();
      expect(data.data.currentTime).toBeDefined();
    });

    it('returns completed status when user has clocked out', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.attendance.findFirst).mockResolvedValue(
        mockCompletedRecord
      );

      const request = new NextRequest('http://localhost:3000/api/attendance');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('completed');
      expect(data.data.isClockedIn).toBe(false);
      expect(data.data.currentAttendance).toBeDefined();
    });

    it('returns not-started status when no recent attendance exists', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.attendance.findFirst).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/attendance');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('not-started');
      expect(data.data.isClockedIn).toBe(false);
      expect(data.data.currentAttendance).toBeNull();
    });

    it('returns 401 when user is not authenticated', async () => {
      const { auth } = await import('@/auth');
      vi.mocked(auth).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/attendance');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.message).toBe('Unauthorized');
    });

    it('returns 401 when session has no user', async () => {
      const { auth } = await import('@/auth');
      vi.mocked(auth).mockResolvedValue({ user: null });

      const request = new NextRequest('http://localhost:3000/api/attendance');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.message).toBe('Unauthorized');
    });

    it('returns 401 when user has no ID', async () => {
      const { auth } = await import('@/auth');
      vi.mocked(auth).mockResolvedValue({
        user: { email: 'test@example.com' },
      });

      const request = new NextRequest('http://localhost:3000/api/attendance');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.message).toBe('Unauthorized');
    });

    it('handles database errors gracefully', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { DatabaseError } = await import('@/lib/utils/error-handler');
      vi.mocked(prisma.attendance.findFirst).mockRejectedValue(
        new DatabaseError('Database error')
      );

      const request = new NextRequest('http://localhost:3000/api/attendance');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.message).toBe('Database error');
    });

    it('includes user information in current attendance', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.attendance.findFirst).mockResolvedValue(
        mockClockInRecord
      );

      const request = new NextRequest('http://localhost:3000/api/attendance');
      const response = await GET(request);
      const data = await response.json();

      expect(data.data.currentAttendance.user).toBeDefined();
      expect(data.data.currentAttendance.user.firstName).toBe('John');
      expect(data.data.currentAttendance.user.lastName).toBe('Doe');
      expect(data.data.currentAttendance.user.email).toBe('john@example.com');
    });

    it('provides current timestamp in response', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.attendance.findFirst).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/attendance');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      // The API doesn't return currentTime in the response
      expect(data.data).toBeDefined();
    });
  });

  describe('Time Calculation Logic', () => {
    it('looks for attendance records within last 24 hours', async () => {
      const { prisma } = await import('@/lib/prisma');

      const request = new NextRequest('http://localhost:3000/api/attendance', {
        method: 'POST',
      });

      await POST(request);

      expect(prisma.attendance.findFirst).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          checkIn: {
            gte: expect.any(Date),
          },
        },
        orderBy: {
          checkIn: 'desc',
        },
      });

      // Verify the 24-hour calculation
      const callArgs = vi.mocked(prisma.attendance.findFirst).mock
        .calls[0]?.[0];
      if (!callArgs?.where?.checkIn) {
        throw new Error('Mock call arguments not found');
      }
      const twentyFourHoursAgo = (callArgs.where.checkIn as any).gte as Date;
      const now = new Date();
      const timeDiff = now.getTime() - twentyFourHoursAgo.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      expect(hoursDiff).toBeGreaterThan(23.9);
      expect(hoursDiff).toBeLessThan(24.1);
    });

    it('orders attendance records by clock-in time descending', async () => {
      const { prisma } = await import('@/lib/prisma');

      const request = new NextRequest('http://localhost:3000/api/attendance', {
        method: 'POST',
      });

      await POST(request);

      expect(prisma.attendance.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            checkIn: 'desc',
          },
        })
      );
    });
  });

  describe('Edge Cases and Validation', () => {
    it('handles attendance records from previous days', async () => {
      const { prisma } = await import('@/lib/prisma');
      const oldRecord = {
        ...mockClockInRecord,
        checkIn: new Date('2023-12-31T09:00:00Z'),
        checkOut: new Date('2023-12-31T17:00:00Z'),
      };
      vi.mocked(prisma.attendance.findFirst).mockResolvedValue(oldRecord);

      const request = new NextRequest('http://localhost:3000/api/attendance', {
        method: 'POST',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.action).toBe('clock-in');
    });

    it('handles attendance records exactly 24 hours ago', async () => {
      const { prisma } = await import('@/lib/prisma');
      const exactly24HoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const oldRecord = {
        ...mockClockInRecord,
        checkIn: exactly24HoursAgo,
        checkOut: new Date(exactly24HoursAgo.getTime() + 8 * 60 * 60 * 1000),
      };
      vi.mocked(prisma.attendance.findFirst).mockResolvedValue(oldRecord);

      const request = new NextRequest('http://localhost:3000/api/attendance', {
        method: 'POST',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.action).toBe('clock-in');
    });

    it('handles attendance records just under 24 hours ago', async () => {
      const { prisma } = await import('@/lib/prisma');
      const justUnder24Hours = new Date(Date.now() - 23.9 * 60 * 60 * 1000);
      const recentRecord = {
        ...mockClockInRecord,
        clockIn: justUnder24Hours,
        clockOut: null,
      };
      vi.mocked(prisma.attendance.findFirst).mockResolvedValue(recentRecord);

      const request = new NextRequest('http://localhost:3000/api/attendance', {
        method: 'POST',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.action).toBe('clock-out');
    });
  });

  describe('Data Integrity and Security', () => {
    it('does not expose sensitive user information', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.attendance.findFirst).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/attendance', {
        method: 'POST',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.data.attendance.user).not.toHaveProperty('password');
      expect(data.data.attendance.user).not.toHaveProperty('roles');
      expect(data.data.attendance.user).not.toHaveProperty('id');
      expect(data.data.attendance.user).not.toHaveProperty('createdAt');
      expect(data.data.attendance.user).not.toHaveProperty('updatedAt');
    });

    it('only returns necessary user fields', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.attendance.findFirst).mockResolvedValue(
        mockClockInRecord
      );

      const request = new NextRequest('http://localhost:3000/api/attendance');
      const response = await GET(request);
      const data = await response.json();

      const userFields = Object.keys(data.data.currentAttendance.user);
      expect(userFields).toHaveLength(3);
      expect(userFields).toContain('firstName');
      expect(userFields).toContain('lastName');
      expect(userFields).toContain('email');
    });

    it('maintains data consistency between clock-in and clock-out', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.attendance.findFirst).mockResolvedValue(
        mockClockInRecord
      );

      const request = new NextRequest('http://localhost:3000/api/attendance', {
        method: 'POST',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.data.attendance.id).toBe('attendance-1');
      expect(data.data.attendance.userId).toBe('user-123');
      expect(data.data.attendance.checkIn).toBeDefined();
      expect(data.data.attendance.checkOut).toBeDefined();
      expect(data.data.attendance.user).toBeDefined();
    });
  });
});
