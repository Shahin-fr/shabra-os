'use client';

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Lazy load admin-specific components

export const TeamWorkloadAnalysis = dynamic(
  () => import('@/components/dashboard/widgets/TeamWorkloadAnalysis').then(mod => ({ default: mod.TeamWorkloadAnalysis })),
  {
    loading: () => (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-sm text-gray-500">Loading team analysis...</div>
      </div>
    ),
    ssr: false,
  }
) as ComponentType<any>;

export const KeyPerformanceIndicators = dynamic(
  () => import('@/components/dashboard/widgets/KeyPerformanceIndicators').then(mod => ({ default: mod.KeyPerformanceIndicators })),
  {
    loading: () => (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-sm text-gray-500">Loading KPIs...</div>
      </div>
    ),
    ssr: false,
  }
) as ComponentType<any>;

