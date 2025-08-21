import { getDocBySlug, getAllDocs } from '@/lib/docs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Calendar, User, Tag, ArrowRight, BookOpen } from 'lucide-react';
import { notFound } from 'next/navigation';
import { formatJalaliDate } from '@/lib/date-utils';


interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const docs = getAllDocs();
  return docs.map((doc) => ({
    slug: doc.slug, // This is now the URL-encoded slug
  }));
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params;
  const doc = await getDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <Link 
          href="/docs" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <BookOpen className="h-4 w-4" />
          پایگاه دانش
          <ArrowRight className="h-4 w-4" />
          {doc.title}
        </Link>
      </nav>

      {/* Article Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">{doc.title}</h1>
        <p className="text-lg text-muted-foreground mb-6">{doc.description}</p>
        
        {/* Article Meta */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatJalaliDate(new Date(doc.date), 'yyyy/M/d')}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{doc.author}</span>
              </div>
              {doc.tags.length > 0 && (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  <div className="flex flex-wrap gap-1">
                    {doc.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Article Content */}
      <article className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-pre:text-foreground prose-blockquote:border-l-[#fdd6e8] prose-blockquote:bg-[#fdd6e8]/10 prose-blockquote:text-muted-foreground prose-a:text-[#fdd6e8] hover:prose-a:text-[#fdd6e8]/80">
        <div 
          className="markdown-content"
          dangerouslySetInnerHTML={{ __html: doc.htmlContent }} 
        />
      </article>

      {/* Back to Docs */}
      <div className="mt-12 pt-8 border-t border-border">
        <Link 
          href="/docs" 
          className="inline-flex items-center gap-2 text-[#fdd6e8] hover:text-[#fdd6e8]/80 transition-colors"
        >
          <ArrowRight className="h-4 w-4 rotate-180" />
          بازگشت به پایگاه دانش
        </Link>
              </div>
      </div>
  );
}
