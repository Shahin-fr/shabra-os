"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

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
    <Card className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 rounded-lg flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-[#ff0a54]" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              فعالیت هفتگی
            </CardTitle>
            <p className="text-sm text-gray-600">تعداد وظایف تکمیل شده</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis 
                dataKey="name" 
                stroke="rgba(107, 114, 128, 0.8)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="rgba(107, 114, 128, 0.8)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}
                labelStyle={{ color: '#374151' }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#ff0a54" 
                strokeWidth={3}
                dot={{ fill: '#ff0a54', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#ff0a54', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
