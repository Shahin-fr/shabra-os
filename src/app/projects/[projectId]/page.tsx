"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import CreateTask from "@/components/tasks/CreateTask";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import { fetchProject, fetchTasks, projectsKeys, tasksKeys } from "@/lib/queries";

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  
  // Use TanStack Query to fetch project data
  const { data: project, isLoading: projectLoading, isError: projectError } = useQuery({
    queryKey: projectsKeys.detail(projectId),
    queryFn: () => fetchProject(projectId),
  });

  // Use TanStack Query to fetch tasks for the project
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: tasksKeys.list(`projectId:${projectId}`),
    queryFn: () => fetchTasks(),
    enabled: !!projectId,
  });

  // Filter tasks for this project
  const projectTasks = tasks.filter((task: any) => task.projectId === projectId);

  const isLoading = projectLoading || tasksLoading;
  const isError = projectError;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-3 text-muted-foreground">در حال بارگذاری پروژه...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">{project.name}</h1>
          {project.description && (
            <p className="text-muted-foreground mb-6">{project.description}</p>
          )}
          <CreateTask projectId={project.id} />
        </div>

        {/* Kanban Board */}
        <KanbanBoard projectId={project.id} tasks={projectTasks} />
      </div>
    </div>
  );
}
