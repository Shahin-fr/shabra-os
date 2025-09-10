'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Users, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock data for the last 30 days
const chartData = [
  { day: 1, newUsers: 12, completedTasks: 8 },
  { day: 2, newUsers: 15, completedTasks: 12 },
  { day: 3, newUsers: 8, completedTasks: 15 },
  { day: 4, newUsers: 20, completedTasks: 18 },
  { day: 5, newUsers: 18, completedTasks: 22 },
  { day: 6, newUsers: 25, completedTasks: 20 },
  { day: 7, newUsers: 22, completedTasks: 25 },
  { day: 8, newUsers: 16, completedTasks: 19 },
  { day: 9, newUsers: 19, completedTasks: 21 },
  { day: 10, newUsers: 23, completedTasks: 24 },
  { day: 11, newUsers: 17, completedTasks: 16 },
  { day: 12, newUsers: 21, completedTasks: 23 },
  { day: 13, newUsers: 26, completedTasks: 27 },
  { day: 14, newUsers: 24, completedTasks: 25 },
  { day: 15, newUsers: 19, completedTasks: 20 },
  { day: 16, newUsers: 22, completedTasks: 24 },
  { day: 17, newUsers: 28, completedTasks: 26 },
  { day: 18, newUsers: 25, completedTasks: 28 },
  { day: 19, newUsers: 20, completedTasks: 22 },
  { day: 20, newUsers: 23, completedTasks: 25 },
  { day: 21, newUsers: 27, completedTasks: 29 },
  { day: 22, newUsers: 24, completedTasks: 26 },
  { day: 23, newUsers: 21, completedTasks: 23 },
  { day: 24, newUsers: 26, completedTasks: 28 },
  { day: 25, newUsers: 29, completedTasks: 31 },
  { day: 26, newUsers: 25, completedTasks: 27 },
  { day: 27, newUsers: 22, completedTasks: 24 },
  { day: 28, newUsers: 28, completedTasks: 30 },
  { day: 29, newUsers: 31, completedTasks: 33 },
  { day: 30, newUsers: 27, completedTasks: 29 }
];

export function NewUsersVsTasksChart() {
  const maxValue = Math.max(
    ...chartData.map(d => Math.max(d.newUsers, d.completedTasks))
  );

  const getYPosition = (value: number) => {
    return 100 - (value / maxValue) * 80; // 80% of height for data, 20% padding
  };

  const getXPosition = (index: number) => {
    return (index / (chartData.length - 1)) * 100;
  };

  // Generate SVG path for new users line
  const newUsersPath = chartData
    .map((point, index) => {
      const x = getXPosition(index);
      const y = getYPosition(point.newUsers);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  // Generate SVG path for completed tasks line
  const completedTasksPath = chartData
    .map((point, index) => {
      const x = getXPosition(index);
      const y = getYPosition(point.completedTasks);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  // Calculate totals
  const totalNewUsers = chartData.reduce((sum, d) => sum + d.newUsers, 0);
  const totalCompletedTasks = chartData.reduce((sum, d) => sum + d.completedTasks, 0);

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
            <TrendingUp className="h-5 w-5 text-[#ff0a54]" />
            کاربران جدید در مقابل تسک‌های تکمیل شده
          </CardTitle>
          <p className="text-sm text-gray-600">آخرین 30 روز</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="h-4 w-4 text-[#ff0a54]" />
                <span className="text-sm font-medium text-gray-700">کاربران جدید</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{totalNewUsers}</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700">تسک‌های تکمیل شده</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{totalCompletedTasks}</div>
            </div>
          </div>

          {/* Line Chart */}
          <div className="relative h-64">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 400 200"
              className="overflow-visible"
            >
              {/* Grid lines */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Y-axis labels */}
              {[0, 25, 50, 75, 100].map((value, index) => {
                const yPos = 100 - (value / 100) * 80;
                const actualValue = Math.round((value / 100) * maxValue);
                return (
                  <g key={index}>
                    <line x1="0" y1={yPos} x2="400" y2={yPos} stroke="#e5e7eb" strokeWidth="1" />
                    <text x="5" y={yPos + 4} fontSize="10" fill="#6b7280" textAnchor="start">
                      {actualValue}
                    </text>
                  </g>
                );
              })}

              {/* New Users Line */}
              <motion.path
                d={newUsersPath}
                fill="none"
                stroke="#ff0a54"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 0.5 }}
              />

              {/* Completed Tasks Line */}
              <motion.path
                d={completedTasksPath}
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 0.7 }}
              />

              {/* Data points for new users */}
              {chartData.map((point, index) => {
                const x = getXPosition(index) * 4; // Scale to SVG width
                const y = getYPosition(point.newUsers) * 2; // Scale to SVG height
                return (
                  <motion.circle
                    key={`users-${index}`}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#ff0a54"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1 + index * 0.05 }}
                    className="hover:r-6 transition-all cursor-pointer"
                  />
                );
              })}

              {/* Data points for completed tasks */}
              {chartData.map((point, index) => {
                const x = getXPosition(index) * 4; // Scale to SVG width
                const y = getYPosition(point.completedTasks) * 2; // Scale to SVG height
                return (
                  <motion.circle
                    key={`tasks-${index}`}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#10b981"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.2 + index * 0.05 }}
                    className="hover:r-6 transition-all cursor-pointer"
                  />
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-[#ff0a54]"></div>
              <span className="text-sm text-gray-600">کاربران جدید</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-green-500"></div>
              <span className="text-sm text-gray-600">تسک‌های تکمیل شده</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
