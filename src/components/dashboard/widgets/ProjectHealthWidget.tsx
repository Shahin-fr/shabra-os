'use client';

import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { EnhancedWidgetCard } from '@/components/ui/EnhancedWidgetCard';
import { cn } from '@/lib/utils';

interface Project {
  id: string;
  name: string;
  status: 'on-track' | 'at-risk' | 'delayed' | 'completed';
  progress: number;
  dueDate: string;
  teamSize: number;
  completedTasks: number;
  totalTasks: number;
}

interface ProjectHealthWidgetProps {
  className?: string;
  variant?: 'mobile' | 'desktop';
  priority?: 'high' | 'medium' | 'low';
}

export function ProjectHealthWidget({ className, variant = 'desktop', priority = 'medium' }: ProjectHealthWidgetProps) {
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['projects', 'health'],
    queryFn: async (): Promise<Project[]> => {
      // Mock data for now - replace with actual API call
      return [
        {
          id: '1',
          name: 'پروژه شبرا',
          status: 'on-track',
          progress: 75,
          dueDate: '2024-02-15',
          teamSize: 5,
          completedTasks: 15,
          totalTasks: 20,
        },
        {
          id: '2',
          name: 'سیستم مدیریت',
          status: 'at-risk',
          progress: 45,
          dueDate: '2024-01-30',
          teamSize: 3,
          completedTasks: 9,
          totalTasks: 20,
        },
        {
          id: '3',
          name: 'اپلیکیشن موبایل',
          status: 'delayed',
          progress: 30,
          dueDate: '2024-01-20',
          teamSize: 4,
          completedTasks: 6,
          totalTasks: 20,
        },
      ];
    },
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'text-green-600 bg-green-100';
      case 'at-risk':
        return 'text-yellow-600 bg-yellow-100';
      case 'delayed':
        return 'text-red-600 bg-red-100';
      case 'completed':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-track':
        return <TrendingUp className="h-4 w-4" />;
      case 'at-risk':
        return <AlertTriangle className="h-4 w-4" />;
      case 'delayed':
        return <TrendingDown className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'در مسیر';
      case 'at-risk':
        return 'در خطر';
      case 'delayed':
        return 'تأخیر';
      case 'completed':
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

  // Calculate overall health metrics
  const onTrackCount = safeProjects.filter(p => p.status === 'on-track').length;
  const atRiskCount = safeProjects.filter(p => p.status === 'at-risk').length;
  const delayedCount = safeProjects.filter(p => p.status === 'delayed').length;
  const totalProjects = safeProjects.length;

  return (
    <EnhancedWidgetCard
      title="سلامت پروژه‌ها"
      variant="manager"
      priority={priority}
      className={className}
      loading={isLoading}
      error={error?.message}
      empty={!isLoading && safeProjects.length === 0}
      emptyMessage="هیچ پروژه‌ای یافت نشد"
      emptyIcon={<TrendingUp className="h-8 w-8 text-blue-400" />}
    >
      {/* Health Summary */}
      {safeProjects.length > 0 && (
        <div className="mb-6">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 rounded-xl bg-green-50">
              <div className="text-2xl font-bold text-green-600 font-vazirmatn">
                {onTrackCount}
              </div>
              <div className="text-xs text-green-600 font-vazirmatn">
                در مسیر
              </div>
            </div>
            <div className="text-center p-3 rounded-xl bg-yellow-50">
              <div className="text-2xl font-bold text-yellow-600 font-vazirmatn">
                {atRiskCount}
              </div>
              <div className="text-xs text-yellow-600 font-vazirmatn">
                در خطر
              </div>
            </div>
            <div className="text-center p-3 rounded-xl bg-red-50">
              <div className="text-2xl font-bold text-red-600 font-vazirmatn">
                {delayedCount}
              </div>
              <div className="text-xs text-red-600 font-vazirmatn">
                تأخیر
              </div>
            </div>
          </div>

          {/* Overall Health Indicator */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <motion.div
              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(onTrackCount / totalProjects) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <div className="text-center text-sm text-gray-600 font-vazirmatn">
            {Math.round((onTrackCount / totalProjects) * 100)}% پروژه‌ها در مسیر
          </div>
        </div>
      )}

      {/* Projects List */}
      <div className="space-y-3">
        {safeProjects.slice(0, isMobile ? 2 : 3).map((project) => (
          <motion.div
            key={project.id}
            className="p-3 rounded-xl bg-white/60 border border-white/40 hover:bg-white/80 transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start rtl:items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className={cn(
                    'font-vazirmatn font-semibold text-gray-900 leading-tight',
                    isMobile ? 'text-sm' : 'text-base'
                  )}>
                    {project.name}
                  </h4>
                  <span className={cn(
                    'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-vazirmatn font-medium',
                    getStatusColor(project.status)
                  )}>
                    {getStatusIcon(project.status)}
                    {getStatusText(project.status)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 font-vazirmatn">
                      پیشرفت: {project.completedTasks}/{project.totalTasks}
                    </span>
                    <span className="text-sm text-gray-500 font-vazirmatn">
                      {project.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${project.progress}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* Project Meta */}
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span className="font-vazirmatn">
                    {project.teamSize} نفر
                  </span>
                  <span className="font-vazirmatn">
                    تا {formatDate(project.dueDate)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action Button */}
      {safeProjects.length > 0 && (
        <div className="pt-4 border-t border-white/40">
          <motion.button
            className="w-full text-center text-sm text-blue-600 font-vazirmatn hover:text-blue-800 transition-colors duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              window.location.href = '/projects';
            }}
          >
            مشاهده همه پروژه‌ها
          </motion.button>
        </div>
      )}
    </EnhancedWidgetCard>
  );
}
