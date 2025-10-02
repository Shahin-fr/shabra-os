'use client';

import { useQuery } from '@tanstack/react-query';
import { FolderOpen, Calendar, Users, CheckCircle } from 'lucide-react';
import { WidgetCard } from './WidgetCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';
  progress: number;
  dueDate?: string;
  teamMembers: number;
  tasksCompleted: number;
  totalTasks: number;
}

interface MyActiveProjectsWidgetProps {
  className?: string;
  variant?: 'mobile' | 'desktop';
}

export function MyActiveProjectsWidget({ className, variant = 'desktop' }: MyActiveProjectsWidgetProps) {
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['projects', 'my-active'],
    queryFn: async (): Promise<Project[]> => {
      const response = await fetch('/api/projects/my-active');
      if (!response.ok) {
        throw new Error('Failed to fetch active projects');
      }
      const data = await response.json();
      return Array.isArray(data.data) ? data.data : [];
    },
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-status-success-text bg-status-success';
      case 'ON_HOLD':
        return 'text-yellow-600 bg-yellow-100';
      case 'COMPLETED':
        return 'text-brand-pink-text bg-brand-pink';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'فعال';
      case 'ON_HOLD':
        return 'متوقف';
      case 'COMPLETED':
        return 'تکمیل شده';
      default:
        return 'نامشخص';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      month: 'short',
      day: 'numeric'
    });
  };

  const isMobile = variant === 'mobile';
  const safeProjects = Array.isArray(projects) ? projects : [];

  return (
    <WidgetCard
      title="پروژه‌های فعال من"
      className={cn(
        'bg-gradient-to-br from-purple-50 to-indigo-50',
        className
      )}
      loading={isLoading}
      error={error?.message}
      empty={!isLoading && safeProjects.length === 0}
      emptyMessage="هیچ پروژه فعالی یافت نشد"
      emptyIcon={<FolderOpen className="h-8 w-8 text-brand-plum" />}
    >
      {/* Projects List */}
      <div className="space-y-4">
        {safeProjects.slice(0, isMobile ? 2 : 3).map((project) => (
          <div
            key={project.id}
            className="p-4 rounded-xl bg-white/60 border border-white/40 hover:bg-white/80 transition-all duration-200"
          >
            {/* Project Header */}
            <div className="flex items-start rtl:items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h4 className={cn(
                  'font-vazirmatn font-semibold text-gray-900 leading-tight mb-1',
                  isMobile ? 'text-sm' : 'text-base'
                )}>
                  {project.name}
                </h4>
                {project.description && (
                  <p className={cn(
                    'text-gray-600 font-vazirmatn line-clamp-2',
                    isMobile ? 'text-xs' : 'text-sm'
                  )}>
                    {project.description}
                  </p>
                )}
              </div>
              <div className="flex-shrink-0 ms-2">
                <span className={cn(
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-vazirmatn font-medium',
                  getStatusColor(project.status)
                )}>
                  {getStatusText(project.status)}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600 font-vazirmatn">
                  پیشرفت
                </span>
                <span className="text-xs text-gray-600 font-vazirmatn">
                  {project.progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {/* Project Stats */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span className="font-vazirmatn">
                  {project.teamMembers} نفر
                </span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                <span className="font-vazirmatn">
                  {project.tasksCompleted}/{project.totalTasks}
                </span>
              </div>
              {project.dueDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span className="font-vazirmatn">
                    {formatDate(project.dueDate)}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action Button */}
      {safeProjects.length > 0 && (
        <div className="pt-4 border-t border-white/40">
          <Button
            variant="outline"
            className="w-full font-vazirmatn text-sm"
            onClick={() => {
              // Navigate to projects page
              window.location.href = '/projects';
            }}
          >
            مشاهده همه پروژه‌ها
          </Button>
        </div>
      )}
    </WidgetCard>
  );
}

