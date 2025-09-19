'use client';

import { CheckSquare } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { CardHeaderWithIcon } from '@/components/ui/CardHeaderWithIcon';
import { mockLatestTask } from '@/lib/mock-data';

export function MyLatestTask() {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-300';
    }
  };

  return (
    <Card className='backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl h-full'>
      <CardHeaderWithIcon
        icon={CheckSquare}
        title='آخرین وظیفه من'
        subtitle=''
        iconBgColor='from-[#ff0a54]/20 to-[#ff0a54]/40'
      />
      <CardContent>
        <div
          className={`p-3 rounded-lg border-l-4 ${getPriorityColor(mockLatestTask.priority)} bg-white/5`}
        >
          <p className='text-sm font-medium text-gray-900 leading-relaxed'>
            {mockLatestTask.title}
          </p>
          <div className='flex items-center gap-2 mt-2'>
            <div
              className={`w-2 h-2 rounded-full ${getPriorityColor(mockLatestTask.priority).replace('border-l-', 'bg-')}`}
            ></div>
            <span className='text-xs text-gray-600'>
              {mockLatestTask.priority === 'high'
                ? 'اولویت بالا'
                : mockLatestTask.priority === 'medium'
                  ? 'اولویت متوسط'
                  : 'اولویت پایین'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

