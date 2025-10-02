'use client';

import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Target, Clock, Award, Zap } from 'lucide-react';
import { EnhancedWidgetCard } from '@/components/ui/EnhancedWidgetCard';
import { cn } from '@/lib/utils';

interface PersonalInsight {
  id: string;
  type: 'productivity' | 'focus' | 'collaboration' | 'achievement';
  title: string;
  description: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface PersonalInsightsWidgetProps {
  className?: string;
  variant?: 'mobile' | 'desktop';
  priority?: 'high' | 'medium' | 'low';
}

export function PersonalInsightsWidget({ className, variant = 'desktop', priority = 'medium' }: PersonalInsightsWidgetProps) {
  const { data: insights, isLoading, error } = useQuery({
    queryKey: ['personal', 'insights'],
    queryFn: async (): Promise<PersonalInsight[]> => {
      // Mock data for now - replace with actual API call
      return [
        {
          id: '1',
          type: 'productivity',
          title: 'بهره‌وری امروز',
          description: '۲۵% بهتر از دیروز',
          value: 85,
          trend: 'up',
          icon: TrendingUp,
          color: 'text-status-success-text bg-status-success',
        },
        {
          id: '2',
          type: 'focus',
          title: 'زمان تمرکز',
          description: '۳ ساعت و ۲۰ دقیقه',
          value: 200,
          trend: 'up',
          icon: Target,
          color: 'text-brand-pink-text bg-brand-pink',
        },
        {
          id: '3',
          type: 'collaboration',
          title: 'همکاری تیمی',
          description: '۵ جلسه این هفته',
          value: 5,
          trend: 'stable',
          icon: Clock,
          color: 'text-brand-plum-text bg-brand-plum',
        },
        {
          id: '4',
          type: 'achievement',
          title: 'دستاوردها',
          description: '۳ هدف محقق شده',
          value: 3,
          trend: 'up',
          icon: Award,
          color: 'text-status-warning-text bg-status-warning',
        },
      ];
    },
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-status-success" />;
      case 'down':
        return <TrendingUp className="h-4 w-4 text-status-danger rotate-180" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-status-success-text';
      case 'down':
        return 'text-status-danger-text';
      default:
        return 'text-gray-600';
    }
  };

  const isMobile = variant === 'mobile';
  const safeInsights = Array.isArray(insights) ? insights : [];
  const visibleInsights = isMobile ? safeInsights.slice(0, 2) : safeInsights.slice(0, 4);

  return (
    <EnhancedWidgetCard
      title="نکات شخصی"
      variant="employee"
      priority={priority}
      className={className}
      loading={isLoading}
      error={error?.message}
      empty={!isLoading && safeInsights.length === 0}
      emptyMessage="در حال تحلیل الگوهای کاری شما..."
      emptyIcon={<Zap className="h-8 w-8 text-brand-pink" />}
    >
      {/* Insights Grid */}
      <div className={cn(
        'grid gap-4',
        isMobile ? 'grid-cols-1' : 'grid-cols-2'
      )}>
        {visibleInsights.map((insight, index) => (
          <motion.div
            key={insight.id}
            className="p-4 rounded-xl bg-white/60 border border-white/40 hover:bg-white/80 transition-all duration-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start rtl:items-start gap-3">
              {/* Icon */}
              <div className={cn(
                'p-2 rounded-lg',
                insight.color
              )}>
                <insight.icon className="h-5 w-5" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={cn(
                    'font-vazirmatn font-semibold text-gray-900',
                    isMobile ? 'text-sm' : 'text-base'
                  )}>
                    {insight.title}
                  </h4>
                  {getTrendIcon(insight.trend)}
                </div>

                <div className="flex items-center justify-between">
                  <div className={cn(
                    'text-2xl font-bold font-vazirmatn',
                    getTrendColor(insight.trend)
                  )}>
                    {insight.type === 'focus' ? `${Math.floor(insight.value / 60)}:${(insight.value % 60).toString().padStart(2, '0')}` : insight.value}
                    {insight.type === 'productivity' && '%'}
                  </div>
                  <p className={cn(
                    'text-xs text-gray-600 font-vazirmatn',
                    isMobile ? 'text-xs' : 'text-sm'
                  )}>
                    {insight.description}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Motivation Message */}
      {safeInsights.length > 0 && (
        <motion.div
          className="mt-4 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-brand-pink" />
            <p className="text-sm text-brand-pink-text font-vazirmatn">
              عالی! امروز عملکرد بهتری نسبت به دیروز داشته‌اید. ادامه دهید! 🚀
            </p>
          </div>
        </motion.div>
      )}

      {/* Action Button */}
      {safeInsights.length > 0 && (
        <div className="pt-4 border-t border-white/40">
          <motion.button
            className="w-full text-center text-sm text-brand-pink-text font-vazirmatn hover:text-brand-pink-text transition-colors duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              window.location.href = '/personal/insights';
            }}
          >
            مشاهده جزئیات بیشتر
          </motion.button>
        </div>
      )}
    </EnhancedWidgetCard>
  );
}
