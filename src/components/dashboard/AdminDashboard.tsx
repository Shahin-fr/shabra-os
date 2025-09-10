'use client';

import { motion } from 'framer-motion';
import { 
  Calendar, 
  Palette, 
  FileText, 
  CheckCircle, 
  Clock, 
  BookOpen 
} from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent } from '@/components/ui/card';

// Import all the new widgets
import { ActionableInbox } from './widgets/ActionableInbox';
import { TodaysSnapshot } from './widgets/TodaysSnapshot';
import { QuickActions } from './widgets/QuickActions';
import { TeamWorkloadAnalysis } from './widgets/TeamWorkloadAnalysis';
import { RecentTeamActivityFeed } from './widgets/RecentTeamActivityFeed';
import { ProjectStatusDonutChart } from './widgets/ProjectStatusDonutChart';
import { InteractiveCalendarWidget } from './widgets/InteractiveCalendarWidget';
import { WeeklySalesChart } from './widgets/WeeklySalesChart';
import { TaskBottlenecks } from './widgets/TaskBottlenecks';
import { WeeklyPerformanceChart } from './widgets/WeeklyPerformanceChart';
import { KeyPerformanceIndicators } from './widgets/KeyPerformanceIndicators';
import { QuarterlyGoals } from './widgets/QuarterlyGoals';

