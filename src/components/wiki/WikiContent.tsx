'use client';

import { FileText, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Badge } from '@/components/ui/badge';
import ClientOnly from '@/components/ui/ClientOnly';
import { formatJalaliDate } from '@/lib/date-utils';
import { logger } from '@/lib/logger';
import { sanitizeHtml } from '@/lib/security/html-sanitizer';

interface WikiDocument {
  id: string;
  title: string;
  content: string;
  type?: 'FOLDER' | 'DOCUMENT';
  author?:
    | {
        firstName: string;
        lastName: string;
      }
    | string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  htmlContent?: string;
}

interface WikiContentProps {
  documentId: string | null;
}

export function WikiContent({ documentId }: WikiContentProps) {
  const [document, setDocument] = useState<WikiDocument | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (documentId) {
      fetchDocument(documentId);
    } else {
      setDocument(null);
    }
  }, [documentId]);

  const fetchDocument = async (id: string) => {
    setLoading(true);
    try {
      // Check if it's a markdown document
      if (id.startsWith('doc-')) {
        const slug = id.replace('doc-', '');
        const response = await fetch(`/api/wiki/docs/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setDocument(data);
        }
      } else {
        // Regular database document
        const response = await fetch(`/api/wiki/${id}`);
        if (response.ok) {
          const data = await response.json();
          setDocument(data);
        }
      }
    } catch (error) {
      logger.error('Error fetching document:', error as Error);
    } finally {
      setLoading(false);
    }
  };

  if (!documentId) {
    return (
      <div className='flex-1 flex items-center justify-center min-h-[50vh]'>
        <div className='text-center max-w-lg'>
          <BookOpen className='h-24 w-24 mx-auto mb-8 text-pink-300' />
          <h2 className='text-3xl font-bold mb-4 text-gray-800'>
            به شبرالوگ خوش آمدید
          </h2>
          <p className='text-lg text-gray-600 mb-8 leading-relaxed'>
            برای شروع، یک مستند یا پوشه را از نوار کناری انتخاب کنید
          </p>
          <div className='text-base text-gray-500 space-y-3'>
            <p className='flex items-center justify-center gap-2'>
              <span className='w-2 h-2 bg-pink-300 rounded-full'></span>
              پوشه‌ها برای سازماندهی محتوا
            </p>
            <p className='flex items-center justify-center gap-2'>
              <span className='w-2 h-2 bg-pink-300 rounded-full'></span>
              مستندات برای نگهداری اطلاعات
            </p>
            <p className='flex items-center justify-center gap-2'>
              <span className='w-2 h-2 bg-pink-300 rounded-full'></span>
              جستجو و فیلتر کردن آسان
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='flex-1 flex items-center justify-center min-h-[50vh]'>
        <div className='animate-pulse space-y-6 w-full max-w-5xl px-8'>
          <div className='h-10 bg-gray-200 rounded-xl w-3/4 mx-auto'></div>
          <div className='h-5 bg-gray-200 rounded-lg w-1/2 mx-auto'></div>
          <div className='space-y-4 max-w-3xl mx-auto'>
            <div className='h-4 bg-gray-200 rounded-lg w-full'></div>
            <div className='h-4 bg-gray-200 rounded-lg w-5/6'></div>
            <div className='h-4 bg-gray-200 rounded-lg w-4/6'></div>
            <div className='h-4 bg-gray-200 rounded-lg w-3/4'></div>
          </div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className='flex-1 flex items-center justify-center min-h-[50vh]'>
        <div className='text-center max-w-md'>
          <FileText className='h-20 w-20 mx-auto mb-6 text-red-400' />
          <h2 className='text-2xl font-bold mb-3 text-gray-800'>
            مستند یافت نشد
          </h2>
          <p className='text-gray-600 leading-relaxed'>
            مستند مورد نظر شما وجود ندارد یا حذف شده است
          </p>
        </div>
      </div>
    );
  }

  if (document.type === 'FOLDER') {
    return (
      <div className='flex-1 p-8'>
        <div className='max-w-5xl mx-auto'>
          <div className='flex items-center justify-between mb-8 p-6 bg-white rounded-xl border border-gray-200/50 shadow-sm'>
            <div>
              <h1 className='text-4xl font-bold mb-3 text-gray-800'>
                {document.title}
              </h1>
              <p className='text-lg text-gray-600'>
                پوشه‌ای برای سازماندهی محتوا
              </p>
            </div>
            {/* Action buttons removed - content managed via markdown files */}
          </div>

          <div className='bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-12 text-center border border-gray-200/50'>
            <FileText className='h-20 w-20 mx-auto mb-6 text-pink-300' />
            <p className='text-lg text-gray-600 max-w-md mx-auto leading-relaxed'>
              این یک پوشه است. برای مشاهده محتوا، آیتم‌های داخل آن را از نوار
              کناری انتخاب کنید.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex-1 p-8'>
      <div className='max-w-5xl mx-auto'>
        {/* Document Header */}
        <div className='flex items-start justify-between mb-8 p-6 bg-white rounded-xl border border-gray-200/50 shadow-sm'>
          <div className='flex-1'>
            <h1 className='text-4xl font-bold mb-4 text-gray-800'>
              {document.title}
            </h1>

            <div className='flex items-center gap-6 text-sm text-gray-600 mb-4'>
              <div className='flex items-center gap-2'>
                <span className='text-gray-500'>نویسنده:</span>
                <span className='font-semibold text-gray-800'>
                  {typeof document.author === 'string'
                    ? document.author
                    : `${document.author?.firstName || ''} ${document.author?.lastName || ''}`.trim()}
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-gray-500'>تاریخ ایجاد:</span>
                <span className='font-medium'>
                  <ClientOnly fallback='...'>
                    {formatJalaliDate(new Date(document.createdAt), 'yyyy/M/d')}
                  </ClientOnly>
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-gray-500'>آخرین ویرایش:</span>
                <span className='font-medium'>
                  <ClientOnly fallback='...'>
                    {formatJalaliDate(new Date(document.updatedAt), 'yyyy/M/d')}
                  </ClientOnly>
                </span>
              </div>
            </div>

            {document.tags.length > 0 && (
              <div className='flex flex-wrap gap-2'>
                {document.tags.map(tag => (
                  <Badge
                    key={tag}
                    variant='secondary'
                    className='bg-pink-50 text-pink-700 border-pink-200'
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons removed - content managed via markdown files */}
        </div>

        {/* Document Content */}
        <div className='bg-white rounded-xl border border-gray-200/50 shadow-sm overflow-hidden'>
          <div className='p-8 prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-strong:text-gray-800 prose-code:text-gray-800 prose-pre:bg-gray-50 prose-pre:text-gray-800'>
            {document.htmlContent ? (
              <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(document.htmlContent) }} />
            ) : (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {document.content}
              </ReactMarkdown>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

