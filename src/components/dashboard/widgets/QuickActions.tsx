'use client';

import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import {
  Plus,
  FileText,
  Calendar,
  Settings,
  BarChart3,
  UserPlus,
  Mail,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const quickActions = [
  {
    title: 'ایجاد تسک جدید',
    description: 'تسک جدید برای تیم',
    icon: Plus,
    color: 'bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/10',
    iconColor: 'text-[#ff0a54]',
    href: '/tasks/create',
    priority: 'high',
  },
  {
    title: 'افزودن کاربر',
    description: 'کاربر جدید به سیستم',
    icon: UserPlus,
    color: 'bg-gradient-to-br from-blue-500/20 to-blue-500/10',
    iconColor: 'text-blue-600',
    href: '/employees/add',
    priority: 'high',
  },
  {
    title: 'گزارش عملکرد',
    description: 'گزارش‌های تحلیلی',
    icon: BarChart3,
    color: 'bg-gradient-to-br from-green-500/20 to-green-500/10',
    iconColor: 'text-green-600',
    href: '/reports',
    priority: 'medium',
  },
  {
    title: 'برنامه‌ریزی جلسه',
    description: 'جلسه جدید برنامه‌ریزی',
    icon: Calendar,
    color: 'bg-gradient-to-br from-purple-500/20 to-purple-500/10',
    iconColor: 'text-purple-600',
    href: '/meetings/schedule',
    priority: 'medium',
  },
  {
    title: 'ارسال اعلان',
    description: 'اطلاعیه به تمام تیم',
    icon: Mail,
    color: 'bg-gradient-to-br from-orange-500/20 to-orange-500/10',
    iconColor: 'text-orange-600',
    href: '/notifications/send',
    priority: 'low',
  },
  {
    title: 'تنظیمات سیستم',
    description: 'پیکربندی سیستم',
    icon: Settings,
    color: 'bg-gradient-to-br from-gray-500/20 to-gray-500/10',
    iconColor: 'text-gray-600',
    href: '/settings',
    priority: 'low',
  },
];

export function QuickActions() {
  return (
    <OptimizedMotion
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <Card className='backdrop-blur-sm bg-white/5 border border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 h-full'>
        <CardHeader className='pb-4'>
          <CardTitle className='flex items-center gap-3 text-xl font-bold'>
            <div className='w-8 h-8 bg-[#ff0a54]/20 rounded-full flex items-center justify-center'>
              <Plus className='h-5 w-5 text-[#ff0a54]' />
            </div>
            اقدامات سریع
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {quickActions.map((action, index) => (
            <OptimizedMotion
              key={action.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant='ghost'
                className='w-full h-auto p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 group'
                asChild={true}
              >
                <a href={action.href}>
                  {/* === SINGLE WRAPPER STARTS HERE === */}
                  <div>
                    <div className='flex items-center gap-4 w-full'>
                      <div
                        className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}
                      >
                        <action.icon className={`h-6 w-6 ${action.iconColor}`} />
                      </div>
                      <div className='flex-1 text-end'>
                        <h4 className='font-semibold text-sm text-foreground group-hover:text-[#ff0a54] transition-colors mb-1'>
                          {action.title}
                        </h4>
                        <p className='text-xs text-muted-foreground'>
                          {action.description}
                        </p>
                      </div>
                      <div className='opacity-0 group-hover:opacity-100 transition-opacity'>
                        <div className='w-2 h-2 bg-[#ff0a54] rounded-full'></div>
                      </div>
                    </div>
                  </div>
                  {/* === SINGLE WRAPPER ENDS HERE === */}
                </a>
              </Button>
            </OptimizedMotion>
          ))}

          <OptimizedMotion
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className='pt-4 border-t border-white/10'
          >
            <Button
              variant='outline'
              className='w-full bg-gradient-to-r from-[#ff0a54]/10 to-purple-500/10 border-[#ff0a54]/20 hover:border-[#ff0a54]/30 text-[#ff0a54] hover:text-[#ff0a54] text-sm'
            >
              <FileText className='h-4 w-4 me-2' />
              مشاهده همه گزینه‌ها
            </Button>
          </OptimizedMotion>
        </CardContent>
      </Card>
    </OptimizedMotion>
  );
}

