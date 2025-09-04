'use client';

import { useQuery } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import { useState } from 'react';

import { MobileDataList } from '@/components/data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { isAdminOrManager } from '@/lib/auth-utils';
import { formatJalaliDate } from '@/lib/date-utils';
import { fetchProjects, projectsKeys } from '@/lib/queries';
import { cn } from '@/lib/utils';
import { Project, ProjectsResponse } from '@/types/project';

import EditProject from './EditProject';
import { MobileCreateProject } from './MobileCreateProject';

interface MobileProjectsListProps {
  className?: string;
}

export function MobileProjectsList({
  className: _className,
}: MobileProjectsListProps) {
  const { user } = useAuth();
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Use TanStack Query to fetch projects with pagination
  const {
    data: projectsData,
    isLoading: isProjectsLoading,
    isError,
    refetch,
  } = useQuery<ProjectsResponse>({
    queryKey: projectsKeys.byPage(1),
    queryFn: async () => fetchProjects(1) as Promise<ProjectsResponse>,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Extract projects data
  const projects = projectsData?.projects || [];
  const { hapticSuccess } = useHapticFeedback();

  // Handle refresh with haptic feedback
  const handleRefresh = async () => {
    await refetch();
    hapticSuccess();
  };

  // Get user privilege level for conditional content
  const canManageProjects =
    user &&
    isAdminOrManager({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        roles: user.roles || [],
      },
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    } as any);

  // Handle project press
  const handleProjectPress = (_project: Project) => {
    if (canManageProjects) {
      setEditingProject(_project);
      setIsEditDialogOpen(true);
    }
  };

  // Handle edit dialog close
  const handleEditDialogClose = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      setEditingProject(null);
    }
  };

  // Define columns for the data list
  const columns = [
    {
      key: 'name',
      label: 'نام پروژه',
      render: (value: string) => (
        <div className='font-semibold text-gray-900'>{value}</div>
      ),
    },
    {
      key: 'description',
      label: 'توضیحات',
      render: (value: string) => (
        <div className='text-sm text-gray-600 line-clamp-2'>
          {value || 'بدون توضیحات'}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'وضعیت',
      render: (value: string) => {
        const statusConfig = {
          ACTIVE: {
            label: 'فعال',
            variant: 'default' as const,
            color: 'bg-green-100 text-green-800',
          },
          PAUSED: {
            label: 'متوقف',
            variant: 'secondary' as const,
            color: 'bg-yellow-100 text-yellow-800',
          },
          COMPLETED: {
            label: 'تکمیل شده',
            variant: 'outline' as const,
            color: 'bg-blue-100 text-blue-800',
          },
          CANCELLED: {
            label: 'لغو شده',
            variant: 'destructive' as const,
            color: 'bg-red-100 text-red-800',
          },
        };
        const config =
          statusConfig[value as keyof typeof statusConfig] ||
          statusConfig.ACTIVE;
        return (
          <Badge variant={config.variant} className={config.color}>
            {config.label}
          </Badge>
        );
      },
    },
    {
      key: 'startDate',
      label: 'تاریخ شروع',
      render: (value: string) => formatJalaliDate(value),
    },
    {
      key: 'accessLevel',
      label: 'سطح دسترسی',
      render: (value: string) => {
        const accessLabels = {
          PUBLIC: 'عمومی',
          PRIVATE: 'خصوصی',
          RESTRICTED: 'محدود',
        };
        return accessLabels[value as keyof typeof accessLabels] || value;
      },
    },
  ];

  if (isError) {
    return (
      <div className='text-center py-12'>
        <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
          <FileText className='h-8 w-8 text-red-600' />
        </div>
        <h3 className='text-lg font-semibold text-foreground mb-2'>
          خطا در بارگذاری پروژه‌ها
        </h3>
        <p className='text-muted-foreground mb-6'>
          مشکلی در بارگذاری پروژه‌ها پیش آمده است
        </p>
        <Button
          onClick={() => refetch()}
          className='bg-[#ff0a54] hover:bg-[#ff0a54]/90 text-white'
        >
          تلاش مجدد
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', _className)}>
      {/* Header */}
      <Card
        style={{
          background: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: `
            0 20px 60px rgba(0, 0, 0, 0.2),
            0 10px 30px rgba(255, 10, 84, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.4)
          `,
        }}
      >
        <CardContent className='p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-foreground mb-2'>
                پروژه‌ها
              </h1>
              <p className='text-muted-foreground'>
                مدیریت و نظارت بر پروژه‌های فعال
              </p>
            </div>
            <div className='flex items-center gap-3'>
              {canManageProjects && <MobileCreateProject />}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects List */}
      <MobileDataList
        data={projects}
        columns={columns}
        onRowPress={handleProjectPress}
        onRefresh={handleRefresh}
        isLoading={isProjectsLoading}
        emptyMessage='هیچ پروژه‌ای یافت نشد'
      />

      {/* Edit Project Dialog */}
      {editingProject && (
        <EditProject
          project={editingProject}
          open={isEditDialogOpen}
          onOpenChange={handleEditDialogClose}
        />
      )}
    </div>
  );
}
