'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import CreateTask from '@/components/tasks/CreateTask';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  assignedTo?: string | null;
  projectId: string;
}

interface DraggableTaskProps {
  task: Task;
  projectId: string;
  isMobile?: boolean;
}

export default function DraggableTask({
  task,
  projectId,
  isMobile = false,
}: DraggableTaskProps) {
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

  if (isMobile) {
    // Mobile layout - simplified card design
    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <CreateTask
          projectId={projectId}
          mode='view'
          taskData={{
            title: task.title,
            description: task.description || '',
            assignedTo: task.assignedTo || '',
          }}
          trigger={
            <Card
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-[#ff0a54] bg-gradient-to-br from-white/80 via-pink-50/80 to-white/80 border border-pink-200/50 transform hover:-translate-y-1 w-full ${
                isDragging ? 'opacity-50 shadow-xl scale-105' : ''
              }`}
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: `
                  0 8px 25px rgba(0, 0, 0, 0.1),
                  0 4px 15px rgba(255, 10, 84, 0.1),
                  inset 0 1px 0 rgba(255, 255, 255, 0.4)
                `,
              }}
            >
              <CardHeader className='pb-3 px-4 py-3'>
                <CardTitle className='text-base font-medium text-foreground'>
                  {task.title}
                </CardTitle>
              </CardHeader>
              {task.description && (
                <CardContent className='pt-0 px-4 pb-3'>
                  <p className='text-sm text-muted-foreground'>
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

  // Desktop layout - original design
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <CreateTask
        projectId={projectId}
        mode='view'
        taskData={{
          title: task.title,
          description: task.description || '',
          assignedTo: task.assignedTo || '',
        }}
        trigger={
          <Card
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-pink-400 bg-gradient-to-br from-white via-pink-50 to-white border border-pink-200 transform hover:-translate-y-1 ${
              isDragging ? 'opacity-50 shadow-xl scale-105' : ''
            }`}
          >
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm font-medium text-pink-700'>
                {task.title}
              </CardTitle>
            </CardHeader>
            {task.description && (
              <CardContent className='pt-0'>
                <p className='text-xs text-gray-600'>{task.description}</p>
              </CardContent>
            )}
          </Card>
        }
      />
    </div>
  );
}
