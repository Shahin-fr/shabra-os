'use client';

import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { MobileClockInCard } from './MobileClockInCard';
import { MobileTasksWidget } from './MobileTasksWidget';
import { MobileNotificationsWidget } from './MobileNotificationsWidget';
import { MobileQuickStats } from './MobileQuickStats';

export function MobileDashboard() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 pb-20 mobile-safe-top'>
      {/* Header */}
      <OptimizedMotion
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 mobile-padding mobile-safe-top'
      >
        <div className='text-center'>
          <h1 className='mobile-heading text-[#393d3f]'>داشبورد</h1>
          <p className='mobile-caption text-gray-600 mt-1'>خوش آمدید</p>
        </div>
      </OptimizedMotion>

      {/* Content */}
      <div className='mobile-container mobile-spacing py-6'>
        {/* Clock In Card - Prominent at top */}
        <OptimizedMotion
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <MobileClockInCard />
        </OptimizedMotion>

        {/* Quick Stats */}
        <OptimizedMotion
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <MobileQuickStats />
        </OptimizedMotion>

        {/* Today's Tasks */}
        <OptimizedMotion
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <MobileTasksWidget />
        </OptimizedMotion>

        {/* Recent Notifications */}
        <OptimizedMotion
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <MobileNotificationsWidget />
        </OptimizedMotion>
      </div>
    </div>
  );
}

