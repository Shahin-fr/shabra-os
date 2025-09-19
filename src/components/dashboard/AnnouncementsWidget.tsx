'use client';

import { useQuery } from '@tanstack/react-query';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { 
  Megaphone, 
  Pin, 
  Calendar, 
  User, 
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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

interface AnnouncementsWidgetProps {
  className?: string;
}

export function AnnouncementsWidget({ className }: AnnouncementsWidgetProps) {
  // Fetch latest announcements
  const {
    data: announcementsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['announcements-widget'],
    queryFn: async (): Promise<{ success: boolean; data: Announcement[] }> => {
      const response = await fetch('/api/announcements?widget=true');
      if (!response.ok) {
        throw new Error('Failed to fetch announcements');
      }
      return response.json();
    },
    retry: 2,
    staleTime: 2 * 60 * 1000, // 2 minutes - widget should be relatively fresh
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    refetchOnWindowFocus: true, // Refetch on window focus for widget
  });

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      GENERAL: 'عمومی',
      TECHNICAL: 'فنی',
      EVENT: 'رویداد',
      IMPORTANT: 'مهم',
    };
    return labels[category] || category;
  };

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case 'IMPORTANT':
        return 'destructive';
      case 'TECHNICAL':
        return 'default';
      case 'EVENT':
        return 'secondary';
      case 'GENERAL':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <Loader2 className="h-6 w-6 mx-auto mb-2 animate-spin text-gray-400" />
          <p className="text-sm text-gray-500">در حال بارگذاری اعلان‌ها...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            اعلان‌ها
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-400" />
          <p className="text-sm text-red-600 mb-3">خطا در بارگذاری اعلان‌ها</p>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 ml-2" />
            تلاش مجدد
          </Button>
        </CardContent>
      </Card>
    );
  }

  const announcements = announcementsData?.data || [];

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            اعلان‌های اخیر
          </CardTitle>
          <Link href="/announcements">
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
              مشاهده همه
              <ArrowRight className="h-4 w-4 mr-2" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {announcements.length > 0 ? (
          <div className="space-y-4">
            {announcements.map((announcement, index) => (
              <OptimizedMotion
                key={announcement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {announcement.isPinned && (
                          <Pin className="h-4 w-4 text-yellow-500" />
                        )}
                        <h3 className="font-medium text-sm line-clamp-1">
                          {announcement.title}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                        {announcement.content}
                      </p>
                    </div>
                    <Badge 
                      variant={getCategoryBadgeVariant(announcement.category)}
                      className="text-xs"
                    >
                      {getCategoryLabel(announcement.category)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {announcement.author.firstName} {announcement.author.lastName}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(announcement.createdAt)} - {formatTime(announcement.createdAt)}
                    </div>
                  </div>
                </div>
              </OptimizedMotion>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Megaphone className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">هیچ اعلانی یافت نشد</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
