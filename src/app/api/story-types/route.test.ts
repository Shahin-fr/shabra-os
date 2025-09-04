import { NextRequest } from 'next/server';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { auth } from '@/auth';
import { isAdmin } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

// Mock the modules
vi.mock('@/auth');
vi.mock('@/lib/prisma');
vi.mock('@/lib/auth-utils');

const mockAuth = vi.mocked(auth);
const mockPrisma = vi.mocked(prisma);
const mockIsAdmin = vi.mocked(isAdmin);

// Import the functions after mocking
const { GET, POST } = await import('./route');

describe('Story Types API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/story-types', () => {
    it('fetches all story types successfully for any authenticated user', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'user@example.com',
          roles: ['EMPLOYEE'], // Regular user, not admin
        },
      };

      const mockStoryTypes = [
        {
          id: 'type-1',
          name: 'Article',
          icon: '📝',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          _count: { stories: 3 },
        },
      ];

      mockAuth.mockResolvedValue(mockSession);
      // ✅ FIXED: No admin check needed for GET requests
      (mockPrisma.storyType.findMany as any).mockResolvedValue(mockStoryTypes);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockStoryTypes);

      expect(mockAuth).toHaveBeenCalled();
      // ✅ FIXED: isAdmin should NOT be called for GET requests
      expect(mockIsAdmin).not.toHaveBeenCalled();
      expect(mockPrisma.storyType.findMany).toHaveBeenCalledWith({
        orderBy: {
          name: 'asc',
        },
        include: {
          _count: {
            select: { stories: true },
          },
        },
      });
    });

    it('returns 401 when user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
      expect(mockPrisma.storyType.findMany).not.toHaveBeenCalled();
    });

    // ✅ FIXED: Remove the test that expected 403 for non-admin users on GET
    // GET requests now work for all authenticated users

    it('handles database errors gracefully', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'user@example.com',
          roles: ['EMPLOYEE'], // Regular user
        },
      };

      mockAuth.mockResolvedValue(mockSession);
      (mockPrisma.storyType.findMany as any).mockRejectedValue(
        new Error('Database error')
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('POST /api/story-types', () => {
    const validStoryTypeData = {
      name: 'New Story Type',
      icon: '🎯',
    };

    it('creates a story type successfully for admin user', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'admin@example.com',
          roles: ['ADMIN'], // ✅ FIXED: Use proper roles array
        },
      };

      const mockCreatedStoryType = {
        id: 'type-new',
        name: 'New Story Type',
        icon: '🎯',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockAuth.mockResolvedValue(mockSession);
      mockIsAdmin.mockReturnValue(true); // ✅ FIXED: Admin check for POST
      (mockPrisma.storyType.findUnique as any).mockResolvedValue(null);
      (mockPrisma.storyType.create as any).mockResolvedValue(
        mockCreatedStoryType
      );

      const request = new NextRequest('http://localhost:3000/api/story-types', {
        method: 'POST',
        body: JSON.stringify(validStoryTypeData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockCreatedStoryType);

      expect(mockAuth).toHaveBeenCalled();
      expect(mockIsAdmin).toHaveBeenCalledWith(mockSession); // ✅ FIXED: Pass session object
      expect(mockPrisma.storyType.findUnique).toHaveBeenCalledWith({
        where: { name: 'New Story Type' },
      });
      expect(mockPrisma.storyType.create).toHaveBeenCalledWith({
        data: {
          name: 'New Story Type',
          icon: '🎯',
        },
      });
    });

    it('creates a story type without icon', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'admin@example.com',
          roles: ['ADMIN'], // ✅ FIXED: Use proper roles array
        },
      };

      const storyTypeDataWithoutIcon = {
        name: 'Story Type Without Icon',
      };

      const mockCreatedStoryType = {
        id: 'type-no-icon',
        name: 'Story Type Without Icon',
        icon: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockAuth.mockResolvedValue(mockSession);
      mockIsAdmin.mockReturnValue(true); // ✅ FIXED: Admin check for POST
      (mockPrisma.storyType.findUnique as any).mockResolvedValue(null);
      (mockPrisma.storyType.create as any).mockResolvedValue(
        mockCreatedStoryType
      );

      const request = new NextRequest('http://localhost:3000/api/story-types', {
        method: 'POST',
        body: JSON.stringify(storyTypeDataWithoutIcon),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.icon).toBeNull();

      expect(mockPrisma.storyType.create).toHaveBeenCalledWith({
        data: {
          name: 'Story Type Without Icon',
          icon: null,
        },
      });
    });

    it('trims whitespace from name', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'admin@example.com',
          roles: ['ADMIN'], // ✅ FIXED: Use proper roles array
        },
      };

      const storyTypeDataWithWhitespace = {
        name: '  Trimmed Name  ',
        icon: '✂️',
      };

      const mockCreatedStoryType = {
        id: 'type-trimmed',
        name: 'Trimmed Name',
        icon: '✂️',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockAuth.mockResolvedValue(mockSession);
      mockIsAdmin.mockReturnValue(true); // ✅ FIXED: Admin check for POST
      (mockPrisma.storyType.findUnique as any).mockResolvedValue(null);
      (mockPrisma.storyType.create as any).mockResolvedValue(
        mockCreatedStoryType
      );

      const request = new NextRequest('http://localhost:3000/api/story-types', {
        method: 'POST',
        body: JSON.stringify(storyTypeDataWithWhitespace),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe('Trimmed Name');

      expect(mockPrisma.storyType.findUnique).toHaveBeenCalledWith({
        where: { name: 'Trimmed Name' },
      });
      expect(mockPrisma.storyType.create).toHaveBeenCalledWith({
        data: {
          name: 'Trimmed Name',
          icon: '✂️',
        },
      });
    });

    it('returns 401 when user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/story-types', {
        method: 'POST',
        body: JSON.stringify(validStoryTypeData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
      expect(mockPrisma.storyType.create).not.toHaveBeenCalled();
    });

    it('returns 403 when user is not admin', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'user@example.com',
          roles: ['EMPLOYEE'], // ✅ FIXED: Regular user, not admin
        },
      };

      mockAuth.mockResolvedValue(mockSession);
      mockIsAdmin.mockReturnValue(false); // ✅ FIXED: Not admin

      const request = new NextRequest('http://localhost:3000/api/story-types', {
        method: 'POST',
        body: JSON.stringify(validStoryTypeData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Forbidden: Admin access required');
      expect(mockPrisma.storyType.create).not.toHaveBeenCalled();
    });

    it('returns 400 when name is missing', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'admin@example.com',
          roles: ['ADMIN'], // ✅ FIXED: Use proper roles array
        },
      };

      mockAuth.mockResolvedValue(mockSession);
      mockIsAdmin.mockReturnValue(true); // ✅ FIXED: Admin check for POST

      const invalidData = { icon: '🎯' };

      const request = new NextRequest('http://localhost:3000/api/story-types', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe(
        'Story type name is required and must be a non-empty string'
      );
      expect(mockPrisma.storyType.create).not.toHaveBeenCalled();
    });

    it('returns 400 when name is empty string', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'admin@example.com',
          roles: ['ADMIN'], // ✅ FIXED: Use proper roles array
        },
      };

      mockAuth.mockResolvedValue(mockSession);
      mockIsAdmin.mockReturnValue(true); // ✅ FIXED: Admin check for POST

      const invalidData = { name: '', icon: '🎯' };

      const request = new NextRequest('http://localhost:3000/api/story-types', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe(
        'Story type name is required and must be a non-empty string'
      );
      expect(mockPrisma.storyType.create).not.toHaveBeenCalled();
    });

    it('returns 400 when name is only whitespace', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'admin@example.com',
          roles: ['ADMIN'], // ✅ FIXED: Use proper roles array
        },
      };

      mockAuth.mockResolvedValue(mockSession);
      mockIsAdmin.mockReturnValue(true); // ✅ FIXED: Admin check for POST

      const invalidData = { name: '   ', icon: '🎯' };

      const request = new NextRequest('http://localhost:3000/api/story-types', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe(
        'Story type name is required and must be a non-empty string'
      );
      expect(mockPrisma.storyType.create).not.toHaveBeenCalled();
    });

    it('returns 409 when story type name already exists', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'admin@example.com',
          roles: ['ADMIN'], // ✅ FIXED: Use proper roles array
        },
      };

      const existingStoryType = {
        id: 'type-existing',
        name: 'Existing Type',
        icon: '📰',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockAuth.mockResolvedValue(mockSession);
      mockIsAdmin.mockReturnValue(true); // ✅ FIXED: Admin check for POST
      (mockPrisma.storyType.findUnique as any).mockResolvedValue(
        existingStoryType
      );

      const request = new NextRequest('http://localhost:3000/api/story-types', {
        method: 'POST',
        body: JSON.stringify({ name: 'Existing Type', icon: '🎯' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe('Story type with this name already exists');
      expect(mockPrisma.storyType.create).not.toHaveBeenCalled();
    });

    it('handles database errors gracefully', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'admin@example.com',
          roles: ['ADMIN'], // ✅ FIXED: Use proper roles array
        },
      };

      mockAuth.mockResolvedValue(mockSession);
      mockIsAdmin.mockReturnValue(true); // ✅ FIXED: Admin check for POST
      (mockPrisma.storyType.findUnique as any).mockResolvedValue(null);
      (mockPrisma.storyType.create as any).mockRejectedValue(
        new Error('Database error')
      );

      const request = new NextRequest('http://localhost:3000/api/story-types', {
        method: 'POST',
        body: JSON.stringify(validStoryTypeData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('handles unique constraint violation gracefully', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'admin@example.com',
          roles: ['ADMIN'], // ✅ FIXED: Use proper roles array
        },
      };

      mockAuth.mockResolvedValue(mockSession);
      mockIsAdmin.mockReturnValue(true); // ✅ FIXED: Admin check for POST
      (mockPrisma.storyType.findUnique as any).mockResolvedValue(null);

      const uniqueConstraintError = new Error(
        'Unique constraint failed on the fields: (`name`)'
      );
      (mockPrisma.storyType.create as any).mockRejectedValue(
        uniqueConstraintError
      );

      const request = new NextRequest('http://localhost:3000/api/story-types', {
        method: 'POST',
        body: JSON.stringify(validStoryTypeData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe('Story type with this name already exists');
    });
  });
});
