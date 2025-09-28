import fs from 'fs';
import path from 'path';

import matter from 'gray-matter';
import { NextRequest, NextResponse } from 'next/server';

import {
  createSuccessResponse,
  createValidationErrorResponse,
  createServerErrorResponse,
  createUnauthorizedErrorResponse,
  HTTP_STATUS_CODES,
  getHttpStatusForErrorCode,
} from '@/lib/api-response';
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
export async function GET(request: NextRequest) {
  console.log('[WIKI API] Starting GET /api/wiki request');
  
  try {
    
    // Add authorization check
    const { withAuth } = await import('@/lib/middleware/auth-middleware');

    // Check authentication
    console.log('[WIKI API] Checking authentication...');
    const authResult = await withAuth(request);
    console.log('[WIKI API] Authentication result:', {
      hasResponse: !!authResult.response,
      hasContext: !!authResult.context,
      userId: authResult.context?.userId,
    });
    
    // If authentication fails, we'll still return public documents
    let userId: string | null = null;
    if (!authResult.response && authResult.context?.userId) {
      userId = authResult.context.userId;
    }

    // Get all documents and folders from database
    // Return public documents OR documents created by the current user (if authenticated)
    let dbItems: any[] = [];
    
    try {
      console.log('[WIKI API] Querying database for documents...');
      console.log('[WIKI API] User ID:', userId || 'anonymous');
      
      const whereClause = userId 
        ? {
            OR: [
              { isPublic: true }, // Public documents
              { authorId: userId }, // User's own documents
            ],
          }
        : { isPublic: true }; // Only public documents if not authenticated

      console.log('[WIKI API] Where clause:', whereClause);

      dbItems = await prisma.document.findMany({
        where: whereClause,
        orderBy: [
          { type: 'asc' }, // Folders first
          { order: 'asc' }, // Then by custom order
          { title: 'asc' }, // Finally by title
        ],
        select: {
          id: true,
          title: true,
          content: true,
          type: true,
          parentId: true,
          authorId: true,
          isPublic: true,
          createdAt: true,
          updatedAt: true,
          order: true,
          fileUrl: true,
          filePublicId: true,
          fileType: true,
          originalName: true,
          fileSize: true,
        },
      });
      
      console.log('[WIKI API] Database query successful, found', dbItems.length, 'items');
      
      logger.info('Wiki items fetched successfully', {
        itemCount: dbItems.length,
        userId: userId || 'anonymous',
        operation: 'GET /api/wiki',
        source: 'api/wiki/route.ts',
      });
    } catch (dbError) {
      console.error('[WIKI API] Database query failed:', dbError);
      
      logger.error('Database query failed for wiki items', dbError as Error, {
        userId: userId || 'anonymous',
        operation: 'GET /api/wiki',
        source: 'api/wiki/route.ts',
      });
      
      // Return error response with proper status code
      const errorResponse = createServerErrorResponse('Failed to fetch wiki items from database');
      return NextResponse.json(errorResponse, {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      });
    }

    // Get all markdown documents from content/docs
    let markdownDocs: any[] = [];
    try {
      markdownDocs = getAllDocs();
      logger.info('Markdown docs loaded successfully', {
        count: markdownDocs.length,
        operation: 'GET /api/wiki',
        source: 'api/wiki/route.ts',
      });
    } catch (error) {
      logger.error('Error loading markdown docs', error as Error, {
        operation: 'GET /api/wiki',
      }, 'api/wiki/route.ts');
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

    logger.info('Wiki tree built successfully', {
      rootItemCount: tree.length,
      totalDbItems: dbItems.length,
      totalMarkdownDocs: markdownDocs.length,
      operation: 'GET /api/wiki',
      source: 'api/wiki/route.ts',
    });

    const successResponse = createSuccessResponse(tree);
    return NextResponse.json(successResponse, {
      status: HTTP_STATUS_CODES.OK,
    });
  } catch (error) {
    console.error('[WIKI API] Main catch block - Error fetching wiki items:', error);
    console.error('[WIKI API] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown',
    });
    
    logger.error('Error fetching wiki items', error as Error, {
      operation: 'GET /api/wiki',
    }, 'api/wiki/route.ts');
    
    // Ensure we always return a proper JSON error response
    const errorResponse = createServerErrorResponse(
      error instanceof Error ? error.message : 'Internal server error'
    );
    
    console.log('[WIKI API] Returning error response:', JSON.stringify(errorResponse, null, 2));
    
    // Double-check that the error response has the correct structure
    if (!errorResponse || typeof errorResponse !== 'object' || !errorResponse.error) {
      console.error('[WIKI API] ERROR: Invalid error response structure!', errorResponse);
      // Fallback to a basic error response
      const fallbackResponse = {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Internal server error'
        }
      };
      return NextResponse.json(fallbackResponse, {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      });
    }
    
    return NextResponse.json(errorResponse, {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    });
  }
}

