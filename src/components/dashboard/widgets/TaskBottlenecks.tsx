'use client';

import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import {
  AlertTriangle,
  Clock,
  User,
  FileText,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const bottleneckData = [
  {
    id: 1,
    title: 'تأیید طراحی UI',
    project: 'وب‌سایت جدید',
    assignee: 'فاطمه احمدی',
    waitingFor: 'احمد محمدی',
    waitingTime: '3 روز',
    priority: 'high',
    status: 'blocked',
  },
  {
    id: 2,
    title: 'تست نهایی سیستم',
    project: 'سیستم CRM',
    assignee: 'حسن کریمی',
    waitingFor: 'تیم QA',
    waitingTime: '2 روز',
    priority: 'high',
    status: 'blocked',
  },
  {
    id: 3,
    title: 'بررسی کدهای امنیتی',
    project: 'اپلیکیشن موبایل',
    assignee: 'علی رضایی',
    waitingFor: 'تیم امنیت',
    waitingTime: '1 روز',
    priority: 'medium',
    status: 'waiting',
  },
  {
    id: 4,
    title: 'تأیید بودجه پروژه',
    project: 'پورتال مشتریان',
    assignee: 'مریم حسینی',
    waitingFor: 'مدیریت',
    waitingTime: '5 روز',
    priority: 'critical',
    status: 'blocked',
  },
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical':
      return 'bg-status-danger text-status-danger-text border-status-danger';
    case 'high':
      return 'bg-status-warning text-status-warning-text border-status-warning';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-status-success text-status-success-text border-status-success';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'blocked':
      return 'text-status-danger-text bg-status-danger/20';
    case 'waiting':
      return 'text-yellow-500 bg-yellow-500/20';
    case 'in_progress':
      return 'text-brand-plum-text bg-brand-plum/20';
    default:
      return 'text-gray-500 bg-gray-500/20';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'blocked':
      return <AlertTriangle className='h-4 w-4' />;
    case 'waiting':
      return <Clock className='h-4 w-4' />;
    case 'in_progress':
      return <CheckCircle className='h-4 w-4' />;
    default:
      return <FileText className='h-4 w-4' />;
  }
};

export function TaskBottlenecks() {
  const totalBottlenecks = bottleneckData.length;
  const criticalBottlenecks = bottleneckData.filter(
    b => b.priority === 'critical'
  ).length;
  const blockedTasks = bottleneckData.filter(
    b => b.status === 'blocked'
  ).length;

  return (
    <OptimizedMotion
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
    >
      <Card className='backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300'>
        <CardHeader className='pb-4'>
          <CardTitle className='flex items-center gap-3 text-xl font-bold'>
            <div className='w-8 h-8 bg-[#ff0a54]/20 rounded-full flex items-center justify-center'>
              <AlertTriangle className='h-5 w-5 text-[#ff0a54]' />
            </div>
            گلوگاه‌های تسک
            <Badge variant='destructive' className='ms-auto'>
              {criticalBottlenecks} بحرانی
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <OptimizedMotion
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            className='grid grid-cols-3 gap-4 mb-6'
          >
            <div className='text-center p-3 rounded-xl bg-white/5'>
              <div className='text-2xl font-bold text-foreground'>
                {totalBottlenecks}
              </div>
              <div className='text-sm text-muted-foreground'>کل گلوگاه‌ها</div>
            </div>
            <div className='text-center p-3 rounded-xl bg-white/5'>
              <div className='text-2xl font-bold text-status-danger-text'>
                {blockedTasks}
              </div>
              <div className='text-sm text-muted-foreground'>مسدود شده</div>
            </div>
            <div className='text-center p-3 rounded-xl bg-white/5'>
              <div className='text-2xl font-bold text-yellow-500'>
                {bottleneckData.filter(b => b.status === 'waiting').length}
              </div>
              <div className='text-sm text-muted-foreground'>در انتظار</div>
            </div>
          </OptimizedMotion>

          {/* Bottleneck List */}
          <div className='space-y-4'>
            {bottleneckData.map((bottleneck, index) => (
              <OptimizedMotion
                key={bottleneck.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
                className='group p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300'
              >
                <div className='flex items-start rtl:items-start justify-between mb-3'>
                  <div className='flex items-start rtl:items-start gap-3'>
                    <div
                      className={`w-10 h-10 ${getStatusColor(bottleneck.status)} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}
                    >
                      {getStatusIcon(bottleneck.status)}
                    </div>
                    <div>
                      <h4 className='font-semibold text-foreground group-hover:text-[#ff0a54] transition-colors'>
                        {bottleneck.title}
                      </h4>
                      <p className='text-sm text-muted-foreground flex items-center gap-2'>
                        <FileText className='h-3 w-3' />
                        {bottleneck.project}
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant='outline'
                    className={`text-xs ${getPriorityColor(bottleneck.priority)}`}
                  >
                    {bottleneck.priority === 'critical'
                      ? 'بحرانی'
                      : bottleneck.priority === 'high'
                        ? 'بالا'
                        : bottleneck.priority === 'medium'
                          ? 'متوسط'
                          : 'پایین'}
                  </Badge>
                </div>

                {/* Bottleneck Details */}
                <div className='space-y-3'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground'>مسئول:</span>
                    <span className='font-medium text-foreground flex items-center gap-1'>
                      <User className='h-3 w-3' />
                      {bottleneck.assignee}
                    </span>
                  </div>

                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground'>منتظر:</span>
                    <span className='font-medium text-foreground'>
                      {bottleneck.waitingFor}
                    </span>
                  </div>

                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground'>زمان انتظار:</span>
                    <span className='font-medium text-status-danger-text flex items-center gap-1'>
                      <Clock className='h-3 w-3' />
                      {bottleneck.waitingTime}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className='mt-4 flex gap-2'>
                  <Button
                    size='sm'
                    className='bg-[#ff0a54] hover:bg-[#ff0a54]/90 text-white px-3 py-1 h-8 text-xs'
                  >
                    <ArrowRight className="rtl:rotate-180 h-3 w-3 me-1" />
                    پیگیری
                  </Button>
                  <Button
                    size='sm'
                    variant='outline'
                    className='px-3 py-1 h-8 text-xs'
                  >
                    <CheckCircle className='h-3 w-3 me-1' />
                    حل شد
                  </Button>
                </div>
              </OptimizedMotion>
            ))}
          </div>

          <OptimizedMotion
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className='mt-4 pt-4 border-t border-white/10'
          >
            <Button
              variant='outline'
              className='w-full bg-white/5 hover:bg-white/10 border-white/20 hover:border-white/30'
            >
              <AlertTriangle className='h-4 w-4 me-2' />
              مدیریت گلوگاه‌ها
            </Button>
          </OptimizedMotion>
        </CardContent>
      </Card>
    </OptimizedMotion>
  );
}

