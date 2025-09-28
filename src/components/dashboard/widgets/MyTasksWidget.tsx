'use client';

import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { CheckCircle, Clock, AlertCircle, Calendar, Plus } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data for tasks
const mockTasks = [
  {
    id: 1,
    title: 'تکمیل گزارش ماهانه',
    description: 'تهیه گزارش عملکرد تیم برای ماه گذشته',
    status: 'in_progress',
    priority: 'high',
    dueTime: '14:00',
    dueDate: new Date(), // Today
    progress: 60,
  },
  {
    id: 2,
    title: 'بررسی کدهای جدید',
    description: 'مرور و تست کدهای نوشته شده توسط تیم',
    status: 'pending',
    priority: 'medium',
    dueTime: '16:30',
    dueDate: new Date(), // Today
    progress: 0,
  },
  {
    id: 3,
    title: 'آپدیت مستندات',
    description: 'به‌روزرسانی مستندات پروژه',
    status: 'completed',
    priority: 'low',
    dueTime: '12:00',
    dueDate: new Date(), // Today
    progress: 100,
  },
  {
    id: 4,
    title: 'جلسه تیم',
    description: 'شرکت در جلسه هفتگی تیم',
    status: 'pending',
    priority: 'high',
    dueTime: '10:00',
    dueDate: new Date(), // Today
    progress: 0,
  },
  // Overdue tasks
  {
    id: 5,
    title: 'بررسی پیشنهادات مشتری',
    description: 'مرور و پاسخ به پیشنهادات دریافتی از مشتریان',
    status: 'pending',
    priority: 'high',
    dueTime: '09:00',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    progress: 0,
  },
  {
    id: 6,
    title: 'تهیه گزارش هفتگی',
    description: 'نوشتن گزارش فعالیت‌های هفته گذشته',
    status: 'in_progress',
    priority: 'medium',
    dueTime: '17:00',
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    progress: 30,
  },
  {
    id: 7,
    title: 'بررسی کدهای قدیمی',
    description: 'مرور و بهینه‌سازی کدهای قدیمی پروژه',
    status: 'pending',
    priority: 'low',
    dueTime: '15:00',
    dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    progress: 0,
  },
];

