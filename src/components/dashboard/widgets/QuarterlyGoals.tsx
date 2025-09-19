'use client';

import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { Target, TrendingUp, Users, DollarSign, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const quarterlyGoals = [
  {
    id: 1,
    title: 'افزایش درآمد 25%',
    category: 'مالی',
    progress: 78,
    target: 100,
    status: 'on_track',
    deadline: '2024-03-31',
    icon: DollarSign,
    color: 'text-green-500',
    bgColor: 'bg-green-500/20',
    description: 'افزایش درآمد از طریق پروژه‌های جدید',
    keyResults: [
      { title: 'تکمیل 5 پروژه بزرگ', completed: 4, total: 5 },
      { title: 'افزایش مشتریان 30%', completed: 25, total: 30 },
      { title: 'بهبود نرخ تبدیل 15%', completed: 12, total: 15 },
    ],
  },
  {
    id: 2,
    title: 'بهبود رضایت مشتریان',
    category: 'کیفیت',
    progress: 65,
    target: 100,
    status: 'at_risk',
    deadline: '2024-03-31',
    icon: Users,
    color: 'text-[#ff0a54]',
    bgColor: 'bg-[#ff0a54]/20',
    description: 'دستیابی به امتیاز 4.8 از 5',
    keyResults: [
      { title: 'نظرسنجی ماهانه', completed: 2, total: 3 },
      { title: 'حل 95% شکایات', completed: 88, total: 95 },
      { title: 'آموزش تیم پشتیبانی', completed: 1, total: 2 },
    ],
  },
  {
    id: 3,
    title: 'بهینه‌سازی فرآیندها',
    category: 'عملیاتی',
    progress: 45,
    target: 100,
    status: 'behind',
    deadline: '2024-03-31',
    icon: BarChart3,
    color: 'text-gray-600',
    bgColor: 'bg-gray-500/20',
    description: 'کاهش 30% زمان تحویل پروژه‌ها',
    keyResults: [
      { title: 'اتوماسیون 5 فرآیند', completed: 2, total: 5 },
      { title: 'آموزش تیم', completed: 1, total: 3 },
      { title: 'پیاده‌سازی ابزارهای جدید', completed: 0, total: 2 },
    ],
  },
  {
    id: 4,
    title: 'توسعه تیم',
    category: 'انسانی',
    progress: 90,
    target: 100,
    status: 'excellent',
    deadline: '2024-03-31',
    icon: TrendingUp,
    color: 'text-green-500',
    bgColor: 'bg-green-500/20',
    description: 'افزایش 20% کارایی تیم',
    keyResults: [
      { title: 'استخدام 3 متخصص', completed: 3, total: 3 },
      { title: 'آموزش 100% تیم', completed: 95, total: 100 },
      { title: 'برنامه‌ریزی شغلی', completed: 1, total: 1 },
    ],
  },
];

const getStatusText = (status: string) => {
  switch (status) {
    case 'excellent':
      return 'عالی';
    case 'on_track':
      return 'طبق برنامه';
    case 'at_risk':
      return 'در خطر';
    case 'behind':
      return 'تأخیر';
    default:
      return 'نامشخص';
  }
};

export function QuarterlyGoals() {
  const totalGoals = quarterlyGoals.length;
  const onTrackGoals = quarterlyGoals.filter(
    g => g.status === 'on_track' || g.status === 'excellent'
  ).length;
  const avgProgress = Math.round(
    quarterlyGoals.reduce((sum, g) => sum + g.progress, 0) / totalGoals
  );

  return (
    <OptimizedMotion
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.0 }}
    >
      <Card className='backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300'>
        <CardHeader className='pb-4'>
          <CardTitle className='flex items-center gap-3 text-xl font-bold'>
            <div className='w-8 h-8 bg-[#ff0a54]/20 rounded-full flex items-center justify-center'>
              <Target className='h-5 w-5 text-[#ff0a54]' />
            </div>
            اهداف سه‌ماهه (OKRs)
            <Badge variant='outline' className='ml-auto'>
              {onTrackGoals}/{totalGoals} طبق برنامه
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Overall Progress */}
          <OptimizedMotion
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 1.1 }}
            className='mb-6 p-4 rounded-xl bg-gradient-to-r from-[#ff0a54]/10 to-purple-500/10 border border-[#ff0a54]/20'
          >
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='text-2xl font-bold text-foreground'>
                  {avgProgress}%
                </h3>
                <p className='text-sm text-muted-foreground'>
                  پیشرفت کلی اهداف
                </p>
              </div>
              <div className='text-right'>
                <div className='text-lg font-semibold text-foreground'>
                  {onTrackGoals}/{totalGoals}
                </div>
                <p className='text-sm text-muted-foreground'>هدف طبق برنامه</p>
              </div>
            </div>
            <div className='mt-3 w-full bg-gray-200 rounded-full h-3'>
              <OptimizedMotion
                className='h-3 rounded-full bg-gradient-to-r from-[#ff0a54] to-purple-500'
                initial={{ scaleX: 0 }}
                animate={{ scaleX: avgProgress / 100 }}
                transition={{ duration: 1, delay: 1.3 }}
              />
            </div>
          </OptimizedMotion>

          {/* Goals List */}
          <div className='space-y-6'>
            {quarterlyGoals.map((goal, index) => (
              <OptimizedMotion
                key={goal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 1.2 + index * 0.1 }}
                className='group p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300'
              >
                <div className='flex items-start justify-between mb-4'>
                  <div className='flex items-start gap-3'>
                    <div
                      className={`w-10 h-10 ${goal.bgColor} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}
                    >
                      <goal.icon className={`h-5 w-5 ${goal.color}`} />
                    </div>
                    <div>
                      <h4 className='font-semibold text-foreground group-hover:text-[#ff0a54] transition-colors'>
                        {goal.title}
                      </h4>
                      <p className='text-sm text-muted-foreground'>
                        {goal.description}
                      </p>
                      <Badge variant='outline' className='mt-1 text-xs'>
                        {goal.category}
                      </Badge>
                    </div>
                  </div>

                  <div className='text-right'>
                    <div className='text-lg font-bold text-foreground'>
                      {goal.progress}%
                    </div>
                    <Badge
                      variant='outline'
                      className={`text-xs ${
                        goal.status === 'excellent'
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : goal.status === 'on_track'
                            ? 'bg-[#ff0a54]/10 text-[#ff0a54] border-[#ff0a54]/20'
                            : goal.status === 'at_risk'
                              ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              : 'bg-red-100 text-red-800 border-red-200'
                      }`}
                    >
                      {getStatusText(goal.status)}
                    </Badge>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className='space-y-3'>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden overflow-hidden">
                    <OptimizedMotion
                      className={`h-2 rounded-full ${
                        goal.status === 'excellent'
                          ? 'bg-green-500'
                          : goal.status === 'on_track'
                            ? 'bg-[#ff0a54]'
                            : goal.status === 'at_risk'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                      }`}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: goal.progress / 100 }}
                      transition={{ duration: 1, delay: 1.4 + index * 0.1 }}
                    />
                  </div>

                  {/* Key Results */}
                  <div className='space-y-2'>
                    <h5 className='text-sm font-medium text-foreground'>
                      نتایج کلیدی:
                    </h5>
                    {goal.keyResults.map((kr, krIndex) => (
                      <div
                        key={krIndex}
                        className='flex items-center justify-between text-sm'
                      >
                        <span className='text-muted-foreground'>
                          {kr.title}
                        </span>
                        <span className='font-medium text-foreground'>
                          {kr.completed}/{kr.total}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </OptimizedMotion>
            ))}
          </div>

          <OptimizedMotion
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            className='mt-6 pt-4 border-t border-white/10'
          >
            <Button
              variant='outline'
              className='w-full bg-white/5 hover:bg-white/10 border-white/20 hover:border-white/30'
            >
              <Target className='h-4 w-4 mr-2' />
              مدیریت اهداف سه‌ماهه
            </Button>
          </OptimizedMotion>
        </CardContent>
      </Card>
    </OptimizedMotion>
  );
}

