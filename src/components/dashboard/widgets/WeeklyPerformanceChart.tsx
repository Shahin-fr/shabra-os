'use client';

import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { BarChart3, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const weeklyData = [
  { day: 'شنبه', tasks: 12, completed: 10, efficiency: 83 },
  { day: 'یکشنبه', tasks: 15, completed: 14, efficiency: 93 },
  { day: 'دوشنبه', tasks: 18, completed: 16, efficiency: 89 },
  { day: 'سه‌شنبه', tasks: 14, completed: 12, efficiency: 86 },
  { day: 'چهارشنبه', tasks: 16, completed: 15, efficiency: 94 },
  { day: 'پنج‌شنبه', tasks: 13, completed: 11, efficiency: 85 },
  { day: 'جمعه', tasks: 8, completed: 6, efficiency: 75 },
];

const maxTasks = Math.max(...weeklyData.map(d => d.tasks));
const avgEfficiency = Math.round(
  weeklyData.reduce((sum, d) => sum + d.efficiency, 0) / weeklyData.length
);

export function WeeklyPerformanceChart() {
  return (
    <OptimizedMotion
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
    >
      <Card className='backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300'>
        <CardHeader className='pb-4'>
          <CardTitle className='flex items-center gap-3 text-xl font-bold'>
            <div className='w-8 h-8 bg-[#ff0a54]/20 rounded-full flex items-center justify-center'>
              <BarChart3 className='h-5 w-5 text-[#ff0a54]' />
            </div>
            نمودار عملکرد هفتگی
            <div className='ml-auto text-right'>
              <div className='text-2xl font-bold text-foreground'>
                {avgEfficiency}%
              </div>
              <div className='text-sm text-muted-foreground'>
                میانگین کارایی
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Chart */}
          <div className='space-y-4'>
            {weeklyData.map((day, index) => (
              <OptimizedMotion
                key={day.day}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.9 + index * 0.05 }}
                className='group'
              >
                <div className='flex items-center justify-between mb-2'>
                  <div className='flex items-center gap-3'>
                    <span className='font-medium text-foreground w-16 text-sm'>
                      {day.day}
                    </span>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm text-muted-foreground'>
                        {day.completed}/{day.tasks} تسک
                      </span>
                      <div
                        className={`flex items-center gap-1 text-xs ${
                          day.efficiency >= 90
                            ? 'text-green-500'
                            : day.efficiency >= 80
                              ? 'text-[#ff0a54]'
                              : day.efficiency >= 70
                                ? 'text-yellow-500'
                                : 'text-red-500'
                        }`}
                      >
                        {day.efficiency >= 90 ? (
                          <TrendingUp className='h-3 w-3' />
                        ) : day.efficiency >= 80 ? (
                          <Target className='h-3 w-3' />
                        ) : (
                          <TrendingDown className='h-3 w-3' />
                        )}
                        {day.efficiency}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  {/* Completed Tasks Bar */}
                  <div className='flex-1 bg-gray-200 rounded-full h-3 relative'>
                    <OptimizedMotion
                      className='h-3 rounded-full bg-gradient-to-r from-[#ff0a54] to-pink-400'
                      initial={{ scaleX: 0 }}
                      animate={{
                        width: `${(day.completed / maxTasks) * 100}%`,
                      }}
                      transition={{ duration: 1, delay: 1.0 + index * 0.1 }}
                    />
                  </div>

                  {/* Efficiency Indicator */}
                  <div
                    className={`w-16 h-3 rounded-full ${
                      day.efficiency >= 90
                        ? 'bg-green-500'
                        : day.efficiency >= 80
                          ? 'bg-[#ff0a54]'
                          : day.efficiency >= 70
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                    }`}
                  />
                </div>
              </OptimizedMotion>
            ))}
          </div>

          {/* Summary Stats */}
          <OptimizedMotion
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className='mt-6 grid grid-cols-3 gap-4'
          >
            <div className='text-center p-3 rounded-xl bg-white/5'>
              <div className='text-lg font-bold text-foreground'>
                {weeklyData.reduce((sum, d) => sum + d.completed, 0)}
              </div>
              <div className='text-sm text-muted-foreground'>تسک تکمیل شده</div>
            </div>
            <div className='text-center p-3 rounded-xl bg-white/5'>
              <div className='text-lg font-bold text-foreground'>
                {weeklyData.reduce((sum, d) => sum + d.tasks, 0)}
              </div>
              <div className='text-sm text-muted-foreground'>کل تسک‌ها</div>
            </div>
            <div className='text-center p-3 rounded-xl bg-white/5'>
              <div className='text-lg font-bold text-foreground'>
                {Math.max(...weeklyData.map(d => d.efficiency))}%
              </div>
              <div className='text-sm text-muted-foreground'>بهترین روز</div>
            </div>
          </OptimizedMotion>

          {/* Performance Insights */}
          <OptimizedMotion
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            className='mt-4 p-4 rounded-xl bg-gradient-to-r from-[#ff0a54]/10 to-purple-500/10 border border-[#ff0a54]/20'
          >
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 bg-[#ff0a54]/20 rounded-full flex items-center justify-center'>
                <TrendingUp className='h-4 w-4 text-[#ff0a54]' />
              </div>
              <div>
                <h4 className='font-semibold text-foreground'>تحلیل عملکرد</h4>
                <p className='text-sm text-muted-foreground'>
                  عملکرد تیم در این هفته{' '}
                  {avgEfficiency >= 85
                    ? 'عالی'
                    : avgEfficiency >= 75
                      ? 'خوب'
                      : 'نیاز به بهبود'}{' '}
                  بوده است.
                  {avgEfficiency >= 85
                    ? ' تیم در مسیر درستی قرار دارد.'
                    : ' پیشنهاد می‌شود روی مدیریت زمان تمرکز کنید.'}
                </p>
              </div>
            </div>
          </OptimizedMotion>
        </CardContent>
      </Card>
    </OptimizedMotion>
  );
}

