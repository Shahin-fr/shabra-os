'use client';

import dynamic from 'next/dynamic';
import React, { Suspense, ComponentType, ReactNode } from 'react';

interface LazyLoadingProps {
  children: ReactNode;
  fallback?: ReactNode;
}

// Default loading fallback
const DefaultFallback = () => (
  <div className='animate-pulse'>
    <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
    <div className='h-4 bg-gray-200 rounded w-1/2'></div>
  </div>
);

export function LazyLoading({ children, fallback }: LazyLoadingProps) {
  return (
    <Suspense fallback={fallback || <DefaultFallback />}>{children}</Suspense>
  );
}

// Lazy load heavy components
export const LazyFramerMotion = dynamic(
  () => import('framer-motion').then(mod => ({ default: mod.motion.div })),
  {
    ssr: false,
    loading: () => <DefaultFallback />,
  }
);

export const LazyRecharts = {
  LineChart: dynamic(
    () => import('recharts').then(mod => ({ default: mod.LineChart })),
    { ssr: false, loading: () => <DefaultFallback /> }
  ),
  BarChart: dynamic(
    () => import('recharts').then(mod => ({ default: mod.BarChart })),
    { ssr: false, loading: () => <DefaultFallback /> }
  ),
  PieChart: dynamic(
    () => import('recharts').then(mod => ({ default: mod.PieChart })),
    { ssr: false, loading: () => <DefaultFallback /> }
  ),
  ResponsiveContainer: dynamic(
    () =>
      import('recharts').then(mod => ({ default: mod.ResponsiveContainer })),
    { ssr: false, loading: () => <DefaultFallback /> }
  ),
  Line: dynamic(() => import('recharts').then(mod => ({ default: mod.Line })), {
    ssr: false,
    loading: () => <DefaultFallback />,
  }),
  Bar: dynamic(() => import('recharts').then(mod => ({ default: mod.Bar })), {
    ssr: false,
    loading: () => <DefaultFallback />,
  }),
  Pie: dynamic(() => import('recharts').then(mod => ({ default: mod.Pie })), {
    ssr: false,
    loading: () => <DefaultFallback />,
  }),
  XAxis: dynamic(
    () => import('recharts').then(mod => ({ default: mod.XAxis })),
    { ssr: false, loading: () => <DefaultFallback /> }
  ),
  YAxis: dynamic(
    () => import('recharts').then(mod => ({ default: mod.YAxis })),
    { ssr: false, loading: () => <DefaultFallback /> }
  ),
  CartesianGrid: dynamic(
    () => import('recharts').then(mod => ({ default: mod.CartesianGrid })),
    { ssr: false, loading: () => <DefaultFallback /> }
  ),
  Tooltip: dynamic(
    () => import('recharts').then(mod => ({ default: mod.Tooltip })),
    { ssr: false, loading: () => <DefaultFallback /> }
  ),
  Legend: dynamic(
    () => import('recharts').then(mod => ({ default: mod.Legend as any })),
    { ssr: false, loading: () => <DefaultFallback /> }
  ),
};

// Lazy load Radix UI components
export const LazyRadixUI = {
  Dialog: dynamic(
    () => import('@radix-ui/react-dialog').then(mod => ({ default: mod.Root })),
    { ssr: false, loading: () => <DefaultFallback /> }
  ),
  DialogTrigger: dynamic(
    () =>
      import('@radix-ui/react-dialog').then(mod => ({ default: mod.Trigger })),
    { ssr: false, loading: () => <DefaultFallback /> }
  ),
  DialogContent: dynamic(
    () =>
      import('@radix-ui/react-dialog').then(mod => ({ default: mod.Content })),
    { ssr: false, loading: () => <DefaultFallback /> }
  ),
  DropdownMenu: dynamic(
    () =>
      import('@radix-ui/react-dropdown-menu').then(mod => ({
        default: mod.Root,
      })),
    { ssr: false, loading: () => <DefaultFallback /> }
  ),
  Select: dynamic(
    () => import('@radix-ui/react-select').then(mod => ({ default: mod.Root })),
    { ssr: false, loading: () => <DefaultFallback /> }
  ),
};

// Generic lazy loading function
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options?: {
    ssr?: boolean;
    loading?: ComponentType;
  }
) {
  return dynamic(importFn, {
    ssr: options?.ssr ?? false,
    loading: options?.loading
      ? () => React.createElement(options.loading!)
      : () => <DefaultFallback />,
  });
}
