'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle, Calendar, Plus } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock data for today's tasks
const mockTasks = [
  {
    id: 1,
    title: 'تکمیل گزارش ماهانه',
    description: 'تهیه گزارش عملکرد تیم برای ماه گذشته',
    status: 'in_progress',
    priority: 'high',
    dueTime: '14:00',
    progress: 60,
  },
  {
    id: 2,
    title: 'بررسی کدهای جدید',
    description: 'مرور و تست کدهای نوشته شده توسط تیم',
    status: 'pending',
    priority: 'medium',
    dueTime: '16:30',
    progress: 0,
  },
  {
    id: 3,
    title: 'آپدیت مستندات',
    description: 'به‌روزرسانی مستندات پروژه',
    status: 'completed',
    priority: 'low',
    dueTime: '12:00',
    progress: 100,
  },
  {
    id: 4,
    title: 'جلسه تیم',
    description: 'شرکت در جلسه هفتگی تیم',
    status: 'pending',
    priority: 'high',
    dueTime: '10:00',
    progress: 0,
  },
];

export function MyTasksWidget() {
  // Get status color and icon
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          color: 'text-green-500',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: CheckCircle,
        };
      case 'in_progress':
        return {
          color: 'text-blue-500',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          icon: Clock,
        };
      case 'pending':
        return {
          color: 'text-orange-500',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          icon: AlertCircle,
        };
      default:
        return {
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: Clock,
        };
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Get status text in Persian
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'تکمیل شده';
      case 'in_progress':
        return 'در حال انجام';
      case 'pending':
        return 'در انتظار';
      default:
        return 'نامشخص';
    }
  };

  // Get priority text in Persian
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'بالا';
      case 'medium':
        return 'متوسط';
      case 'low':
        return 'پایین';
      default:
        return 'نامشخص';
    }
  };

  // Filter tasks for today
  const todayTasks = mockTasks.filter(task => task.status !== 'completed');
  const completedTasks = mockTasks.filter(task => task.status === 'completed');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-[#ff0a54] flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            تسک‌های امروز
          </CardTitle>
          <p className="text-sm text-gray-600">
            {todayTasks.length} تسک باقی‌مانده از {mockTasks.length} تسک کل
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Overview */}
          <motion.div
            className="bg-gradient-to-r from-[#ff0a54]/10 to-purple-500/10 p-4 rounded-lg border border-[#ff0a54]/20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">پیشرفت کلی</span>
              <span className="text-sm font-bold text-[#ff0a54]">
                {Math.round((completedTasks.length / mockTasks.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="h-2 rounded-full bg-gradient-to-r from-[#ff0a54] to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${(completedTasks.length / mockTasks.length) * 100}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </motion.div>

          {/* Tasks List */}
          <div className="space-y-3">
            {todayTasks.map((task, index) => {
              const statusInfo = getStatusInfo(task.status);
              const StatusIcon = statusInfo.icon;

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={`p-4 rounded-lg border ${statusInfo.borderColor} ${statusInfo.bgColor} hover:shadow-md transition-all duration-200`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                      </div>
                      {task.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-xs ${getPriorityColor(task.priority)}`}
                        >
                          {getPriorityText(task.priority)}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>{task.dueTime}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="text-xs text-gray-500 mb-1">پیشرفت</div>
                      <div className="text-sm font-bold text-[#ff0a54]">
                        {task.progress}%
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {task.status === 'in_progress' && (
                    <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
                      <motion.div
                        className="h-1 rounded-full bg-gradient-to-r from-[#ff0a54] to-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${task.progress}%` }}
                        transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                      />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <motion.div
            className="pt-4 border-t border-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
              >
                <Plus className="h-3 w-3 ml-1" />
                تسک جدید
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
              >
                مشاهده همه
              </Button>
            </div>
          </motion.div>

          {/* Completed Tasks Summary */}
          {completedTasks.length > 0 && (
            <motion.div
              className="bg-green-50 border border-green-200 rounded-lg p-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
            >
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {completedTasks.length} تسک امروز تکمیل شده
                </span>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
