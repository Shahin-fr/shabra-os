'use client';

import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Activity, CheckCircle, Plus, MessageSquare, Calendar } from 'lucide-react';
import { EnhancedWidgetCard } from '@/components/ui/EnhancedWidgetCard';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  type: 'task_completed' | 'task_created' | 'comment_added' | 'meeting_scheduled' | 'status_changed';
  user: {
    name: string;
    avatar?: string;
  };
  description: string;
  timestamp: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface RecentActivityWidgetProps {
  className?: string;
  variant?: 'mobile' | 'desktop';
  priority?: 'high' | 'medium' | 'low';
}

export function RecentActivityWidget({ className, variant = 'desktop', priority = 'medium' }: RecentActivityWidgetProps) {
  const { data: activities, isLoading, error } = useQuery({
    queryKey: ['recent', 'activity'],
    queryFn: async (): Promise<ActivityItem[]> => {
      // Mock data for now - replace with actual API call
      return [
        {
          id: '1',
          type: 'task_completed',
          user: { name: 'احمد محمدی', avatar: '' },
          description: 'کار "طراحی رابط کاربری" را تکمیل کرد',
          timestamp: '2024-01-15T10:30:00Z',
          icon: CheckCircle,
          color: 'text-green-600 bg-green-100',
        },
        {
          id: '2',
          type: 'task_created',
          user: { name: 'فاطمه احمدی', avatar: '' },
          description: 'کار جدید "تست عملکرد" ایجاد کرد',
          timestamp: '2024-01-15T09:15:00Z',
          icon: Plus,
          color: 'text-blue-600 bg-blue-100',
        },
        {
          id: '3',
          type: 'comment_added',
          user: { name: 'علی رضایی', avatar: '' },
          description: 'نظری روی پروژه "سیستم مدیریت" اضافه کرد',
          timestamp: '2024-01-15T08:45:00Z',
          icon: MessageSquare,
          color: 'text-purple-600 bg-purple-100',
        },
        {
          id: '4',
          type: 'meeting_scheduled',
          user: { name: 'مریم حسینی', avatar: '' },
          description: 'جلسه "بررسی هفتگی" را برنامه‌ریزی کرد',
          timestamp: '2024-01-15T08:00:00Z',
          icon: Calendar,
          color: 'text-orange-600 bg-orange-100',
        },
        {
          id: '5',
          type: 'status_changed',
          user: { name: 'حسن کریمی', avatar: '' },
          description: 'وضعیت پروژه "اپلیکیشن موبایل" را به "در حال انجام" تغییر داد',
          timestamp: '2024-01-15T07:30:00Z',
          icon: Activity,
          color: 'text-yellow-600 bg-yellow-100',
        },
      ];
    },
    refetchInterval: 60000, // Refetch every minute
  });

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} روز پیش`;
    } else if (diffHours > 0) {
      return `${diffHours} ساعت پیش`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} دقیقه پیش`;
    } else {
      return 'همین الان';
    }
  };

  const isMobile = variant === 'mobile';
  const safeActivities = Array.isArray(activities) ? activities : [];
  const visibleActivities = isMobile ? safeActivities.slice(0, 3) : safeActivities.slice(0, 5);

  return (
    <EnhancedWidgetCard
      title="فعالیت‌های اخیر"
      variant="manager"
      priority={priority}
      className={className}
      loading={isLoading}
      error={error?.message}
      empty={!isLoading && safeActivities.length === 0}
      emptyMessage="هیچ فعالیتی یافت نشد"
      emptyIcon={<Activity className="h-8 w-8 text-blue-400" />}
    >
      {/* Activity Feed */}
      <div className="space-y-3">
        {visibleActivities.map((activity, index) => (
          <motion.div
            key={activity.id}
            className="flex items-start gap-3 p-3 rounded-xl bg-white/60 border border-white/40 hover:bg-white/80 transition-all duration-200"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            whileHover={{ scale: 1.01 }}
          >
            {/* Icon */}
            <div className={cn(
              'p-2 rounded-lg flex-shrink-0',
              activity.color
            )}>
              <activity.icon className="h-4 w-4" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-gray-900 font-vazirmatn leading-tight',
                    isMobile ? 'text-sm' : 'text-base'
                  )}>
                    <span className="font-semibold text-blue-600">
                      {activity.user.name}
                    </span>
                    {' '}
                    {activity.description}
                  </p>
                </div>
                <span className={cn(
                  'text-gray-500 font-vazirmatn flex-shrink-0',
                  isMobile ? 'text-xs' : 'text-sm'
                )}>
                  {formatTime(activity.timestamp)}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Live Indicator */}
      {safeActivities.length > 0 && (
        <motion.div
          className="mt-4 flex items-center gap-2 text-sm text-green-600 font-vazirmatn"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>فعالیت‌ها به صورت زنده به‌روزرسانی می‌شوند</span>
        </motion.div>
      )}

      {/* Action Button */}
      {safeActivities.length > 0 && (
        <div className="pt-4 border-t border-white/40">
          <motion.button
            className="w-full text-center text-sm text-blue-600 font-vazirmatn hover:text-blue-800 transition-colors duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              window.location.href = '/activity';
            }}
          >
            مشاهده همه فعالیت‌ها
          </motion.button>
        </div>
      )}
    </EnhancedWidgetCard>
  );
}
