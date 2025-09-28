'use client';

import { AnimatePresence } from '@/lib/framer-motion-optimized';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { RefreshCw, CheckCircle } from 'lucide-react';
import React from 'react';

import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  enabled?: boolean;
  showSuccessFeedback?: boolean;
}

export function PullToRefresh({
  onRefresh,
  children,
  className,
  threshold = 80,
  enabled = true,
  showSuccessFeedback = true,
}: PullToRefreshProps) {
  const { hapticSuccess } = useHapticFeedback();

  const { isRefreshing, pullDistance, isPulling, canRefresh, elementRef } =
    usePullToRefresh({
      onRefresh: async () => {
        await onRefresh();
        if (showSuccessFeedback) {
          hapticSuccess();
        }
      },
      threshold,
      enabled,
    });

  const progress = Math.min(pullDistance / threshold, 1);
  const rotation = progress * 360;

  return (
    <div className={cn('relative', className)}>
      {/* Pull to refresh indicator */}
      <AnimatePresence>
        {(isPulling || isRefreshing) && (
          <OptimizedMotion
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className='absolute top-0 start-0 end-0 z-10 flex justify-center pt-2'
          >
            <div className='flex flex-col items-center space-y-1'>
              <OptimizedMotion
                animate={{ rotate: isRefreshing ? 360 : rotation }}
                transition={{
                  duration: isRefreshing ? 1 : 0,
                  repeat: isRefreshing ? Infinity : 0,
                }}
                className={cn(
                  'p-2 rounded-full transition-colors duration-200',
                  canRefresh || isRefreshing
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                )}
              >
                {isRefreshing ? (
                  <RefreshCw className='h-5 w-5' />
                ) : canRefresh ? (
                  <CheckCircle className='h-5 w-5' />
                ) : (
                  <RefreshCw className='h-5 w-5' />
                )}
              </OptimizedMotion>

              <OptimizedMotion
                as="p"
                animate={{ opacity: canRefresh ? 1 : 0.5 }}
                className={cn(
                  'text-xs font-medium transition-colors duration-200',
                  canRefresh || isRefreshing
                    ? 'text-green-600'
                    : 'text-gray-500'
                )}
              >
                {isRefreshing
                  ? 'در حال بارگذاری...'
                  : canRefresh
                    ? 'رها کنید تا بارگذاری شود'
                    : 'کشیدن برای بارگذاری مجدد'}
              </OptimizedMotion>
            </div>
          </OptimizedMotion>
        )}
      </AnimatePresence>

      {/* Content with pull-to-refresh functionality */}
      <div
        ref={elementRef}
        className={cn(
          'transition-transform duration-200 ease-out',
          isPulling && 'transform-gpu'
        )}
        style={{
          transform: isPulling
            ? `translateY(${Math.min(pullDistance * 0.5, 50)}px)`
            : 'translateY(0)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Enhanced version with haptic feedback on pull start
export function EnhancedPullToRefresh({
  onRefresh,
  children,
  className,
  threshold = 80,
  enabled = true,
  showSuccessFeedback = true,
}: PullToRefreshProps) {
  const { hapticLight, hapticSuccess } = useHapticFeedback();

  const { isRefreshing, pullDistance, isPulling, canRefresh, elementRef } =
    usePullToRefresh({
      onRefresh: async () => {
        await onRefresh();
        if (showSuccessFeedback) {
          hapticSuccess();
        }
      },
      threshold,
      enabled,
    });

  // Trigger haptic feedback when threshold is reached
  React.useEffect(() => {
    if (canRefresh && !isRefreshing) {
      hapticLight();
    }
  }, [canRefresh, isRefreshing, hapticLight]);

  const progress = Math.min(pullDistance / threshold, 1);
  const rotation = progress * 360;

  return (
    <div className={cn('relative', className)}>
      {/* Pull to refresh indicator */}
      <AnimatePresence>
        {(isPulling || isRefreshing) && (
          <OptimizedMotion
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className='absolute top-0 start-0 end-0 z-10 flex justify-center pt-2'
          >
            <div className='flex flex-col items-center space-y-1'>
              <OptimizedMotion
                animate={{ rotate: isRefreshing ? 360 : rotation }}
                transition={{
                  duration: isRefreshing ? 1 : 0,
                  repeat: isRefreshing ? Infinity : 0,
                }}
                className={cn(
                  'p-2 rounded-full transition-all duration-200',
                  canRefresh || isRefreshing
                    ? 'bg-green-500 text-white scale-110'
                    : 'bg-gray-200 text-gray-500 scale-100'
                )}
              >
                {isRefreshing ? (
                  <RefreshCw className='h-5 w-5' />
                ) : canRefresh ? (
                  <CheckCircle className='h-5 w-5' />
                ) : (
                  <RefreshCw className='h-5 w-5' />
                )}
              </OptimizedMotion>

              <OptimizedMotion
                as="p"
                animate={{
                  opacity: canRefresh ? 1 : 0.5,
                  scale: canRefresh ? 1.05 : 1,
                }}
                className={cn(
                  'text-xs font-medium transition-all duration-200',
                  canRefresh || isRefreshing
                    ? 'text-green-600'
                    : 'text-gray-500'
                )}
              >
                {isRefreshing
                  ? 'در حال بارگذاری...'
                  : canRefresh
                    ? 'رها کنید تا بارگذاری شود'
                    : 'کشیدن برای بارگذاری مجدد'}
              </OptimizedMotion>
            </div>
          </OptimizedMotion>
        )}
      </AnimatePresence>

      {/* Content with pull-to-refresh functionality */}
      <div
        ref={elementRef}
        className={cn(
          'transition-transform duration-200 ease-out',
          isPulling && 'transform-gpu'
        )}
        style={{
          transform: isPulling
            ? `translateY(${Math.min(pullDistance * 0.5, 50)}px)`
            : 'translateY(0)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

