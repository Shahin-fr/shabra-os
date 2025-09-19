'use client';

import {
  Plus,
  Palette,
  BarChart3,
  Calendar,
  Users,
  CheckSquare,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CardHeaderWithIcon } from '@/components/ui/CardHeaderWithIcon';

const actions = [
  {
    title: 'استوری جدید',
    description: 'ایجاد استوری جدید',
    icon: Palette,
    href: '/storyboard',
    color: 'from-purple-500/20 to-purple-600/40',
  },
  {
    title: 'تسک جدید',
    description: 'ایجاد تسک جدید',
    icon: CheckSquare,
    href: '/tasks',
    color: 'from-blue-500/20 to-blue-600/40',
  },
  {
    title: 'گزارش جدید',
    description: 'ایجاد گزارش',
    icon: BarChart3,
    href: '/analytics',
    color: 'from-green-500/20 to-green-600/40',
  },
  {
    title: 'رویداد جدید',
    description: 'برنامه‌ریزی رویداد',
    icon: Calendar,
    href: '/calendar',
    color: 'from-orange-500/20 to-orange-600/40',
  },
  {
    title: 'عضو تیم',
    description: 'افزودن عضو جدید',
    icon: Users,
    href: '/team',
    color: 'from-pink-500/20 to-pink-600/40',
  },
];

export function QuickActions() {
  return (
    <Card className='backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl'>
      <CardHeaderWithIcon
        icon={Plus}
        title='اقدامات سریع'
        subtitle='دسترسی سریع به ابزارها'
      />
      <CardContent>
        <div className='grid grid-cols-2 gap-3'>
          {actions.map(action => (
            <Link key={action.title} href={action.href}>
              <Button
                variant='ghost'
                className='w-full h-auto p-4 backdrop-blur-sm bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group'
              >
                <div className='flex flex-col items-center gap-2 text-center'>
                  <div
                    className={`w-10 h-10 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <action.icon className='h-5 w-5 text-white' />
                  </div>
                  <div>
                    <p className='text-sm font-medium text-gray-900'>
                      {action.title}
                    </p>
                    <p className='text-xs text-gray-600'>
                      {action.description}
                    </p>
                  </div>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

