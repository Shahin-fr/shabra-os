import { NextRequest } from 'next/server';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the modules before importing
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    storyType: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));
vi.mock('@/lib/auth-utils', () => ({
  isAdmin: vi.fn(),
}));

// Import after mocking
import { auth } from '@/auth';
import { isAdmin } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

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
    it('fetches all story types successfully', async () => {
      const mockStoryTypes = [
        {
          id: 'type-1',
          name: 'Article',
          icon: '📝',
          description: 'Article story type',
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      (mockPrisma.storyType.findMany as any).mockResolvedValue(mockStoryTypes);

      const mockRequest = new NextRequest('http://localhost:3000/api/story-types');
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockStoryTypes);

      expect(mockPrisma.storyType.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
      });
    });

    it('handles database errors gracefully', async () => {
      (mockPrisma.storyType.findMany as any).mockRejectedValue(
        new Error('Database error')
      );

      const mockRequest = new NextRequest('http://localhost:3000/api/story-types');
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.message).toBe('Failed to fetch story types');
    });
  });

  describe('POST /api/story-types', () => {
    const validStoryTypeData = {
      name: 'New Story Type',
      icon: '🎯',
    };

    it('creates a story type successfully', async () => {
      const mockCreatedStoryType = {
        id: 'type-new',
        name: 'New Story Type',
        icon: '🎯',
        description: '',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

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

      expect(mockPrisma.storyType.create).toHaveBeenCalledWith({
        data: {
          name: 'New Story Type',
          icon: '🎯',
          description: '',
          isActive: true,
        },
      });
    });

    it('creates a story type without icon', async () => {
      const storyTypeDataWithoutIcon = {
        name: 'Story Type Without Icon',
      };

      const mockCreatedStoryType = {
        id: 'type-no-icon',
        name: 'Story Type Without Icon',
        icon: 'Palette',
        description: '',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

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
      expect(data.icon).toBe('Palette');

      expect(mockPrisma.storyType.create).toHaveBeenCalledWith({
        data: {
          name: 'Story Type Without Icon',
          icon: 'Palette',
          description: '',
          isActive: true,
        },
      });
    });

    it('creates story type with whitespace in name', async () => {
      const storyTypeDataWithWhitespace = {
        name: '  Name With Whitespace  ',
        icon: '✂️',
      };

      const mockCreatedStoryType = {
        id: 'type-whitespace',
        name: '  Name With Whitespace  ',
        icon: '✂️',
        description: '',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

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
      expect(data.name).toBe('  Name With Whitespace  ');

      expect(mockPrisma.storyType.create).toHaveBeenCalledWith({
        data: {
          name: '  Name With Whitespace  ',
          icon: '✂️',
          description: '',
          isActive: true,
        },
      });
    });

    it('returns 400 when name is missing', async () => {
      const invalidData = { icon: '🎯' };

      const request = new NextRequest('http://localhost:3000/api/story-types', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toBe('Name is required');
      expect(mockPrisma.storyType.create).not.toHaveBeenCalled();
    });

    it('returns 400 when name is empty string', async () => {
      const invalidData = { name: '', icon: '🎯' };

      const request = new NextRequest('http://localhost:3000/api/story-types', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toBe('Name is required');
      expect(mockPrisma.storyType.create).not.toHaveBeenCalled();
    });

    it('handles database errors gracefully', async () => {
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
      expect(data.error.message).toBe('Failed to create story type');
    });
  });
});
