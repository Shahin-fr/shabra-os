'use client';

import { OptimizedMotion } from '@/components/ui/OptimizedMotion';

import { AttendanceDashboardWidget } from './widgets/AttendanceDashboardWidget';
import { MyTasksWidget } from './widgets/MyTasksWidget';
import { PersonalNotificationsWidget } from './widgets/PersonalNotificationsWidget';
import { AnnouncementsWidget } from './AnnouncementsWidget';

export function EmployeeDashboard() {
  // Enhanced animation variants for world-class UI
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <OptimizedMotion
      className='min-h-screen bg-white dark:bg-slate-900'
      variants={containerVariants}
      initial='hidden'
      animate='visible'
    >
      {/* Main Dashboard Content */}
      <div className='container mx-auto px-6 py-12 space-y-12 bg-white rounded-2xl mx-6 mt-6 shadow-lg'>
        {/* Hero Header */}
        <OptimizedMotion className='text-center space-y-6' variants={itemVariants}>
          <OptimizedMotion
            as="h1"
            className='text-4xl md:text-5xl font-bold text-[#ff0a54]'
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            داشبورد کارمند
          </OptimizedMotion>
          <OptimizedMotion
            as="p"
            className='text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto'
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            مدیریت حضور، وظایف و اعلان‌های شخصی
          </OptimizedMotion>
        </OptimizedMotion>

        {/* Single Column Layout - Clean and Focused */}
        <div className='max-w-4xl mx-auto space-y-8'>
          {/* Attendance Dashboard Widget - Most Important */}
          <OptimizedMotion as="section" variants={itemVariants}>
            <AttendanceDashboardWidget />
          </OptimizedMotion>

          {/* Tasks Widget */}
          <OptimizedMotion as="section" variants={itemVariants}>
            <MyTasksWidget />
          </OptimizedMotion>

          {/* Notifications Widget */}
          <OptimizedMotion as="section" variants={itemVariants}>
            <PersonalNotificationsWidget />
          </OptimizedMotion>

          {/* Announcements Widget */}
          <OptimizedMotion as="section" variants={itemVariants}>
            <AnnouncementsWidget />
          </OptimizedMotion>
        </div>
      </div>
    </OptimizedMotion>
  );
}

