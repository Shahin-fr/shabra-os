'use client';

import { Activity, Clock } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { CardHeaderWithIcon } from '@/components/ui/CardHeaderWithIcon';
import { mockActivities } from '@/lib/mock-data';

export function RecentActivity() {
  return (
    <Card className='backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl'>
      <CardHeaderWithIcon
        icon={Activity}
        title='فعالیت‌های اخیر'
        subtitle='آخرین به‌روزرسانی‌ها'
      />
      <CardContent>
        <div className='space-y-4 max-h-48 overflow-y-auto'>
          {mockActivities.map(activity => (
            <div
              key={activity.id}
              className='flex items-start rtl:items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors duration-200'
            >
              <div className='w-2 h-2 bg-[#ff0a54] rounded-full mt-2 flex-shrink-0'></div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-gray-900 leading-relaxed'>
                  {activity.message}
                </p>
                <div className='flex items-center gap-2 mt-1'>
                  <Clock className='h-3 w-3 text-gray-400' />
                  <span className='text-xs text-gray-500'>{activity.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

