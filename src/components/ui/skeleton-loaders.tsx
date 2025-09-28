'use client';

import { OptimizedMotion } from '@/components/ui/OptimizedMotion';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
}

export function Skeleton({
  className,
  width = '100%',
  height = '1rem',
  rounded = true,
}: SkeletonProps) {
  return (
    <OptimizedMotion
      className={cn(
        'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]',
        rounded && 'rounded-md',
        className
      )}
      style={{ width, height }}
      animate={{
        backgroundPosition: ['0% 50%', '200% 50%', '0% 50%'],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className='bg-white rounded-lg p-4 shadow-sm border border-gray-100'>
      <div className='flex items-start rtl:items-start space-x-3 rtl:space-x-reverse space-x-reverse'>
        <Skeleton width={40} height={40} className='rounded-full' />
        <div className='flex-1 space-y-2'>
          <Skeleton width='70%' height={16} />
          <Skeleton width='50%' height={14} />
          <Skeleton width='30%' height={12} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonTaskCard() {
  return (
    <div className='bg-white rounded-lg p-4 shadow-sm border border-gray-100'>
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center space-x-2 rtl:space-x-reverse space-x-reverse'>
          <Skeleton width={20} height={20} className='rounded' />
          <Skeleton width={60} height={16} />
        </div>
        <Skeleton width={50} height={20} className='rounded-full' />
      </div>
      <Skeleton width='90%' height={14} className='mb-2' />
      <Skeleton width='60%' height={12} />
    </div>
  );
}

export function SkeletonProjectCard() {
  return (
    <div className='bg-white rounded-lg p-4 shadow-sm border border-gray-100'>
      <div className='flex items-start rtl:items-start space-x-3 rtl:space-x-reverse space-x-reverse mb-3'>
        <Skeleton width={48} height={48} className='rounded-lg' />
        <div className='flex-1'>
          <Skeleton width='80%' height={18} className='mb-2' />
          <Skeleton width='60%' height={14} className='mb-2' />
          <div className='flex items-center space-x-2 rtl:space-x-reverse space-x-reverse'>
            <Skeleton width={40} height={16} className='rounded-full' />
            <Skeleton width={60} height={14} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonStatsCard() {
  return (
    <div className='bg-white rounded-lg p-4 shadow-sm border border-gray-100'>
      <div className='flex items-center justify-between mb-2'>
        <Skeleton width={24} height={24} className='rounded' />
        <Skeleton width={40} height={16} className='rounded-full' />
      </div>
      <Skeleton width='60%' height={20} className='mb-1' />
      <Skeleton width='40%' height={14} />
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className='space-y-3'>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

export function SkeletonTaskList({ count = 5 }: { count?: number }) {
  return (
    <div className='space-y-3'>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonTaskCard key={index} />
      ))}
    </div>
  );
}

export function SkeletonProjectList({ count = 4 }: { count?: number }) {
  return (
    <div className='space-y-3'>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonProjectCard key={index} />
      ))}
    </div>
  );
}

export function SkeletonStatsGrid({ count = 4 }: { count?: number }) {
  return (
    <div className='grid grid-cols-2 gap-3'>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonStatsCard key={index} />
      ))}
    </div>
  );
}

// Enhanced skeleton loaders with staggered animations
export function SkeletonListStaggered({ count = 5 }: { count?: number }) {
  return (
    <div className='space-y-3'>
      {Array.from({ length: count }).map((_, index) => (
        <OptimizedMotion
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
        >
          <SkeletonCard />
        </OptimizedMotion>
      ))}
    </div>
  );
}

export function SkeletonTaskListStaggered({ count = 5 }: { count?: number }) {
  return (
    <div className='space-y-3'>
      {Array.from({ length: count }).map((_, index) => (
        <OptimizedMotion
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
        >
          <SkeletonTaskCard />
        </OptimizedMotion>
      ))}
    </div>
  );
}

export function SkeletonProjectListStaggered({
  count = 4,
}: {
  count?: number;
}) {
  return (
    <div className='space-y-3'>
      {Array.from({ length: count }).map((_, index) => (
        <OptimizedMotion
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
        >
          <SkeletonProjectCard />
        </OptimizedMotion>
      ))}
    </div>
  );
}

// Pulse skeleton for quick loading states
export function SkeletonPulse({ className }: { className?: string }) {
  return (
    <OptimizedMotion
      className={cn('bg-gray-200 rounded-md', className)}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

