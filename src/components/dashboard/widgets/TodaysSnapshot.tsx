'use client';

import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { Users, CheckCircle, Clock, Target, TrendingUp, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { DashboardService, SnapshotItem } from '@/services/dashboard.service';
import { useEffect, useState } from 'react';

// Icon mapping for different snapshot types
const getIconComponent = (iconName: string) => {
  const iconProps = { className: 'h-6 w-6 text-gray-600' };
  
  switch (iconName) {
    case 'Clock':
      return <Clock {...iconProps} />;
    case 'CheckCircle':
      return <CheckCircle {...iconProps} />;
    case 'Target':
      return <Target {...iconProps} />;
    case 'Users':
      return <Users {...iconProps} />;
    default:
      return <TrendingUp {...iconProps} />;
  }
};

export function TodaysSnapshot() {
  const [isClient, setIsClient] = useState(false);
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard-snapshot'],
    queryFn: async () => {
      return await DashboardService.getTodaysSnapshot();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 2 * 60 * 1000, // 2 minutes
  });

  // Ensure component only renders animations after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (isLoading) {
    return (
      <Card className='h-full bg-white border border-gray-200 shadow-sm'>
        <CardContent className='p-6 h-full flex flex-col'>
          <div className='space-y-8 flex-1'>
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <Skeleton className='w-12 h-12 rounded-xl' />
                    <div className='space-y-2'>
                      <Skeleton className='h-4 w-24' />
                      <Skeleton className='h-8 w-16' />
                    </div>
                  </div>
                  <Skeleton className='h-6 w-12 rounded-full' />
                </div>
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-20' />
                  <Skeleton className='h-2 w-full rounded-full' />
                </div>
              </div>
            ))}
          </div>
          <div className='mt-8 p-4 rounded-xl bg-gray-50 border border-gray-200'>
            <div className='flex items-center gap-3'>
              <Skeleton className='w-8 h-8 rounded-lg' />
              <div className='space-y-2'>
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-3 w-32' />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className='h-full bg-white border border-gray-200 shadow-sm'>
        <CardContent className='p-6 h-full flex flex-col items-center justify-center text-center'>
          <div className='space-y-4'>
            <div className='p-4 rounded-full bg-red-100'>
              <RefreshCw className='h-8 w-8 text-red-500' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                خطا در بارگذاری داده‌ها
              </h3>
              <p className='text-sm text-gray-600 mb-4'>
                متأسفانه امکان بارگذاری تصویر امروز وجود ندارد
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
        <CardContent className='p-6 h-full flex flex-col items-center justify-center text-center'>
          <div className='space-y-4'>
            <div className='p-4 rounded-full bg-gray-100'>
              <TrendingUp className='h-8 w-8 text-gray-500' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                داده‌ای موجود نیست
              </h3>
              <p className='text-sm text-gray-600'>
                در حال حاضر اطلاعاتی برای نمایش وجود ندارد
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <OptimizedMotion
      initial={isClient ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
      animate={isClient ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
      transition={isClient ? { duration: 0.6 } : { duration: 0 }}
      className='h-full'
    >
      <Card className='h-full bg-white border border-gray-200 shadow-sm'>
        <CardContent className='p-6 h-full flex flex-col'>
          <div className='space-y-8 flex-1'>
            {data.data.map((item, index) => {
              const IconComponent = getIconComponent(item.icon);
              return (
                <OptimizedMotion
                  key={item.title}
                  initial={isClient ? { opacity: 0, x: -20 } : { opacity: 1, x: 0 }}
                  animate={isClient ? { opacity: 1, x: 0 } : { opacity: 1, x: 0 }}
                  transition={isClient ? { delay: index * 0.1 } : { delay: 0 }}
                  className='space-y-4'
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                      <div className='p-3 rounded-xl bg-gray-50'>
                        {IconComponent}
                      </div>
                      <div>
                        <h3 className='text-sm font-medium text-gray-700 mb-1'>
                          {item.title}
                        </h3>
                        <div className='flex items-baseline gap-2'>
                          <span className='text-2xl font-bold text-gray-900'>
                            {item.value}
                          </span>
                          <span className='text-sm text-gray-500'>
                            از {item.total}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='text-right'>
                      <div className='text-sm font-medium text-[#ff0a54] bg-[#ff0a54]/10 px-3 py-1 rounded-full'>
                        {item.trend}
                      </div>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-600'>
                        {item.percentage}% تکمیل
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <OptimizedMotion
                        className="h-2 rounded-full bg-[#ff0a54]" 
                        style={{ transformOrigin: 'left center' }}
                        initial={isClient ? { scaleX: 0 } : { scaleX: item.percentage / 100 }}
                        animate={isClient ? { scaleX: item.percentage / 100 } : { scaleX: item.percentage / 100 }}
                        transition={isClient ? { duration: 0.8, delay: index * 0.1 + 0.3 } : { duration: 0 }}
                      />
                    </div>
                  </div>
                </OptimizedMotion>
              );
            })}
          </div>

          {/* Summary Section */}
          <OptimizedMotion
            initial={isClient ? { opacity: 0 } : { opacity: 1 }}
            animate={isClient ? { opacity: 1 } : { opacity: 1 }}
            transition={isClient ? { delay: 0.8 } : { delay: 0 }}
            className='mt-8 p-4 rounded-xl bg-gray-50 border border-gray-200'
          >
            <div className='flex items-center gap-3'>
              <div className='p-2 rounded-lg bg-[#ff0a54]/10'>
                <TrendingUp className='h-5 w-5 text-[#ff0a54]' />
              </div>
              <div>
                <h4 className='font-semibold text-gray-900 text-sm'>
                  {data.summary.status}
                </h4>
                <p className='text-xs text-gray-600 mt-1'>
                  {data.summary.message}
                </p>
              </div>
            </div>
          </OptimizedMotion>
        </CardContent>
      </Card>
    </OptimizedMotion>
  );
}

