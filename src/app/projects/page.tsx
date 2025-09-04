'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, FileText, Shield, UserCheck, Edit } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

import CreateProject from '@/components/projects/CreateProject';
import DeleteProject from '@/components/projects/DeleteProject';
import EditProject from '@/components/projects/EditProject';
import { MobileProjectsList } from '@/components/projects/MobileProjectsList';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { useAuth } from '@/hooks/useAuth';
import { useMobile } from '@/hooks/useResponsive';
import { isAdminOrManager } from '@/lib/auth-utils';
import { formatJalaliDate } from '@/lib/date-utils';
import { fetchProjects, projectsKeys } from '@/lib/queries';
import { cn } from '@/lib/utils';
import { Project, ProjectsResponse } from '@/types/project';

// Dynamic import to prevent SSR issues with TanStack Query
const ProjectsPageContent = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const isMobile = useMobile();
  const [currentPage, setCurrentPage] = useState(1);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Use TanStack Query to fetch projects with pagination
  const {
    data: projectsData,
    isLoading: isProjectsLoading,
    isError,
  } = useQuery<ProjectsResponse>({
    queryKey: projectsKeys.byPage(currentPage),
    queryFn: async () =>
      fetchProjects(currentPage) as Promise<ProjectsResponse>,
    enabled: isAuthenticated,
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Always refetch when component mounts
  });

  // Extract projects and pagination data
  const projects = projectsData?.projects || [];
  const pagination = {
    currentPage: projectsData?.currentPage || 1,
    totalPages: projectsData?.totalPages || 1,
    hasNextPage: projectsData?.hasNextPage || false,
    hasPreviousPage: projectsData?.hasPreviousPage || false,
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
    } as any);

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle double click to edit project
  const handleProjectDoubleClick = (project: Project) => {
    if (canManageProjects) {
      setEditingProject(project);
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

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      redirect('/login');
    }
  }, [isAuthenticated, isLoading]);

  // Show mobile components for mobile devices
  if (isMobile) {
    return <MobileProjectsList />;
  }

  if (isLoading || isProjectsLoading) {
    return (
      <div className='container mx-auto max-w-7xl'>
        <div className='text-center py-12'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
          <p className='mt-3 text-muted-foreground'>
            در حال بارگذاری پروژه‌ها...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='container mx-auto max-w-7xl'>
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
            onClick={() => window.location.reload()}
            className='bg-[#ff0a54] hover:bg-[#ff0a54]/90 text-white'
          >
            تلاش مجدد
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className='container mx-auto max-w-7xl p-6'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className='mb-8'
      >
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
                <h1 className='text-3xl font-bold text-foreground mb-2'>
                  پروژه‌ها
                </h1>
                <p className='text-muted-foreground'>
                  مدیریت و نظارت بر پروژه‌های فعال
                </p>
              </div>

              <div className='flex items-center gap-3'>
                {canManageProjects && <CreateProject />}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Projects Grid */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'
      >
        {projects.map((project: Project, index: number) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 * index }}
          >
            <Card
              className='h-full bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all cursor-pointer group relative'
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
              onDoubleClick={() => handleProjectDoubleClick(project)}
              title={canManageProjects ? 'دابل کلیک برای ویرایش' : ''}
            >
              <CardHeader className='pb-3'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <CardTitle className='text-lg font-bold text-foreground mb-2 line-clamp-2'>
                      {project.name}
                    </CardTitle>
                    <CardDescription className='text-muted-foreground line-clamp-2'>
                      {project.description || 'بدون توضیحات'}
                    </CardDescription>
                  </div>
                  {canManageProjects && (
                    <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
                      <div className='text-muted-foreground text-xs'>
                        <Edit className='h-3 w-3' />
                      </div>
                      <DeleteProject project={project} />
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className='pt-0'>
                <div className='space-y-3'>
                  {/* Project Status */}
                  <div className='flex items-center gap-2'>
                    <div
                      className={cn(
                        'w-3 h-3 rounded-full',
                        project.status === 'ACTIVE' && 'bg-green-500',
                        project.status === 'PAUSED' && 'bg-yellow-500',
                        project.status === 'COMPLETED' && 'bg-blue-500',
                        project.status === 'CANCELLED' && 'bg-red-500'
                      )}
                    />
                    <span className='text-sm font-medium text-foreground'>
                      {project.status === 'ACTIVE' && 'فعال'}
                      {project.status === 'PAUSED' && 'متوقف'}
                      {project.status === 'COMPLETED' && 'تکمیل شده'}
                      {project.status === 'CANCELLED' && 'لغو شده'}
                    </span>
                  </div>

                  {/* Project Details */}
                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div className='flex items-center gap-2 text-muted-foreground'>
                      <Calendar className='h-4 w-4' />
                      <span>تاریخ شروع:</span>
                    </div>
                    <div className='text-foreground'>
                      {formatJalaliDate(project.startDate)}
                    </div>

                    <div className='flex items-center gap-2 text-muted-foreground'>
                      <FileText className='h-4 w-4' />
                      <span>وظایف:</span>
                    </div>
                    <div className='text-foreground'>
                      {project._count.tasks || 0} وظیفه
                    </div>

                    <div className='flex items-center gap-2 text-muted-foreground'>
                      <UserCheck className='h-4 w-4' />
                      <span>اعضا:</span>
                    </div>
                    <div className='text-foreground'>
                      {project._count.members || 0} عضو
                    </div>

                    <div className='flex items-center gap-2 text-muted-foreground'>
                      <Shield className='h-4 w-4' />
                      <span>سطح دسترسی:</span>
                    </div>
                    <div className='text-foreground'>
                      {project.accessLevel === 'PUBLIC' && 'عمومی'}
                      {project.accessLevel === 'PRIVATE' && 'خصوصی'}
                      {project.accessLevel === 'RESTRICTED' && 'محدود'}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className='flex items-center gap-2 pt-2'>
                    <Link href={`/projects/${project.id}`}>
                      <Button
                        variant='outline'
                        size='sm'
                        className='flex-1 bg-white/20 border-white/30 hover:bg-white/30 text-foreground'
                      >
                        مشاهده جزئیات
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className='flex justify-center'
        >
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            hasNextPage={pagination.hasNextPage}
            hasPreviousPage={pagination.hasPreviousPage}
          />
        </motion.div>
      )}

      {/* Empty State */}
      {projects.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className='text-center py-12'
        >
          <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <FileText className='h-8 w-8 text-gray-600' />
          </div>
          <h3 className='text-lg font-semibold text-foreground mb-2'>
            هیچ پروژه‌ای یافت نشد
          </h3>
          <p className='text-muted-foreground mb-6'>
            هنوز پروژه‌ای ایجاد نشده است
          </p>
          {canManageProjects && <CreateProject />}
        </motion.div>
      )}

      {/* Edit Project Dialog */}
      {editingProject && (
        <EditProject
          project={editingProject}
          open={isEditDialogOpen}
          onOpenChange={handleEditDialogClose}
        />
      )}
    </motion.div>
  );
};

// Export with dynamic import to prevent SSR issues
export default dynamic(() => Promise.resolve(ProjectsPageContent), {
  ssr: false,
  loading: () => (
    <div className='container mx-auto max-w-7xl p-6'>
      <div className='text-center py-12'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
        <p className='mt-3 text-muted-foreground'>
          در حال بارگذاری پروژه‌ها...
        </p>
      </div>
    </div>
  ),
});
