'use client';

import { motion } from 'framer-motion';
import { MobileClockInCard } from './MobileClockInCard';
import { MobileTasksWidget } from './MobileTasksWidget';
import { MobileNotificationsWidget } from './MobileNotificationsWidget';
import { MobileQuickStats } from './MobileQuickStats';

export function MobileDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 pb-20 mobile-safe-top">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 mobile-padding mobile-safe-top"
      >
        <div className="text-center">
          <h1 className="mobile-heading text-[#393d3f]">داشبورد</h1>
          <p className="mobile-caption text-gray-600 mt-1">خوش آمدید</p>
        </div>
      </motion.div>

      {/* Content */}
      <div className="mobile-container mobile-spacing py-6">
        {/* Clock In Card - Prominent at top */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <MobileClockInCard />
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <MobileQuickStats />
        </motion.div>

        {/* Today's Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <MobileTasksWidget />
        </motion.div>

        {/* Recent Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <MobileNotificationsWidget />
        </motion.div>
      </div>
    </div>
  );
}
