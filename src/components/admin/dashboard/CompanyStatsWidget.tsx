'use client';

import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { Users, Briefcase, CheckCircle, Calendar } from 'lucide-react';

import { CompanyStatsWidgetProps, StatItem } from '@/types/admin-dashboard';
import { useCompanyStats } from '@/hooks/useCompanyStats';

export function CompanyStatsWidget({ 
  className = '', 
  onStatClick,
  isLoading: externalLoading,
  error: externalError 
}: CompanyStatsWidgetProps) {
  const { data: stats, isLoading: statsLoading, error: statsError } = useCompanyStats();
  
  const isLoading = externalLoading || statsLoading;
  const error = externalError || statsError?.message;

  const statItems: StatItem[] = [
    {
      value: stats?.totalEmployees || 0,
      label: 'کل کارمندان',
      growth: stats?.employeeGrowth || { percentage: 0, period: '', isPositive: true },
      icon: 'Users',
      color: '#ff0a54',
    },
    {
      value: stats?.activeProjects || 0,
      label: 'پروژه‌های فعال',
      growth: stats?.projectGrowth || { percentage: 0, period: '', isPositive: true },
      icon: 'Briefcase',
      color: '#6b7280',
    },
    {
      value: stats?.completedTasks || 0,
      label: 'تسک‌های تکمیل شده',
      growth: stats?.taskGrowth || { percentage: 0, period: '', isPositive: true },
      icon: 'CheckCircle',
      color: '#6b7280',
    },
    {
      value: `${stats?.attendanceRate || 0}%`,
      label: 'نرخ حضور',
      growth: stats?.attendanceGrowth || { percentage: 0, period: '', isPositive: true },
      icon: 'Calendar',
      color: '#6b7280',
    },
  ];

  const iconMap = {
    Users,
    Briefcase,
    CheckCircle,
    Calendar,
  };

  if (isLoading) {
    return (
      <div className={`relative ${className}`}>
        <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl shadow-lg">
          <div className="text-center mb-8">
            <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mx-auto"></div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-2xl mx-auto mb-4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-20 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`relative ${className}`}>
        <div className="bg-red-50 border border-red-200 p-8 rounded-3xl">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              خطا در بارگذاری آمار
            </h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <OptimizedMotion
      className={`relative ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.3 }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ff0a54]/5 via-transparent to-purple-500/5 rounded-3xl"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff0a54]/10 rounded-full -translate-y-48 translate-x-48"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full translate-y-32 -translate-x-32"></div>

      {/* Content */}
      <div className="relative z-10">
        <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl shadow-lg">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              آمار کلی شرکت
            </h2>
            <p className="text-gray-600">وضعیت فعلی سیستم</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {statItems.map((item, index) => {
              const IconComponent = iconMap[item.icon as keyof typeof iconMap];
              const isFirstItem = index === 0;
              
              return (
                <OptimizedMotion
                  key={item.label}
                  className="text-center group cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => onStatClick?.(item.label as keyof typeof stats)}
                >
                  <div 
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300 ${
                      isFirstItem 
                        ? 'bg-[#ff0a54]/10 group-hover:bg-[#ff0a54]/20' 
                        : 'bg-gray-100 group-hover:bg-gray-200'
                    }`}
                  >
                    <IconComponent 
                      className={`h-6 w-6 ${
                        isFirstItem ? 'text-[#ff0a54]' : 'text-gray-700'
                      }`} 
                    />
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    {item.label}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {item.value}
                  </div>
                  <div className={`text-xs mt-1 ${
                    item.growth.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.growth.percentage > 0 ? '+' : ''}{item.growth.percentage}% {item.growth.period}
                  </div>
                </OptimizedMotion>
              );
            })}
          </div>
        </div>
      </div>
    </OptimizedMotion>
  );
}

