'use client';

import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { Calendar, User, GripVertical } from 'lucide-react';
import React, { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatJalaliDate } from '@/lib/dateUtils';

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

interface TaskCardProps {
  task: Task;
  onStatusChange: (
    _taskId: string,
    _status: 'Todo' | 'InProgress' | 'Done'
  ) => void;
  onEdit?: (_task: Task) => void;
  isDragging?: boolean;
  canEdit?: boolean;
}

const statusConfig = {
  Todo: {
    label: 'انجام نشده',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    dotColor: 'bg-gray-500',
  },
  InProgress: {
    label: 'در حال انجام',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    dotColor: 'bg-yellow-500',
  },
  Done: {
    label: 'انجام شده',
    color: 'bg-green-100 text-green-800 border-green-200',
    dotColor: 'bg-green-500',
  },
};

export function TaskCard({
  task,
  onStatusChange,
  onEdit,
  isDragging = false,
  canEdit = false,
}: TaskCardProps) {
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isDraggingState,
  } = useDraggable({
    id: task.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const currentStatusConfig = statusConfig[task.status];
  const otherStatuses = Object.keys(statusConfig).filter(
    status => status !== task.status
  ) as ('Todo' | 'InProgress' | 'Done')[];

  const handleStatusChange = (newStatus: 'Todo' | 'InProgress' | 'Done') => {
    onStatusChange(task.id, newStatus);
    setIsStatusMenuOpen(false);
  };

  const handleDoubleClick = () => {
    if (canEdit && onEdit) {
      onEdit(task);
    }
  };

  const handleStatusBadgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canEdit) {
      setIsStatusMenuOpen(true);
    }
  };

  const handleDragHandleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const getAssigneeName = () => {
    if (task.assignee) {
      return `${task.assignee.firstName} ${task.assignee.lastName}`;
    }
    return 'محول نشده';
  };

  const getCreatorName = () => {
    return `${task.creator.firstName} ${task.creator.lastName}`;
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`${isDragging || isDraggingState ? 'opacity-50' : ''}`}
    >
      <Card
        className={`hover:shadow-lg transition-all duration-200 border-l-4 border-l-[#ff0a54] ${
          canEdit ? 'cursor-pointer' : ''
        } ${isDragging || isDraggingState ? 'opacity-0' : ''}`}
        onDoubleClick={handleDoubleClick}
      >
        <CardHeader className='pb-3'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <CardTitle className='text-lg font-semibold text-gray-900 mb-2 line-clamp-2'>
                {task.title}
              </CardTitle>
              {task.description && (
                <p className='text-sm text-gray-600 mb-3 line-clamp-2'>
                  {task.description}
                </p>
              )}
            </div>

            {/* Drag Handle - Only the grip icon is draggable */}
            <div
              {...listeners}
              {...attributes}
              onClick={handleDragHandleClick}
              className='cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded'
            >
              <GripVertical className='h-4 w-4 text-gray-500' />
            </div>
          </div>
        </CardHeader>

        <CardContent className='pt-0'>
          {/* Status Badge with Dropdown */}
          <div className='flex items-center gap-2 mb-3'>
            <div
              className={`w-2 h-2 rounded-full ${currentStatusConfig.dotColor}`}
            />
            <DropdownMenu
              open={isStatusMenuOpen}
              onOpenChange={setIsStatusMenuOpen}
            >
              <DropdownMenuTrigger asChild>
                <Badge
                  className={`${currentStatusConfig.color} border ${
                    canEdit
                      ? 'cursor-pointer hover:opacity-80 transition-opacity'
                      : 'cursor-default'
                  }`}
                  onClick={handleStatusBadgeClick}
                >
                  {currentStatusConfig.label}
                </Badge>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='start' className='w-48'>
                {otherStatuses.map(status => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className='cursor-pointer'
                  >
                    <div className='flex items-center gap-2'>
                      <div
                        className={`w-2 h-2 rounded-full ${statusConfig[status].dotColor}`}
                      />
                      {statusConfig[status].label}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Task Details */}
          <div className='space-y-2 text-sm text-gray-600'>
            {task.project && (
              <div className='flex items-center gap-2'>
                <div className='w-1 h-1 bg-gray-400 rounded-full' />
                <span>پروژه: {task.project.name}</span>
              </div>
            )}

            <div className='flex items-center gap-2'>
              <User className='h-3 w-3' />
              <span>مسئول: {getAssigneeName()}</span>
            </div>

            <div className='flex items-center gap-2'>
              <User className='h-3 w-3' />
              <span>ایجادکننده: {getCreatorName()}</span>
            </div>

            {task.dueDate && (
              <div className='flex items-center gap-2'>
                <Calendar className='h-3 w-3' />
                <span>مهلت: {formatJalaliDate(task.dueDate)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
