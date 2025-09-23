'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface WidgetCardProps {
  title: string;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
}

export function WidgetCard({
  title,
  children,
  className,
  headerAction,
  loading = false,
  error,
  empty = false,
  emptyMessage = 'هیچ داده‌ای موجود نیست',
  emptyIcon,
}: WidgetCardProps) {
  if (loading) {
    return (
      <div
        className={cn(
          'bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6',
          className
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 font-vazirmatn">
            {title}
          </h3>
          {headerAction}
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          'bg-white/80 backdrop-blur-sm rounded-2xl border border-red-200 shadow-lg p-6',
          className
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 font-vazirmatn">
            {title}
          </h3>
          {headerAction}
        </div>
        <div className="text-center py-8">
          <div className="text-red-500 text-4xl mb-3">⚠️</div>
          <p className="text-red-600 font-vazirmatn">{error}</p>
        </div>
      </div>
    );
  }

  if (empty) {
    return (
      <div
        className={cn(
          'bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6',
          className
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 font-vazirmatn">
            {title}
          </h3>
          {headerAction}
        </div>
        <div className="text-center py-8">
          {emptyIcon || <div className="text-gray-400 text-4xl mb-3">📭</div>}
          <p className="text-gray-500 font-vazirmatn">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6 transition-all duration-200 hover:shadow-xl hover:bg-white/90',
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 font-vazirmatn">
          {title}
        </h3>
        {headerAction}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
