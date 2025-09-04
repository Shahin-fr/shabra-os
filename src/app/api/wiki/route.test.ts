import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the dependencies
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    document: {
      findMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

// Import the component after mocking
import { GET, POST } from './route';

describe('Wiki API Route', () => {
  const mockSession = {
    user: {
      id: 'user-123',
      email: 'test@example.com',
      roles: ['USER'],
    },
  };

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashedpassword123',
    firstName: 'John',
    lastName: 'Doe',
    avatar: null,
    isActive: true,
    roles: ['EMPLOYEE'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  const mockWikiItems = [
    {
      id: 'folder-1',
      parentId: null,
      title: 'Main Folder',
      type: 'FOLDER',
      content: null,
      authorId: 'user-123',
      isPublic: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      author: mockUser,
      children: [],
    },
    {
      id: 'doc-1',
      parentId: 'folder-1',
      title: 'Document 1',
      type: 'DOCUMENT',
      content: 'This is document content',
      authorId: 'user-123',
      isPublic: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      author: mockUser,
      children: [],
    },
    {
      id: 'doc-2',
      parentId: 'folder-1',
      title: 'Document 2',
      type: 'DOCUMENT',
      content: 'Another document',
      authorId: 'user-456',
      isPublic: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      author: {
        id: 'user-456',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
      },
      children: [],
    },
    {
      id: 'folder-2',
      parentId: null,
      title: 'Private Folder',
      type: 'FOLDER',
      content: null,
      authorId: 'user-123',
      isPublic: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      author: mockUser,
      children: [],
    },
  ];

  const mockNewDocument = {
    id: 'doc-new',
    parentId: 'folder-1',
    title: 'New Document',
    type: 'DOCUMENT',
    content: 'New content',
    authorId: 'user-123',
    isPublic: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    author: mockUser,
  };

  const mockNewFolder = {
    id: 'folder-new',
    parentId: null,
    title: 'New Folder',
    type: 'FOLDER',
    content: null,
    authorId: 'user-123',
    isPublic: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    author: mockUser,
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup default mocks using vi.mocked
    const { auth } = await import('@/auth');
    const { prisma } = await import('@/lib/prisma');

    vi.mocked(auth).mockResolvedValue(mockSession);
    vi.mocked(prisma.document.findMany).mockResolvedValue(mockWikiItems);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
    vi.mocked(prisma.document.create).mockResolvedValue(mockNewDocument);
    vi.mocked(prisma.document.findUnique).mockResolvedValue(
      mockWikiItems[0] as any
    ); // Default to folder
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/wiki', () => {
    it('returns wiki items in tree structure', async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(2); // Root level items

      // Verify tree structure
      const mainFolder = data.find((item: any) => item.id === 'folder-1');
      expect(mainFolder).toBeDefined();
      expect(mainFolder.children).toBeDefined();
      expect(mainFolder.children).toHaveLength(2); // 2 documents inside
    });

    it('includes public documents for all users', async () => {
      const { prisma } = await import('@/lib/prisma');

      await GET();

      expect(prisma.document.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ isPublic: true }, { author: { email: 'test@example.com' } }],
        },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          children: {
            include: {
              author: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: [{ type: 'asc' }, { title: 'asc' }],
      });
    });

    it('orders items by type (folders first) then by title', async () => {
      const { prisma } = await import('@/lib/prisma');

      await GET();

      expect(prisma.document.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ type: 'asc' }, { title: 'asc' }],
        })
      );
    });

    it('includes author information for all items', async () => {
      const response = await GET();
      const data = await response.json();

      // Verify root items have author info
      data.forEach((item: any) => {
        expect(item.author).toBeDefined();
        expect(item.author.id).toBeDefined();
        expect(item.author.firstName).toBeDefined();
        expect(item.author.lastName).toBeDefined();
        expect(item.author.email).toBeDefined();
      });

      // Verify nested children have author info
      const mainFolder = data.find((item: any) => item.id === 'folder-1');
      mainFolder.children.forEach((child: any) => {
        expect(child.author).toBeDefined();
        expect(child.author.id).toBeDefined();
        expect(child.author.firstName).toBeDefined();
        expect(child.author.lastName).toBeDefined();
        expect(child.author.email).toBeDefined();
      });
    });

    it('builds correct tree hierarchy', async () => {
      const response = await GET();
      const data = await response.json();

      // Find the main folder
      const mainFolder = data.find((item: any) => item.id === 'folder-1');
      expect(mainFolder.parentId).toBeNull(); // Root level
      expect(mainFolder.children).toHaveLength(2);

      // Verify children are properly nested
      const doc1 = mainFolder.children.find(
        (child: any) => child.id === 'doc-1'
      );
      const doc2 = mainFolder.children.find(
        (child: any) => child.id === 'doc-2'
      );
      expect(doc1.parentId).toBe('folder-1');
      expect(doc2.parentId).toBe('folder-1');
    });

    it('handles empty wiki gracefully', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.document.findMany).mockResolvedValue([]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(0);
      expect(Array.isArray(data)).toBe(true);
    });

    it('returns 401 when user is not authenticated', async () => {
      const { auth } = await import('@/auth');
      vi.mocked(auth).mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('returns 401 when session has no user', async () => {
      const { auth } = await import('@/auth');
      vi.mocked(auth).mockResolvedValue({ user: null });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('returns 401 when user has no email', async () => {
      const { auth } = await import('@/auth');
      vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123' } });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('handles database errors gracefully', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.document.findMany).mockRejectedValue(
        new Error('Database error')
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('filters items based on user access rights', async () => {
      const { prisma } = await import('@/lib/prisma');

      await GET();

      // Verify the query includes both public items and user's own items
      expect(prisma.document.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [{ isPublic: true }, { author: { email: 'test@example.com' } }],
          },
        })
      );
    });
  });

  describe('POST /api/wiki', () => {
    it('creates new document successfully', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.document.create).mockResolvedValue(mockNewDocument);

      const documentData = {
        title: 'New Document',
        content: 'Document content',
        type: 'DOCUMENT',
        parentId: 'folder-1',
      };

      const request = new NextRequest('http://localhost:3000/api/wiki', {
        method: 'POST',
        body: JSON.stringify(documentData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.title).toBe('New Document');
      expect(data.content).toBe('New content');
      expect(data.type).toBe('DOCUMENT');
      expect(data.parentId).toBe('folder-1');
      expect(data.authorId).toBe('user-123');
      expect(data.isPublic).toBe(false);
    });

    it('creates new folder successfully', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.document.create).mockResolvedValue(mockNewFolder);

      const folderData = {
        title: 'New Folder',
        type: 'FOLDER',
        parentId: null,
      };

      const request = new NextRequest('http://localhost:3000/api/wiki', {
        method: 'POST',
        body: JSON.stringify(folderData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.title).toBe('New Folder');
      expect(data.type).toBe('FOLDER');
      expect(data.content).toBeNull();
      expect(data.parentId).toBeNull();
      expect(data.authorId).toBe('user-123');
    });

    it('returns 400 when title is missing', async () => {
      const documentData = {
        content: 'Document content',
        type: 'DOCUMENT',
        parentId: 'folder-1',
      };

      const request = new NextRequest('http://localhost:3000/api/wiki', {
        method: 'POST',
        body: JSON.stringify(documentData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Title and type are required');
    });

    it('returns 400 when type is missing', async () => {
      const documentData = {
        title: 'New Document',
        content: 'Document content',
        parentId: 'folder-1',
      };

      const request = new NextRequest('http://localhost:3000/api/wiki', {
        method: 'POST',
        body: JSON.stringify(documentData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Title and type are required');
    });

    it('returns 400 when title is empty', async () => {
      const documentData = {
        title: '',
        content: 'Document content',
        type: 'DOCUMENT',
        parentId: 'folder-1',
      };

      const request = new NextRequest('http://localhost:3000/api/wiki', {
        method: 'POST',
        body: JSON.stringify(documentData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Title and type are required');
    });

    it('returns 400 when type is empty', async () => {
      const documentData = {
        title: 'New Document',
        content: 'Document content',
        type: '',
        parentId: 'folder-1',
      };

      const request = new NextRequest('http://localhost:3000/api/wiki', {
        method: 'POST',
        body: JSON.stringify(documentData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Title and type are required');
    });

    it('returns 401 when user is not authenticated', async () => {
      const { auth } = await import('@/auth');
      vi.mocked(auth).mockResolvedValue(null);

      const documentData = {
        title: 'New Document',
        content: 'Document content',
        type: 'DOCUMENT',
      };

      const request = new NextRequest('http://localhost:3000/api/wiki', {
        method: 'POST',
        body: JSON.stringify(documentData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('returns 401 when session has no user', async () => {
      const { auth } = await import('@/auth');
      vi.mocked(auth).mockResolvedValue({ user: null });

      const documentData = {
        title: 'New Document',
        content: 'Document content',
        type: 'DOCUMENT',
      };

      const request = new NextRequest('http://localhost:3000/api/wiki', {
        method: 'POST',
        body: JSON.stringify(documentData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('returns 401 when user has no email', async () => {
      const { auth } = await import('@/auth');
      vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123' } });

      const documentData = {
        title: 'New Document',
        content: 'Document content',
        type: 'DOCUMENT',
      };

      const request = new NextRequest('http://localhost:3000/api/wiki', {
        method: 'POST',
        body: JSON.stringify(documentData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('returns 404 when user not found in database', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const documentData = {
        title: 'New Document',
        content: 'Document content',
        type: 'DOCUMENT',
      };

      const request = new NextRequest('http://localhost:3000/api/wiki', {
        method: 'POST',
        body: JSON.stringify(documentData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
    });

    it('returns 400 when parent is not a folder', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.document.findUnique).mockResolvedValue({
        ...mockWikiItems[1], // Document, not folder
        type: 'DOCUMENT',
      } as any);

      const documentData = {
        title: 'New Document',
        content: 'Document content',
        type: 'DOCUMENT',
        parentId: 'doc-1',
      };

      const request = new NextRequest('http://localhost:3000/api/wiki', {
        method: 'POST',
        body: JSON.stringify(documentData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Parent must be a valid folder');
    });

    it('returns 400 when parent does not exist', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.document.findUnique).mockResolvedValue(null);

      const documentData = {
        title: 'New Document',
        content: 'Document content',
        type: 'DOCUMENT',
        parentId: 'nonexistent-folder',
      };

      const request = new NextRequest('http://localhost:3000/api/wiki', {
        method: 'POST',
        body: JSON.stringify(documentData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Parent must be a valid folder');
    });

    it('creates document without parent (root level)', async () => {
      const { prisma } = await import('@/lib/prisma');
      const rootDocument = { ...mockNewDocument, parentId: null };
      vi.mocked(prisma.document.create).mockResolvedValue(rootDocument);

      const documentData = {
        title: 'Root Document',
        content: 'Root content',
        type: 'DOCUMENT',
      };

      const request = new NextRequest('http://localhost:3000/api/wiki', {
        method: 'POST',
        body: JSON.stringify(documentData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.parentId).toBeNull();
    });

    it('sets content to null for folders', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.document.create).mockResolvedValue(mockNewFolder);

      const folderData = {
        title: 'New Folder',
        type: 'FOLDER',
        content: 'This should be ignored',
      };

      const request = new NextRequest('http://localhost:3000/api/wiki', {
        method: 'POST',
        body: JSON.stringify(folderData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.content).toBeNull();
    });

    it('includes author information in created item', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.document.create).mockResolvedValue(mockNewDocument);

      const documentData = {
        title: 'New Document',
        content: 'Document content',
        type: 'DOCUMENT',
      };

      const request = new NextRequest('http://localhost:3000/api/wiki', {
        method: 'POST',
        body: JSON.stringify(documentData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.author).toBeDefined();
      expect(data.author.id).toBe('user-123');
      expect(data.author.firstName).toBe('John');
      expect(data.author.lastName).toBe('Doe');
      expect(data.author.email).toBe('test@example.com');
    });

    it('handles database errors gracefully', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.document.create).mockRejectedValue(
        new Error('Database error')
      );

      const documentData = {
        title: 'New Document',
        content: 'Document content',
        type: 'DOCUMENT',
      };

      const request = new NextRequest('http://localhost:3000/api/wiki', {
        method: 'POST',
        body: JSON.stringify(documentData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('handles JSON parsing errors gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/wiki', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('Tree Building Logic', () => {
    it('correctly filters items by parent ID', async () => {
      const response = await GET();
      const data = await response.json();

      // Root level items should have parentId = null
      const rootItems = data.filter((item: any) => item.parentId === null);
      expect(rootItems).toHaveLength(2);

      // Items with parent should be nested
      const mainFolder = data.find((item: any) => item.id === 'folder-1');
      const nestedItems = mainFolder.children.filter(
        (item: any) => item.parentId === 'folder-1'
      );
      expect(nestedItems).toHaveLength(2);
    });

    it('handles deep nesting correctly', async () => {
      const { prisma } = await import('@/lib/prisma');
      const deepNestedItems = [
        {
          id: 'root-folder',
          parentId: null,
          title: 'Root',
          type: 'FOLDER',
          content: null,
          authorId: 'user-123',
          isPublic: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          author: mockUser,
          children: [],
        },
        {
          id: 'level1-folder',
          parentId: 'root-folder',
          title: 'Level 1',
          type: 'FOLDER',
          content: null,
          authorId: 'user-123',
          isPublic: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          author: mockUser,
          children: [],
        },
        {
          id: 'level2-folder',
          parentId: 'level1-folder',
          title: 'Level 2',
          type: 'FOLDER',
          content: null,
          authorId: 'user-123',
          isPublic: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          author: mockUser,
          children: [],
        },
        {
          id: 'deep-doc',
          parentId: 'level2-folder',
          title: 'Deep Document',
          type: 'DOCUMENT',
          content: 'Deep content',
          authorId: 'user-123',
          isPublic: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          author: mockUser,
          children: [],
        },
      ];
      vi.mocked(prisma.document.findMany).mockResolvedValue(deepNestedItems);

      const response = await GET();
      const data = await response.json();

      expect(data).toHaveLength(1); // Root level
      const rootFolder = data[0];
      expect(rootFolder.children).toHaveLength(1); // Level 1
      const level1Folder = rootFolder.children[0];
      expect(level1Folder.children).toHaveLength(1); // Level 2
      const level2Folder = level1Folder.children[0];
      expect(level2Folder.children).toHaveLength(1); // Deep document
    });
  });

  describe('Access Control and Security', () => {
    it('only returns public items and user-owned items', async () => {
      const { prisma } = await import('@/lib/prisma');

      await GET();

      expect(prisma.document.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [{ isPublic: true }, { author: { email: 'test@example.com' } }],
          },
        })
      );
    });

    it('does not expose sensitive user information', async () => {
      const response = await GET();
      const data = await response.json();

      // Verify author objects only contain necessary fields
      const verifyAuthorFields = (item: any) => {
        expect(item.author).not.toHaveProperty('password');
        expect(item.author).not.toHaveProperty('passwordHash');
        expect(item.author).not.toHaveProperty('roles');
        expect(item.author).not.toHaveProperty('permissions');
        expect(item.author).not.toHaveProperty('sessionToken');
        expect(item.author).not.toHaveProperty('resetToken');
        expect(item.author).not.toHaveProperty('emailVerified');
        expect(item.author).not.toHaveProperty('lastLoginAt');
        expect(item.author).not.toHaveProperty('loginAttempts');
        expect(item.author).not.toHaveProperty('lockedUntil');
        expect(item.author).not.toHaveProperty('createdAt');
        expect(item.author).not.toHaveProperty('updatedAt');
      };

      // Check root items
      data.forEach(verifyAuthorFields);

      // Check nested items
      data.forEach((item: any) => {
        if (item.children) {
          item.children.forEach(verifyAuthorFields);
        }
      });
    });

    it('only returns necessary author fields', async () => {
      const response = await GET();
      const data = await response.json();

      const verifyAuthorStructure = (item: any) => {
        const authorFields = Object.keys(item.author);
        expect(authorFields).toHaveLength(4);
        expect(authorFields).toContain('id');
        expect(authorFields).toContain('firstName');
        expect(authorFields).toContain('lastName');
        expect(authorFields).toContain('email');
      };

      // Check root items
      data.forEach(verifyAuthorStructure);

      // Check nested items
      data.forEach((item: any) => {
        if (item.children) {
          item.children.forEach(verifyAuthorStructure);
        }
      });
    });
  });

  describe('Edge Cases and Validation', () => {
    it('handles items with null content gracefully', async () => {
      const { prisma } = await import('@/lib/prisma');
      const itemsWithNullContent = [
        {
          id: 'null-content-doc',
          parentId: null,
          title: 'Null Content Doc',
          type: 'DOCUMENT',
          content: null,
          authorId: 'user-123',
          isPublic: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          author: mockUser,
          children: [],
        },
      ];
      vi.mocked(prisma.document.findMany).mockResolvedValue(
        itemsWithNullContent
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data[0].content).toBeNull();
    });

    it('handles items with empty content gracefully', async () => {
      const { prisma } = await import('@/lib/prisma');
      const itemsWithEmptyContent = [
        {
          id: 'empty-content-doc',
          parentId: null,
          title: 'Empty Content Doc',
          type: 'DOCUMENT',
          content: '',
          authorId: 'user-123',
          isPublic: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          author: mockUser,
          children: [],
        },
      ];
      vi.mocked(prisma.document.findMany).mockResolvedValue(
        itemsWithEmptyContent
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data[0].content).toBe('');
    });

    it('handles circular references gracefully', async () => {
      const { prisma } = await import('@/lib/prisma');
      const circularItems = [
        {
          id: 'folder-a',
          parentId: 'folder-b',
          title: 'Folder A',
          type: 'FOLDER',
          content: null,
          authorId: 'user-123',
          isPublic: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          author: mockUser,
          children: [],
        },
        {
          id: 'folder-b',
          parentId: 'folder-a',
          title: 'Folder B',
          type: 'FOLDER',
          content: null,
          authorId: 'user-123',
          isPublic: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          author: mockUser,
          children: [],
        },
      ];
      vi.mocked(prisma.document.findMany).mockResolvedValue(circularItems);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      // The tree building should handle this gracefully
      expect(Array.isArray(data)).toBe(true);
    });
  });
});
