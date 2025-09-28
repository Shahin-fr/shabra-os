'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, Clock, CheckCircle, ChevronRight } from 'lucide-react';
import { WidgetCard } from './WidgetCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  jobTitle?: string;
  department?: string;
  lastActivity?: {
    taskId: string;
    title: string;
    status: string;
    projectName?: string;
    updatedAt: string;
  };
  isActive: boolean;
  completedTasksCount: number;
}

interface TeamActivityWidgetProps {
  className?: string;
  variant?: 'mobile' | 'desktop';
}

export function TeamActivityWidget({ className, variant = 'desktop' }: TeamActivityWidgetProps) {
  const { data: teamActivity, isLoading, error } = useQuery({
    queryKey: ['admin', 'team-activity-today'],
    queryFn: async (): Promise<TeamMember[]> => {
      const response = await fetch('/api/admin/team-activity-today');
      if (!response.ok) {
        throw new Error('Failed to fetch team activity today');
      }
      const data = await response.json();
      return Array.isArray(data.data) ? data.data : [];
    },
    refetchInterval: 60000, // Refetch every minute
  });


  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} روز پیش`;
    } else if (diffHours > 0) {
      return `${diffHours} ساعت پیش`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} دقیقه پیش`;
    } else {
      return 'همین الان';
    }
  };

  const safeTeamActivity = Array.isArray(teamActivity) ? teamActivity : [];

  const isMobile = variant === 'mobile';

  return (
    <WidgetCard
      title="فعالیت امروز تیم"
      className={cn(
        'bg-gradient-to-br from-blue-50 to-indigo-50',
        className
      )}
      loading={isLoading}
      error={error?.message}
      empty={!isLoading && safeTeamActivity.length === 0}
      emptyMessage="هیچ کاری امروز تکمیل نشده است"
      emptyIcon={<Users className="h-8 w-8 text-blue-400" />}
    >

      {/* Completed Tasks List */}
      <div className="space-y-3">
        {safeTeamActivity.slice(0, isMobile ? 4 : 10).map((member) => (
          <div
            key={member.id}
            className="p-3 rounded-xl bg-white/60 border border-white/40 hover:bg-white/80 transition-all duration-200"
          >
            <div className="flex items-start rtl:items-start gap-3">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {member.avatar ? (
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <Users className="h-5 w-5 text-gray-500" />
                  </div>
                )}
              </div>

              {/* Task Completion Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className={cn(
                    'font-vazirmatn font-semibold text-gray-900 leading-tight',
                    isMobile ? 'text-sm' : 'text-base'
                  )}>
                    {member.name}
                  </h4>
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-vazirmatn font-medium">
                      {member.completedTasksCount} کار تکمیل شده
                    </span>
                  </div>
                </div>

                {member.lastActivity ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 font-vazirmatn">
                        آخرین کار:
                      </span>
                      <span className="text-sm font-medium text-gray-900 font-vazirmatn">
                        {member.lastActivity.title}
                      </span>
                    </div>
                    
                    {member.lastActivity.projectName && (
                      <div className="text-xs text-blue-600 font-vazirmatn">
                        پروژه: {member.lastActivity.projectName}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span className="font-vazirmatn">
                        تکمیل شده {formatTime(member.lastActivity.updatedAt)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 font-vazirmatn">
                    هیچ کاری امروز تکمیل نشده
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Button - Only show if more than max items */}
      {safeTeamActivity.length > (isMobile ? 4 : 10) && (
        <div className="pt-4 border-t border-white/40">
          <Link href="/admin/team-activity">
            <Button
              variant="outline"
              className="w-full font-vazirmatn text-sm hover:bg-white/80"
            >
              <span>مشاهده همه فعالیت‌ها</span>
              <ChevronRight className="rtl:rotate-180 h-4 w-4 me-2" />
            </Button>
          </Link>
        </div>
      )}
    </WidgetCard>
  );
}
