import {
  BarChart3,
  TrendingUp,
  PieChart,
  Activity,
  Target,
  Users,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AnalyticsPage() {
  return (
    <div className='container mx-auto max-w-7xl space-y-8'>
      {/* Page Header */}
      <div className='text-center space-y-4'>
        <h1 className='text-4xl font-bold text-gray-900'>تحلیل‌ها و گزارشات</h1>
        <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
          داشبوردهای تحلیل عملکرد و گزارش‌های کلیدی
        </p>
      </div>

      {/* Analytics Card */}
      <Card className='max-w-6xl mx-auto'>
        <CardHeader>
          <CardTitle className='flex items-center gap-3 text-2xl font-semibold text-gray-900'>
            <div className='w-10 h-10 bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 rounded-lg flex items-center justify-center'>
              <BarChart3 className='h-5 w-5 text-[#ff0a54]' />
            </div>
            داشبورد تحلیل‌ها
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center py-16'>
            <div className='w-24 h-24 bg-gradient-to-br from-[#ff0a54]/10 to-[#ff0a54]/20 rounded-full flex items-center justify-center mx-auto mb-6'>
              <BarChart3 className='h-12 w-12 text-[#ff0a54]' />
            </div>
            <h3 className='text-xl font-semibold text-gray-900 mb-4'>
              داشبوردهای تحلیل عملکرد
            </h3>
            <p className='text-gray-600 max-w-md mx-auto mb-8'>
              داشبوردهای تحلیل عملکرد و گزارش‌های کلیدی در اینجا نمایش داده
              خواهند شد. این بخش شامل آمار پروژه‌ها، عملکرد تیم و تحلیل‌های
              پیشرفته خواهد بود.
            </p>

            {/* Analytics Features Preview */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto'>
              <div className='p-6 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm'>
                <div className='w-14 h-14 bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 rounded-lg flex items-center justify-center mx-auto mb-4'>
                  <TrendingUp className='h-7 w-7 text-[#ff0a54]' />
                </div>
                <h4 className='font-semibold text-gray-900 mb-3'>
                  روند عملکرد
                </h4>
                <p className='text-sm text-gray-600'>
                  تحلیل روندهای عملکرد تیم و پروژه‌ها
                </p>
              </div>

              <div className='p-6 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm'>
                <div className='w-14 h-14 bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 rounded-lg flex items-center justify-center mx-auto mb-4'>
                  <PieChart className='h-7 w-7 text-[#ff0a54]' />
                </div>
                <h4 className='font-semibold text-gray-900 mb-3'>توزیع کار</h4>
                <p className='text-sm text-gray-600'>
                  تحلیل توزیع کار و زمان‌بندی
                </p>
              </div>

              <div className='p-6 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm'>
                <div className='w-14 h-14 bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 rounded-lg flex items-center justify-center mx-auto mb-4'>
                  <Activity className='h-7 w-7 text-[#ff0a54]' />
                </div>
                <h4 className='font-semibold text-gray-900 mb-3'>فعالیت‌ها</h4>
                <p className='text-sm text-gray-600'>
                  نظارت بر فعالیت‌های روزانه
                </p>
              </div>

              <div className='p-6 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm'>
                <div className='w-14 h-14 bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 rounded-lg flex items-center justify-center mx-auto mb-4'>
                  <Target className='h-7 w-7 text-[#ff0a54]' />
                </div>
                <h4 className='font-semibold text-gray-900 mb-3'>اهداف</h4>
                <p className='text-sm text-gray-600'>
                  پیگیری پیشرفت اهداف و KPI
                </p>
              </div>

              <div className='p-6 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm'>
                <div className='w-14 h-14 bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 rounded-lg flex items-center justify-center mx-auto mb-4'>
                  <Users className='h-7 w-7 text-[#ff0a54]' />
                </div>
                <h4 className='font-semibold text-gray-900 mb-3'>عملکرد تیم</h4>
                <p className='text-sm text-gray-600'>
                  تحلیل عملکرد فردی و تیمی
                </p>
              </div>

              <div className='p-6 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm'>
                <div className='w-14 h-14 bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 rounded-lg flex items-center justify-center mx-auto mb-4'>
                  <BarChart3 className='h-7 w-7 text-[#ff0a54]' />
                </div>
                <h4 className='font-semibold text-gray-900 mb-3'>گزارش‌ها</h4>
                <p className='text-sm text-gray-600'>
                  گزارش‌های دوره‌ای و سفارشی
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
