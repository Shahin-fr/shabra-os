'use client';

import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock sales data for the current week (Saturday to Friday)
const salesData = [
  { day: 'شنبه', sales: 12500, target: 15000, color: '#ff0a54' },
  { day: 'یکشنبه', sales: 18900, target: 15000, color: '#ff0a54' },
  { day: 'دوشنبه', sales: 22100, target: 15000, color: '#ff0a54' },
  { day: 'سه‌شنبه', sales: 16800, target: 15000, color: '#ff0a54' },
  { day: 'چهارشنبه', sales: 24500, target: 15000, color: '#ff0a54' },
  { day: 'پنج‌شنبه', sales: 31200, target: 15000, color: '#ff0a54' },
  { day: 'جمعه', sales: 28900, target: 15000, color: '#ff0a54' }
];

export function WeeklySalesChart() {
  const maxSales = Math.max(...salesData.map(d => d.sales));
  const totalSales = salesData.reduce((sum, d) => sum + d.sales, 0);
  const totalTarget = salesData.reduce((sum, d) => sum + d.target, 0);
  const achievementRate = Math.round((totalSales / totalTarget) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="h-full"
    >
      <Card className="h-full bg-white border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-[#ff0a54]" />
            نمودار فروش هفتگی
          </CardTitle>
          <p className="text-sm text-gray-600">آخرین 7 روز</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-[#ff0a54]/5 rounded-xl">
              <div className="flex items-center justify-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-[#ff0a54]" />
                <span className="text-sm font-medium text-gray-700">کل فروش</span>
              </div>
              <div className="text-2xl font-bold text-[#ff0a54]">
                {totalSales.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">تومان</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-gray-700">نرخ دستیابی</span>
              </div>
              <div className="text-2xl font-bold text-green-500">
                {achievementRate}%
              </div>
              <div className="text-xs text-gray-500">به هدف</div>
            </div>
          </div>

          {/* Stunning Line Chart */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">فروش روزانه</h3>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#ff0a54] to-[#ff0a54]/60"></div>
                  <span className="text-gray-600">فروش واقعی</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-gray-400 to-gray-300 border-2 border-dashed"></div>
                  <span className="text-gray-600">هدف</span>
                </div>
              </div>
            </div>
            
            <div className="relative h-96 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 rounded-3xl p-4 shadow-xl border border-slate-200/50 overflow-hidden">
              {/* CSS Animation Keyframes */}
              <style jsx>{`
                @keyframes fadeInScale {
                  0% {
                    opacity: 0;
                    transform: scale(0);
                  }
                  100% {
                    opacity: 1;
                    transform: scale(1);
                  }
                }
                .tooltip-group:hover .tooltip-content {
                  opacity: 1 !important;
                }
                .tooltip-content {
                  opacity: 0;
                  transition: opacity 0.3s ease;
                }
              `}</style>
              
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#ff0a54]/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
              
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 800 350"
                className="overflow-visible"
              >
                {/* Advanced gradient definitions */}
                <defs>
                  <linearGradient id="salesGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ff0a54" stopOpacity="0.4"/>
                    <stop offset="50%" stopColor="#ff0a54" stopOpacity="0.15"/>
                    <stop offset="100%" stopColor="#ff0a54" stopOpacity="0.02"/>
                  </linearGradient>
                  <linearGradient id="targetGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#64748b" stopOpacity="0.25"/>
                    <stop offset="50%" stopColor="#64748b" stopOpacity="0.1"/>
                    <stop offset="100%" stopColor="#64748b" stopOpacity="0.02"/>
                  </linearGradient>
                  <linearGradient id="salesLine" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ff0a54"/>
                    <stop offset="50%" stopColor="#ff4081"/>
                    <stop offset="100%" stopColor="#ff0a54"/>
                  </linearGradient>
                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#ff0a54" floodOpacity="0.3"/>
                  </filter>
                </defs>

                {/* Subtle background grid - expanded width */}
                <g opacity="0.15">
                  {Array.from({ length: 7 }).map((_, i) => {
                    const y = 60 + (i * 45);
                    return (
                      <line
                        key={`grid-h-${i}`}
                        x1="40"
                        y1={y}
                        x2="760"
                        y2={y}
                        stroke="#cbd5e1"
                        strokeWidth="1"
                      />
                    );
                  })}
                </g>

                {/* X-axis labels (days) with expanded width */}
                {salesData.map((point, index) => {
                  const x = 40 + (index / (salesData.length - 1)) * 720;
                  return (
                    <text
                      key={index}
                      x={x}
                      y="340"
                      fontSize="12"
                      fill="#64748b"
                      textAnchor="middle"
                      fontWeight="600"
                      className="drop-shadow-sm"
                    >
                      {point.day}
                    </text>
                  );
                })}

                {/* Sales area fill with beautiful gradient - expanded width */}
                <motion.path
                  d={`M 40,300 ${salesData
                    .map((point, index) => {
                      const x = 40 + (index / (salesData.length - 1)) * 720;
                      const y = 300 - (point.sales / maxSales) * 240;
                      return `L ${x} ${y}`;
                    })
                    .join(' ')} L 760,300 Z`}
                  fill="url(#salesGradient)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 2, delay: 0.3 }}
                />

                {/* Target area fill - expanded width */}
                <motion.path
                  d={`M 40,300 ${salesData
                    .map((point, index) => {
                      const x = 40 + (index / (salesData.length - 1)) * 720;
                      const y = 300 - (point.target / maxSales) * 240;
                      return `L ${x} ${y}`;
                    })
                    .join(' ')} L 760,300 Z`}
                  fill="url(#targetGradient)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 2, delay: 0.5 }}
                />

                {/* Sales Line with gradient and glow - expanded width */}
                <motion.path
                  d={salesData
                    .map((point, index) => {
                      const x = 40 + (index / (salesData.length - 1)) * 720;
                      const y = 300 - (point.sales / maxSales) * 240;
                      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="url(#salesLine)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#glow)"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 3, delay: 0.8, ease: "easeInOut" }}
                />

                {/* Target Line with better styling - expanded width */}
                <motion.path
                  d={salesData
                    .map((point, index) => {
                      const x = 40 + (index / (salesData.length - 1)) * 720;
                      const y = 300 - (point.target / maxSales) * 240;
                      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="3"
                  strokeDasharray="12,6"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 3, delay: 1, ease: "easeInOut" }}
                />

                {/* Sales data points with smooth animations and tooltips */}
                {salesData.map((point, index) => {
                  const x = 40 + (index / (salesData.length - 1)) * 720;
                  const y = 300 - (point.sales / maxSales) * 240;
                  const isLastPoint = index === salesData.length - 1; // Today's data point
                  const isAboveTarget = point.sales > point.target;
                  
                  return (
                    <g key={`sales-${index}`}>
                      {/* Animated entrance for data points */}
                      <circle
                        cx={x}
                        cy={y}
                        r={isLastPoint ? "12" : "8"}
                        fill="url(#salesLine)"
                        stroke="white"
                        strokeWidth="4"
                        filter="url(#shadow)"
                        className="cursor-pointer transition-all duration-300 hover:r-14"
                        style={{ 
                          transformOrigin: `${x}px ${y}px`,
                          transition: 'r 0.3s ease',
                          animation: `fadeInScale 0.8s ease-out ${1.5 + index * 0.2}s both`
                        }}
                      />
                      {/* Outer glow ring - only for live data point with smooth animation */}
                      {isLastPoint && (
                        <circle
                          cx={x}
                          cy={y}
                          r="25"
                          fill="#ff0a54"
                          opacity="0.15"
                        >
                          <animate
                            attributeName="r"
                            values="20;30;20"
                            dur="2s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="opacity"
                            values="0.1;0.3;0.1"
                            dur="2s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      )}
                      
                      {/* Middle ring - only for live data point */}
                      {isLastPoint && (
                        <circle
                          cx={x}
                          cy={y}
                          r="18"
                          fill="#ff0a54"
                          opacity="0.25"
                        >
                          <animate
                            attributeName="opacity"
                            values="0.2;0.4;0.2"
                            dur="1.5s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      )}
                      
                      
                      {/* Inner highlight */}
                      <circle
                        cx={x - 3}
                        cy={y - 3}
                        r="3"
                        fill="white"
                        opacity="0.9"
                      />
                      
                      {/* Tooltip group with proper hover handling */}
                      <g className="tooltip-group">
                        {/* Invisible hover area for better interaction */}
                        <circle
                          cx={x}
                          cy={y}
                          r="20"
                          fill="transparent"
                          className="cursor-pointer"
                        />
                        
                        {/* Tooltip background - initially hidden */}
                        <rect
                          x={x - 45}
                          y={y - 70}
                          width="90"
                          height="50"
                          rx="20"
                          fill="white"
                          stroke="#e2e8f0"
                          strokeWidth="2"
                          className="drop-shadow-xl tooltip-content"
                        />
                        
                        {/* Tooltip content */}
                        <text
                          x={x}
                          y={y - 55}
                          fontSize="12"
                          fill="#1e293b"
                          textAnchor="middle"
                          fontWeight="700"
                          className="tooltip-content"
                        >
                          {point.day}
                        </text>
                        <text
                          x={x}
                          y={y - 40}
                          fontSize="14"
                          fill="#ff0a54"
                          textAnchor="middle"
                          fontWeight="800"
                          className="tooltip-content"
                        >
                          {point.sales.toLocaleString()} تومان
                        </text>
                        
                        {/* Performance indicator */}
                        <text
                          x={x}
                          y={y - 25}
                          fontSize="10"
                          fill={isAboveTarget ? "#10b981" : "#ef4444"}
                          textAnchor="middle"
                          fontWeight="600"
                          className="tooltip-content"
                        >
                          {isAboveTarget ? `+${Math.round(((point.sales - point.target) / point.target) * 100)}%` : `-${Math.round(((point.target - point.sales) / point.target) * 100)}%`}
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* Target data points with subtle styling - smaller and static */}
                {salesData.map((point, index) => {
                  const x = 40 + (index / (salesData.length - 1)) * 720;
                  const y = 300 - (point.target / maxSales) * 240;
                  
                  return (
                    <circle
                      key={`target-${index}`}
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#64748b"
                      className="cursor-pointer transition-all duration-300 hover:r-6"
                      stroke="white"
                      strokeWidth="2"
                      style={{ 
                        transformOrigin: `${x}px ${y}px`,
                        transition: 'r 0.3s ease'
                      }}
                    />
                  );
                })}
              </svg>
            </div>

            {/* Enhanced performance summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-[#ff0a54]/10 to-[#ff0a54]/5 rounded-2xl border border-[#ff0a54]/20">
                <div className="text-2xl font-bold text-[#ff0a54] mb-1">
                  {totalSales.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">کل فروش</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-2xl border border-green-500/20">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {achievementRate}%
                </div>
                <div className="text-sm text-gray-600">دستیابی به هدف</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-2xl border border-blue-500/20">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {Math.round(totalSales / 7).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">میانگین روزانه</div>
              </div>
            </div>
          </div>

          {/* Performance Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="p-4 bg-gradient-to-r from-[#ff0a54]/10 to-purple-500/10 rounded-xl border border-[#ff0a54]/20"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#ff0a54]/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-[#ff0a54]" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">عملکرد هفته</h4>
                <p className="text-xs text-gray-600">
                  {achievementRate >= 100 
                    ? `عالی! ${achievementRate}% از هدف هفتگی محقق شد`
                    : `نیاز به ${100 - achievementRate}% بهبود برای رسیدن به هدف`
                  }
                </p>
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
