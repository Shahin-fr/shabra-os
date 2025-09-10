'use client';

import { motion } from 'framer-motion';

import { AttendanceClockWidget } from './widgets/AttendanceClockWidget';
import { MyTasksWidget } from './widgets/MyTasksWidget';
import { PersonalNotificationsWidget } from './widgets/PersonalNotificationsWidget';

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
        duration: 0.6
      }
    },
  };

  return (
    <motion.div
      className="min-h-screen bg-white dark:bg-slate-900"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Main Dashboard Content */}
      <div className="container mx-auto px-6 py-12 space-y-12 bg-white rounded-2xl mx-6 mt-6 shadow-lg">
        {/* Hero Header */}
        <motion.div
          className="text-center space-y-6"
          variants={itemVariants}
        >
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-[#ff0a54]"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            داشبورد کارمند
          </motion.h1>
          <motion.p
            className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            مدیریت حضور، وظایف و اعلان‌های شخصی
          </motion.p>
        </motion.div>

        {/* Single Column Layout - Clean and Focused */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Attendance Clock Widget - Most Important */}
          <motion.section
            variants={itemVariants}
          >
            <AttendanceClockWidget />
          </motion.section>

          {/* Tasks Widget */}
          <motion.section
            variants={itemVariants}
          >
            <MyTasksWidget />
          </motion.section>

          {/* Notifications Widget */}
          <motion.section
            variants={itemVariants}
          >
            <PersonalNotificationsWidget />
          </motion.section>
        </div>
      </div>
    </motion.div>
  );
}
