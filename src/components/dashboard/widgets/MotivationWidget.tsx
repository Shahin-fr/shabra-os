'use client';

import { motion } from 'framer-motion';
import { Trophy, Target, Zap, Star, TrendingUp } from 'lucide-react';
import { EnhancedWidgetCard } from '@/components/ui/EnhancedWidgetCard';
import { cn } from '@/lib/utils';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
}

interface MotivationWidgetProps {
  className?: string;
  variant?: 'mobile' | 'desktop';
  priority?: 'high' | 'medium' | 'low';
}

const achievements: Achievement[] = [
  {
    id: '1',
    title: 'تکمیل کننده سریع',
    description: '۵ کار را در یک روز تکمیل کنید',
    icon: Zap,
    color: 'text-yellow-600 bg-yellow-100',
    progress: 3,
    maxProgress: 5,
    unlocked: false,
  },
  {
    id: '2',
    title: 'همکار نمونه',
    description: 'در ۱۰ جلسه تیمی شرکت کنید',
    icon: Target,
    color: 'text-blue-600 bg-blue-100',
    progress: 7,
    maxProgress: 10,
    unlocked: false,
  },
  {
    id: '3',
    title: 'مداوم‌کار',
    description: '۷ روز متوالی کار کنید',
    icon: TrendingUp,
    color: 'text-green-600 bg-green-100',
    progress: 5,
    maxProgress: 7,
    unlocked: false,
  },
  {
    id: '4',
    title: 'ستاره تیم',
    description: '۱۰ امتیاز مثبت دریافت کنید',
    icon: Star,
    color: 'text-purple-600 bg-purple-100',
    progress: 10,
    maxProgress: 10,
    unlocked: true,
  },
];

export function MotivationWidget({ className, variant = 'desktop', priority = 'medium' }: MotivationWidgetProps) {
  const isMobile = variant === 'desktop';
  const visibleAchievements = isMobile ? achievements.slice(0, 2) : achievements.slice(0, 3);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const progressPercentage = (unlockedCount / totalCount) * 100;

  return (
    <EnhancedWidgetCard
      title="دستاوردها"
      variant="employee"
      priority={priority}
      className={className}
    >
      {/* Progress Overview */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 font-vazirmatn">
            پیشرفت کلی
          </span>
          <span className="text-sm text-gray-600 font-vazirmatn">
            {unlockedCount}/{totalCount}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <div className="text-center text-xs text-gray-500 font-vazirmatn mt-1">
          {Math.round(progressPercentage)}% تکمیل شده
        </div>
      </div>

      {/* Achievements List */}
      <div className="space-y-3">
        {visibleAchievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            className={cn(
              'p-3 rounded-xl border transition-all duration-200',
              achievement.unlocked
                ? 'bg-green-50 border-green-200'
                : 'bg-white/60 border-white/40 hover:bg-white/80'
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start rtl:items-start gap-3">
              {/* Icon */}
              <div className={cn(
                'p-2 rounded-lg flex-shrink-0',
                achievement.unlocked ? 'bg-green-100' : achievement.color
              )}>
                <achievement.icon className={cn(
                  'h-5 w-5',
                  achievement.unlocked ? 'text-green-600' : 'text-gray-600'
                )} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={cn(
                    'font-vazirmatn font-semibold leading-tight',
                    achievement.unlocked ? 'text-green-800' : 'text-gray-900',
                    isMobile ? 'text-sm' : 'text-base'
                  )}>
                    {achievement.title}
                  </h4>
                  {achievement.unlocked && (
                    <Trophy className="h-4 w-4 text-yellow-500" />
                  )}
                </div>

                <p className={cn(
                  'text-gray-600 font-vazirmatn mb-2',
                  isMobile ? 'text-xs' : 'text-sm'
                )}>
                  {achievement.description}
                </p>

                {/* Progress Bar */}
                {!achievement.unlocked && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 font-vazirmatn">
                        {achievement.progress}/{achievement.maxProgress}
                      </span>
                      <span className="text-gray-500 font-vazirmatn">
                        {Math.round((achievement.progress / achievement.maxProgress) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <motion.div
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-1.5 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Motivation Message */}
      <motion.div
        className="mt-4 p-3 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-500" />
          <p className="text-sm text-yellow-700 font-vazirmatn">
            {unlockedCount > 0 
              ? `عالی! ${unlockedCount} دستاورد کسب کرده‌اید. ادامه دهید! 🎉`
              : 'اولین دستاورد خود را کسب کنید! 🚀'
            }
          </p>
        </div>
      </motion.div>

      {/* Action Button */}
      <div className="pt-4 border-t border-white/40">
        <motion.button
          className="w-full text-center text-sm text-blue-600 font-vazirmatn hover:text-blue-800 transition-colors duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            window.location.href = '/achievements';
          }}
        >
          مشاهده همه دستاوردها
        </motion.button>
      </div>
    </EnhancedWidgetCard>
  );
}
