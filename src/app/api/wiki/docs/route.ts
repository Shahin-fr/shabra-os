import { NextResponse } from 'next/server';

import { getAllDocs } from '@/lib/docs';
import { logger } from '@/lib/logger';

// GET /api/wiki/docs - Get all markdown documents from content/docs
export async function GET() {
  try {
    const docs = getAllDocs();

    // Transform docs to match WikiItem interface
    const wikiItems = docs.map(doc => ({
      id: `doc-${doc.slug}`,
      title: doc.title,
      type: 'DOCUMENT' as const,
      parentId: null,
      slug: doc.slug,
      originalSlug: doc.originalSlug,
      date: doc.date,
      description: doc.description,
      author: doc.author,
      tags: doc.tags,
    }));

    return NextResponse.json(wikiItems);
  } catch (error) {
    logger.error('Error fetching markdown docs', error as Error, {
      operation: 'GET /api/wiki/docs',
      source: 'api/wiki/docs/route.ts',
    });
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}
