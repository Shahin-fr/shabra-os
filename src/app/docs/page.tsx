import { getAllDocs, getAllTags } from '@/lib/docs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Calendar, User, Tag } from 'lucide-react';
import { formatJalaliDate } from '@/lib/date-utils';


export default function DocsPage() {
  const docs = getAllDocs();
  const tags = getAllTags();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">پایگاه دانش</h1>
        <p className="text-lg text-muted-foreground">
          مرجع کامل راهنماها و مستندات Shabra OS
        </p>
      </div>

      {/* Tags Filter */}
      {tags.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Tag className="h-5 w-5" />
            دسته‌بندی‌ها
          </h2>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="hover:bg-[#fdd6e8]/30 hover:text-black transition-colors cursor-pointer"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {docs.map((doc) => (
          <Link key={doc.slug} href={`/docs/${doc.slug}`}>
            <Card className="h-full hover:shadow-lg transition-all duration-200 hover:border-[#fdd6e8]/50 group">
              <CardHeader>
                <CardTitle className="group-hover:text-[#ff0a54] transition-colors line-clamp-2">
                  {doc.title}
                </CardTitle>
                <CardDescription className="line-clamp-3">
                  {doc.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatJalaliDate(new Date(doc.date), 'yyyy/M/d')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{doc.author}</span>
                  </div>
                </div>
                
                {/* Tags */}
                {doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {doc.tags.slice(0, 3).map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {doc.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{doc.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {docs.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Tag className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">هیچ مقاله‌ای یافت نشد</h3>
          <p className="text-muted-foreground">
            مقالات مستندات در پوشه content/docs قرار می‌گیرند
          </p>
        </div>
      )}
      </div>
  );
}
