'use client';

import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { CheckSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const mockTasks = [
  {
    id: 1,
    title: 'طراحی رابط کاربری جدید',
    description: 'طراحی UI برای صفحه اصلی',
    priority: 'high',
    status: 'in_progress',
    dueDate: 'امروز',
    assignee: 'احمد محمدی',
    progress: 75,
  },
  {
    id: 2,
    title: 'بررسی کدهای پروژه',
    description: 'بررسی کیفیت کد و تست',
    priority: 'medium',
    status: 'pending',
    dueDate: 'فردا',
    assignee: 'فاطمه احمدی',
    progress: 0,
  },
  {
    id: 3,
    title: 'نوشتن مستندات',
    description: 'مستندسازی API جدید',
    priority: 'low',
    status: 'completed',
    dueDate: 'دیروز',
    assignee: 'علی رضایی',
    progress: 100,
  },
  {
    id: 4,
    title: 'تست عملکرد سیستم',
    description: 'تست سرعت و کارایی',
    priority: 'high',
    status: 'in_progress',
    dueDate: 'امروز',
    assignee: 'مریم حسینی',
    progress: 40,
  },
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export function MobileTasksWidget() {
  const pendingTasks = mockTasks.filter(task => task.status === 'pending');
  const inProgressTasks = mockTasks.filter(
    task => task.status === 'in_progress'
  );
  const completedTasks = mockTasks.filter(task => task.status === 'completed');

  return (
    <Card className='mobile-card'>
      <CardHeader className='pb-4'>
        <CardTitle className='flex items-center gap-3 mobile-subheading'>
          <div className='w-8 h-8 bg-[#ff0a54]/20 rounded-full flex items-center justify-center'>
            <CheckSquare className='h-5 w-5 text-[#ff0a54]' />
          </div>
          تسک‌های امروز
        </CardTitle>
      </CardHeader>
      <CardContent className='mobile-spacing'>
        {/* In Progress Tasks */}
        {inProgressTasks.length > 0 && (
          <div className='space-y-3'>
            <h3 className='text-sm font-semibold text-gray-700 flex items-center gap-2'>
              <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
              در حال انجام ({inProgressTasks.length})
            </h3>
            {inProgressTasks.map((task, index) => (
              <OptimizedMotion
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className='p-4 bg-blue-50/50 rounded-xl border border-blue-200/50'
              >
                <div className='flex items-start rtl:items-start justify-between mb-2'>
                  <h4 className='font-semibold text-gray-900 text-sm'>
                    {task.title}
                  </h4>
                  <Badge
                    className={`text-xs ${getPriorityColor(task.priority)}`}
                  >
                    {task.priority === 'high'
                      ? 'بالا'
                      : task.priority === 'medium'
                        ? 'متوسط'
                        : 'پایین'}
                  </Badge>
                </div>
                <p className='text-xs text-gray-600 mb-3'>{task.description}</p>

                {/* Progress Bar */}
                <div className='mb-3'>
                  <div className='flex justify-between text-xs text-gray-600 mb-1'>
                    <span>پیشرفت</span>
                    <span>{task.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden overflow-hidden">
                    <div
                      className='bg-blue-500 h-2 rounded-full transition-all duration-300'
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>

                <div className='flex items-center justify-between text-xs text-gray-500'>
                  <span>{task.assignee}</span>
                  <span>{task.dueDate}</span>
                </div>
              </OptimizedMotion>
            ))}
          </div>
        )}

        {/* Pending Tasks */}
        {pendingTasks.length > 0 && (
          <div className='space-y-3'>
            <h3 className='text-sm font-semibold text-gray-700 flex items-center gap-2'>
              <div className='w-2 h-2 bg-gray-500 rounded-full'></div>
              در انتظار ({pendingTasks.length})
            </h3>
            {pendingTasks.map((task, index) => (
              <OptimizedMotion
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.3,
                  delay: (inProgressTasks.length + index) * 0.1,
                }}
                className='p-4 bg-gray-50/50 rounded-xl border border-gray-200/50'
              >
                <div className='flex items-start rtl:items-start justify-between mb-2'>
                  <h4 className='font-semibold text-gray-900 text-sm'>
                    {task.title}
                  </h4>
                  <Badge
                    className={`text-xs ${getPriorityColor(task.priority)}`}
                  >
                    {task.priority === 'high'
                      ? 'بالا'
                      : task.priority === 'medium'
                        ? 'متوسط'
                        : 'پایین'}
                  </Badge>
                </div>
                <p className='text-xs text-gray-600 mb-3'>{task.description}</p>
                <div className='flex items-center justify-between text-xs text-gray-500'>
                  <span>{task.assignee}</span>
                  <span>{task.dueDate}</span>
                </div>
              </OptimizedMotion>
            ))}
          </div>
        )}

        {/* Completed Tasks (Collapsed) */}
        {completedTasks.length > 0 && (
          <div className='space-y-3'>
            <h3 className='text-sm font-semibold text-gray-700 flex items-center gap-2'>
              <div className='w-2 h-2 bg-green-500 rounded-full'></div>
              تکمیل شده ({completedTasks.length})
            </h3>
            <div className='p-3 bg-green-50/50 rounded-xl border border-green-200/50 text-center'>
              <p className='text-sm text-green-700 font-medium'>
                {completedTasks.length} تسک امروز تکمیل شده است
              </p>
            </div>
          </div>
        )}

        {/* View All Button */}
        <OptimizedMotion
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className='pt-4 border-t border-gray-200'
        >
          <Button
            variant='outline'
            className='w-full bg-white/50 hover:bg-white/80 border-gray-200 text-sm'
          >
            مشاهده همه تسک‌ها
          </Button>
        </OptimizedMotion>
      </CardContent>
    </Card>
  );
}

