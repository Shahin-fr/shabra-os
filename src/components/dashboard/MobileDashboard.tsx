'use client';

import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import {
  Clock,
  CheckSquare,
  Calendar,
  Users,
  TrendingUp,
  Plus,
  ChevronLeft,
  ChevronRight,
  FileText,
  Target,
  Activity,
  RefreshCw,
} from 'lucide-react';
import { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useMobile } from '@/hooks/useResponsive';
import { useQuery } from '@tanstack/react-query';
import { MobileService, MobileDashboardData } from '@/services/mobile.service';

import { MobileClockInCard } from './MobileClockInCard';
import { QuickActionCard } from './QuickActionCard';
import { SwipeableStatsCard } from './SwipeableStatsCard';

// Data interfaces for component props
interface StatData {
  id: string;
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend: string;
  trendDirection: 'up' | 'down' | 'neutral';
}

interface QuickAction {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  href: string;
}

interface MobileDashboardProps {
  className?: string;
}

export function MobileDashboard({ className }: MobileDashboardProps) {
  const { user } = useAuth();
  const isMobile = useMobile();
  const [currentStatIndex, setCurrentStatIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const { hapticSuccess } = useHapticFeedback();

  // Single data fetch for all mobile dashboard data
  const { data: dashboardData, isLoading, error, refetch } = useQuery<MobileDashboardData>({
    queryKey: ['mobile-dashboard'],
    queryFn: async () => {
      return await MobileService.getMobileDashboardData();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

  // Handle refresh with haptic feedback
  const handleRefresh = async () => {
    await refetch();
    hapticSuccess();
  };

  // Auto-scroll stats cards
  useEffect(() => {
    if (!isAutoScrolling || !dashboardData?.stats) return;

    const interval = setInterval(() => {
      setCurrentStatIndex(prev => (prev + 1) % dashboardData.stats.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoScrolling, dashboardData]);

  // Don't render on desktop - moved after all hooks
  if (!isMobile) {
    return null;
  }

  const handleStatSwipe = (direction: 'left' | 'right') => {
    if (!dashboardData?.stats) return;
    setIsAutoScrolling(false);
    if (direction === 'left') {
      setCurrentStatIndex(prev => (prev + 1) % dashboardData.stats.length);
    } else {
      setCurrentStatIndex(
        prev => (prev - 1 + dashboardData.stats.length) % dashboardData.stats.length
      );
    }
  };

  // Icon mapping functions - return component functions, not JSX elements
  const getStatsIcon = (iconName: string) => {
    switch (iconName) {
      case 'Clock':
        return Clock;
      case 'CheckSquare':
        return CheckSquare;
      case 'Target':
        return Target;
      case 'FileText':
        return FileText;
      default:
        return TrendingUp;
    }
  };

  const getQuickActionIcon = (iconName: string) => {
    switch (iconName) {
      case 'Clock':
        return Clock;
      case 'Calendar':
        return Calendar;
      case 'CheckSquare':
        return CheckSquare;
      case 'Plus':
        return Plus;
      case 'Users':
        return Users;
      case 'Target':
        return Target;
      default:
        return Plus;
    }
  };

  // Transform data for components
  const transformedStats: StatData[] = dashboardData?.stats.map(stat => ({
    ...stat,
    icon: getStatsIcon(stat.icon),
  })) || [];

  const transformedQuickActions: QuickAction[] = dashboardData?.quickActions.map(action => ({
    ...action,
    icon: getQuickActionIcon(action.icon),
  })) || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <PullToRefresh
      onRefresh={handleRefresh}
      enabled={true}
      showSuccessFeedback={true}
    >
      <OptimizedMotion
        className={`space-y-6 ${className}`}
        variants={containerVariants}
        initial='hidden'
        animate='visible'
      >
        {/* Welcome Header */}
        <OptimizedMotion variants={itemVariants}>
          <Card
            className='overflow-hidden'
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            <CardContent className='p-6'>
              <div className='flex items-center gap-4'>
                <div className='p-3 bg-[#ff0a54]/10 rounded-xl'>
                  <Clock className='h-6 w-6 text-[#ff0a54]' />
                </div>
                <div className='flex-1'>
                  <h1 className='text-xl font-bold text-gray-900'>
                    سلام،{' '}
                    {'firstName' in (user || {})
                      ? (user as any)?.firstName
                      : user?.name || 'کاربر'}
                    ! 👋
                  </h1>
                  <p className='text-gray-600'>
                    {new Date().toLocaleDateString('fa-IR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <Badge className='bg-[#ff0a54]/10 text-[#ff0a54] border-[#ff0a54]/20'>
                  موبایل
                </Badge>
              </div>
            </CardContent>
          </Card>
        </OptimizedMotion>

        {/* Clock-in Card - Only for Employees */}
        {user?.roles && user.roles.includes('EMPLOYEE') && (
          <OptimizedMotion variants={itemVariants}>
            <MobileClockInCard />
          </OptimizedMotion>
        )}

        {/* Swipeable Stats Cards */}
        <OptimizedMotion variants={itemVariants}>
          <Card
            className='overflow-hidden'
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-lg font-semibold'>
                  آمار امروز
                </CardTitle>
                {transformedStats && transformedStats.length > 0 && (
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleStatSwipe('right')}
                      className='h-8 w-8 p-0'
                    >
                      <ChevronRight className='h-4 w-4' />
                    </Button>
                    <div className='flex gap-1'>
                      {transformedStats.map((_, index) => (
                        <div
                          key={index}
                          className={`h-2 w-2 rounded-full transition-colors ${
                            index === currentStatIndex
                              ? 'bg-[#ff0a54]'
                              : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleStatSwipe('left')}
                      className='h-8 w-8 p-0'
                    >
                      <ChevronLeft className='h-4 w-4' />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className='pt-0'>
              {isLoading ? (
                <div className='space-y-4'>
                  <Skeleton className='h-32 w-full rounded-lg' />
                </div>
              ) : error ? (
                <div className='flex flex-col items-center justify-center py-8 text-center'>
                  <div className='space-y-4'>
                    <div className='p-4 rounded-full bg-red-100'>
                      <RefreshCw className='h-8 w-8 text-red-500' />
                    </div>
                    <div>
                      <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                        خطا در بارگذاری آمار
                      </h3>
                      <p className='text-sm text-gray-600 mb-4'>
                        متأسفانه امکان بارگذاری آمار امروز وجود ندارد
                      </p>
                      <Button onClick={() => refetch()} variant='outline' size='sm'>
                        تلاش مجدد
                      </Button>
                    </div>
                  </div>
                </div>
              ) : !transformedStats || transformedStats.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-8 text-center'>
                  <div className='space-y-4'>
                    <div className='p-4 rounded-full bg-gray-100'>
                      <TrendingUp className='h-8 w-8 text-gray-500' />
                    </div>
                    <div>
                      <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                        آمار موجود نیست
                      </h3>
                      <p className='text-sm text-gray-600'>
                        در حال حاضر آمار برای نمایش وجود ندارد
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <SwipeableStatsCard
                  stats={transformedStats}
                  currentIndex={currentStatIndex}
                  onSwipe={handleStatSwipe}
                />
              )}
            </CardContent>
          </Card>
        </OptimizedMotion>

        {/* Quick Actions Grid - Only for Employees */}
        {user?.roles && user.roles.includes('EMPLOYEE') && (
          <OptimizedMotion variants={itemVariants}>
            <Card
              className='overflow-hidden'
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              <CardHeader className='pb-3'>
                <CardTitle className='text-lg font-semibold'>
                  دسترسی سریع
                </CardTitle>
              </CardHeader>
              <CardContent className='pt-0'>
                {isLoading ? (
                  <div className='grid grid-cols-2 gap-3'>
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Skeleton key={index} className='h-20 w-full rounded-xl' />
                    ))}
                  </div>
                ) : error ? (
                  <div className='flex flex-col items-center justify-center py-8 text-center'>
                    <div className='space-y-4'>
                      <div className='p-4 rounded-full bg-red-100'>
                        <RefreshCw className='h-8 w-8 text-red-500' />
                      </div>
                      <div>
                        <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                          خطا در بارگذاری دسترسی‌ها
                        </h3>
                        <p className='text-sm text-gray-600 mb-4'>
                          متأسفانه امکان بارگذاری دسترسی‌های سریع وجود ندارد
                        </p>
                        <Button onClick={() => refetch()} variant='outline' size='sm'>
                          تلاش مجدد
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : !transformedQuickActions || transformedQuickActions.length === 0 ? (
                  <div className='flex flex-col items-center justify-center py-8 text-center'>
                    <div className='space-y-4'>
                      <div className='p-4 rounded-full bg-gray-100'>
                        <Plus className='h-8 w-8 text-gray-500' />
                      </div>
                      <div>
                        <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                          دسترسی موجود نیست
                        </h3>
                        <p className='text-sm text-gray-600'>
                          در حال حاضر دسترسی سریعی برای نمایش وجود ندارد
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='grid grid-cols-2 gap-3'>
                    {transformedQuickActions.map(action => (
                      <QuickActionCard key={action.id} action={action} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </OptimizedMotion>
        )}

        {/* Recent Activity */}
        <OptimizedMotion variants={itemVariants}>
          <Card
            className='overflow-hidden'
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            <CardHeader className='pb-3'>
              <CardTitle className='text-lg font-semibold'>
                فعالیت‌های اخیر
              </CardTitle>
            </CardHeader>
            <CardContent className='pt-0'>
              <div className='space-y-3'>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className='flex items-start gap-3 p-3 rounded-lg bg-gray-50/50'>
                      <Skeleton className='w-2 h-2 rounded-full mt-2' />
                      <div className='flex-1 space-y-2'>
                        <Skeleton className='h-4 w-3/4' />
                        <Skeleton className='h-3 w-1/4' />
                      </div>
                    </div>
                  ))
                ) : error ? (
                  <div className='flex flex-col items-center justify-center py-4 text-center'>
                    <div className='space-y-2'>
                      <div className='p-2 rounded-full bg-red-100'>
                        <RefreshCw className='h-4 w-4 text-red-500' />
                      </div>
                      <div>
                        <p className='text-sm text-gray-600'>خطا در بارگذاری فعالیت‌ها</p>
                        <Button onClick={() => refetch()} variant='outline' size='sm' className='mt-2'>
                          تلاش مجدد
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : !dashboardData?.recentActivity || dashboardData.recentActivity.length === 0 ? (
                  <div className='flex flex-col items-center justify-center py-4 text-center'>
                    <div className='space-y-2'>
                      <div className='p-2 rounded-full bg-gray-100'>
                        <Activity className='h-4 w-4 text-gray-500' />
                      </div>
                      <p className='text-sm text-gray-600'>فعالیتی برای نمایش وجود ندارد</p>
                    </div>
                  </div>
                ) : (
                  dashboardData.recentActivity.map(activity => (
                    <div
                      key={activity.id}
                      className='flex items-start gap-3 p-3 rounded-lg bg-gray-50/50'
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          activity.type === 'success'
                            ? 'bg-green-500'
                            : activity.type === 'warning'
                            ? 'bg-yellow-500'
                            : 'bg-blue-500'
                        }`}
                      />
                      <div className='flex-1'>
                        <p className='text-sm text-gray-900'>{activity.text}</p>
                        <p className='text-xs text-gray-500 mt-1'>
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </OptimizedMotion>
      </OptimizedMotion>
    </PullToRefresh>
  );
}

