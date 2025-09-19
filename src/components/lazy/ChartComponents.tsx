'use client';

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Lazy load heavy chart components
export const WeeklySalesChart = dynamic(
  () => import('@/components/dashboard/widgets/WeeklySalesChart').then(mod => ({ default: mod.WeeklySalesChart })),
  {
    loading: () => (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-sm text-gray-500">Loading chart...</div>
      </div>
    ),
    ssr: false,
  }
) as ComponentType<any>;

export const WeeklyPerformanceChart = dynamic(
  () => import('@/components/dashboard/widgets/WeeklyPerformanceChart').then(mod => ({ default: mod.WeeklyPerformanceChart })),
  {
    loading: () => (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-sm text-gray-500">Loading performance chart...</div>
      </div>
    ),
    ssr: false,
  }
) as ComponentType<any>;

export const ProjectStatusDonutChart = dynamic(
  () => import('@/components/dashboard/widgets/ProjectStatusDonutChart').then(mod => ({ default: mod.ProjectStatusDonutChart })),
  {
    loading: () => (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-sm text-gray-500">Loading project status...</div>
      </div>
    ),
    ssr: false,
  }
) as ComponentType<any>;