// POST /api/wiki - Create new wiki item
export async function POST(request: NextRequest) {
  try {
    // Add authorization check
    const { withAuth } = await import('@/lib/middleware/auth-middleware');

    // Check authentication - any authenticated user can create wiki items
    const authResult = await withAuth(request);

    if (authResult.response) {
      return authResult.response;
    }

    const body = await request.json();
    const { title, content, type, parentId } = body;

    // Validate required fields
    if (!title || !type) {
      const errorResponse = createValidationErrorResponse(
        'Title and type are required'
      );
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error?.code || 'VALIDATION_ERROR'),
      });
    }

    // Validate type
    if (!['FOLDER', 'DOCUMENT'].includes(type)) {
      const errorResponse = createValidationErrorResponse(
        'Type must be either FOLDER or DOCUMENT'
      );
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error?.code || 'VALIDATION_ERROR'),
      });
    }

    // Validate title length
    if (title.trim().length < 1 || title.trim().length > 255) {
      const errorResponse = createValidationErrorResponse(
        'Title must be between 1 and 255 characters'
      );
      return NextResponse.json(errorResponse, {
        status: getHttpStatusForErrorCode(errorResponse.error?.code || 'VALIDATION_ERROR'),
      });
    }

    logger.info('Wiki item creation request received', {
      title: title.trim(),
      type,
      parentId,
      userId: authResult.context.userId,
      operation: 'POST /api/wiki',
      source: 'api/wiki/route.ts',
    });

    // Validate parent if provided
    if (parentId) {
      try {
        const parent = await prisma.document.findUnique({
          where: { id: parentId },
          select: { id: true, type: true, authorId: true },
        });

        if (!parent) {
          const errorResponse = createValidationErrorResponse(
            'Parent folder not found'
          );
          return NextResponse.json(errorResponse, {
            status: getHttpStatusForErrorCode(errorResponse.error?.code || 'VALIDATION_ERROR'),
          });
        }

        if (parent.type !== 'FOLDER') {
          const errorResponse = createValidationErrorResponse(
            'Parent must be a folder'
          );
          return NextResponse.json(errorResponse, {
            status: getHttpStatusForErrorCode(errorResponse.error?.code || 'VALIDATION_ERROR'),
          });
        }

        // Check if user has access to the parent folder
        if (parent.authorId !== authResult.context.userId && !authResult.context.roles?.includes('ADMIN')) {
          const errorResponse = createUnauthorizedErrorResponse(
            'You do not have permission to create items in this folder'
          );
          return NextResponse.json(errorResponse, {
            status: getHttpStatusForErrorCode(errorResponse.error?.code || 'VALIDATION_ERROR'),
          });
        }
      } catch (dbError) {
        logger.error('Error validating parent folder', dbError as Error, {
          parentId,
          userId: authResult.context.userId,
          operation: 'POST /api/wiki',
        }, 'api/wiki/route.ts');
        
        const errorResponse = createServerErrorResponse('Failed to validate parent folder');
        return NextResponse.json(errorResponse, {
          status: getHttpStatusForErrorCode(errorResponse.error?.code || 'VALIDATION_ERROR'),
        });
      }
    }

    // Create the document/folder
    const newItem = await prisma.document.create({
      data: {
        title: title.trim(),
        content: type === 'DOCUMENT' ? content : null,
        type,
        parentId,
        authorId: authResult.context.userId,
        isPublic: false, // Default to private
      },
    });

    logger.info('Wiki item created successfully', {
      itemId: newItem.id,
      title: newItem.title,
      type: newItem.type,
      parentId: newItem.parentId,
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
    }, 'api/wiki/route.ts');
    
    const errorResponse = createServerErrorResponse('Internal server error');
    return NextResponse.json(errorResponse, {
      status: getHttpStatusForErrorCode(errorResponse.error?.code || 'VALIDATION_ERROR'),
    });
  }
}
