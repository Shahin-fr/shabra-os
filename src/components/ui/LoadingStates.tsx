'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  animate?: boolean;
}

export function Skeleton({ 
  className, 
  variant = 'rectangular', 
  width, 
  height, 
  animate = true 
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200 rounded';
  
  const variantClasses = {
    text: 'h-4',
    rectangular: 'h-4',
    circular: 'rounded-full',
  };

  const animationClasses = animate ? 'animate-pulse' : '';

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses,
        className
      )}
      style={{
        width: width || '100%',
        height: height || '1rem',
      }}
    />
  );
}

interface SkeletonCardProps {
  className?: string;
  lines?: number;
  showAvatar?: boolean;
  showButton?: boolean;
}

export function SkeletonCard({ 
  className, 
  lines = 3, 
  showAvatar = false, 
  showButton = false 
}: SkeletonCardProps) {
  return (
    <motion.div
      className={cn(
        'p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Skeleton width="40%" height="1.25rem" />
          <Skeleton width="2rem" height="2rem" variant="circular" />
        </div>

        {/* Content */}
        <div className="space-y-2">
          {showAvatar && (
            <div className="flex items-center gap-3">
              <Skeleton width="2.5rem" height="2.5rem" variant="circular" />
              <div className="flex-1 space-y-1">
                <Skeleton width="60%" height="1rem" />
                <Skeleton width="40%" height="0.75rem" />
              </div>
            </div>
          )}

          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton 
              key={i} 
              width={i === lines - 1 ? '60%' : '100%'} 
              height="0.875rem" 
            />
          ))}
        </div>

        {/* Button */}
        {showButton && (
          <div className="pt-2">
            <Skeleton width="100%" height="2.5rem" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface SkeletonListProps {
  className?: string;
  items?: number;
  showAvatar?: boolean;
}

export function SkeletonList({ 
  className, 
  items = 3, 
  showAvatar = false 
}: SkeletonListProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <motion.div
          key={i}
          className="p-3 rounded-xl bg-white/60 border border-white/40"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1, duration: 0.3 }}
        >
          <div className="flex items-center gap-3">
            {showAvatar && (
              <Skeleton width="2.5rem" height="2.5rem" variant="circular" />
            )}
            <div className="flex-1 space-y-2">
              <Skeleton width="80%" height="1rem" />
              <Skeleton width="60%" height="0.75rem" />
            </div>
            <Skeleton width="1.5rem" height="1.5rem" variant="circular" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

interface SkeletonChartProps {
  className?: string;
  type?: 'bar' | 'line' | 'pie';
}

export function SkeletonChart({ 
  className, 
  // type = 'bar' // Removed unused parameter 
}: SkeletonChartProps) {
  return (
    <motion.div
      className={cn('p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg', className)}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Skeleton width="40%" height="1.25rem" />
          <Skeleton width="3rem" height="1.5rem" />
        </div>

        {/* Chart Area */}
        <div className="h-48 flex items-end justify-center gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton
              key={i}
              width="2rem"
              height={`${Math.random() * 100 + 50}%`}
              className="rounded-t"
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton width="1rem" height="1rem" variant="circular" />
              <Skeleton width="3rem" height="0.75rem" />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

interface SkeletonTableProps {
  className?: string;
  rows?: number;
  columns?: number;
}

export function SkeletonTable({ 
  className, 
  rows = 5, 
  columns = 4 
}: SkeletonTableProps) {
  return (
    <motion.div
      className={cn('rounded-xl bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg overflow-hidden', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} width="100%" height="1rem" />
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton 
                  key={colIndex} 
                  width="100%" 
                  height="0.875rem"
                  className={colIndex === 0 ? 'w-3/4' : ''}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
