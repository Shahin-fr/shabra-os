'use client';

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDroppable,
} from '@dnd-kit/core';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckSquare, Plus, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';
import { EditTaskModal } from '@/components/tasks/EditTaskModal';
import { TaskCard } from '@/components/tasks/TaskCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useMobile } from '@/hooks/useResponsive';
import { useUpdateTaskStatus } from '@/hooks/useUpdateTaskStatus';

// DroppableColumn component for drag & drop
function DroppableColumn({
  id,
  title,
  count,
  color,
  children,
}: {
  id: string;
  title: string;
  count: number;
  color: string;
  children: React.ReactNode;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-2 mb-4'>
        <div className={`w-3 h-3 rounded-full ${color}`}></div>
        <h3 className='font-semibold text-gray-900'>{title}</h3>
        <Badge
          variant='secondary'
          className={`${color.replace('bg-', 'bg-').replace('500', '100')} ${color.replace('bg-', 'text-').replace('500', '800')}`}
        >
          {count}
        </Badge>
      </div>
      <div
        ref={setNodeRef}
        className={`space-y-3 min-h-[400px] p-2 rounded-lg transition-colors ${
          isOver ? 'bg-pink-50 border-2 border-dashed border-pink-300' : ''
        }`}
      >
        {children}
      </div>
    </div>
  );
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'Todo' | 'InProgress' | 'Done';
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  assignedTo: string | null;
  projectId: string | null;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignee: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  project: {
    id: string;
    name: string;
  } | null;
}

const fetchTasks = async (): Promise<Task[]> => {
  const response = await fetch('/api/tasks');
  if (!response.ok) {
    throw new Error('خطا در دریافت وظایف');
  }
  return response.json();
};

export default function TasksPage() {
  const { data: session, status } = useSession();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const isMobile = useMobile();

  const {
    data: tasks = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
    enabled: status === 'authenticated',
  });

  const updateTaskStatus = useUpdateTaskStatus();

  // Group tasks by status
  const tasksByStatus = {
    Todo: tasks.filter(task => task.status === 'Todo'),
    InProgress: tasks.filter(task => task.status === 'InProgress'),
    Done: tasks.filter(task => task.status === 'Done'),
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setSelectedTask(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as 'Todo' | 'InProgress' | 'Done';
    const task = tasks.find(t => t.id === taskId);

    if (task && task.status !== newStatus) {
      updateTaskStatus.mutate({ taskId, status: newStatus });
    }
  };

  if (status === 'loading') {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='flex items-center gap-2'>
          <Loader2 className='h-6 w-6 animate-spin' />
          <span>در حال بارگذاری...</span>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <h2 className='text-xl font-semibold mb-2'>دسترسی غیرمجاز</h2>
              <p className='text-gray-600'>لطفاً وارد حساب کاربری خود شوید</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <h2 className='text-xl font-semibold mb-2 text-red-600'>خطا</h2>
              <p className='text-gray-600'>خطا در بارگذاری وظایف</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userRoles = session?.user?.roles || [];
  const isManager =
    userRoles.includes('MANAGER') || userRoles.includes('ADMIN');

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-pink-50/50 to-purple-50/30'>
      <div className='container mx-auto px-4 py-6'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-6'
        >
          <div className='flex items-center gap-3 mb-4'>
            <div className='p-2 bg-[#ff0a54]/10 rounded-xl'>
              <CheckSquare className='h-6 w-6 text-[#ff0a54]' />
            </div>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>مدیریت وظایف</h1>
              <p className='text-gray-600'>
                {isManager
                  ? 'مدیریت و پیگیری تسک‌های تیم'
                  : 'تسک‌های محول شده به شما'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className='flex justify-end'>
            {isManager && (
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className='bg-[#ff0a54] hover:bg-[#ff0a54]/90'
              >
                <Plus className='h-4 w-4 ml-2' />
                تسک جدید
              </Button>
            )}
          </div>
        </motion.div>

        {/* Main Content */}
        {tasks.length === 0 && !isLoading ? (
          // Empty State - Single page-level component
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='flex items-center justify-center min-h-[60vh]'
          >
            <div className='text-center'>
              <CheckSquare className='h-16 w-16 text-gray-300 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                هیچ تسکی یافت نشد
              </h3>
              <p className='text-gray-500 mb-4'>
                {isManager
                  ? 'هنوز هیچ تسکی ایجاد نشده است'
                  : 'هنوز هیچ تسکی به شما محول نشده است'}
              </p>
              {isManager && (
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className='bg-[#ff0a54] hover:bg-[#ff0a54]/90'
                >
                  <Plus className='h-4 w-4 ml-2' />
                  ایجاد تسک جدید
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          // Kanban Board - Only render if there are tasks
          <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            {isMobile ? (
              // Mobile view - simple list
              <div className='space-y-4'>
                {tasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={(taskId, status) =>
                      updateTaskStatus.mutate({ taskId, status })
                    }
                    onEdit={handleEditTask}
                    canEdit={isManager}
                  />
                ))}
              </div>
            ) : (
              // Desktop view - Kanban board
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                {/* Todo Column */}
                <DroppableColumn
                  id='Todo'
                  title='انجام نشده'
                  count={tasksByStatus.Todo.length}
                  color='bg-gray-500'
                >
                  {tasksByStatus.Todo.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={(taskId, status) =>
                        updateTaskStatus.mutate({ taskId, status })
                      }
                      onEdit={handleEditTask}
                      canEdit={isManager}
                    />
                  ))}
                </DroppableColumn>

                {/* In Progress Column */}
                <DroppableColumn
                  id='InProgress'
                  title='در حال انجام'
                  count={tasksByStatus.InProgress.length}
                  color='bg-yellow-500'
                >
                  {tasksByStatus.InProgress.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={(taskId, status) =>
                        updateTaskStatus.mutate({ taskId, status })
                      }
                      onEdit={handleEditTask}
                      canEdit={isManager}
                    />
                  ))}
                </DroppableColumn>

                {/* Done Column */}
                <DroppableColumn
                  id='Done'
                  title='انجام شده'
                  count={tasksByStatus.Done.length}
                  color='bg-green-500'
                >
                  {tasksByStatus.Done.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={(taskId, status) =>
                        updateTaskStatus.mutate({ taskId, status })
                      }
                      onEdit={handleEditTask}
                      canEdit={isManager}
                    />
                  ))}
                </DroppableColumn>
              </div>
            )}

            {/* Drag Overlay */}
            <DragOverlay>
              {activeTask ? (
                <div className='transition-transform duration-75 ease-out'>
                  <TaskCard
                    task={activeTask}
                    onStatusChange={(taskId, status) =>
                      updateTaskStatus.mutate({ taskId, status })
                    }
                    onEdit={handleEditTask}
                    canEdit={isManager}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

        {/* Create Task Modal */}
        {isCreateModalOpen && (
          <CreateTaskModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={() => {
              setIsCreateModalOpen(false);
              // The query will automatically refetch due to invalidation
            }}
          />
        )}

        {/* Edit Task Modal */}
        {isEditModalOpen && selectedTask && (
          <EditTaskModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSuccess={handleEditSuccess}
            task={selectedTask}
          />
        )}
      </div>
    </div>
  );
}
