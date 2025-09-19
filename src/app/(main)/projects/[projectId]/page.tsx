'use client';

import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';

import KanbanBoard from '@/components/kanban/KanbanBoard';
import CreateTask from '@/components/tasks/CreateTask';
import {
  fetchProject,
  fetchTasks,
  projectsKeys,
  tasksKeys,
} from '@/lib/queries';

// Type definitions for project and task data
interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  accessLevel: string;
  createdAt: string;
  updatedAt: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: string;
  projectId: string;
  assignedTo: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

// Dynamic import to prevent SSR issues with TanStack Query
const ProjectPageContent = () => {
  const params = useParams();
  const projectId = params.projectId as string;

  // Use TanStack Query to fetch project data
  const {
    data: project,
    isLoading: projectLoading,
    isError: projectError,
  } = useQuery<Project>({
    queryKey: projectsKeys.detail(projectId),
    queryFn: async () => fetchProject(projectId) as Promise<Project>,
  });

  // Use TanStack Query to fetch tasks for the project
  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: tasksKeys.list(`projectId:${projectId}`),
    queryFn: async () => fetchTasks(projectId) as Promise<Task[]>,
    enabled: !!projectId,
  });

  // Filter tasks for this project
  const projectTasks = tasks;

  const isLoading = projectLoading || tasksLoading;
  const isError = projectError;

  if (isLoading) {
    return (
      <div className='bg-muted/30'>
        <div className='container mx-auto px-4 py-8'>
          <div className='text-center py-12'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
            <p className='mt-3 text-muted-foreground'>
              در حال بارگذاری پروژه...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !project) {
    notFound();
  }

  return (
    <div className='bg-muted/30'>
      <div className='container mx-auto px-4 py-8'>
        {/* Page Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-foreground mb-4'>
            {project.name}
          </h1>
          {project.description && (
            <p className='text-muted-foreground mb-6'>{project.description}</p>
          )}
          <CreateTask projectId={project.id} />
        </div>

        {/* Kanban Board */}
        <KanbanBoard projectId={project.id} tasks={projectTasks} />
      </div>
    </div>
  );
};

// Export with dynamic import to prevent SSR issues
export default dynamic(() => Promise.resolve(ProjectPageContent), {
  ssr: false,
  loading: () => (
    <div className='min-h-screen bg-muted/30'>
      <div className='container mx-auto px-4 py-8'>
        <div className='text-center py-12'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
          <p className='mt-3 text-muted-foreground'>در حال بارگذاری پروژه...</p>
        </div>
      </div>
    </div>
  ),
});
