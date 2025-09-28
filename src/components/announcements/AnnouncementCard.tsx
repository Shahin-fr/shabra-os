'use client';

import { useState } from 'react';
// import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import {
  Pin,
  Calendar,
  // User,
  ChevronDown,
  ChevronUp,
  // ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

interface AnnouncementCardProps {
  announcement: Announcement;
  className?: string;
}

export function AnnouncementCard({ announcement, className }: AnnouncementCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'همین الان';
    } else if (diffInHours < 24) {
      return `${diffInHours} ساعت پیش`;
    } else if (diffInHours < 48) {
      return 'دیروز';
    } else {
      return formatDate(dateString);
    }
  };

  const shouldTruncate = announcement.content.length > 200;

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-md',
      announcement.isPinned && 'ring-2 ring-yellow-200 bg-yellow-50/50',
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start rtl:items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {announcement.isPinned && (
                <Pin className="h-4 w-4 text-yellow-500" />
              )}
              <h3 className="text-lg font-semibold line-clamp-2">
                {announcement.title}
              </h3>
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <Badge variant={getCategoryBadgeVariant(announcement.category)}>
                {getCategoryLabel(announcement.category)}
              </Badge>
              {announcement.isPinned && (
                <Badge variant="outline" className="text-yellow-600">
                  سنجاق شده
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Content */}
          <div className="prose prose-sm max-w-none">
            <p className={cn(
              'text-gray-700 leading-relaxed',
              !isExpanded && shouldTruncate && 'line-clamp-3'
            )}>
              {announcement.content}
            </p>
          </div>

          {/* Expand/Collapse Button */}
          {shouldTruncate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 hover:text-blue-800"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="rtl:rotate-180 h-4 w-4 ms-1" />
                  نمایش کمتر
                </>
              ) : (
                <>
                  <ChevronDown className="rtl:rotate-180 h-4 w-4 ms-1" />
                  نمایش بیشتر
                </>
              )}
            </Button>
          )}

          {/* Author and Date */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                {announcement.author.avatar ? (
                  <img
                    src={announcement.author.avatar}
                    alt={`${announcement.author.firstName} ${announcement.author.lastName}`}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  `${announcement.author.firstName.charAt(0)}${announcement.author.lastName.charAt(0)}`
                )}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {announcement.author.firstName} {announcement.author.lastName}
                </div>
                <div className="text-xs text-gray-500">
                  {announcement.author.email}
                </div>
              </div>
            </div>

            <div className="text-end">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{formatRelativeTime(announcement.createdAt)}</span>
              </div>
              {formatRelativeTime(announcement.createdAt) !== formatDate(announcement.createdAt) && (
                <div className="text-xs text-gray-500 mt-1">
                  {formatDate(announcement.createdAt)} - {formatTime(announcement.createdAt)}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
