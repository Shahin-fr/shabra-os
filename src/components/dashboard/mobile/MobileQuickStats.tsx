'use client';

import { motion } from 'framer-motion';
import { CheckSquare, Clock, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const stats = [
  {
    icon: CheckSquare,
    label: 'تسک‌های امروز',
    value: '8',
    total: '12',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    progress: 67
  },
  {
    icon: Clock,
    label: 'ساعات کار',
    value: '7.5',
    total: '8',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    progress: 94
  },
  {
    icon: Users,
    label: 'اعضای تیم',
    value: '24',
    total: '24',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    progress: 100
  },
  {
    icon: TrendingUp,
    label: 'پروژه‌های فعال',
    value: '5',
    total: '8',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    progress: 63
  }
];

export function MobileQuickStats() {
  return (
    <Card className="mobile-card">
      <CardContent className="mobile-padding">
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="p-4 rounded-xl bg-gradient-to-br from-white to-gray-50/50 border border-gray-200/50"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-600">{stat.label}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-gray-900">{stat.value}</span>
                    <span className="text-sm text-gray-500">/ {stat.total}</span>
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div 
                  className={`h-2 rounded-full ${stat.bgColor.replace('100', '500')}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.progress}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