export function MyTasksWidget() {
  // Helper function to check if a task is overdue
  const isOverdue = (dueDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  // Helper function to check if a task is due today
  const isDueToday = (dueDate: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    return dueDate >= today && dueDate < tomorrow;
  };

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

  // Filter tasks for today and overdue
  const todayTasks = mockTasks.filter(task => 
    isDueToday(task.dueDate) && task.status !== 'completed'
  );
  const overdueTasks = mockTasks.filter(task => 
    isOverdue(task.dueDate) && task.status !== 'completed'
  );
  const completedTasks = mockTasks.filter(task => task.status === 'completed');

  return (
    <OptimizedMotion
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className='backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl'>
        <CardHeader className='pb-4'>
          <CardTitle className='text-xl font-bold text-[#ff0a54] flex items-center gap-2'>
            <CheckCircle className='h-5 w-5' />
            تسک‌های من
          </CardTitle>
          <p className='text-sm text-gray-600'>
            {todayTasks.length + overdueTasks.length} تسک باقی‌مانده از {mockTasks.length} تسک کل
          </p>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Progress Overview */}
          <OptimizedMotion
            className='bg-gradient-to-r from-[#ff0a54]/10 to-purple-500/10 p-4 rounded-lg border border-[#ff0a54]/20'
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm font-medium text-gray-700'>
                پیشرفت کلی
              </span>
              <span className='text-sm font-bold text-[#ff0a54]'>
                {Math.round((completedTasks.length / mockTasks.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <OptimizedMotion
                className='h-2 rounded-full bg-gradient-to-r from-[#ff0a54] to-purple-500'
                initial={{ scaleX: 0 }}
                animate={{
                  width: `${(completedTasks.length / mockTasks.length) * 100}%`,
                }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </OptimizedMotion>

          {/* Tabbed Interface */}
          <Tabs defaultValue="today" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="today" className="font-vazirmatn">
                امروز ({todayTasks.length})
              </TabsTrigger>
              <TabsTrigger value="overdue" className="font-vazirmatn">
                با تاخیر ({overdueTasks.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="today" className="space-y-3 mt-4">
              {todayTasks.length > 0 ? (
                todayTasks.map((task, index) => {
                  const statusInfo = getStatusInfo(task.status);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <OptimizedMotion
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className={`p-4 rounded-lg border ${statusInfo.borderColor} ${statusInfo.bgColor} hover:shadow-md transition-all duration-200`}
                    >
                      <div className='flex items-start rtl:items-start justify-between'>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2 mb-2'>
                            <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
                            <h4 className='font-medium text-gray-900'>
                              {task.title}
                            </h4>
                          </div>
                          {task.description && (
                            <p className='text-sm text-gray-600 mb-2'>
                              {task.description}
                            </p>
                          )}
                          <div className='flex items-center gap-2'>
                            <Badge
                              variant='outline'
                              className={`text-xs ${getPriorityColor(task.priority)}`}
                            >
                              {getPriorityText(task.priority)}
                            </Badge>
                            <div className='flex items-center gap-1 text-xs text-gray-500'>
                              <Calendar className='h-3 w-3' />
                              <span>{task.dueTime}</span>
                            </div>
                          </div>
                        </div>
                        <div className='text-start'>
                          <div className='text-xs text-gray-500 mb-1'>پیشرفت</div>
                          <div className='text-sm font-bold text-[#ff0a54]'>
                            {task.progress}%
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {task.status === 'in_progress' && (
                        <div className='mt-3 w-full bg-gray-200 rounded-full h-1'>
                          <OptimizedMotion
                            className='h-1 rounded-full bg-gradient-to-r from-[#ff0a54] to-purple-500'
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: task.progress / 100 }}
                            transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                          />
                        </div>
                      )}
                    </OptimizedMotion>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500 font-vazirmatn">
                  هیچ تسکی برای امروز ندارید
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="overdue" className="space-y-3 mt-4">
              {overdueTasks.length > 0 ? (
                overdueTasks.map((task, index) => {
                  const daysOverdue = Math.ceil((new Date().getTime() - task.dueDate.getTime()) / (1000 * 60 * 60 * 24));

                  return (
                    <OptimizedMotion
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className={`p-4 rounded-lg border border-red-200 bg-red-50 hover:shadow-md transition-all duration-200`}
                    >
                      <div className='flex items-start rtl:items-start justify-between'>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2 mb-2'>
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <h4 className='font-medium text-gray-900'>
                              {task.title}
                            </h4>
                            <Badge variant="destructive" className="text-xs">
                              {daysOverdue} روز تاخیر
                            </Badge>
                          </div>
                          {task.description && (
                            <p className='text-sm text-gray-600 mb-2'>
                              {task.description}
                            </p>
                          )}
                          <div className='flex items-center gap-2'>
                            <Badge
                              variant='outline'
                              className={`text-xs ${getPriorityColor(task.priority)}`}
                            >
                              {getPriorityText(task.priority)}
                            </Badge>
                            <div className='flex items-center gap-1 text-xs text-red-500'>
                              <Calendar className='h-3 w-3' />
                              <span>تاریخ سررسید: {task.dueDate.toLocaleDateString('fa-IR')}</span>
                            </div>
                          </div>
                        </div>
                        <div className='text-start'>
                          <div className='text-xs text-gray-500 mb-1'>پیشرفت</div>
                          <div className='text-sm font-bold text-red-600'>
                            {task.progress}%
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {task.status === 'in_progress' && (
                        <div className='mt-3 w-full bg-gray-200 rounded-full h-1'>
                          <OptimizedMotion
                            className='h-1 rounded-full bg-gradient-to-r from-red-500 to-red-600'
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: task.progress / 100 }}
                            transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                          />
                        </div>
                      )}
                    </OptimizedMotion>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500 font-vazirmatn">
                  هیچ تسک با تاخیری ندارید
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Quick Actions */}
          <OptimizedMotion
            className='pt-4 border-t border-gray-200'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className='flex gap-2'>
              <Button variant='outline' size='sm' className='flex-1 text-xs'>
                <Plus className='h-3 w-3 ms-1' />
                تسک جدید
              </Button>
              <Button variant='outline' size='sm' className='flex-1 text-xs'>
                مشاهده همه
              </Button>
            </div>
          </OptimizedMotion>

          {/* Completed Tasks Summary */}
          {completedTasks.length > 0 && (
            <OptimizedMotion
              className='bg-green-50 border border-green-200 rounded-lg p-3'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
            >
              <div className='flex items-center gap-2 text-green-700'>
                <CheckCircle className='h-4 w-4' />
                <span className='text-sm font-medium'>
                  {completedTasks.length} تسک تکمیل شده
                </span>
              </div>
            </OptimizedMotion>
          )}
        </CardContent>
      </Card>
    </OptimizedMotion>
  );
}

