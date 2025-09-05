import fs from 'fs';
import path from 'path';

import matter from 'gray-matter';
import { NextRequest, NextResponse } from 'next/server';

import {
  createSuccessResponse,
  createValidationErrorResponse,
  createServerErrorResponse,
  HTTP_STATUS_CODES,
  getHttpStatusForErrorCode,
} from '@/lib/api/response-utils';
// import { getAllDocs } from '@/lib/docs';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

// Temporary inline getAllDocs function for testing
function getAllDocs() {
  const docsDirectory = path.join(process.cwd(), 'content/docs');

  if (!fs.existsSync(docsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(docsDirectory);
  const allDocsData = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      const originalSlug = fileName.replace(/\.md$/, '');
      const slug = encodeURIComponent(originalSlug);
      const fullPath = path.join(docsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);

      return {
        slug,
        originalSlug,
        title: matterResult.data.title || 'Untitled',
        date: matterResult.data.date || new Date().toISOString().split('T')[0],
        description: matterResult.data.description || '',
        author: matterResult.data.author || 'Unknown',
        tags: matterResult.data.tags || [],
      };
    });

  return allDocsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

// GET /api/wiki - Get all wiki items with nested structure
export async function GET() {
  try {
    // Temporarily disable authentication for testing
    // TODO: Re-enable authentication once the issue is resolved
    /*
    // Add authorization check
    const { withAuth } = await import('@/lib/middleware/auth-middleware');

    // Check authentication
    const authResult = await withAuth(request);
    if (authResult.response) {
      return authResult.response;
    }
    */

    // Get all documents and folders from database
    const dbItems = await prisma.document.findMany({
      where: {
        isPublic: true, // Only get public documents for now
      },
      orderBy: [
        { type: 'asc' }, // Folders first
        { title: 'asc' },
      ],
    });

    // Get all markdown documents from content/docs
    let markdownDocs: any[] = [];
    try {
      logger.warn('=== WIKI API DEBUG ===');
      logger.warn('Attempting to load markdown docs...');
      markdownDocs = getAllDocs();
      logger.warn('Markdown docs loaded successfully:', { count: markdownDocs.length });
      if (markdownDocs.length > 0) {
        logger.warn(
          'First few docs:',
          markdownDocs
            .slice(0, 3)
            .map(doc => ({ title: doc.title, slug: doc.slug }))
        );
      } else {
        logger.warn('No markdown docs found!');
      }
      logger.warn('=== END WIKI API DEBUG ===');
    } catch (error) {
      logger.error('Error loading markdown docs:', error instanceof Error ? error : new Error(String(error)));
      if (error instanceof Error) {
        logger.error('Error stack:', new Error(error.stack || 'No stack trace available'));
      }
      markdownDocs = [];
    }

    // Create a special folder for markdown documents
    const docsFolder = {
      id: 'markdown-docs-folder',
      title: '📚 مستندات شبرا',
      type: 'FOLDER',
      parentId: null,
      content: null,
      authorId: 'system',
      children: markdownDocs.map(doc => ({
        id: `doc-${doc.slug}`,
        title: doc.title,
        type: 'DOCUMENT',
        parentId: 'markdown-docs-folder',
        content: null,
        authorId: 'system',
        slug: doc.slug,
        originalSlug: doc.originalSlug,
        date: doc.date,
        description: doc.description,
        author: doc.author,
        tags: doc.tags,
      })),
    };

    // Combine database items with markdown docs folder
    const allItems = [docsFolder, ...dbItems];

    // Build tree structure
    type DocumentItem = {
      id: string;
      parentId: string | null;
      title: string;
      type: string;
      content: string | null;
      authorId: string;
      children?: DocumentItem[];
      slug?: string;
      originalSlug?: string;
      date?: string;
      description?: string;
      author?: string;
      tags?: string[];
    };

    const buildTree = (
      items: DocumentItem[],
      parentId: string | null = null
    ): DocumentItem[] => {
      return items
        .filter(item => item.parentId === parentId)
        .map(item => ({
          ...item,
          children: buildTree(items, item.id),
        }));
    };

    const tree = buildTree(allItems);

    return NextResponse.json(tree);
  } catch (error) {
    logger.error('Error fetching wiki items', error as Error, {
      operation: 'GET /api/wiki',
      source: 'api/wiki/route.ts',
    });
    const errorResponse = createServerErrorResponse('Internal server error');
    return NextResponse.json(errorResponse, {
      status: getHttpStatusForErrorCode(errorResponse.error.code),
    });
  }
}

// POST /api/wiki - Create new wiki item
export async function POST(request: NextRequest) {
  try {
    // Add authorization check
    const { withAuth } = await import('@/lib/middleware/auth-middleware');

    // Check authentication - any authenticated user can create wiki items
    const authResult = await withAuth(request, {
      requiredPrivilegeLevel: 'EMPLOYEE',
    });

    if (authResult.response) {
      return authResult.response;
    }

    const body = await request.json();
    const { title, content, type, parentId } = body;

    logger.info('Wiki item creation request received', {
      body,
      userId: authResult.context.userId,
      operation: 'POST /api/wiki',
      source: 'api/wiki/route.ts',
    });

    if (!title || !type) {
      logger.warn('Wiki item creation failed: missing required fields', {
        body,
        userId: authResult.context.userId,
        operation: 'POST /api/wiki',
        source: 'api/wiki/route.ts',
      });
      const errorResponse = createValidationErrorResponse(
        'Title and type are required'
      );
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error.code),
      });
    }

    // Validate parent if provided
    if (parentId) {
      const parent = await prisma.document.findUnique({
        where: { id: parentId },
      });

      if (!parent || parent.type !== 'FOLDER') {
        const errorResponse = createValidationErrorResponse(
          'Parent must be a valid folder'
        );
        return NextResponse.json(errorResponse, {
          status: getHttpStatusForErrorCode(errorResponse.error.code),
        });
      }
    }

    // Create the document/folder
    const newItem = await prisma.document.create({
      data: {
        title,
        content: type === 'DOCUMENT' ? content : null,
        type,
        parentId,
        authorId: authResult.context.userId,
        isPublic: false, // Default to private
      },
    });

    logger.info('Wiki item created successfully', {
      itemId: newItem.id,
      userId: authResult.context.userId,
      operation: 'POST /api/wiki',
      source: 'api/wiki/route.ts',
    });

    const successResponse = createSuccessResponse(newItem);
    return NextResponse.json(successResponse, {
      status: HTTP_STATUS_CODES.CREATED,
    });
  } catch (error) {
    logger.error('Error creating wiki item', error as Error, {
      operation: 'POST /api/wiki',
      source: 'api/wiki/route.ts',
    });
    const errorResponse = createServerErrorResponse('Internal server error');
    return NextResponse.json(errorResponse, {
      status: getHttpStatusForErrorCode(errorResponse.error.code),
    });
  }
}
