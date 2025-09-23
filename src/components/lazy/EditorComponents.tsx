'use client';

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Lazy load heavy editor components
export const StoryManagement = dynamic(
  () => import('@/components/storyboard/StoryManagement').then(mod => mod.StoryManagement),
  {
    loading: () => (
      <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-sm text-gray-500">Loading story management...</div>
        </div>
      </div>
    ),
    ssr: false,
  }
) as ComponentType<any>;

export const RealTimeCollaboration = dynamic(
  () => import('@/components/storyboard/RealTimeCollaboration').then(mod => mod.RealTimeCollaboration),
  {
    loading: () => (
      <div className="flex items-center justify-center h-12">
        <div className="text-sm text-gray-500">Loading collaboration...</div>
      </div>
    ),
    ssr: false,
  }
) as ComponentType<any>;

export const InteractiveCalendarWidget = dynamic(
  () => import('@/components/dashboard/widgets/InteractiveCalendarWidget').then(mod => mod.InteractiveCalendarWidget),
  {
    loading: () => (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-sm text-gray-500">Loading calendar...</div>
      </div>
    ),
    ssr: false,
  }
) as ComponentType<any>;

