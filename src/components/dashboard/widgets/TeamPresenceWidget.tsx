'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, UserCheck, UserX, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { ManagerWidget } from '@/components/ui/PerfectWidget';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

// interface TeamPresenceStats {
//   clockedIn: number;
//   onLeave: number;
//   absent: number;
//   total: number;
// }

interface TeamPresenceWidgetProps {
  className?: string;
  variant?: 'mobile' | 'desktop';
}

export function TeamPresenceWidget({ className, variant = 'desktop' }: TeamPresenceWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: presenceData, isLoading, error } = useQuery({
    queryKey: ['admin', 'team-presence-stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/team-presence-stats');
      if (!response.ok) {
        throw new Error('Failed to fetch team presence stats');
      }
      const data = await response.json();
      return data;
    },
    refetchInterval: 60000, // Refetch every minute
  });

  const presenceStats = presenceData?.data?.stats;

  const IDEAL_TEAM_SIZE = 3; // Ideal team size for 100% presence

  const getPresencePercentage = (count: number) => {
    if (!presenceStats) return 0;
    return Math.round((count / IDEAL_TEAM_SIZE) * 100);
  };

  const getPresenceRate = () => {
    if (!presenceStats) return 0;
    return presenceStats.total > 0 ? Math.round((presenceStats.clockedIn / presenceStats.total) * 100) : 0;
  };

  // const getPresenceColor = (type: string) => {
  //   switch (type) {
  //     case 'clockedIn':
  //       return 'text-green-600 bg-green-100';
  //     case 'onLeave':
  //       return 'text-blue-600 bg-blue-100';
  //     case 'absent':
  //       return 'text-red-600 bg-red-100';
  //     default:
  //       return 'text-gray-600 bg-gray-100';
  //   }
  // };

  // const getPresenceIcon = (type: string) => {
  //   switch (type) {
  //     case 'clockedIn':
  //       return <UserCheck className="h-5 w-5" />;
  //     case 'onLeave':
  //       return <Calendar className="h-5 w-5" />;
  //     case 'absent':
  //       return <UserX className="h-5 w-5" />;
  //     default:
  //       return <Users className="h-5 w-5" />;
  //   }
  // };

  const getPresenceText = (type: string) => {
    switch (type) {
      case 'clockedIn':
        return 'حاضر';
      case 'onLeave':
        return 'مرخصی';
      case 'absent':
        return 'غایب';
      default:
        return 'نامشخص';
    }
  };

  const getProgressBarColor = (count: number) => {
    if (count >= 3) return 'from-green-500 to-emerald-500'; // 3+ people - Green
    if (count === 2) return 'from-yellow-500 to-orange-500'; // 2 people - Yellow
    if (count === 1) return 'from-orange-500 to-red-500'; // 1 person - Orange
    return 'from-red-500 to-red-600'; // 0 people - Red
  };

  const getProgressBarWidth = (count: number) => {
    const percentage = getPresencePercentage(count);
    return Math.min(percentage, 100); // Cap at 100%
  };

  const isMobile = variant === 'mobile';

  return (
    <ManagerWidget
      title="حضور تیم"
      className={cn(
        'bg-gradient-to-br from-green-50/50 to-emerald-50/50',
        className
      )}
      loading={isLoading}
      error={error?.message}
      empty={!isLoading && !presenceStats}
      emptyMessage="اطلاعات حضور در دسترس نیست"
      emptyIcon={<Users className="h-8 w-8 text-status-success" />}
    >
      {/* Overall Stats - Perfect Typography Hierarchy */}
      {presenceStats && (
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className={cn(
              "font-bold text-gray-900 font-vazirmatn mb-2",
              isMobile ? "text-3xl" : "text-4xl"
            )}>
              {presenceStats.clockedIn}
            </div>
            <div className={cn(
              "font-semibold font-vazirmatn mb-1",
              isMobile ? "text-lg" : "text-xl",
              presenceStats.clockedIn >= 3 ? "text-status-success-text" :
              presenceStats.clockedIn === 2 ? "text-yellow-600" :
              presenceStats.clockedIn === 1 ? "text-status-warning-text" : "text-status-danger-text"
            )}>
              {getPresenceRate()}% حضور
            </div>
            <div className="text-sm text-gray-500 font-vazirmatn">
              از {presenceStats.total} نفر اعضای تیم
            </div>
          </div>
        </div>
      )}

      {/* Expandable Details Button - Only on Mobile */}
      {isMobile && (
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full justify-between p-2 text-sm font-vazirmatn text-gray-600 hover:text-gray-900 hover:bg-white/40"
          >
            <span>جزئیات بیشتر</span>
            {isExpanded ? (
              <ChevronUp className="rtl:rotate-180 h-4 w-4" />
            ) : (
              <ChevronDown className="rtl:rotate-180 h-4 w-4" />
            )}
          </Button>
        </div>
      )}

      {/* Presence Breakdown - Beautiful Stat Blocks */}
      {(!isMobile || isExpanded) && (
        <div className="space-y-4 mb-6">
          {/* Clocked In - Stat Block */}
          <div className="group relative p-6 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/50" dir="rtl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="p-4 rounded-xl bg-status-success border border-status-success shadow-sm">
                    <UserCheck className="h-7 w-7 text-status-success-text" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-status-success border-2 border-white shadow-sm">
                    <div className="w-full h-full rounded-full bg-status-success animate-pulse"></div>
                  </div>
                </div>
                <div>
                  <div className="font-bold text-gray-900 font-vazirmatn text-lg text-right">
                    {getPresenceText('clockedIn')}
                  </div>
                  <div className="text-sm text-gray-500 font-vazirmatn text-right">
                    {getPresenceRate()}% از تیم
                  </div>
                </div>
              </div>
              <div className="text-4xl font-bold text-status-success-text font-vazirmatn">
                {presenceStats?.clockedIn || 0}
              </div>
            </div>
          </div>

          {/* On Leave - Stat Block */}
          <div className="group relative p-6 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/50" dir="rtl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="p-4 rounded-xl bg-brand-pink border border-brand-pink shadow-sm">
                    <Calendar className="h-7 w-7 text-brand-pink-text" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-pink border-2 border-white shadow-sm">
                    <div className="w-full h-full rounded-full bg-brand-pink animate-pulse"></div>
                  </div>
                </div>
                <div>
                  <div className="font-bold text-gray-900 font-vazirmatn text-lg text-right">
                    {getPresenceText('onLeave')}
                  </div>
                  <div className="text-sm text-gray-500 font-vazirmatn text-right">
                    {presenceStats?.total ? Math.round(((presenceStats?.onLeave || 0) / presenceStats.total) * 100) : 0}% از تیم
                  </div>
                </div>
              </div>
              <div className="text-4xl font-bold text-brand-pink-text font-vazirmatn">
                {presenceStats?.onLeave || 0}
              </div>
            </div>
          </div>

          {/* Absent - Stat Block */}
          <div className="group relative p-6 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/50" dir="rtl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="p-4 rounded-xl bg-status-danger border border-status-danger shadow-sm">
                    <UserX className="h-7 w-7 text-status-danger-text" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-status-danger border-2 border-white shadow-sm">
                    <div className="w-full h-full rounded-full bg-status-danger animate-pulse"></div>
                  </div>
                </div>
                <div>
                  <div className="font-bold text-gray-900 font-vazirmatn text-lg text-right">
                    {getPresenceText('absent')}
                  </div>
                  <div className="text-sm text-gray-500 font-vazirmatn text-right">
                    {presenceStats?.total ? Math.round(((presenceStats?.absent || 0) / presenceStats.total) * 100) : 0}% از تیم
                  </div>
                </div>
              </div>
              <div className="text-4xl font-bold text-status-danger-text font-vazirmatn">
                {presenceStats?.absent || 0}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar - Perfect Visual Feedback */}
      {presenceStats && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700 font-vazirmatn">
              نرخ حضور
            </span>
            <span className="text-sm font-medium text-gray-700 font-vazirmatn">
              {presenceStats.clockedIn} نفر
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={cn(
                "h-3 rounded-full transition-all duration-500 ease-out",
                `bg-gradient-to-r ${getProgressBarColor(presenceStats.clockedIn)}`
              )}
              style={{ width: `${getProgressBarWidth(presenceStats.clockedIn)}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Button - Perfect Call-to-Action */}
      <div className="pt-6 border-t border-gray-200/50">
        <Button
          variant="outline"
          className="w-full font-vazirmatn text-sm bg-white/50 hover:bg-white/80 border-gray-300/50 hover:border-gray-400/50 transition-all duration-200"
          onClick={() => {
            // Navigate to attendance report
            window.location.href = '/admin/attendance';
          }}
        >
          گزارش حضور و غیاب
        </Button>
      </div>
    </ManagerWidget>
  );
}
