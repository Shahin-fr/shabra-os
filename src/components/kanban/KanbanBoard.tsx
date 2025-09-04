'use client';

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';

import { updateTaskStatus } from '@/app/actions/task-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { tasksKeys } from '@/lib/queries';
import { showStatusMessage } from '@/lib/utils';
import { useMobile } from '@/hooks/useResponsive';

import DroppableColumn from './DroppableColumn';

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
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
  status: Task['status'];
}

const columns: Column[] = [
  { id: 'todo', title: 'برای انجام', status: 'PENDING' },
  { id: 'in-progress', title: 'در حال انجام', status: 'IN_PROGRESS' },
  { id: 'completed', title: 'انجام شده', status: 'COMPLETED' },
];

export default function KanbanBoard({ projectId, tasks }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const queryClient = useQueryClient();
  const isMobile = useMobile();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Optimistic update mutation for task status changes
  const updateTaskStatusMutation = useMutation({
    mutationFn: ({
      taskId,
      newStatus,
    }: {
      taskId: string;
      newStatus: Task['status'];
    }) => updateTaskStatus(taskId, newStatus as any, projectId),

    onMutate: async ({ taskId, newStatus }) => {
      // Cancel any outgoing refetches for tasks
      await queryClient.cancelQueries({
        queryKey: tasksKeys.list(`projectId:${projectId}`),
      });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData(
        tasksKeys.list(`projectId:${projectId}`)
      );

      // Optimistically update the cache
      queryClient.setQueryData(
        tasksKeys.list(`projectId:${projectId}`),
        (old: Task[] | undefined) => {
          if (!old) return old;
          return old.map(task =>
            task.id === taskId ? { ...task, status: newStatus } : task
          );
        }
      );

      // Show loading message
      showStatusMessage('در حال جابجایی...', 2000);

      // Return a context object with the snapshotted value
      return { previousTasks };
    },

    onError: (_err, { taskId: _taskId, newStatus: _newStatus }, context) => {
      // Rollback on error using the context from onMutate
      if (context?.previousTasks) {
        queryClient.setQueryData(
          tasksKeys.list(`projectId:${projectId}`),
          context.previousTasks
        );
      }
      showStatusMessage('خطا در جابجایی وظیفه', 3000);
    },

    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: tasksKeys.list(`projectId:${projectId}`),
      });
    },
  });

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const task = tasks.find(t => t.id === active.id);
      if (task) {
        const newStatus = over.id as Task['status'];
        updateTaskStatusMutation.mutate({
          taskId: task.id,
          newStatus,
        });
      }
    }

    setActiveTask(null);
  };

  // Group tasks by status for mobile vertical layout
  const tasksByStatus = useMemo(() => {
    const grouped = {
      PENDING: tasks.filter(task => task.status === 'PENDING'),
      IN_PROGRESS: tasks.filter(task => task.status === 'IN_PROGRESS'),
      COMPLETED: tasks.filter(task => task.status === 'COMPLETED'),
    };
    return grouped;
  }, [tasks]);

  // Mobile layout with vertical stacking
  if (isMobile) {
    return (
      <div className='space-y-6'>
        <div className='text-center mb-6'>
          <h2 className='text-2xl font-bold text-foreground mb-2'>
            مدیریت وظایف
          </h2>
          <p className='text-muted-foreground'>
            وظایف پروژه را به صورت عمودی مدیریت کنید
          </p>
        </div>

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Mobile Vertical Layout */}
          <div className='space-y-6'>
            {columns.map(column => (
              <div key={column.id} className='w-full'>
                <Card
                  className='w-full'
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
                  <CardHeader className='pb-4'>
                    <CardTitle className='text-lg font-semibold text-center text-foreground'>
                      {column.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='pt-0'>
                    <DroppableColumn
                      id={column.id}
                      title={column.title}
                      tasks={
                        tasksByStatus[
                          column.status as keyof typeof tasksByStatus
                        ] || []
                      }
                      projectId={projectId}
                      isMobile={true}
                    />
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className='bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-white/20'>
                <h3 className='font-semibold text-foreground'>
                  {activeTask.title}
                </h3>
                {activeTask.description && (
                  <p className='text-sm text-muted-foreground mt-1'>
                    {activeTask.description}
                  </p>
                )}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    );
  }

  // Desktop horizontal layout
  return (
    <div className='space-y-6'>
      <div className='text-center mb-6'>
        <h2 className='text-2xl font-bold text-foreground mb-2'>
          مدیریت وظایف
        </h2>
        <p className='text-muted-foreground'>
          وظایف پروژه را به صورت افقی مدیریت کنید
        </p>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Desktop Horizontal Layout */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {columns.map(column => (
            <DroppableColumn
              key={column.id}
              id={column.id}
              title={column.title}
              tasks={
                tasksByStatus[column.status as keyof typeof tasksByStatus] || []
              }
              projectId={projectId}
              isMobile={false}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className='bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-white/20'>
              <h3 className='font-semibold text-foreground'>
                {activeTask.title}
              </h3>
              {activeTask.description && (
                <p className='text-sm text-muted-foreground mt-1'>
                  {activeTask.description}
                </p>
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
