'use client';

import { TrendingUp } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { CardHeaderWithIcon } from '@/components/ui/CardHeaderWithIcon';
import { LazyRecharts } from '@/components/ui/lazy-loading';

const data = [
  { name: 'شنبه', value: 12 },
  { name: 'یکشنبه', value: 19 },
  { name: 'دوشنبه', value: 15 },
  { name: 'سه‌شنبه', value: 25 },
  { name: 'چهارشنبه', value: 22 },
  { name: 'پنج‌شنبه', value: 30 },
  { name: 'جمعه', value: 28 },
];

export function ActivityChart() {
  return (
    <Card className='backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl'>
      <CardHeaderWithIcon
        icon={TrendingUp}
        title='فعالیت هفتگی'
        subtitle='تعداد وظایف تکمیل شده'
      />
      <CardContent>
        <div className='h-64'>
          <LazyRecharts.ResponsiveContainer width='100%' height='100%'>
            <LazyRecharts.LineChart data={data}>
              <LazyRecharts.CartesianGrid
                strokeDasharray='3 3'
                stroke='rgba(255, 255, 255, 0.1)'
              />
              <LazyRecharts.XAxis
                dataKey='name'
                stroke='rgba(107, 114, 128, 0.8)'
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <LazyRecharts.YAxis
                stroke='rgba(107, 114, 128, 0.8)'
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={value => `${value}`}
              />
              <LazyRecharts.Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                }}
                labelStyle={{ color: '#374151' }}
              />
              <LazyRecharts.Line
                type='monotone'
                dataKey='value'
                stroke='#ff0a54'
                strokeWidth={3}
                dot={{ fill: '#ff0a54', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#ff0a54', strokeWidth: 2 }}
              />
            </LazyRecharts.LineChart>
          </LazyRecharts.ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
