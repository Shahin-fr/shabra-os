'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useIsMobile } from '../../../hooks/useMediaQuery';

/**
 * StatusAndV1RoadmapSection Component - Project Status & V1.0 Roadmap
 * 
 * A comprehensive Kanban-style board showcasing current project status,
 * critical tasks, and detailed roadmap to achieve stable Version 1.0.
 */
export default function StatusAndV1RoadmapSection() {
  const isMobile = useIsMobile();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  // Task data for each column
  const columns = [
    {
      title: 'باید انجام شود',
      status: 'todo',
      color: 'from-red-500/20 to-red-600/20',
      borderColor: 'border-red-500/30',
      tasks: [
        'رفع آسیب‌پذیری امنیتی XSS در ماژول ویکی',
        'پیاده‌سازی Rate Limiting برای API Endpoints',
        'یکپارچه‌سازی کامل Design System و حذف استایل‌های متناقض',
        'بهینه‌سازی کوئری‌های دیتابیس برای رفع مشکل N+1',
        'اضافه شدن بخش جامع تنظیمات مدیر و کارمند',
        'بازسازی ماژول ویکی با سیستم انتشار محتوای جدید'
      ]
    },
    {
      title: 'در حال انجام',
      status: 'in-progress',
      color: 'from-yellow-500/20 to-orange-500/20',
      borderColor: 'border-yellow-500/30',
      tasks: [
        'بازطراحی کامل UI/UX وب‌اپلیکیشن موبایل',
        'پیاده‌سازی کنترل خطای پیشرفته برای موبایل',
        'افزایش سرعت کلی اپلیکیشن و بهینه‌سازی Bundle Size',
        'تحقیق و توسعه برای پیاده‌سازی وب‌اپ آفلاین'
      ]
    },
    {
      title: 'انجام شده - نمونه',
      status: 'done',
      color: 'from-green-500/20 to-emerald-500/20',
      borderColor: 'border-green-500/30',
      tasks: [
        'معماری اولیه و انتخاب Tech Stack',
        'ساخت ماژول‌های اصلی (پروژه، استوری‌بورد، ...)',
        'پیاده‌سازی سیستم احراز هویت (Authentication)'
      ]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1
    }
  };

  const columnVariants = {
    hidden: { 
      opacity: 0, 
      x: -50,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      x: 0,
      scale: 1
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1
    }
  };

  return (
    <section 
      ref={ref}
      className="relative py-20 px-4 sm:px-6 lg:px-8 bg-transparent overflow-hidden"
    >
      <motion.div 
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          variants={itemVariants}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F5F5F5] mb-6">
            وضعیت پروژه و نقشه راه V1.0
          </h2>
          <p className="text-lg sm:text-xl text-[#A1A1A1] max-w-4xl mx-auto leading-relaxed">
            تمرکز بر پایداری، امنیت و تجربه کاربری برای ساخت یک فونداسیون مستحکم.
          </p>
        </motion.div>

        {/* Kanban Board */}
        <motion.div 
          className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-1 md:grid-cols-3 gap-8'}`}
          variants={containerVariants}
        >
          {columns.map((column, columnIndex) => (
            <motion.div
              key={column.status}
              className="flex flex-col"
              variants={columnVariants}
              transition={{ delay: columnIndex * 0.2 }}
            >
              {/* Column Header */}
              <motion.div 
                className={`bg-gradient-to-r ${column.color} rounded-t-2xl border-t-2 ${column.borderColor} p-4 mb-4`}
                variants={itemVariants}
              >
                <h3 className="text-lg font-bold text-[#F5F5F5] text-center">
                  {column.title}
                </h3>
              </motion.div>

              {/* Task Cards */}
              <div className="space-y-3 flex-1">
                {column.tasks.map((task, taskIndex) => (
                  <motion.div
                    key={`${column.status}-${taskIndex}`}
                    className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-xl border border-[#2A2A2A] p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-[#E000A0]/30"
                    variants={cardVariants}
                    transition={{ delay: (columnIndex * 0.2) + (taskIndex * 0.1) }}
                    whileHover={{ 
                      scale: 1.02,
                      y: -2,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <div className="flex items-start space-x-3 rtl:space-x-reverse">
                      {/* Task Status Indicator */}
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${
                        column.status === 'todo' ? 'bg-red-500' :
                        column.status === 'in-progress' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`} />
                      
                      {/* Task Text */}
                      <p className="text-sm text-[#A1A1A1] leading-relaxed">
                        {task}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Progress Summary */}
        <motion.div 
          className="mt-16 text-center"
          variants={itemVariants}
        >
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl border border-[#2A2A2A] p-8 max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-[#F5F5F5] mb-4">
              پیشرفت کلی پروژه
            </h3>
            <div className="flex items-center justify-center space-x-4 rtl:space-x-reverse mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">6</div>
                <div className="text-sm text-[#A1A1A1]">باید انجام شود</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">4</div>
                <div className="text-sm text-[#A1A1A1]">در حال انجام</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">3</div>
                <div className="text-sm text-[#A1A1A1]">انجام شده</div>
              </div>
            </div>
            <p className="text-[#A1A1A1] leading-relaxed">
              هدف ما رسیدن به نسخه 1.0 پایدار و قابل اعتماد تا پایان فصل آینده است. 
              تمرکز اصلی بر امنیت، عملکرد و تجربه کاربری بهینه خواهد بود.
            </p>
          </div>
        </motion.div>


        {/* Subtle background decoration */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: inView ? 0.03 : 0 }}
          transition={{ duration: 2 }}
        >
          <div className="absolute top-1/4 start-1/4 w-96 h-96 bg-[#E000A0] rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 end-1/4 w-64 h-64 bg-[#8B5CF6] rounded-full blur-3xl" />
        </motion.div>
      </motion.div>
    </section>
  );
}
