'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, User, AlertCircle } from 'lucide-react';
import { WidgetCard } from './WidgetCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TeamMemberWorkload {
  id: string;
  name: string;
  avatar?: string;
  inProgressTasks: number;
}

interface TeamWorkloadWidgetProps {
  className?: string;
  variant?: 'mobile' | 'desktop';
}

export function TeamWorkloadWidget({ className, variant = 'desktop' }: TeamWorkloadWidgetProps) {
  const { data: teamWorkload, isLoading, error } = useQuery({
    queryKey: ['admin', 'team-workload'],
    queryFn: async (): Promise<TeamMemberWorkload[]> => {
      const response = await fetch('/api/admin/team-workload');
      if (!response.ok) {
        throw new Error('Failed to fetch team workload');
      }
      const data = await response.json();
      return Array.isArray(data.data) ? data.data : [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes - workload changes less frequently
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  const getWorkloadLevel = (taskCount: number) => {
    if (taskCount === 0) {
      return { level: 'light', text: 'سبک', color: 'text-status-success-text bg-status-success' };
    } else if (taskCount <= 2) {
      return { level: 'moderate', text: 'متوسط', color: 'text-brand-pink-text bg-brand-pink' };
    } else if (taskCount <= 4) {
      return { level: 'heavy', text: 'سنگین', color: 'text-status-warning-text bg-status-warning' };
    } else {
      return { level: 'overloaded', text: 'بیش از حد', color: 'text-status-danger-text bg-status-danger' };
    }
  };

  const getWorkloadBarColor = (taskCount: number) => {
    if (taskCount === 0) {
      return 'bg-status-success';
    } else if (taskCount <= 2) {
      return 'bg-brand-pink';
    } else if (taskCount <= 4) {
      return 'bg-status-warning';
    } else {
      return 'bg-status-danger';
    }
  };

  const getMaxTasks = () => {
    if (!teamWorkload || teamWorkload.length === 0) return 1;
    return Math.max(...teamWorkload.map(member => member.inProgressTasks), 1);
  };

  const getWorkloadPercentage = (taskCount: number) => {
    const maxTasks = getMaxTasks();
    return Math.round((taskCount / maxTasks) * 100);
  };

  const safeTeamWorkload = Array.isArray(teamWorkload) ? teamWorkload : [];
  
  const averageWorkload = safeTeamWorkload.length > 0
    ? Math.round(safeTeamWorkload.reduce((sum, member) => sum + member.inProgressTasks, 0) / safeTeamWorkload.length)
    : 0;

  const overloadedMembers = safeTeamWorkload.filter(member => member.inProgressTasks > 4).length;
  const underutilizedMembers = safeTeamWorkload.filter(member => member.inProgressTasks === 0).length;

  const isMobile = variant === 'mobile';

  return (
    <WidgetCard
      title="بار کاری تیم"
      className={cn(
        'bg-gradient-to-br from-purple-50 to-pink-50',
        className
      )}
      loading={isLoading}
      error={error?.message}
      empty={!isLoading && safeTeamWorkload.length === 0}
      emptyMessage="هیچ عضو تیمی یافت نشد"
      emptyIcon={<Users className="h-8 w-8 text-brand-plum" />}
    >
      {/* Workload Summary */}
      {safeTeamWorkload.length > 0 && (
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-xl bg-white/60">
              <div className="text-2xl font-bold text-gray-900 font-vazirmatn">
                {averageWorkload}
              </div>
              <div className="text-sm text-gray-600 font-vazirmatn">
                میانگین کار
              </div>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/60">
              <div className="text-2xl font-bold text-brand-plum-text font-vazirmatn">
                {safeTeamWorkload.length}
              </div>
              <div className="text-sm text-gray-600 font-vazirmatn">
                عضو تیم
              </div>
            </div>
          </div>
          
          {/* Alerts */}
          {(overloadedMembers > 0 || underutilizedMembers > 0) && (
            <div className="mt-4 space-y-2">
              {overloadedMembers > 0 && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-status-danger text-status-danger-text text-sm font-vazirmatn">
                  <AlertCircle className="h-4 w-4" />
                  {overloadedMembers} نفر بیش از حد کار دارند
                </div>
              )}
              {underutilizedMembers > 0 && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-status-success text-status-success-text text-sm font-vazirmatn">
                  <Users className="h-4 w-4" />
                  {underutilizedMembers} نفر کار ندارند
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Team Members List */}
      <div className="space-y-3">
        {safeTeamWorkload.slice(0, isMobile ? 4 : 6).map((member) => {
          const workload = getWorkloadLevel(member.inProgressTasks);
          const percentage = getWorkloadPercentage(member.inProgressTasks);
          
          return (
            <div
              key={member.id}
              className="p-3 rounded-xl bg-white/60 border border-white/40 hover:bg-white/80 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
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
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                  )}
                </div>

                {/* Member Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={cn(
                      'font-vazirmatn font-semibold text-gray-900 leading-tight',
                      isMobile ? 'text-sm' : 'text-base'
                    )}>
                      {member.name}
                    </h4>
                    <span className={cn(
                      'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-vazirmatn font-medium',
                      workload.color
                    )}>
                      {workload.text}
                    </span>
                  </div>

                  {/* Workload Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 font-vazirmatn">
                        {member.inProgressTasks} کار در حال انجام
                      </span>
                      <span className="text-sm text-gray-500 font-vazirmatn">
                        {percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={cn(
                          'h-2 rounded-full transition-all duration-300',
                          getWorkloadBarColor(member.inProgressTasks)
                        )}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Button */}
      {safeTeamWorkload.length > 0 && (
        <div className="pt-4 border-t border-white/40">
          <Button
            variant="outline"
            className="w-full font-vazirmatn text-sm"
            onClick={() => {
              // Navigate to task assignment page
              window.location.href = '/admin/task-assignment';
            }}
          >
            تخصیص کار جدید
          </Button>
        </div>
      )}
    </WidgetCard>
  );
}
