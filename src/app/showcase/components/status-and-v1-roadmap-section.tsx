'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import { ChevronDown } from 'lucide-react';

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

  // State for managing expanded columns
  const [expandedColumns, setExpandedColumns] = useState<{
    [key: string]: boolean;
  }>({
    'todo': false,
    'in-progress': false,
    'done': false
  });

  // Function to toggle column expansion
  const toggleColumn = (columnStatus: string) => {
    setExpandedColumns(prev => ({
      ...prev,
      [columnStatus]: !prev[columnStatus]
    }));
  };

  // Task data for each column
  const columns = [
    {
      title: 'باید انجام شود',
      status: 'todo',
      color: 'from-red-500/20 to-red-600/20',
      borderColor: 'border-red-500/30',
      tasks: [
        'بهینه‌سازی جامع عملکرد (کوئری‌های دیتابیس، حجم Bundle، Caching)',
        'پیاده‌سازی تجربه Real-time در ماژول‌های کلیدی',
        'پیاده‌سازی قابلیت استفاده آفلاین (PWA)',
        'بازسازی پایگاه دانش (ShabraLog v2) با قابلیت‌های همکاری پیشرفته',
        'ساخت تقویم همه‌جانبه برای نمایش تمام رویدادها',
        'توسعه پنل تنظیمات پیشرفته برای مدیران و کارمندان',
        'ساخت ماژول یادگیری برای تیم',
        'نوشتن مستندات کامل و انجام تست‌های End-to-End (آماده‌سازی برای v2.0)'
      ]
    },
    {
      title: 'در حال انجام',
      status: 'in-progress',
      color: 'from-yellow-500/20 to-orange-500/20',
      borderColor: 'border-yellow-500/30',
      tasks: [
        'استحکام‌بخشی امنیتی جامع (رفع XSS، Rate Limiting، اعتبارسنجی Zod)',
        'ایجاد Design System و یکپارچه‌سازی کامل UI/UX',
        'بازطراحی و بهینه‌سازی کامل تجربه کاربری برای موبایل',
        'شروع توسعه ماژول مدیریت جلسات',
        'حسابرسی وابستگی‌ها (npm audit) و به‌روزرسانی پکیج‌های کلیدی'
      ]
    },
    {
      title: 'انجام شده',
      status: 'done',
      color: 'from-green-500/20 to-emerald-500/20',
      borderColor: 'border-green-500/30',
      tasks: [
        'پیاده‌سازی ساختار اولیه و قابلیت‌های پایه ماژول مدیریت وظایف',
        'پیاده‌سازی ساختار اولیه و قابلیت‌های پایه ماژول استوری‌بورد',
        'پیاده‌سازی ماژول InstaPulse به عنوان Proof-of-Concept',
        'پیاده‌سازی ماژول پایگاه دانش (Wiki)',
        'پیاده‌سازی ساختار اولیه و قابلیت‌های پایه ماژول منابع انسانی',
        'طراحی و پیاده‌سازی معماری پروژه (مبتنی بر Next.js App Router)',
        'ایجاد زیرساخت دیتابیس و مدیریت اسکیمای آن با Prisma'
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
            وضعیت فعلی و قدم‌های بعدی
          </h2>
          <p className="text-lg sm:text-xl text-[#A1A1A1] max-w-4xl mx-auto leading-relaxed">
            این پروژه یک کار در حال پیشرفته. بورد زیر، نمای کلی از وضعیت فعلی و نقشه راه رسیدن به نسخه پایدار (v1.0) رو نشون می‌ده.
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
                {/* Always show first 5 tasks */}
                {column.tasks.slice(0, 5).map((task, taskIndex) => (
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

                {/* Animated container for additional tasks */}
                <AnimatePresence mode="wait">
                  {expandedColumns[column.status] && column.tasks.length > 5 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ 
                        duration: 0.3,
                        ease: "easeInOut"
                      }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-3">
                        {column.tasks.slice(5).map((task, taskIndex) => (
                          <motion.div
                            key={`${column.status}-extra-${taskIndex}`}
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ 
                              delay: taskIndex * 0.05,
                              duration: 0.2,
                              ease: "easeOut"
                            }}
                            className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-xl border border-[#2A2A2A] p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-[#E000A0]/30"
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
                  )}
                </AnimatePresence>

                {/* Show More/Less Button */}
                {column.tasks.length > 5 && (
                  <motion.button
                    onClick={() => toggleColumn(column.status)}
                    className="w-full mt-4 px-4 py-3 bg-transparent border border-[#2A2A2A] rounded-lg text-gray-400 hover:bg-white/10 hover:border-[#E000A0]/30 transition-all duration-300 flex items-center justify-center space-x-2 rtl:space-x-reverse group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    variants={cardVariants}
                    transition={{ delay: (columnIndex * 0.2) + 0.5 }}
                  >
                    <span className="text-sm font-medium">
                      {expandedColumns[column.status] ? 'نمایش کمتر' : 'نمایش بیشتر'}
                    </span>
                    <motion.div
                      animate={{ rotate: expandedColumns[column.status] ? 180 : 0 }}
                      transition={{ 
                        duration: 0.3,
                        ease: "easeInOut"
                      }}
                    >
                      <ChevronDown size={16} className="text-gray-400 group-hover:text-[#E000A0] transition-colors duration-300" />
                    </motion.div>
                  </motion.button>
                )}
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
                <div className="text-2xl font-bold text-red-500">8</div>
                <div className="text-sm text-[#A1A1A1]">باید انجام شود</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">5</div>
                <div className="text-sm text-[#A1A1A1]">در حال انجام</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">7</div>
                <div className="text-sm text-[#A1A1A1]">انجام شده</div>
              </div>
            </div>
            <p className="text-[#A1A1A1] leading-relaxed">
              این پروژه همچنان در حال توسعه است. هدف اصلی، رسیدن به یک نسخه پایدار و قابل استفاده است.
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
