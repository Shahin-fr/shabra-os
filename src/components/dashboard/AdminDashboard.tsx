'use client';

import { OptimizedMotion } from '@/components/ui/OptimizedMotion';

// Import lightweight widgets (loaded immediately)
import { ActionableInbox } from './widgets/ActionableInbox';
import { TodaysSnapshot } from './widgets/TodaysSnapshot';
import { QuickActions } from './widgets/QuickActions';

// Import heavy widgets (lazy loaded)
import {
  TeamWorkloadAnalysis,
  RecentTeamActivityFeed,
  ProjectStatusDonutChart,
  InteractiveCalendarWidget,
  WeeklySalesChart,
  TaskBottlenecks,
  WeeklyPerformanceChart,
  KeyPerformanceIndicators,
  QuarterlyGoals,
} from '@/components/lazy';

// Import new modular components
import {
  HeroHeader,
  CompanyStatsWidget,
  NavigationCardsWidget,
  DashboardLayout,
} from '@/components/admin/dashboard';

// Import hooks
import { useCompanyStats } from '@/hooks/useCompanyStats';

export function AdminDashboard() {
  // Get data from hooks
  const { data: companyStats } = useCompanyStats();

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
    <DashboardLayout>
        {/* Hero Header */}
      <HeroHeader
        title="داشبورد سیستم عامل شبرا"
        subtitle="مدیریت جامع سیستم و نظارت بر عملکرد تیم"
      />

        {/* Top Section - Two Column Layout */}
        <OptimizedMotion
        className="grid grid-cols-1 lg:grid-cols-5 gap-8"
          variants={itemVariants}
        >
          {/* Left Column - Weekly Sales Chart (3/5 width) */}
          <OptimizedMotion
          className="lg:col-span-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <WeeklySalesChart />
          </OptimizedMotion>

          {/* Right Column - Urgent Actions (2/5 width) */}
          <OptimizedMotion
          className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
          >
            <ActionableInbox />
          </OptimizedMotion>
        </OptimizedMotion>

        {/* Animated Decorative Logo - Large Background Element */}
        <OptimizedMotion
        className="absolute -top-12 -left-32 z-0"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
        >
          <OptimizedMotion
          className="w-72 h-72 rounded-full overflow-hidden"
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              background:
                'linear-gradient(135deg, rgba(255, 10, 84, 0.1) 0%, rgba(255, 10, 84, 0.05) 50%, rgba(255, 10, 84, 0.1) 100%)',
              backdropFilter: 'blur(40px)',
              boxShadow: '0 20px 60px rgba(255, 10, 84, 0.15)',
            }}
          >
            <img
            src="/logo-circle.svg"
            alt="Shabra Logo"
            className="w-full h-full object-cover opacity-60"
            />
          </OptimizedMotion>
        </OptimizedMotion>

      {/* Company Stats Section */}
      {companyStats && <CompanyStatsWidget stats={companyStats} />}

        {/* Main Content Grid - Spacious Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Left Column - 5 columns */}
        <div className="xl:col-span-5 space-y-8">
            {/* Today's Snapshot */}
            <OptimizedMotion
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.3 }}
            >
            <h2 className="text-lg font-bold text-gray-900 mb-4">
                تصویر امروز
              </h2>
              <TodaysSnapshot />
            </OptimizedMotion>

          {/* Project Status Donut Chart */}
            <OptimizedMotion
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
            >
              <ProjectStatusDonutChart />
            </OptimizedMotion>
          </div>

          {/* Center Column - 4 columns */}
        <div className="xl:col-span-4 space-y-8">
            {/* Team Workload Analysis */}
            <OptimizedMotion
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.5 }}
            >
            <h2 className="text-lg font-bold text-gray-900 mb-4">
                تحلیل بار کاری تیم
              </h2>
              <TeamWorkloadAnalysis />
            </OptimizedMotion>
          </div>

          {/* Right Column - 3 columns */}
        <div className="xl:col-span-3 space-y-8">
            {/* Interactive Calendar */}
            <OptimizedMotion
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.7 }}
            >
              <InteractiveCalendarWidget />
            </OptimizedMotion>

            {/* Recent Team Activity */}
            <OptimizedMotion
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.8 }}
            >
            <h2 className="text-lg font-bold text-gray-900 mb-4">
                فعالیت‌های اخیر
              </h2>
              <RecentTeamActivityFeed />
            </OptimizedMotion>
          </div>
        </div>

        {/* Bottom Section: Analytics & Performance */}
      <div className="space-y-8">
          {/* Performance Charts Row */}
          <OptimizedMotion
          className="grid grid-cols-1 xl:grid-cols-2 gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.9 }}
          >
            {/* Weekly Performance Chart */}
            <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
                نمودار عملکرد هفتگی
              </h2>
              <WeeklyPerformanceChart />
            </div>

          {/* Quick Actions */}
            <OptimizedMotion
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.0 }}
            >
              <QuickActions />
            </OptimizedMotion>

          {/* Task Bottlenecks */}
            <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
                گلوگاه‌های تسک‌ها
              </h2>
              <TaskBottlenecks />
            </div>
          </OptimizedMotion>

        {/* Key Performance Indicators */}
          <OptimizedMotion
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 2.1 }}
          >
          <h2 className="text-lg font-bold text-gray-900 mb-4">
              شاخص‌های کلیدی عملکرد
            </h2>
            <KeyPerformanceIndicators />
          </OptimizedMotion>

          {/* Quarterly Goals */}
          <OptimizedMotion
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 2.2 }}
          >
          <h2 className="text-lg font-bold text-gray-900 mb-4">
              اهداف سه‌ماهه
            </h2>
            <QuarterlyGoals />
          </OptimizedMotion>
        </div>

        {/* Navigation Widgets */}
      <NavigationCardsWidget />
    </DashboardLayout>
  );
}

