'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Megaphone, Calendar, User, AlertCircle, Eye, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { WidgetCard } from './WidgetCard';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { toast } from 'sonner';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'GENERAL' | 'URGENT' | 'TEAM' | 'COMPANY';
  author: {
    name: string;
    avatar?: string;
  };
  createdAt: string;
  isRead: boolean;
}

interface AnnouncementsWidgetProps {
  className?: string;
  variant?: 'mobile' | 'desktop';
}

export function AnnouncementsWidget({ className, variant = 'desktop' }: AnnouncementsWidgetProps) {
  const queryClient = useQueryClient();
  const [expandedAnnouncement, setExpandedAnnouncement] = useState<string | null>(null);

  const { data: announcements, isLoading, error } = useQuery({
    queryKey: ['announcements', 'recent'],
    queryFn: async (): Promise<Announcement[]> => {
      const response = await fetch('/api/announcements/recent');
      if (!response.ok) {
        throw new Error('Failed to fetch announcements');
      }
      const data = await response.json();
      return Array.isArray(data.data) ? data.data : [];
    },
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  // Mark announcement as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (announcementId: string) => {
      const response = await fetch(`/api/announcements/${announcementId}/read`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark announcement as read');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements', 'recent'] });
    },
    onError: () => {
      toast.error('خطا در به‌روزرسانی وضعیت اعلان');
    },
  });

  const handleMarkAsRead = (announcementId: string) => {
    markAsReadMutation.mutate(announcementId);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'URGENT':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'TEAM':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'COMPANY':
        return 'text-purple-600 bg-purple-100 border-purple-200';
      case 'GENERAL':
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'URGENT':
        return 'فوری';
      case 'TEAM':
        return 'تیمی';
      case 'COMPANY':
        return 'شرکتی';
      case 'GENERAL':
      default:
        return 'عمومی';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'URGENT':
        return <AlertCircle className="h-4 w-4" />;
      case 'TEAM':
        return <User className="h-4 w-4" />;
      case 'COMPANY':
        return <Megaphone className="h-4 w-4" />;
      case 'GENERAL':
      default:
        return <Megaphone className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'امروز';
    } else if (diffDays === 1) {
      return 'دیروز';
    } else if (diffDays < 7) {
      return `${diffDays} روز پیش`;
    } else {
      return date.toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isMobile = variant === 'mobile';
  const safeAnnouncements = Array.isArray(announcements) ? announcements : [];
  const unreadCount = safeAnnouncements.filter(announcement => !announcement.isRead).length;

  if (isLoading) {
    return (
      <WidgetCard
        title="اعلانات"
        className={cn(
          'bg-gradient-to-br from-orange-50 to-red-50',
          className
        )}
        loading={true}
        variant={variant}
      />
    );
  }

  if (error) {
    return (
      <WidgetCard
        title="اعلانات"
        className={cn(
          'bg-gradient-to-br from-red-50 to-pink-50',
          className
        )}
        variant={variant}
      >
        <div className="text-center py-4">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 text-sm">خطا در بارگذاری اعلانات</p>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard
      title="اعلانات"
      className={cn(
        'bg-gradient-to-br from-orange-50 to-red-50',
        className
      )}
      variant={variant}
    >
      <div className="space-y-4">
        {/* Header with unread count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 font-vazirmatn">اعلانات اخیر</h3>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-vazirmatn">
                {unreadCount} جدید
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/announcements'}
            className="text-xs font-vazirmatn"
          >
            همه
          </Button>
        </div>

        {/* Announcements List */}
        <div className="space-y-3">
          {safeAnnouncements.length === 0 ? (
            <div className="text-center py-6">
              <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 font-vazirmatn">هیچ اعلانی وجود ندارد</p>
            </div>
          ) : (
            safeAnnouncements.slice(0, isMobile ? 3 : 5).map((announcement, index) => (
              <OptimizedMotion
                key={announcement.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "bg-white rounded-xl p-4 shadow-sm border transition-all duration-200 hover:shadow-md",
                  !announcement.isRead ? "border-l-4 border-l-blue-500" : "border-gray-200"
                )}
              >
                <div className="space-y-3">
                  {/* Announcement Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium font-vazirmatn flex items-center gap-1 border',
                          getTypeColor(announcement.type)
                        )}>
                          {getTypeIcon(announcement.type)}
                          {getTypeText(announcement.type)}
                        </span>
                        {!announcement.isRead && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <h4 className="font-semibold text-gray-900 font-vazirmatn mb-1">
                        {announcement.title}
                      </h4>
                    </div>
                  </div>

                  {/* Announcement Content */}
                  <div className="text-sm text-gray-600 font-vazirmatn">
                    {expandedAnnouncement === announcement.id ? (
                      <div className="space-y-2">
                        <p className="whitespace-pre-wrap">{announcement.content}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedAnnouncement(null)}
                          className="text-xs p-1 h-auto"
                        >
                          <ChevronUp className="h-3 w-3 ml-1" />
                          بستن
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="line-clamp-2 flex-1">
                          {announcement.content.length > 100 
                            ? `${announcement.content.substring(0, 100)}...` 
                            : announcement.content
                          }
                        </p>
                        {announcement.content.length > 100 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedAnnouncement(announcement.id)}
                            className="text-xs p-1 h-auto"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Announcement Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-500 font-vazirmatn">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {announcement.author.name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(announcement.createdAt)} - {formatTime(announcement.createdAt)}
                      </div>
                    </div>
                    
                    {!announcement.isRead && (
                      <Button
                        size="sm"
                        onClick={() => handleMarkAsRead(announcement.id)}
                        disabled={markAsReadMutation.isPending}
                        className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 h-7"
                      >
                        <Eye className="h-3 w-3 ml-1" />
                        خواندم
                      </Button>
                    )}
                  </div>
                </div>
              </OptimizedMotion>
            ))
          )}
        </div>

        {/* View All Button */}
        {safeAnnouncements.length > (isMobile ? 3 : 5) && (
          <div className="text-center pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/announcements'}
              className="text-xs font-vazirmatn"
            >
              مشاهده همه اعلانات
            </Button>
          </div>
        )}
      </div>
    </WidgetCard>
  );
}