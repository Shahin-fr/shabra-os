'use client';

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Lazy load utility components that are not needed on initial load
export const TaskBottlenecks = dynamic(
  () => import('@/components/dashboard/widgets/TaskBottlenecks').then(mod => ({ default: mod.TaskBottlenecks })),
  {
    loading: () => (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-sm text-gray-500">Loading task analysis...</div>
      </div>
    ),
    ssr: false,
  }
) as ComponentType<any>;

export const QuarterlyGoals = dynamic(
  () => import('@/components/dashboard/widgets/QuarterlyGoals').then(mod => ({ default: mod.QuarterlyGoals })),
  {
    loading: () => (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-sm text-gray-500">Loading quarterly goals...</div>
      </div>
    ),
    ssr: false,
  }
) as ComponentType<any>;

export const RecentTeamActivityFeed = dynamic(
  () => import('@/components/dashboard/widgets/RecentTeamActivityFeed').then(mod => ({ default: mod.RecentTeamActivityFeed })),
  {
    loading: () => (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-sm text-gray-500">Loading activity feed...</div>
      </div>
    ),
    ssr: false,
  }
) as ComponentType<any>;

