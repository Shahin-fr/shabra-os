'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import DraggableTask from './DraggableTask';

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  assignedTo?: string | null;
  projectId: string;
}

interface DroppableColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  projectId: string;
  isMobile?: boolean;
}

export default function DroppableColumn({
  id,
  title,
  tasks,
  projectId,
  isMobile = false,
}: DroppableColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  if (isMobile) {
    // Mobile layout - simplified column without card wrapper
    return (
      <div className='w-full'>
        <div ref={setNodeRef}>
          <SortableContext
            items={tasks.map(task => task.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className='space-y-3'>
              {tasks.map(task => (
                <DraggableTask
                  key={task.id}
                  task={task}
                  projectId={projectId}
                  isMobile={true}
                />
              ))}
              {tasks.length === 0 && (
                <div className='text-center py-8 text-gray-400 text-sm border-2 border-dashed border-pink-300 rounded-lg bg-pink-50/50'>
                  {id === 'todo' && 'وظیفه‌ای برای انجام وجود ندارد'}
                  {id === 'in-progress' && 'وظیفه‌ای در حال انجام وجود ندارد'}
                  {id === 'completed' && 'وظیفه‌ای انجام شده وجود ندارد'}
                </div>
              )}
            </div>
          </SortableContext>
        </div>
      </div>
    );
  }

  // Desktop layout - with card wrapper
  return (
    <div className='flex-1'>
      <div className='bg-gradient-to-b from-white to-pink-50 rounded-lg p-4 h-full shadow-sm border border-pink-200'>
        <h2 className='text-lg font-semibold mb-4 text-center text-pink-700'>
          {title}
        </h2>
        <div ref={setNodeRef}>
          <SortableContext
            items={tasks.map(task => task.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className='space-y-3'>
              {tasks.map(task => (
                <DraggableTask
                  key={task.id}
                  task={task}
                  projectId={projectId}
                  isMobile={false}
                />
              ))}
              {tasks.length === 0 && (
                <div className='text-center py-8 text-gray-400 text-sm border-2 border-dashed border-pink-300 rounded-lg bg-pink-50/50'>
                  {id === 'todo' && 'وظیفه‌ای برای انجام وجود ندارد'}
                  {id === 'in-progress' && 'وظیفه‌ای در حال انجام وجود ندارد'}
                  {id === 'completed' && 'وظیفه‌ای انجام شده وجود ندارد'}
                </div>
              )}
            </div>
          </SortableContext>
        </div>
      </div>
    </div>
  );
}

