"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CreateTask from "@/components/tasks/CreateTask";

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  assignedTo?: string | null;
  projectId: string;
}

interface DraggableTaskProps {
  task: Task;
  projectId: string;
}

export default function DraggableTask({ task, projectId }: DraggableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <CreateTask
        projectId={projectId}
        mode="view"
        taskData={{
          title: task.title,
          description: task.description || "",
          assignedTo: task.assignedTo || "",
        }}
        trigger={
                     <Card 
             className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-pink-400 bg-gradient-to-br from-white via-pink-50 to-white border border-pink-200 transform hover:-translate-y-1 ${
               isDragging ? "opacity-50 shadow-xl scale-105" : ""
             }`}
           >
            <CardHeader className="pb-3">
                             <CardTitle className="text-sm font-medium text-pink-700">
                 {task.title}
               </CardTitle>
            </CardHeader>
            {task.description && (
              <CardContent className="pt-0">
                <p className="text-xs text-gray-600">
                  {task.description}
                </p>
              </CardContent>
            )}
          </Card>
        }
      />
    </div>
  );
}
