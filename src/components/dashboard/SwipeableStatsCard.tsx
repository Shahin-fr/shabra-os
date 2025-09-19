'use client';

import { AnimatePresence } from '@/lib/framer-motion-optimized';
import type { PanInfo } from 'framer-motion';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import React, { useState } from 'react';

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

interface SwipeableStatsCardProps {
  stats: StatData[];
  currentIndex: number;
  onSwipe: (direction: 'left' | 'right') => void;
  className?: string;
}

export function SwipeableStatsCard({
  stats,
  currentIndex,
  onSwipe,
  className,
}: SwipeableStatsCardProps) {
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(
    null
  );

  const handleDragEnd = (_event: any, info: PanInfo) => {
    const threshold = 50;
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    if (Math.abs(offset) > threshold || Math.abs(velocity) > 500) {
      if (offset > 0 || velocity > 0) {
        onSwipe('right');
      } else {
        onSwipe('left');
      }
    }

    setDragDirection(null);
  };

  const handleDrag = (_event: any, info: PanInfo) => {
    if (info.offset.x > 10) {
      setDragDirection('right');
    } else if (info.offset.x < -10) {
      setDragDirection('left');
    } else {
      setDragDirection(null);
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
        accent: 'text-blue-800',
      },
      purple: {
        bg: 'bg-purple-100',
        text: 'text-purple-600',
        accent: 'text-purple-800',
      },
      green: {
        bg: 'bg-green-100',
        text: 'text-green-600',
        accent: 'text-green-800',
      },
      orange: {
        bg: 'bg-orange-100',
        text: 'text-orange-600',
        accent: 'text-orange-800',
      },
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return <TrendingUp className='h-3 w-3' />;
      case 'down':
        return <TrendingDown className='h-3 w-3' />;
      default:
        return <Minus className='h-3 w-3' />;
    }
  };

  const getTrendColor = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const currentStat = stats[currentIndex];
  if (!currentStat) return null;

  const colors = getColorClasses(currentStat.color);
  const StatIcon = currentStat.icon;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <OptimizedMotion
        drag='x'
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        className='cursor-grab active:cursor-grabbing'
        whileDrag={{ scale: 0.98 }}
      >
        <AnimatePresence mode='wait'>
          <OptimizedMotion
            key={currentIndex}
            initial={{ opacity: 0, x: dragDirection === 'left' ? 100 : -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dragDirection === 'left' ? -100 : 100 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className='p-4'
          >
            <div className='flex items-center gap-4'>
              {/* Icon */}
              <div className={`p-4 rounded-2xl ${colors.bg}`}>
                <StatIcon className={`h-8 w-8 ${colors.text}`} />
              </div>

              {/* Content */}
              <div className='flex-1'>
                <div className='flex items-center justify-between mb-2'>
                  <h3 className='text-sm font-medium text-gray-600'>
                    {currentStat.title}
                  </h3>
                  <div
                    className={`flex items-center gap-1 ${getTrendColor(currentStat.trendDirection)}`}
                  >
                    {getTrendIcon(currentStat.trendDirection)}
                    <span className='text-xs font-medium'>
                      {currentStat.trend}
                    </span>
                  </div>
                </div>

                <div className='text-3xl font-bold text-gray-900 mb-1'>
                  {currentStat.value}
                </div>

                <p className='text-sm text-gray-500'>{currentStat.subtitle}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className='mt-4'>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden overflow-hidden">
                <OptimizedMotion
                  className={`h-2 rounded-full ${colors.bg.replace('100', '500')}`}
                  initial={{ scaleX: 0 }}
                  animate={{ width: '75%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>
          </OptimizedMotion>
        </AnimatePresence>
      </OptimizedMotion>

      {/* Swipe Indicator */}
      <div className='absolute bottom-2 left-1/2 transform -translate-x-1/2'>
        <div className='flex gap-1'>
          {stats.map((_, index) => (
            <div
              key={index}
              className={`h-1 w-6 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-[#ff0a54]' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Swipe Hint */}
      <div className='absolute top-1/2 left-2 transform -translate-y-1/2 opacity-30'>
        <OptimizedMotion
          animate={{ x: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className='text-gray-400'
        >
          ←
        </OptimizedMotion>
      </div>
      <div className='absolute top-1/2 right-2 transform -translate-y-1/2 opacity-30'>
        <OptimizedMotion
          animate={{ x: [0, -5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className='text-gray-400'
        >
          →
        </OptimizedMotion>
      </div>
    </div>
  );
}

