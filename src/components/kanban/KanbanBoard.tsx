"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useStatusStore } from "@/stores/statusStore";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DroppableColumn from "./DroppableColumn";
import { updateTaskStatus } from "@/app/actions/task-actions";

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
  // Local state for optimistic updates
  const [optimisticTasks, setOptimisticTasks] = useState<Task[]>(tasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  // Sync optimistic tasks with props when tasks change
  useEffect(() => {
    setOptimisticTasks(tasks);
  }, [tasks]);
  
  // Global status store
  const { setStatus } = useStatusStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = optimisticTasks.find((t) => t.id === event.active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const columnId = over.id as string;
    const column = columns.find((col) => col.id === columnId);

    if (!column) return;

    // Don't update if the task is already in the correct column
    const task = optimisticTasks.find((t) => t.id === taskId);
    if (task && task.status === column.status) return;

    // Store the original task for potential rollback
    const originalTask = task;

    // Show loading state
    setStatus('loading', 'در حال بروزرسانی وظیفه...');

    // OPTIMISTIC UPDATE: Immediately update the local state
    setOptimisticTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id === taskId ? { ...t, status: column.status } : t
      )
    );

    // Call the server action in the background (non-blocking)
    const result = await updateTaskStatus(taskId, column.status, projectId);

    // Handle the result
    if (!result.success) {
      // ROLLBACK: Revert the optimistic update on error
      setOptimisticTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === taskId ? originalTask! : t
        )
      );
      
      // Show error notification via global status
      setStatus('error', result.error || "خطا در بروزرسانی وظیفه");
    } else {
      // Success notification via global status
      setStatus('success', "وظیفه با موفقیت بروزرسانی شد");
    }
  }, [optimisticTasks, projectId, setStatus]);

  // Memoize column tasks to prevent recalculation on every render
  const columnTasks = useMemo(() => ({
    PENDING: optimisticTasks.filter(t => t.status === "PENDING"),
    IN_PROGRESS: optimisticTasks.filter(t => t.status === "IN_PROGRESS"),
    COMPLETED: optimisticTasks.filter(t => t.status === "COMPLETED")
  }), [optimisticTasks]);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 h-full">
        {columns.map((column) => {
          const tasksForColumn = columnTasks[column.status];
          
          return (
            <DroppableColumn
              key={column.id}
              id={column.id}
              title={column.title}
              tasks={tasksForColumn}
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
    </DndContext>
  );
}
