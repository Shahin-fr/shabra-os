'use client';

import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MobileTaskCard } from './MobileTaskCard';

const mockTasks = [
  {
    id: 1,
    title: 'طراحی رابط کاربری جدید',
    description: 'طراحی UI برای صفحه اصلی با تمرکز بر تجربه کاربری',
    priority: 'high' as const,
    status: 'in_progress' as const,
    dueDate: 'امروز',
    assignee: 'احمد محمدی',
    progress: 75,
    tags: ['UI/UX', 'Frontend']
  },
  {
    id: 2,
    title: 'بررسی کدهای پروژه',
    description: 'بررسی کیفیت کد و انجام تست‌های مختلف',
    priority: 'medium' as const,
    status: 'pending' as const,
    dueDate: 'فردا',
    assignee: 'فاطمه احمدی',
    progress: 0,
    tags: ['Backend', 'Testing']
  },
  {
    id: 3,
    title: 'نوشتن مستندات',
    description: 'مستندسازی API جدید و راهنمای استفاده',
    priority: 'low' as const,
    status: 'completed' as const,
    dueDate: 'دیروز',
    assignee: 'علی رضایی',
    progress: 100,
    tags: ['Documentation']
  },
  {
    id: 4,
    title: 'تست عملکرد سیستم',
    description: 'تست سرعت و کارایی سیستم در شرایط مختلف',
    priority: 'high' as const,
    status: 'in_progress' as const,
    dueDate: 'امروز',
    assignee: 'مریم حسینی',
    progress: 40,
    tags: ['Testing', 'Performance']
  },
  {
    id: 5,
    title: 'پیاده‌سازی ویژگی جدید',
    description: 'اضافه کردن قابلیت جستجوی پیشرفته',
    priority: 'medium' as const,
    status: 'pending' as const,
    dueDate: 'پس‌فردا',
    assignee: 'حسن کریمی',
    progress: 0,
    tags: ['Feature', 'Backend']
  }
];



export function MobileTasksList() {
  const pendingTasks = mockTasks.filter(task => task.status === 'pending');
  const inProgressTasks = mockTasks.filter(task => task.status === 'in_progress');
  const completedTasks = mockTasks.filter(task => task.status === 'completed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 pb-20 mobile-safe-top">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 mobile-padding mobile-safe-top"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mobile-heading text-[#393d3f]">تسک‌ها</h1>
            <p className="mobile-caption text-gray-600 mt-1">مدیریت و پیگیری تسک‌ها</p>
          </div>
          <Button className="mobile-button bg-[#ff0a54] hover:bg-[#ff0a54]/90 text-white">
            <Plus className="h-5 w-5 ml-2" />
            تسک جدید
          </Button>
        </div>
      </motion.div>

      {/* Content */}
      <div className="mobile-container mobile-spacing py-6">
        {/* In Progress Tasks */}
        {inProgressTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <h2 className="text-lg font-bold text-gray-900">در حال انجام</h2>
              <Badge className="bg-blue-100 text-blue-800">{inProgressTasks.length}</Badge>
            </div>
            <div className="space-y-3">
              {inProgressTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <MobileTaskCard task={task} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Pending Tasks */}
        {pendingTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <h2 className="text-lg font-bold text-gray-900">در انتظار</h2>
              <Badge className="bg-gray-100 text-gray-800">{pendingTasks.length}</Badge>
            </div>
            <div className="space-y-3">
              {pendingTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <MobileTaskCard task={task} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <h2 className="text-lg font-bold text-gray-900">تکمیل شده</h2>
              <Badge className="bg-green-100 text-green-800">{completedTasks.length}</Badge>
            </div>
            <div className="space-y-3">
              {completedTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <MobileTaskCard task={task} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
