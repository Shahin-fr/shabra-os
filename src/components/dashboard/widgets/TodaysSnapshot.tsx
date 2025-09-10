'use client';

import { motion } from 'framer-motion';
import { Users, CheckCircle, Clock, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const snapshotData = [
  {
    title: 'کارمندان حاضر',
    value: '18',
    total: '24',
    percentage: 75,
    icon: Users,
    trend: '+12%'
  },
  {
    title: 'تسک‌های تکمیل شده',
    value: '23',
    total: '35',
    percentage: 66,
    icon: CheckCircle,
    trend: '+8%'
  },
  {
    title: 'پروژه‌های فعال',
    value: '8',
    total: '12',
    percentage: 67,
    icon: Target,
    trend: '+2'
  },
  {
    title: 'ساعات کاری',
    value: '142',
    total: '192',
    percentage: 74,
    icon: Clock,
    trend: '+5%'
  }
];

export function TodaysSnapshot() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="h-full"
    >
      <Card className="h-full bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-6 h-full flex flex-col">
          <div className="space-y-8 flex-1">
            {snapshotData.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-gray-50">
                        <IconComponent className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-1">
                          {item.title}
                        </h3>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-gray-900">
                            {item.value}
                          </span>
                          <span className="text-sm text-gray-500">
                            از {item.total}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-[#ff0a54] bg-[#ff0a54]/10 px-3 py-1 rounded-full">
                        {item.trend}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {item.percentage}% تکمیل
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="h-2 rounded-full bg-[#ff0a54]"
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {/* Summary Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 p-4 rounded-xl bg-gray-50 border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#ff0a54]/10">
                <TrendingUp className="h-5 w-5 text-[#ff0a54]" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">وضعیت کلی</h4>
                <p className="text-xs text-gray-600 mt-1">
                  عملکرد تیم در سطح مطلوب قرار دارد
                </p>
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}