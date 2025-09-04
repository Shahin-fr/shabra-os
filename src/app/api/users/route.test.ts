import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
    },
  },
}));

// Import the component after mocking
import { GET } from './route';

describe('Users API Route', () => {
  const mockUsers = [
    {
      id: 'user-1',
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice@example.com',
    },
    {
      id: 'user-2',
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob@example.com',
    },
    {
      id: 'user-3',
      firstName: 'Charlie',
      lastName: 'Brown',
      email: 'charlie@example.com',
    },
    {
      id: 'user-4',
      firstName: 'Diana',
      lastName: 'Wilson',
      email: 'diana@example.com',
    },
  ];

  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup default mocks using vi.mocked
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/users', () => {
    it('returns all active users successfully', async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(4);
      expect(data[0].firstName).toBe('Alice');
      expect(data[1].firstName).toBe('Bob');
      expect(data[2].firstName).toBe('Charlie');
      expect(data[3].firstName).toBe('Diana');
    });

    it('filters only active users', async () => {
      const { prisma } = await import('@/lib/prisma');

      await GET();

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
        orderBy: {
          firstName: 'asc',
        },
      });
    });

    it('selects only necessary user fields', async () => {
      const response = await GET();
      const data = await response.json();

      // Verify only required fields are returned
      expect(data[0]).toHaveProperty('id');
      expect(data[0]).toHaveProperty('firstName');
      expect(data[0]).toHaveProperty('lastName');
      expect(data[0]).toHaveProperty('email');

      // Verify only 4 fields are returned (the ones selected by the API)
      expect(Object.keys(data[0])).toHaveLength(4);
      expect(Object.keys(data[0])).toEqual([
        'id',
        'firstName',
        'lastName',
        'email',
      ]);
    });

    it('orders users by firstName in ascending order', async () => {
      const { prisma } = await import('@/lib/prisma');

      await GET();

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            firstName: 'asc',
          },
        })
      );
    });

    it('handles empty results gracefully', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.user.findMany).mockResolvedValue([]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(0);
      expect(Array.isArray(data)).toBe(true);
    });

    it('handles single user result', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.user.findMany).mockResolvedValue([mockUsers[0]] as any);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(data[0].firstName).toBe('Alice');
      expect(data[0].lastName).toBe('Johnson');
      expect(data[0].email).toBe('alice@example.com');
    });

    it('handles database errors gracefully', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.user.findMany).mockRejectedValue(
        new Error('Database connection failed')
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.message).toBe('خطا در دریافت لیست کاربران');
    });

    it('handles prisma validation errors gracefully', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.user.findMany).mockRejectedValue(
        new Error('Invalid query parameters')
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.message).toBe('خطا در دریافت لیست کاربران');
    });

    it('handles network errors gracefully', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.user.findMany).mockRejectedValue(
        new Error('Network timeout')
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.message).toBe('خطا در دریافت لیست کاربران');
    });

    it('returns correct user data structure', async () => {
      const response = await GET();
      const data = await response.json();

      // Verify data structure for each user
      data.forEach((user: any) => {
        expect(typeof user.id).toBe('string');
        expect(typeof user.firstName).toBe('string');
        expect(typeof user.lastName).toBe('string');
        expect(typeof user.email).toBe('string');

        expect(user.id).toBeDefined();
        expect(user.firstName).toBeDefined();
        expect(user.lastName).toBeDefined();
        expect(user.email).toBeDefined();
      });
    });

    it('maintains data integrity', async () => {
      const response = await GET();
      const data = await response.json();

      // Verify data matches mock data exactly
      expect(data[0].id).toBe('user-1');
      expect(data[0].firstName).toBe('Alice');
      expect(data[0].lastName).toBe('Johnson');
      expect(data[0].email).toBe('alice@example.com');

      expect(data[1].id).toBe('user-2');
      expect(data[1].firstName).toBe('Bob');
      expect(data[1].lastName).toBe('Smith');
      expect(data[1].email).toBe('bob@example.com');
    });

    it('excludes inactive users from results', async () => {
      const { prisma } = await import('@/lib/prisma');

      await GET();

      // Verify the query only looks for active users
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            isActive: true,
          },
        })
      );
    });

    it('handles users with empty names gracefully', async () => {
      const { prisma } = await import('@/lib/prisma');
      const usersWithEmptyNames = [
        {
          id: 'user-empty',
          firstName: '',
          lastName: '',
          email: 'empty@example.com',
        },
      ];
      vi.mocked(prisma.user.findMany).mockResolvedValue(
        usersWithEmptyNames as any
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data[0].firstName).toBe('');
      expect(data[0].lastName).toBe('');
      expect(data[0].email).toBe('empty@example.com');
    });

    it('handles users with null names gracefully', async () => {
      const { prisma } = await import('@/lib/prisma');
      const usersWithNullNames = [
        {
          id: 'user-null',
          firstName: null,
          lastName: null,
          email: 'null@example.com',
        },
      ];
      vi.mocked(prisma.user.findMany).mockResolvedValue(
        usersWithNullNames as any
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data[0].firstName).toBeNull();
      expect(data[0].lastName).toBeNull();
      expect(data[0].email).toBe('null@example.com');
    });
  });

  describe('Data Security and Privacy', () => {
    it('does not expose sensitive user information', async () => {
      const response = await GET();
      const data = await response.json();

      // Verify sensitive fields are never returned
      data.forEach((user: any) => {
        expect(user).not.toHaveProperty('password');
        expect(user).not.toHaveProperty('passwordHash');
        expect(user).not.toHaveProperty('roles');
        expect(user).not.toHaveProperty('permissions');
        expect(user).not.toHaveProperty('sessionToken');
        expect(user).not.toHaveProperty('resetToken');
        expect(user).not.toHaveProperty('emailVerified');
        expect(user).not.toHaveProperty('lastLoginAt');
        expect(user).not.toHaveProperty('loginAttempts');
        expect(user).not.toHaveProperty('lockedUntil');
      });
    });

    it('only returns public user profile information', async () => {
      const response = await GET();
      const data = await response.json();

      // Verify only public fields are returned
      data.forEach((user: any) => {
        const allowedFields = ['id', 'firstName', 'lastName', 'email'];
        const userFields = Object.keys(user);

        expect(userFields).toHaveLength(allowedFields.length);
        allowedFields.forEach(field => {
          expect(userFields).toContain(field);
        });
      });
    });
  });

  describe('Edge Cases and Validation', () => {
    it('handles very long user names', async () => {
      const { prisma } = await import('@/lib/prisma');
      const longNameUser = [
        {
          id: 'user-long',
          firstName: 'A'.repeat(1000),
          lastName: 'B'.repeat(1000),
          email: 'long@example.com',
        },
      ];
      vi.mocked(prisma.user.findMany).mockResolvedValue(longNameUser as any);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data[0].firstName).toHaveLength(1000);
      expect(data[0].lastName).toHaveLength(1000);
    });

    it('handles special characters in user names', async () => {
      const { prisma } = await import('@/lib/prisma');
      const specialCharUser = [
        {
          id: 'user-special',
          firstName: 'John@#$%^&*()',
          lastName: 'Doe_+-=[]{}|;:,.<>?',
          email: 'special@example.com',
        },
      ];
      vi.mocked(prisma.user.findMany).mockResolvedValue(specialCharUser as any);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data[0].firstName).toBe('John@#$%^&*()');
      expect(data[0].lastName).toBe('Doe_+-=[]{}|;:,.<>?');
    });

    it('handles unicode characters in user names', async () => {
      const { prisma } = await import('@/lib/prisma');
      const unicodeUser = [
        {
          id: 'user-unicode',
          firstName: 'محمد',
          lastName: 'احمدی',
          email: 'unicode@example.com',
        },
      ];
      vi.mocked(prisma.user.findMany).mockResolvedValue(unicodeUser as any);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data[0].firstName).toBe('محمد');
      expect(data[0].lastName).toBe('احمدی');
    });

    it('handles emoji in user names', async () => {
      const { prisma } = await import('@/lib/prisma');
      const emojiUser = [
        {
          id: 'user-emoji',
          firstName: 'John🚀',
          lastName: 'Doe🎉',
          email: 'emoji@example.com',
        },
      ];
      vi.mocked(prisma.user.findMany).mockResolvedValue(emojiUser as any);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data[0].firstName).toBe('John🚀');
      expect(data[0].lastName).toBe('Doe🎉');
    });

    it('handles users with very long email addresses', async () => {
      const { prisma } = await import('@/lib/prisma');
      const longEmailUser = [
        {
          id: 'user-long-email',
          firstName: 'Long',
          lastName: 'Email',
          email: `${'a'.repeat(100)}@${'b'.repeat(100)}.${'c'.repeat(50)}`,
        },
      ];
      vi.mocked(prisma.user.findMany).mockResolvedValue(longEmailUser as any);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data[0].email).toContain('@');
      expect(data[0].email).toContain('.');
    });
  });

  describe('Performance and Scalability', () => {
    it('handles large number of users efficiently', async () => {
      const { prisma } = await import('@/lib/prisma');
      const largeUserList = Array.from({ length: 1000 }, (_, i) => ({
        id: `user-${i}`,
        firstName: `User${i}`,
        lastName: `LastName${i}`,
        email: `user${i}@example.com`,
      }));
      vi.mocked(prisma.user.findMany).mockResolvedValue(largeUserList as any);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(1000);
      expect(data[999].firstName).toBe('User999');
    });

    it('maintains consistent response structure for all users', async () => {
      const { prisma } = await import('@/lib/prisma');
      const mixedUserList = [
        {
          id: 'user-1',
          firstName: 'Alice',
          lastName: 'Johnson',
          email: 'alice@example.com',
        },
        {
          id: 'user-2',
          firstName: null,
          lastName: null,
          email: 'bob@example.com',
        },
        {
          id: 'user-3',
          firstName: '',
          lastName: '',
          email: 'charlie@example.com',
        },
        {
          id: 'user-4',
          firstName: 'محمد',
          lastName: 'احمدی',
          email: 'unicode@example.com',
        },
      ];
      vi.mocked(prisma.user.findMany).mockResolvedValue(mixedUserList as any);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(4);

      // Verify all users have the same structure
      data.forEach((user: any) => {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('firstName');
        expect(user).toHaveProperty('lastName');
        expect(user).toHaveProperty('email');
        expect(Object.keys(user)).toHaveLength(4);
      });
    });
  });

  describe('Error Handling Scenarios', () => {
    it('handles prisma client initialization errors', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.user.findMany).mockRejectedValue(
        new Error('Prisma client not initialized')
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.message).toBe('خطا در دریافت لیست کاربران');
    });

    it('handles database connection timeout errors', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.user.findMany).mockRejectedValue(
        new Error('Connection timeout')
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.message).toBe('خطا در دریافت لیست کاربران');
    });

    it('handles database permission errors', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.user.findMany).mockRejectedValue(
        new Error('Insufficient permissions')
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.message).toBe('خطا در دریافت لیست کاربران');
    });

    it('handles unexpected error types', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.user.findMany).mockRejectedValue(
        'Unexpected string error'
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.message).toBe('خطا در دریافت لیست کاربران');
    });
  });
});
