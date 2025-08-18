"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DroppableColumn from "./DroppableColumn";

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  assignedTo?: string | null;
  projectId: string;
}

interface KanbanBoardProps {
  projectId: string;
  tasks: Task[];
}

interface Column {
  id: string;
  title: string;
  status: Task["status"];
}

const columns: Column[] = [
  { id: "todo", title: "برای انجام", status: "PENDING" },
  { id: "in-progress", title: "در حال انجام", status: "IN_PROGRESS" },
  { id: "completed", title: "انجام شده", status: "COMPLETED" },
];

export default function KanbanBoard({ projectId, tasks }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const columnId = over.id as string;
    const column = columns.find((col) => col.id === columnId);

    if (!column) return;

    // Don't update if the task is already in the correct column
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status === column.status) return;

    setIsUpdating(true);

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: column.status,
        }),
      });

      if (!response.ok) {
        throw new Error("خطا در بروزرسانی وظیفه");
      }

      // Refresh the page to show updated state
      router.refresh();
    } catch (error) {
      console.error("Error updating task:", error);
      alert("خطا در بروزرسانی وظیفه. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsUpdating(false);
    }
  };

  const getTasksForColumn = (status: Task["status"]) => {
    return tasks.filter((task) => task.status === status);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 h-full">
        {columns.map((column) => {
          const columnTasks = getTasksForColumn(column.status);
          
          return (
            <DroppableColumn
              key={column.id}
              id={column.id}
              title={column.title}
              tasks={columnTasks}
              projectId={projectId}
            />
          );
        })}
      </div>

             <DragOverlay>
         {activeTask ? (
           <Card className="cursor-pointer shadow-2xl border-pink-400 bg-gradient-to-br from-pink-100 via-white to-pink-50 transform rotate-2">
            <CardHeader className="pb-3">
                             <CardTitle className="text-sm font-medium text-pink-700">
                 {activeTask.title}
               </CardTitle>
            </CardHeader>
            {activeTask.description && (
              <CardContent className="pt-0">
                <p className="text-xs text-gray-600">
                  {activeTask.description}
                </p>
              </CardContent>
            )}
          </Card>
        ) : null}
      </DragOverlay>

             {isUpdating && (
         <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
           <div className="bg-gradient-to-br from-white to-pink-50 rounded-lg p-6 shadow-xl border border-pink-200">
             <div className="text-center">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-2"></div>
               <p className="text-gray-600">در حال بروزرسانی...</p>
             </div>
           </div>
         </div>
       )}
    </DndContext>
  );
}
