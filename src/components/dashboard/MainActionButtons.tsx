'use client';

import { Plus, Palette, BarChart3, Calendar, CheckCircle } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const mainActions = [
  {
    title: 'تسک جدید',
    description: 'ایجاد تسک جدید',
    icon: CheckCircle,
    href: '/tasks',
    color: 'from-blue-500/20 to-blue-600/40',
    bgColor: 'bg-blue-500/20',
  },
  {
    title: 'استوری جدید',
    description: 'ایجاد استوری جدید',
    icon: Palette,
    href: '/storyboard',
    color: 'from-purple-500/20 to-purple-600/40',
    bgColor: 'bg-purple-500/20',
  },
  {
    title: 'رویداد جدید',
    description: 'برنامه‌ریزی رویداد',
    icon: Calendar,
    href: '/calendar',
    color: 'from-orange-500/20 to-orange-600/40',
    bgColor: 'bg-orange-500/20',
  },
  {
    title: 'گزارش جدید',
    description: 'ایجاد گزارش',
    icon: BarChart3,
    href: '/analytics',
    color: 'from-green-500/20 to-green-600/40',
    bgColor: 'bg-green-500/20',
  },
];

export function MainActionButtons() {
  return (
    <Card className='backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl'>
      <CardContent className='p-6'>
        <div className='flex flex-col space-y-4'>
          {mainActions.map(action => (
            <Link key={action.title} href={action.href}>
              <Button
                variant='ghost'
                className='w-full h-auto p-6 backdrop-blur-sm bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group hover:scale-105'
              >
                <div className='flex items-center gap-4 w-full'>
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}
                  >
                    <action.icon className='h-8 w-8 text-white' />
                  </div>
                  <div className='flex-1 text-right'>
                    <h3 className='text-lg font-semibold text-gray-900 mb-1'>
                      {action.title}
                    </h3>
                    <p className='text-sm text-gray-600'>
                      {action.description}
                    </p>
                  </div>
                  <div className='flex-shrink-0'>
                    <Plus className='h-5 w-5 text-gray-400 group-hover:text-[#ff0a54] transition-colors duration-200' />
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

