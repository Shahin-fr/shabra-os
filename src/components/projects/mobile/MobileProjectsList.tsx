'use client';

import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import {
  FolderOpen,
  Users,
  Calendar,
  TrendingUp,
  MoreHorizontal,
  Plus,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const mockProjects = [
  {
    id: 1,
    title: 'وب‌سایت جدید شرکت',
    description: 'طراحی و توسعه وب‌سایت جدید با تمرکز بر تجربه کاربری',
    progress: 75,
    status: 'active',
    team: ['احمد محمدی', 'فاطمه احمدی', 'علی رضایی'],
    dueDate: '15 دی 1403',
    priority: 'high',
    budget: '50,000,000 تومان',
  },
  {
    id: 2,
    title: 'اپلیکیشن موبایل',
    description: 'توسعه اپلیکیشن موبایل برای iOS و Android',
    progress: 45,
    status: 'active',
    team: ['مریم حسینی', 'حسن کریمی'],
    dueDate: '20 بهمن 1403',
    priority: 'medium',
    budget: '80,000,000 تومان',
  },
  {
    id: 3,
    title: 'سیستم مدیریت محتوا',
    description: 'پیاده‌سازی CMS برای مدیریت محتوای وب‌سایت',
    progress: 90,
    status: 'active',
    team: ['زهرا نوری', 'محمد صادقی'],
    dueDate: '5 دی 1403',
    priority: 'high',
    budget: '30,000,000 تومان',
  },
  {
    id: 4,
    title: 'پروژه تحقیقاتی AI',
    description: 'پژوهش و توسعه الگوریتم‌های هوش مصنوعی',
    progress: 25,
    status: 'planning',
    team: ['علی رضایی', 'فاطمه احمدی', 'حسن کریمی'],
    dueDate: '15 اسفند 1403',
    priority: 'low',
    budget: '120,000,000 تومان',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'planning':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'on_hold':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'completed':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'active':
      return 'فعال';
    case 'planning':
      return 'برنامه‌ریزی';
    case 'on_hold':
      return 'متوقف';
    case 'completed':
      return 'تکمیل شده';
    default:
      return 'نامشخص';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function MobileProjectsList() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 pb-20 mobile-safe-top'>
      {/* Header */}
      <OptimizedMotion
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 mobile-padding mobile-safe-top'
      >
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='mobile-heading text-[#393d3f]'>پروژه‌ها</h1>
            <p className='mobile-caption text-gray-600 mt-1'>
              مدیریت و پیگیری پروژه‌ها
            </p>
          </div>
          <Button className='mobile-button bg-[#ff0a54] hover:bg-[#ff0a54]/90 text-white'>
            <Plus className='h-5 w-5 ml-2' />
            پروژه جدید
          </Button>
        </div>
      </OptimizedMotion>

      {/* Content */}
      <div className='mobile-container mobile-spacing py-6'>
        {mockProjects.map((project, index) => (
          <OptimizedMotion
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className='cursor-pointer'
          >
            <Card className='mobile-card'>
              <CardContent className='mobile-padding'>
                {/* Header */}
                <div className='flex items-start justify-between mb-4'>
                  <div className='flex items-start gap-3 flex-1'>
                    <div className='w-12 h-12 bg-[#ff0a54]/20 rounded-2xl flex items-center justify-center flex-shrink-0'>
                      <FolderOpen className='h-6 w-6 text-[#ff0a54]' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <h3 className='font-bold text-gray-900 text-base mb-1 line-clamp-2'>
                        {project.title}
                      </h3>
                      <p className='text-sm text-gray-600 line-clamp-2 mb-2'>
                        {project.description}
                      </p>
                      <div className='flex items-center gap-2'>
                        <Badge
                          className={`text-xs ${getStatusColor(project.status)}`}
                        >
                          {getStatusText(project.status)}
                        </Badge>
                        <Badge
                          className={`text-xs ${getPriorityColor(project.priority)}`}
                        >
                          {project.priority === 'high'
                            ? 'بالا'
                            : project.priority === 'medium'
                              ? 'متوسط'
                              : 'پایین'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='p-2 h-8 w-8 text-gray-400 hover:text-gray-600'
                  >
                    <MoreHorizontal className='h-4 w-4' />
                  </Button>
                </div>

                {/* Progress Bar */}
                <div className='mb-4'>
                  <div className='flex justify-between text-sm text-gray-600 mb-2'>
                    <span>پیشرفت پروژه</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-3'>
                    <OptimizedMotion
                      className='bg-gradient-to-r from-[#ff0a54] to-purple-500 h-3 rounded-full'
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: project.progress / 100 }}
                      transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                    />
                  </div>
                </div>

                {/* Team Avatars */}
                <div className='flex items-center gap-2 mb-4'>
                  <Users className='h-4 w-4 text-gray-500' />
                  <div className='flex -space-x-2'>
                    {project.team.slice(0, 3).map((member, memberIndex) => (
                      <div
                        key={memberIndex}
                        className='w-8 h-8 bg-gradient-to-br from-[#ff0a54] to-purple-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-semibold'
                      >
                        {member.charAt(0)}
                      </div>
                    ))}
                    {project.team.length > 3 && (
                      <div className='w-8 h-8 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center text-gray-600 text-xs font-semibold'>
                        +{project.team.length - 3}
                      </div>
                    )}
                  </div>
                  <span className='text-sm text-gray-600'>
                    {project.team.length} عضو
                  </span>
                </div>

                {/* Footer Info */}
                <div className='flex items-center justify-between text-sm text-gray-500'>
                  <div className='flex items-center gap-1'>
                    <Calendar className='h-4 w-4' />
                    <span>{project.dueDate}</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <TrendingUp className='h-4 w-4' />
                    <span>{project.budget}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </OptimizedMotion>
        ))}
      </div>
    </div>
  );
}

