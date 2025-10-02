'use client';

import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { BarChart3, Users, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const workloadData = [
  {
    name: 'احمد محمدی',
    department: 'توسعه',
    tasks: 8,
    completed: 6,
    overdue: 1,
    workload: 85,
    status: 'high',
  },
  {
    name: 'فاطمه احمدی',
    department: 'طراحی',
    tasks: 5,
    completed: 4,
    overdue: 0,
    workload: 60,
    status: 'medium',
  },
  {
    name: 'علی رضایی',
    department: 'فروش',
    tasks: 6,
    completed: 3,
    overdue: 2,
    workload: 95,
    status: 'critical',
  },
  {
    name: 'مریم حسینی',
    department: 'بازاریابی',
    tasks: 4,
    completed: 4,
    overdue: 0,
    workload: 40,
    status: 'low',
  },
  {
    name: 'حسن کریمی',
    department: 'پشتیبانی',
    tasks: 7,
    completed: 5,
    overdue: 1,
    workload: 70,
    status: 'medium',
  },
];

const getWorkloadColor = (status: string) => {
  switch (status) {
    case 'low':
      return 'bg-status-success';
    case 'medium':
      return 'bg-[#ff0a54]';
    case 'high':
      return 'bg-status-warning';
    case 'critical':
      return 'bg-status-danger';
    default:
      return 'bg-gray-500';
  }
};

export function TeamWorkloadAnalysis() {
  const avgWorkload = Math.round(
    workloadData.reduce((sum, emp) => sum + emp.workload, 0) /
      workloadData.length
  );
  const criticalCount = workloadData.filter(
    emp => emp.status === 'critical'
  ).length;

  return (
    <OptimizedMotion
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <Card className='backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300'>
        <CardHeader className='pb-4'>
          <CardTitle className='flex items-center gap-3 text-xl font-bold'>
            <div className='w-8 h-8 bg-[#ff0a54]/20 rounded-full flex items-center justify-center'>
              <BarChart3 className='h-5 w-5 text-[#ff0a54]' />
            </div>
            تحلیل بار کاری تیم
            <Badge variant='outline' className='ms-auto'>
              میانگین: {avgWorkload}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <OptimizedMotion
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className='grid grid-cols-3 gap-4 mb-6'
          >
            <div className='text-center p-3 rounded-xl bg-white/5'>
              <div className='text-2xl font-bold text-foreground'>
                {avgWorkload}%
              </div>
              <div className='text-sm text-muted-foreground'>
                میانگین بار کاری
              </div>
            </div>
            <div className='text-center p-3 rounded-xl bg-white/5'>
              <div className='text-2xl font-bold text-status-danger-text'>
                {criticalCount}
              </div>
              <div className='text-sm text-muted-foreground'>نیاز به توجه</div>
            </div>
            <div className='text-center p-3 rounded-xl bg-white/5'>
              <div className='text-2xl font-bold text-status-success-text'>
                {workloadData.filter(emp => emp.status === 'low').length}
              </div>
              <div className='text-sm text-muted-foreground'>
                در وضعیت مطلوب
              </div>
            </div>
          </OptimizedMotion>

          {/* Workload Bars */}
          <div className='space-y-4'>
            {workloadData.map((employee, index) => (
              <OptimizedMotion
                key={employee.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                className='group p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300'
              >
                <div className='flex items-center justify-between mb-3'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-[#ff0a54]/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform'>
                      <Users className='h-5 w-5 text-[#ff0a54]' />
                    </div>
                    <div>
                      <h4 className='font-semibold text-foreground group-hover:text-[#ff0a54] transition-colors'>
                        {employee.name}
                      </h4>
                      <p className='text-sm text-muted-foreground'>
                        {employee.department}
                      </p>
                    </div>
                  </div>

                  <div className='text-end'>
                    <div className='text-lg font-bold text-foreground'>
                      {employee.workload}%
                    </div>
                    <Badge
                      variant='outline'
                      className={`text-xs ${
                        employee.status === 'critical'
                          ? 'bg-status-danger text-status-danger-text border-status-danger'
                          : employee.status === 'high'
                            ? 'bg-status-warning text-status-warning-text border-status-warning'
                            : employee.status === 'medium'
                              ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              : 'bg-status-success text-status-success-text border-status-success'
                      }`}
                    >
                      {employee.status === 'critical'
                        ? 'بحرانی'
                        : employee.status === 'high'
                          ? 'بالا'
                          : employee.status === 'medium'
                            ? 'متوسط'
                            : 'پایین'}
                    </Badge>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className='space-y-2'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground'>بار کاری</span>
                    <span className='font-medium text-foreground'>
                      {employee.tasks} تسک • {employee.completed} تکمیل شده
                    </span>
                  </div>

                  <div className='w-full bg-gray-200 rounded-full h-3'>
                    <OptimizedMotion
                      className={`h-3 rounded-full ${getWorkloadColor(employee.status)}`}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: employee.workload / 100 }}
                      transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                    />
                  </div>

                  <div className='flex items-center justify-between text-xs text-muted-foreground'>
                    <span>
                      تسک‌های باقی‌مانده: {employee.tasks - employee.completed}
                    </span>
                    {employee.overdue > 0 && (
                      <span className='text-status-danger-text flex items-center gap-1'>
                        <AlertTriangle className='h-3 w-3' />
                        {employee.overdue} تسک تأخیر
                      </span>
                    )}
                  </div>
                </div>
              </OptimizedMotion>
            ))}
          </div>

          <OptimizedMotion
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className='mt-4 pt-4 border-t border-white/10'
          >
            <Button
              variant='outline'
              className='w-full bg-white/5 hover:bg-white/10 border-white/20 hover:border-white/30'
            >
              <BarChart3 className='h-4 w-4 me-2' />
              مشاهده گزارش کامل
            </Button>
          </OptimizedMotion>
        </CardContent>
      </Card>
    </OptimizedMotion>
  );
}

