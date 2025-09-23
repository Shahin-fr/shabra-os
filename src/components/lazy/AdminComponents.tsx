'use client';

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load admin-specific components

export const TeamWorkloadAnalysis = dynamic(
  () => import('@/components/dashboard/widgets/TeamWorkloadAnalysis').then(mod => mod.TeamWorkloadAnalysis),
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
  () => import('@/components/dashboard/widgets/KeyPerformanceIndicators').then(mod => mod.KeyPerformanceIndicators),
  {
    loading: () => (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-sm text-gray-500">Loading KPIs...</div>
      </div>
    ),
    ssr: false,
  }
) as ComponentType<any>;

// InteractiveCalendarWidget and RecentTeamActivityFeed are exported from other files to avoid conflicts

// These components are exported from other files to avoid conflicts

// High-priority lazy-loaded components for performance optimization

export const TodaysSnapshot = dynamic(
  () => import('@/components/dashboard/widgets/TodaysSnapshot').then(mod => mod.TodaysSnapshot),
  {
    loading: () => (
      <div className="h-full bg-white border border-gray-200 shadow-sm rounded-lg">
        <div className="p-6 space-y-8">
          {/* Header skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          
          {/* Content skeletons */}
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </div>
          ))}
          
          {/* Summary skeleton */}
          <div className="mt-8 p-4 rounded-xl bg-gray-50 border border-gray-200">
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    ssr: false,
  }
) as ComponentType<any>;

export const QuickActions = dynamic(
  () => import('@/components/dashboard/widgets/QuickActions').then(mod => mod.QuickActions),
  {
    loading: () => (
      <div className="backdrop-blur-sm bg-white/5 border border-white/10 shadow-lg rounded-lg h-full">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-lg">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="w-2 h-2 rounded-full" />
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-white/10">
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>
    ),
    ssr: false,
  }
) as ComponentType<any>;

export const CompanyStatsWidget = dynamic(
  () => import('@/components/admin/dashboard/CompanyStatsWidget').then(mod => mod.CompanyStatsWidget),
  {
    loading: () => (
      <div className="relative">
        <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl shadow-lg">
          <div className="text-center mb-8">
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="text-center">
                <Skeleton className="w-16 h-16 rounded-2xl mx-auto mb-4" />
                <Skeleton className="h-4 w-20 mx-auto mb-2" />
                <Skeleton className="h-3 w-16 mx-auto mb-1" />
                <Skeleton className="h-3 w-12 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    ssr: false,
  }
) as ComponentType<any>;

