import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layout/MainLayout';

export default function DocsNotFound() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
        <BookOpen className="h-10 w-10 text-muted-foreground" />
      </div>
      
      <h1 className="text-3xl font-bold text-foreground mb-4">
        مقاله مورد نظر یافت نشد
      </h1>
      
      <p className="text-lg text-muted-foreground mb-8">
        متأسفانه مقاله‌ای که به دنبال آن هستید وجود ندارد یا حذف شده است.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild>
          <Link href="/docs" className="inline-flex items-center gap-2">
            <ArrowRight className="h-4 w-4 rotate-180" />
            بازگشت به پایگاه دانش
          </Link>
        </Button>
        
        <Button variant="outline" asChild>
          <Link href="/" className="inline-flex items-center gap-2">
            <ArrowRight className="h-4 w-4 rotate-180" />
            بازگشت به داشبورد
          </Link>
        </Button>
      </div>
      </div>
    </MainLayout>
  );
}
