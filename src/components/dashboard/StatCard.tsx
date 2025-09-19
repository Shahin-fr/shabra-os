'use client';

import { LucideIcon } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendType = 'neutral',
}: StatCardProps) {
  const getTrendColor = () => {
    switch (trendType) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card className='backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105'>
      <CardContent className='p-6'>
        <div className='flex items-center justify-between'>
          <div className='flex-1'>
            <p className='text-sm font-medium text-gray-600 mb-1'>{title}</p>
            <div className='flex items-baseline gap-2'>
              <p className='text-3xl font-bold text-gray-900'>{value}</p>
              {trend && (
                <span className={`text-sm font-medium ${getTrendColor()}`}>
                  {trend}
                </span>
              )}
            </div>
          </div>
          <div className='w-12 h-12 bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 rounded-lg flex items-center justify-center'>
            <Icon className='h-6 w-6 text-[#ff0a54]' />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

