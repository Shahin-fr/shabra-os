'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { 
  Megaphone,
  Search,
  RefreshCw,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AnnouncementCard } from '@/components/announcements/AnnouncementCard';

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'GENERAL' | 'TECHNICAL' | 'EVENT' | 'IMPORTANT';
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
}

interface AnnouncementsResponse {
  success: boolean;
  data: Announcement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function AnnouncementsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch announcements
  const {
    data: announcementsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['announcements', debouncedSearchTerm, categoryFilter, page],
    queryFn: async (): Promise<AnnouncementsResponse> => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(categoryFilter && categoryFilter !== 'all' && { category: categoryFilter }),
      });

      const response = await fetch(`/api/announcements?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch announcements');
      }
      return response.json();
    },
    retry: 2,
    staleTime: 3 * 60 * 1000, // 3 minutes - announcements change more frequently
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    refetchOnWindowFocus: true, // Refetch on window focus for announcements
  });


  // Use server-side filtered data directly (no client-side filtering needed)
  const announcements = announcementsData?.data || [];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <OptimizedMotion
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-4xl mx-auto"
        >
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin" />
              <p>در حال بارگذاری اعلان‌ها...</p>
            </CardContent>
          </Card>
        </OptimizedMotion>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <OptimizedMotion
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              خطا در بارگذاری اعلان‌ها: {error.message}
            </AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 ml-2" />
              تلاش مجدد
            </Button>
          </div>
        </OptimizedMotion>
      </div>
    );
  }

  const pagination = announcementsData?.pagination;

  return (
    <div className="container mx-auto px-4 py-8">
      <OptimizedMotion
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Megaphone className="h-8 w-8" />
            اعلان‌ها
          </h1>
          <p className="text-gray-600">
            آخرین اخبار و اطلاعیه‌های داخلی
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="جستجو در اعلان‌ها..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="فیلتر بر اساس دسته" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه دسته‌ها</SelectItem>
                  <SelectItem value="GENERAL">عمومی</SelectItem>
                  <SelectItem value="TECHNICAL">فنی</SelectItem>
                  <SelectItem value="EVENT">رویداد</SelectItem>
                  <SelectItem value="IMPORTANT">مهم</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ml-2 ${isLoading ? 'animate-spin' : ''}`} />
                بروزرسانی
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Announcements List */}
        <div className="space-y-6">
          {announcements.length > 0 ? (
            <>
              {announcements.map((announcement, index) => (
                <OptimizedMotion
                  key={announcement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <AnnouncementCard announcement={announcement} />
                </OptimizedMotion>
              ))}

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 1}
                  >
                    قبلی
                  </Button>
                  <span className="text-sm text-gray-600">
                    صفحه {page} از {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= pagination.pages}
                  >
                    بعدی
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Megaphone className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">هیچ اعلانی یافت نشد</h3>
                <p className="text-gray-600">
                  {searchTerm || categoryFilter 
                    ? 'با فیلترهای انتخاب شده هیچ اعلانی یافت نشد'
                    : 'هنوز هیچ اعلانی منتشر نشده است'
                  }
                </p>
                {(searchTerm || categoryFilter) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setCategoryFilter('');
                    }}
                    className="mt-4"
                  >
                    پاک کردن فیلترها
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </OptimizedMotion>
    </div>
  );
}
