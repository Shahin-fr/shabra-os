import { NextRequest, NextResponse } from 'next/server';

import { getDocBySlug } from '@/lib/docs';
import { logger } from '@/lib/logger';

interface RouteParams {
  params: { slug: string };
}

// GET /api/wiki/docs/[slug] - Get specific markdown document
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const doc = await getDocBySlug(params.slug);

    if (!doc) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Transform to match WikiDocument interface
    const wikiDocument = {
      id: `doc-${doc.slug}`,
      title: doc.title,
      content: doc.content,
      htmlContent: doc.htmlContent,
      createdAt: new Date(doc.date).toISOString(),
      updatedAt: new Date(doc.date).toISOString(),
      author: doc.author,
      tags: doc.tags,
    };

    return NextResponse.json(wikiDocument);
  } catch (error) {
    logger.error('Error fetching markdown doc', error as Error, {
      operation: 'GET /api/wiki/docs/[slug]',
      source: 'api/wiki/docs/[slug]/route.ts',
      slug: params.slug,
    });
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}
