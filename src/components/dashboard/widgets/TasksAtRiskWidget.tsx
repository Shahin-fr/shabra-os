'use client';

import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Clock, User, Folder, Calendar, ChevronRight } from 'lucide-react';
import { WidgetCard } from './WidgetCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface TaskAtRisk {
  id: string;
  title: string;
  dueDate: string;
  status: string;
  assignee: {
    firstName: string;
    lastName: string;
  };
  project?: {
    name: string;
  };
}

interface TasksAtRiskWidgetProps {
  className?: string;
  variant?: 'mobile' | 'desktop';
}

export function TasksAtRiskWidget({ className, variant = 'desktop' }: TasksAtRiskWidgetProps) {
  const { data: tasksAtRisk, isLoading, error } = useQuery({
    queryKey: ['admin', 'urgent-tasks'],
    queryFn: async (): Promise<TaskAtRisk[]> => {
      const response = await fetch('/api/admin/urgent-tasks');
      if (!response.ok) {
        throw new Error('Failed to fetch urgent tasks');
      }
      const data = await response.json();
      return Array.isArray(data.data) ? data.data : [];
    },
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  const getRiskLevel = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { level: 'overdue', text: 'تأخیر', color: 'text-red-600 bg-red-100' };
    } else if (diffDays === 0) {
      return { level: 'due-today', text: 'امروز', color: 'text-orange-600 bg-orange-100' };
    } else {
      return { level: 'due-soon', text: 'به زودی', color: 'text-blue-600 bg-blue-100' };
    }
  };

  const getRiskIcon = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    } else if (diffDays <= 1) {
      return <Clock className="h-4 w-4 text-orange-500" />;
    } else {
      return <Calendar className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isMobile = variant === 'mobile';
  
  // Safety check to ensure tasksAtRisk is always an array
  const safeTasksAtRisk = Array.isArray(tasksAtRisk) ? tasksAtRisk : [];

  // Categorize tasks into Today and Overdue
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const overdueTasks = safeTasksAtRisk.filter(task => {
    const due = new Date(task.dueDate);
    return due.getTime() < today.getTime();
  });

  const todayTasks = safeTasksAtRisk.filter(task => {
    const due = new Date(task.dueDate);
    return due.getTime() >= today.getTime() && due.getTime() < tomorrow.getTime();
  });

  const overdueCount = overdueTasks.length;
  const dueTodayCount = todayTasks.length;

  return (
    <WidgetCard
      title="تسک های فوری"
      className={cn(
        'bg-gradient-to-br from-orange-50 to-red-50',
        className
      )}
      loading={isLoading}
      error={error?.message}
      empty={!isLoading && safeTasksAtRisk.length === 0}
      emptyMessage="هیچ کاری در معرض خطر نیست"
      emptyIcon={<AlertTriangle className="h-8 w-8 text-green-400" />}
        headerAction={
          safeTasksAtRisk.length > 0 && (
          <div className="flex items-center gap-2">
            {overdueCount > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-vazirmatn font-medium">
                <AlertTriangle className="h-3 w-3" />
                {overdueCount} تأخیر
              </div>
            )}
            {dueTodayCount > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-vazirmatn font-medium">
                <Clock className="h-3 w-3" />
                {dueTodayCount} امروز
              </div>
            )}
          </div>
        )
      }
    >

      {/* Tasks List */}
      <div className="space-y-4">
        {/* Overdue Tasks Section */}
        {overdueTasks.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-red-700 font-vazirmatn mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              با تاخیر ({overdueCount})
            </h3>
            <div className="space-y-3">
              {overdueTasks.slice(0, isMobile ? 2 : 3).map((task) => {
                const risk = getRiskLevel(task.dueDate);
                return (
                  <div
                    key={task.id}
                    className="p-3 rounded-xl bg-red-50 border border-red-200 hover:bg-red-100 transition-all duration-200"
                  >
                    <div className="flex items-start gap-3">
                      {/* Risk Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getRiskIcon(task.dueDate)}
                      </div>

                      {/* Task Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className={cn(
                            'font-vazirmatn font-semibold text-gray-900 leading-tight',
                            isMobile ? 'text-sm' : 'text-base'
                          )}>
                            {task.title}
                          </h4>
                          <span className={cn(
                            'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-vazirmatn font-medium',
                            risk.color
                          )}>
                            {risk.text}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {/* Assignee */}
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="font-vazirmatn">
                              {task.assignee.firstName} {task.assignee.lastName}
                            </span>
                          </div>

                          {/* Project */}
                          {task.project && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Folder className="h-4 w-4 text-gray-400" />
                              <span className="font-vazirmatn">
                                {task.project.name}
                              </span>
                            </div>
                          )}

                          {/* Due Date */}
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="font-vazirmatn">
                              {formatDate(task.dueDate)} - {formatTime(task.dueDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Today Tasks Section */}
        {todayTasks.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-orange-700 font-vazirmatn mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              امروز ({dueTodayCount})
            </h3>
            <div className="space-y-3">
              {todayTasks.slice(0, isMobile ? 2 : 3).map((task) => {
                const risk = getRiskLevel(task.dueDate);
                return (
                  <div
                    key={task.id}
                    className="p-3 rounded-xl bg-orange-50 border border-orange-200 hover:bg-orange-100 transition-all duration-200"
                  >
                    <div className="flex items-start gap-3">
                      {/* Risk Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getRiskIcon(task.dueDate)}
                      </div>

                      {/* Task Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className={cn(
                            'font-vazirmatn font-semibold text-gray-900 leading-tight',
                            isMobile ? 'text-sm' : 'text-base'
                          )}>
                            {task.title}
                          </h4>
                          <span className={cn(
                            'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-vazirmatn font-medium',
                            risk.color
                          )}>
                            {risk.text}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {/* Assignee */}
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="font-vazirmatn">
                              {task.assignee.firstName} {task.assignee.lastName}
                            </span>
                          </div>

                          {/* Project */}
                          {task.project && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Folder className="h-4 w-4 text-gray-400" />
                              <span className="font-vazirmatn">
                                {task.project.name}
                              </span>
                            </div>
                          )}

                          {/* Due Date */}
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="font-vazirmatn">
                              {formatDate(task.dueDate)} - {formatTime(task.dueDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Action Button - Only show if more than max items */}
      {safeTasksAtRisk.length > (isMobile ? 3 : 6) && (
        <div className="pt-4 border-t border-white/40">
          <Link href="/admin/tasks">
            <Button
              variant="outline"
              className="w-full font-vazirmatn text-sm hover:bg-white/80"
            >
              <span>مشاهده همه تسک‌ها</span>
              <ChevronRight className="h-4 w-4 mr-2" />
            </Button>
          </Link>
        </div>
      )}
    </WidgetCard>
  );
}
