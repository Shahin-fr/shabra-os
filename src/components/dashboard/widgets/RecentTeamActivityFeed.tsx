'use client';

import { AnimatePresence } from 'framer-motion';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import {
  Activity,
  CheckCircle,
  Plus,
  MessageSquare,
  Calendar,
  FileText,
  ChevronDown,
  RefreshCw,
  Target,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardService } from '@/services/dashboard.service';

// Icon mapping for different activity types
const getIconComponent = (iconName: string) => {
  const iconProps = { className: 'h-4 w-4' };
  
  switch (iconName) {
    case 'CheckCircle':
      return <CheckCircle {...iconProps} />;
    case 'Plus':
      return <Plus {...iconProps} />;
    case 'MessageSquare':
      return <MessageSquare {...iconProps} />;
    case 'Calendar':
      return <Calendar {...iconProps} />;
    case 'FileText':
      return <FileText {...iconProps} />;
    case 'Target':
      return <Target {...iconProps} />;
    case 'Clock':
      return <Clock {...iconProps} />;
    default:
      return <Activity {...iconProps} />;
  }
};

export function RecentTeamActivityFeed() {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['team-activity'],
    queryFn: async () => {
      return await DashboardService.getRecentTeamActivity();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const getActionTypeText = (type: string) => {
    switch (type) {
      case 'task_completed':
        return 'تکمیل تسک';
      case 'task_created':
        return 'ایجاد تسک';
      case 'comment':
        return 'نظر جدید';
      case 'meeting':
        return 'برنامه‌ریزی جلسه';
      case 'document':
        return 'آپلود فایل';
      default:
        return 'فعالیت';
    }
  };

  if (isLoading) {
    return (
      <Card className='h-full bg-white border border-gray-200 shadow-sm'>
        <CardHeader className='pb-4'>
          <CardTitle className='text-lg font-bold text-gray-900 flex items-center gap-2'>
            <Activity className='h-5 w-5 text-[#ff0a54]' />
            فعالیت‌های اخیر
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className='border border-gray-200 rounded-lg p-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <Skeleton className='w-8 h-8 rounded-lg' />
                  <div className='space-y-2'>
                    <Skeleton className='h-4 w-20' />
                    <Skeleton className='h-3 w-16' />
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <Skeleton className='h-3 w-12' />
                  <Skeleton className='w-4 h-4' />
                </div>
              </div>
            </div>
          ))}
          <div className='pt-4 border-t border-gray-200'>
            <Skeleton className='h-8 w-full rounded' />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className='h-full bg-white border border-gray-200 shadow-sm'>
        <CardHeader className='pb-4'>
          <CardTitle className='text-lg font-bold text-gray-900 flex items-center gap-2'>
            <Activity className='h-5 w-5 text-[#ff0a54]' />
            فعالیت‌های اخیر
          </CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col items-center justify-center text-center py-8'>
          <div className='space-y-4'>
            <div className='p-4 rounded-full bg-red-100'>
              <RefreshCw className='h-8 w-8 text-red-500' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                خطا در بارگذاری فعالیت‌ها
              </h3>
              <p className='text-sm text-gray-600 mb-4'>
                متأسفانه امکان بارگذاری فعالیت‌های اخیر وجود ندارد
              </p>
              <Button onClick={() => refetch()} variant='outline' size='sm'>
                تلاش مجدد
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <Card className='h-full bg-white border border-gray-200 shadow-sm'>
        <CardHeader className='pb-4'>
          <CardTitle className='text-lg font-bold text-gray-900 flex items-center gap-2'>
            <Activity className='h-5 w-5 text-[#ff0a54]' />
            فعالیت‌های اخیر
          </CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col items-center justify-center text-center py-8'>
          <div className='space-y-4'>
            <div className='p-4 rounded-full bg-gray-100'>
              <Activity className='h-8 w-8 text-gray-500' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                فعالیتی موجود نیست
              </h3>
              <p className='text-sm text-gray-600'>
                در حال حاضر فعالیتی برای نمایش وجود ندارد
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <OptimizedMotion
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className='h-full'
    >
      <Card className='h-full bg-white border border-gray-200 shadow-sm'>
        <CardHeader className='pb-4'>
          <CardTitle className='text-lg font-bold text-gray-900 flex items-center gap-2'>
            <Activity className='h-5 w-5 text-[#ff0a54]' />
            فعالیت‌های اخیر
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          {data.data.map((item, index) => {
            const IconComponent = getIconComponent(item.icon);
            const isExpanded = expandedItems.includes(item.id);

            return (
              <OptimizedMotion
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className='border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow'
              >
                {/* Collapsed View - Always Visible */}
                <button
                  onClick={() => toggleExpanded(item.id)}
                  className='w-full p-4 text-right hover:bg-gray-50 transition-colors'
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className={`p-2 rounded-lg ${item.bgColor}`}>
                        <div className={item.color}>
                          {IconComponent}
                        </div>
                      </div>
                      <div className='text-right'>
                        <div className='text-sm font-medium text-gray-900'>
                          {item.user}
                        </div>
                        <div className='text-xs text-gray-600'>
                          {getActionTypeText(item.type)}
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='text-xs text-gray-500'>{item.time}</span>
                      <OptimizedMotion
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className='h-4 w-4 text-gray-400' />
                      </OptimizedMotion>
                    </div>
                  </div>
                </button>

                {/* Expanded View - Accordion */}
                <AnimatePresence>
                  {isExpanded && (
                    <OptimizedMotion
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className='border-t border-gray-200 bg-gray-50'
                    >
                      <div className='p-4'>
                        <div className='space-y-2'>
                          <div className='text-sm text-gray-700'>
                            {item.fullAction}
                          </div>
                          <div className='flex items-center justify-between'>
                            <Badge
                              variant='outline'
                              className={`text-xs ${item.color} ${item.bgColor} border-0`}
                            >
                              {getActionTypeText(item.type)}
                            </Badge>
                            <span className='text-xs text-gray-500'>
                              {item.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    </OptimizedMotion>
                  )}
                </AnimatePresence>
              </OptimizedMotion>
            );
          })}

          {/* View All Button */}
          <OptimizedMotion
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className='pt-4 border-t border-gray-200'
          >
            <Button variant='outline' size='sm' className='w-full text-xs'>
              مشاهده همه فعالیت‌ها
            </Button>
          </OptimizedMotion>
        </CardContent>
      </Card>
    </OptimizedMotion>
  );
}