export function AdminDashboard() {
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
        ease: [0.25, 0.46, 0.45, 0.94]
      } 
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
  };

  return (
    <motion.div
      className="min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Main Dashboard Content - Frameless Design */}
      <div className="container mx-auto px-6 py-12 space-y-12">
        {/* Hero Header */}
        <motion.div
          className="text-center space-y-6"
          variants={headerVariants}
        >
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-[#393d3f]"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            داشبورد سیستم عامل شبرا
          </motion.h1>
          <motion.p
            className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            مدیریت جامع سیستم و نظارت بر عملکرد تیم
          </motion.p>
        </motion.div>
        
        {/* DYNAMIC MINIMALISM LAYOUT - Clean & Spacious Design */}
        
        {/* Top Section - Two Column Layout */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-5 gap-8"
          variants={itemVariants}
        >
          {/* Left Column - Weekly Sales Chart (3/5 width) */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <WeeklySalesChart />
          </motion.div>

          {/* Right Column - Urgent Actions (2/5 width) */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
          >
            <ActionableInbox />
          </motion.div>
        </motion.div>

        {/* Animated Decorative Logo - Large Background Element */}
        <motion.div
          className="absolute -top-12 -left-32 z-0"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
        >
          <motion.div
            className="w-72 h-72 rounded-full overflow-hidden"
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              background: 'linear-gradient(135deg, rgba(255, 10, 84, 0.1) 0%, rgba(255, 10, 84, 0.05) 50%, rgba(255, 10, 84, 0.1) 100%)',
              backdropFilter: 'blur(40px)',
              boxShadow: '0 20px 60px rgba(255, 10, 84, 0.15)',
            }}
          >
            <img
              src="/logo-circle.svg"
              alt="Shabra Logo"
              className="w-full h-full object-cover opacity-60"
            />
          </motion.div>
        </motion.div>

        {/* Company Stats - Full Width Below Two Column Grid */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.3 }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#ff0a54]/5 via-transparent to-purple-500/5 rounded-3xl"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff0a54]/10 rounded-full -translate-y-48 translate-x-48"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full translate-y-32 -translate-x-32"></div>
          
          {/* Content */}
          <div className="relative z-10">
            <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl shadow-lg">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  آمار کلی شرکت
                </h2>
                <p className="text-gray-600">وضعیت فعلی سیستم</p>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                <motion.div 
                  className="text-center group"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-16 h-16 bg-[#ff0a54]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-[#ff0a54]/20 transition-colors">
                    <span className="text-2xl font-bold text-[#ff0a54]">24</span>
                  </div>
                  <div className="text-sm font-medium text-gray-700">کل کارمندان</div>
                  <div className="text-xs text-green-600 mt-1">+12% این ماه</div>
                </motion.div>
                
                <motion.div 
                  className="text-center group"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-200 transition-colors">
                    <span className="text-2xl font-bold text-gray-700">18</span>
                  </div>
                  <div className="text-sm font-medium text-gray-700">پروژه‌های فعال</div>
                  <div className="text-xs text-blue-600 mt-1">+3 این هفته</div>
                </motion.div>
                
                <motion.div 
                  className="text-center group"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-200 transition-colors">
                    <span className="text-2xl font-bold text-gray-700">156</span>
                  </div>
                  <div className="text-sm font-medium text-gray-700">تسک‌های تکمیل شده</div>
                  <div className="text-xs text-purple-600 mt-1">+28 این هفته</div>
                </motion.div>
                
                <motion.div 
                  className="text-center group"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-200 transition-colors">
                    <span className="text-2xl font-bold text-gray-700">92%</span>
                  </div>
                  <div className="text-sm font-medium text-gray-700">نرخ حضور</div>
                  <div className="text-xs text-orange-600 mt-1">+5% این ماه</div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid - Spacious Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Left Column - 5 columns */}
          <div className="xl:col-span-5 space-y-8">
            {/* Today's Snapshot */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.3 }}
            >
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                تصویر امروز
              </h2>
              <TodaysSnapshot />
            </motion.div>

            {/* Project Status Donut Chart - Moved here */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
            >
              <ProjectStatusDonutChart />
            </motion.div>
          </div>

          {/* Center Column - 4 columns */}
          <div className="xl:col-span-4 space-y-8">
            {/* Team Workload Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.5 }}
            >
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                تحلیل بار کاری تیم
              </h2>
              <TeamWorkloadAnalysis />
            </motion.div>
          </div>

          {/* Right Column - 3 columns */}
          <div className="xl:col-span-3 space-y-8">
            {/* Interactive Calendar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.7 }}
            >
              <InteractiveCalendarWidget />
            </motion.div>

            {/* Recent Team Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.8 }}
            >
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                فعالیت‌های اخیر
              </h2>
              <RecentTeamActivityFeed />
            </motion.div>
          </div>
        </div>

        {/* Bottom Section: Analytics & Performance */}
        <div className="space-y-8">
          {/* Performance Charts Row */}
          <motion.div
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

            {/* Quick Actions - Moved here */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.0 }}
            >
              <QuickActions />
            </motion.div>

            {/* Task Bottlenecks - Moved below Quick Actions */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                گلوگاه‌های تسک‌ها
              </h2>
              <TaskBottlenecks />
            </div>
          </motion.div>

          {/* Key Performance Indicators - Moved here */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 2.1 }}
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              شاخص‌های کلیدی عملکرد
            </h2>
            <KeyPerformanceIndicators />
          </motion.div>

          {/* Quarterly Goals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 2.2 }}
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              اهداف سه‌ماهه
            </h2>
            <QuarterlyGoals />
          </motion.div>
        </div>

        {/* Navigation Widgets */}
        <motion.section
          className="space-y-8"
          variants={itemVariants}
        >
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.7 }}
          >
            <h2 className="text-3xl font-black text-slate-800 dark:text-slate-200 mb-2">
              دسترسی سریع
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              لینک‌های مهم برای دسترسی آسان به بخش‌های مختلف
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Link href="/tasks">
                <Card
                  className="group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:scale-105 backdrop-blur-xl bg-white/20 border border-white/30 hover:border-[#ff0a54]/50"
                  style={{
                    background: 'rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(40px)',
                    boxShadow: `
                      0 8px 32px rgba(0, 0, 0, 0.1),
                      0 4px 16px rgba(255, 10, 84, 0.1),
                      inset 0 1px 0 rgba(255, 255, 255, 0.4)
                    `,
                  }}
                >
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-[#ff0a54]/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#ff0a54]/30 group-hover:scale-110 transition-all duration-300">
                      <FileText className="h-8 w-8 text-[#ff0a54]" />
                    </div>
                    <h3 className="font-bold text-foreground mb-2 text-lg">تسک‌ها</h3>
                    <p className="text-sm text-muted-foreground">مدیریت تسک‌ها</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Link href="/storyboard">
                <Card
                  className="group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:scale-105 backdrop-blur-xl bg-white/20 border border-white/30 hover:border-purple-500/50"
                  style={{
                    background: 'rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(40px)',
                    boxShadow: `
                      0 8px 32px rgba(0, 0, 0, 0.1),
                      0 4px 16px rgba(147, 51, 234, 0.1),
                      inset 0 1px 0 rgba(255, 255, 255, 0.4)
                    `,
                  }}
                >
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-500/30 group-hover:scale-110 transition-all duration-300">
                      <Palette className="h-8 w-8 text-purple-500" />
                    </div>
                    <h3 className="font-bold text-foreground mb-2 text-lg">استوری‌بورد</h3>
                    <p className="text-sm text-muted-foreground">مدیریت محتوای بصری</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Link href="/content-calendar">
                <Card
                  className="group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:scale-105 backdrop-blur-xl bg-white/20 border border-white/30 hover:border-[#ff0a54]/50"
                  style={{
                    background: 'rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(40px)',
                    boxShadow: `
                      0 8px 32px rgba(0, 0, 0, 0.1),
                      0 4px 16px rgba(59, 130, 246, 0.1),
                      inset 0 1px 0 rgba(255, 255, 255, 0.4)
                    `,
                  }}
                >
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-[#ff0a54]/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#ff0a54]/30 group-hover:scale-110 transition-all duration-300">
                      <Calendar className="h-8 w-8 text-[#ff0a54]" />
                    </div>
                    <h3 className="font-bold text-foreground mb-2 text-lg">تقویم محتوا</h3>
                    <p className="text-sm text-muted-foreground">برنامه‌ریزی محتوا</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Link href="/wiki">
                <Card
                  className="group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:scale-105 backdrop-blur-xl bg-white/20 border border-white/30 hover:border-green-500/50"
                  style={{
                    background: 'rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(40px)',
                    boxShadow: `
                      0 8px 32px rgba(0, 0, 0, 0.1),
                      0 4px 16px rgba(34, 197, 94, 0.1),
                      inset 0 1px 0 rgba(255, 255, 255, 0.4)
                    `,
                  }}
                >
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-500/30 group-hover:scale-110 transition-all duration-300">
                      <BookOpen className="h-8 w-8 text-green-500" />
                    </div>
                    <h3 className="font-bold text-foreground mb-2 text-lg">شبرالوگ</h3>
                    <p className="text-sm text-muted-foreground">پایگاه دانش</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          </motion.div>
        </motion.section>
      </div>
    </motion.div>
  );
}