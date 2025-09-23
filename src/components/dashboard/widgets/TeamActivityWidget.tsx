'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, Activity, Clock, CheckCircle, Circle, ChevronRight } from 'lucide-react';
import { WidgetCard } from './WidgetCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  lastActivity?: {
    taskId: string;
    title: string;
    status: string;
    updatedAt: string;
  };
  isActive: boolean;
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'TODO':
        return 'در انتظار';
      case 'IN_PROGRESS':
        return 'در حال انجام';
      case 'DONE':
        return 'انجام شده';
      default:
        return 'نامشخص';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO':
        return 'text-gray-500 bg-gray-100';
      case 'IN_PROGRESS':
        return 'text-blue-500 bg-blue-100';
      case 'DONE':
        return 'text-green-500 bg-green-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'TODO':
        return <Circle className="h-4 w-4" />;
      case 'IN_PROGRESS':
        return <Activity className="h-4 w-4" />;
      case 'DONE':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

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
  
  const activeMembers = safeTeamActivity.filter(member => member.isActive).length;
  const totalMembers = safeTeamActivity.length;

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
      emptyMessage="هیچ عضو تیمی یافت نشد"
      emptyIcon={<Users className="h-8 w-8 text-blue-400" />}
    >
      {/* Team Summary */}
      {safeTeamActivity.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 font-vazirmatn">
                {activeMembers}
              </div>
              <div className="text-sm text-gray-600 font-vazirmatn">
                فعال از {totalMembers}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 font-vazirmatn">
                {Math.round((activeMembers / totalMembers) * 100)}%
              </div>
              <div className="text-sm text-gray-600 font-vazirmatn">
                حضور
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Members List */}
      <div className="space-y-3">
        {safeTeamActivity.slice(0, isMobile ? 4 : 10).map((member) => (
          <div
            key={member.id}
            className="p-3 rounded-xl bg-white/60 border border-white/40 hover:bg-white/80 transition-all duration-200"
          >
            <div className="flex items-start gap-3">
              {/* Avatar with Status */}
              <div className="relative flex-shrink-0">
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
                {/* Active Status Indicator */}
                <div className={cn(
                  'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white',
                  member.isActive ? 'bg-green-500' : 'bg-gray-400'
                )} />
              </div>

              {/* Member Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={cn(
                    'font-vazirmatn font-semibold text-gray-900 leading-tight',
                    isMobile ? 'text-sm' : 'text-base'
                  )}>
                    {member.name}
                  </h4>
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    member.isActive ? 'bg-green-500' : 'bg-gray-400'
                  )} />
                </div>

                {member.lastActivity ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-vazirmatn font-medium',
                        getStatusColor(member.lastActivity.status)
                      )}>
                        {getStatusIcon(member.lastActivity.status)}
                        {getStatusText(member.lastActivity.status)}
                      </span>
                    </div>
                    
                    <p className={cn(
                      'text-gray-600 font-vazirmatn line-clamp-2',
                      isMobile ? 'text-xs' : 'text-sm'
                    )}>
                      {member.lastActivity.title}
                    </p>
                    
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span className="font-vazirmatn">
                        {formatTime(member.lastActivity.updatedAt)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 font-vazirmatn">
                    {member.isActive ? 'فعال - بدون کار' : 'غیرفعال'}
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
              <ChevronRight className="h-4 w-4 mr-2" />
            </Button>
          </Link>
        </div>
      )}
    </WidgetCard>
  );
}
