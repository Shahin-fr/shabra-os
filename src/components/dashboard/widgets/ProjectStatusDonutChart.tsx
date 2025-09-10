'use client';

import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Clock, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const projectData = [
  {
    status: 'On-track',
    count: 8,
    percentage: 67,
    color: '#10b981',
    icon: CheckCircle,
    description: 'پروژه‌های در مسیر'
  },
  {
    status: 'At-risk',
    count: 3,
    percentage: 25,
    color: '#f59e0b',
    icon: AlertTriangle,
    description: 'پروژه‌های در خطر'
  },
  {
    status: 'Delayed',
    count: 1,
    percentage: 8,
    color: '#ef4444',
    icon: Clock,
    description: 'پروژه‌های تاخیردار'
  }
];

export function ProjectStatusDonutChart() {
  const total = projectData.reduce((sum, item) => sum + item.count, 0);
  
  // Calculate SVG path for donut chart
  const radius = 80;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;
  
  let cumulativePercentage = 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="h-full"
    >
      <Card className="h-full bg-white border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Target className="h-5 w-5 text-[#ff0a54]" />
            وضعیت پروژه‌ها
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col h-full">
          <div className="flex-1 flex items-center justify-center">
            <div className="relative">
              {/* Donut Chart SVG */}
              <svg width="200" height="200" className="transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  stroke="#f3f4f6"
                  strokeWidth={strokeWidth}
                  fill="none"
                />
                
                {/* Data segments */}
                {projectData.map((item, index) => {
                  const strokeDasharray = circumference;
                  const strokeDashoffset = circumference - (item.percentage / 100) * circumference;
                  
                  const currentOffset = cumulativePercentage;
                  cumulativePercentage += item.percentage;
                  
                  return (
                    <motion.circle
                      key={item.status}
                      cx="100"
                      cy="100"
                      r={radius}
                      stroke={item.color}
                      strokeWidth={strokeWidth}
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={strokeDasharray}
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset }}
                      transition={{ duration: 1.5, delay: index * 0.2 }}
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  );
                })}
              </svg>
              
              {/* Center text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{total}</div>
                  <div className="text-sm text-gray-600">کل پروژه‌ها</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="space-y-3 mt-6">
            {projectData.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <motion.div
                  key={item.status}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">
                        {item.description}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">
                      {item.count}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.percentage}%
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
