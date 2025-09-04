'use client';

import { motion } from 'framer-motion';
import {
  Clock,
  CheckSquare,
  Calendar,
  Users,
  TrendingUp,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { useAuth } from '@/hooks/useAuth';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useMobile } from '@/hooks/useResponsive';

import { MobileClockInCard } from './MobileClockInCard';
import { QuickActionCard } from './QuickActionCard';
import { SwipeableStatsCard } from './SwipeableStatsCard';

// Mock data for demonstration
const mockStats = [
  {
    id: 'tasks',
    title: 'وظایف امروز',
    value: '8',
    subtitle: 'از 12 تکمیل شده',
    icon: CheckSquare,
    color: 'blue',
    trend: '+2',
    trendDirection: 'up' as const,
  },
  {
    id: 'tasks',
    title: 'تسک‌های فعال',
    value: '15',
    subtitle: 'در حال انجام',
    icon: CheckSquare,
    color: 'purple',
    trend: '+3',
    trendDirection: 'up' as const,
  },
  {
    id: 'team',
    title: 'اعضای تیم',
    value: '12',
    subtitle: 'آنلاین: 8 نفر',
    icon: Users,
    color: 'green',
    trend: '0',
    trendDirection: 'neutral' as const,
  },
  {
    id: 'performance',
    title: 'عملکرد هفته',
    value: '94%',
    subtitle: 'بهتر از هفته قبل',
    icon: TrendingUp,
    color: 'orange',
    trend: '+5%',
    trendDirection: 'up' as const,
  },
];

const quickActions = [
  {
    id: 'new-task',
    title: 'وظیفه جدید',
    icon: Plus,
    color: 'bg-blue-500',
    href: '/tasks/create',
  },
  {
    id: 'new-task',
    title: 'تسک جدید',
    icon: Plus,
    color: 'bg-purple-500',
    href: '/tasks',
  },
  {
    id: 'schedule',
    title: 'برنامه‌ریزی',
    icon: Calendar,
    color: 'bg-green-500',
    href: '/content-calendar',
  },
  {
    id: 'team',
    title: 'مدیریت تیم',
    icon: Users,
    color: 'bg-orange-500',
    href: '/team',
  },
];

interface MobileDashboardProps {
  className?: string;
}

export function MobileDashboard({ className }: MobileDashboardProps) {
  const { user } = useAuth();
  const isMobile = useMobile();
  const [currentStatIndex, setCurrentStatIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const { hapticSuccess } = useHapticFeedback();

  // Handle refresh with haptic feedback
  const handleRefresh = async () => {
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    hapticSuccess();
  };

  // Auto-scroll stats cards
  useEffect(() => {
    if (!isAutoScrolling) return;

    const interval = setInterval(() => {
      setCurrentStatIndex(prev => (prev + 1) % mockStats.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoScrolling]);

  // Don't render on desktop - moved after all hooks
  if (!isMobile) {
    return null;
  }

  const handleStatSwipe = (direction: 'left' | 'right') => {
    setIsAutoScrolling(false);
    if (direction === 'left') {
      setCurrentStatIndex(prev => (prev + 1) % mockStats.length);
    } else {
      setCurrentStatIndex(
        prev => (prev - 1 + mockStats.length) % mockStats.length
      );
    }
  };

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
      <motion.div
        className={`space-y-6 ${className}`}
        variants={containerVariants}
        initial='hidden'
        animate='visible'
      >
        {/* Welcome Header */}
        <motion.div variants={itemVariants}>
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
        </motion.div>

        {/* Clock-in Card - Only for Employees */}
        {user?.roles && user.roles.includes('EMPLOYEE') && (
          <motion.div variants={itemVariants}>
            <MobileClockInCard />
          </motion.div>
        )}

        {/* Swipeable Stats Cards */}
        <motion.div variants={itemVariants}>
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
                    {mockStats.map((_, index) => (
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
              </div>
            </CardHeader>
            <CardContent className='pt-0'>
              <SwipeableStatsCard
                stats={mockStats}
                currentIndex={currentStatIndex}
                onSwipe={handleStatSwipe}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions Grid - Only for Employees */}
        {user?.roles && user.roles.includes('EMPLOYEE') && (
          <motion.div variants={itemVariants}>
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
                <div className='grid grid-cols-2 gap-3'>
                  {quickActions.map(action => (
                    <QuickActionCard key={action.id} action={action} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
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
                {[
                  {
                    id: 1,
                    text: 'وظیفه "طراحی رابط کاربری" تکمیل شد',
                    time: '2 ساعت پیش',
                    type: 'success',
                  },
                  {
                    id: 2,
                    text: 'تسک "طراحی رابط کاربری" شروع شد',
                    time: '4 ساعت پیش',
                    type: 'info',
                  },
                  {
                    id: 3,
                    text: 'عضو جدید به تیم اضافه شد',
                    time: '1 روز پیش',
                    type: 'info',
                  },
                ].map(activity => (
                  <div
                    key={activity.id}
                    className='flex items-start gap-3 p-3 rounded-lg bg-gray-50/50'
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === 'success'
                          ? 'bg-green-500'
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
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </PullToRefresh>
  );
}
