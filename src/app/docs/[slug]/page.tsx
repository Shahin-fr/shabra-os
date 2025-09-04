import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import { sanitizeHtml } from '@/lib/security/html-sanitizer';

interface DocPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({
  params,
}: DocPageProps): Promise<Metadata> {
  // Note: Document model doesn't have slug field, using id instead
  // TODO: Either add slug field to Document model or change routing strategy
  const doc = await prisma.document.findUnique({
    where: { id: params.slug },
    select: { title: true, content: true },
  });

  if (!doc) {
    return {
      title: 'Document Not Found',
      description: 'The requested document could not be found.',
    };
  }

  return {
    title: doc.title,
    description: doc.content || `Read ${doc.title} on Shabra OS`,
  };
}

export default async function DocPage({ params }: DocPageProps) {
  const doc = await prisma.document.findUnique({
    where: { id: params.slug },
    select: {
      id: true,
      title: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      authorId: true,
    },
  });

  if (!doc) {
    notFound();
  }

  // Fetch author information
  const author = await prisma.user.findUnique({
    where: { id: doc.authorId },
    select: {
      firstName: true,
      lastName: true,
    },
  });

  // Sanitize HTML content to prevent XSS attacks
  const sanitizedHtml = sanitizeHtml(doc.content || '');

  return (
    <div className='container mx-auto px-4 py-8 max-w-4xl'>
      <article className='prose prose-lg max-w-none'>
        <header className='mb-8'>
          <h1 className='text-4xl font-bold text-gray-900 mb-4'>{doc.title}</h1>
          <div className='flex items-center gap-4 text-sm text-gray-600'>
            <span>
              By {author?.firstName || 'Unknown'} {author?.lastName || 'Author'}
            </span>
            <span>•</span>
            <time dateTime={doc.createdAt.toISOString()}>
              {new Date(doc.createdAt).toLocaleDateString('fa-IR')}
            </time>
            {doc.updatedAt > doc.createdAt && (
              <>
                <span>•</span>
                <time dateTime={doc.updatedAt.toISOString()}>
                  Updated {new Date(doc.updatedAt).toLocaleDateString('fa-IR')}
                </time>
              </>
            )}
          </div>
        </header>

        <div
          className='mt-8'
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      </article>
    </div>
  );
}
