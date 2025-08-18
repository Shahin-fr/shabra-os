import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CreateTask from "@/components/tasks/CreateTask";
import KanbanBoard from "@/components/kanban/KanbanBoard";

interface ProjectPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;
  
  // Fetch the project with its tasks
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
    include: {
      tasks: {
        orderBy: {
          createdAt: 'desc'
        }
      },
    },
  });

  // If project not found, return 404
  if (!project) {
    notFound();
  }

  // Filter tasks to only include those that belong to this project and cast to correct type
  const projectTasks = project.tasks
    .filter(task => task.projectId === project.id)
    .map(task => ({
      ...task,
      projectId: task.projectId as string
    }));

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
