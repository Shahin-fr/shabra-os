'use client';

import { AnimatePresence } from 'framer-motion';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import {
  CheckSquare,
  Clock,
  AlertCircle,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  Flag,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { Separator } from '@/components/ui/separator';
import { SkeletonTaskListStaggered } from '@/components/ui/skeleton-loaders';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

// Task status configuration
const statusConfig = {
  TODO: {
    label: 'در انتظار',
    color: 'bg-gray-100 text-gray-800',
    icon: Clock,
    swipeAction: 'start',
    swipeColor: 'bg-blue-500',
  },
  IN_PROGRESS: {
    label: 'در حال انجام',
    color: 'bg-blue-100 text-blue-800',
    icon: AlertCircle,
    swipeAction: 'complete',
    swipeColor: 'bg-green-500',
  },
  COMPLETED: {
    label: 'تکمیل شده',
    color: 'bg-green-100 text-green-800',
    icon: CheckSquare,
    swipeAction: 'reopen',
    swipeColor: 'bg-orange-500',
  },
};

// Priority configuration
const priorityConfig = {
  HIGH: {
    label: 'بالا',
    color: 'bg-red-100 text-red-800',
    icon: Flag,
  },
  MEDIUM: {
    label: 'متوسط',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Flag,
  },
  LOW: {
    label: 'پایین',
    color: 'bg-green-100 text-green-800',
    icon: Flag,
  },
};

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

interface MobileTaskListProps {
  tasks: Task[];
  onStatusChange: (_taskId: string, _status: Task['status']) => void;
  onTaskSelect: (_task: Task) => void;
  onCreateTask: () => void;
  onRefresh?: () => Promise<void> | void;
  isLoading?: boolean;
  className?: string;
}

export function MobileTaskList({
  tasks,
  onStatusChange,
  onTaskSelect,
  onCreateTask,
  onRefresh,
  isLoading = false,
  className: _className,
}: MobileTaskListProps) {
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(
    null
  );
  const [swipeProgress, setSwipeProgress] = useState(0);
  const { hapticSuccess, hapticLight } = useHapticFeedback();

  const handleTaskPress = (task: Task) => {
    if (expandedTask === task.id) {
      setExpandedTask(null);
    } else {
      setExpandedTask(task.id);
    }
  };

  const handleSwipeStart = (direction: 'left' | 'right') => {
    setSwipeDirection(direction);
  };

  const handleSwipeMove = (progress: number) => {
    setSwipeProgress(progress);
  };

  const handleSwipeEnd = (task: Task, direction: 'left' | 'right') => {
    const config = statusConfig[task.status];

    if (direction === 'right' && config.swipeAction === 'start') {
      onStatusChange(task.id, 'IN_PROGRESS');
      hapticSuccess();
    } else if (direction === 'left' && config.swipeAction === 'complete') {
      onStatusChange(task.id, 'COMPLETED');
      hapticSuccess();
    } else if (direction === 'left' && config.swipeAction === 'reopen') {
      onStatusChange(task.id, 'TODO');
      hapticSuccess();
    } else {
      hapticLight();
    }

    setSwipeDirection(null);
    setSwipeProgress(0);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getSwipeActionText = (task: Task, direction: 'left' | 'right') => {
    const config = statusConfig[task.status];

    if (direction === 'right' && config.swipeAction === 'start') {
      return 'شروع';
    } else if (direction === 'left' && config.swipeAction === 'complete') {
      return 'تکمیل';
    } else if (direction === 'left' && config.swipeAction === 'reopen') {
      return 'بازگشایی';
    }
    return '';
  };

  return (
    <div className={`space-y-3 ${_className || ''}`}>
      {/* Header with Create Button */}
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-lg font-semibold text-gray-900'>وظایف من</h2>
        <Button
          onClick={onCreateTask}
          size='sm'
          className='bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-2'
        >
          <CheckSquare className='h-4 w-4 mr-2' />
          وظیفه جدید
        </Button>
      </div>

      {/* Task List with Pull-to-Refresh */}
      <PullToRefresh
        onRefresh={onRefresh || (() => Promise.resolve())}
        enabled={!!onRefresh}
        showSuccessFeedback={true}
      >
        <div className='space-y-3'>
          {/* Loading State */}
          {isLoading ? (
            <SkeletonTaskListStaggered count={5} />
          ) : (
            <>
              {tasks.map(task => {
                const statusInfo =
                  statusConfig[task.status] || statusConfig.TODO;
                const priorityInfo =
                  priorityConfig[task.priority] || priorityConfig.MEDIUM;
                const isExpanded = expandedTask === task.id;
                const StatusIcon = statusInfo.icon;
                const PriorityIcon = priorityInfo.icon;

                return (
                  <OptimizedMotion
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 30,
                    }}
                    className='relative'
                  >
                    {/* Swipe Action Overlay */}
                    <AnimatePresence>
                      {swipeDirection && (
                        <OptimizedMotion
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={`absolute inset-0 z-10 flex items-center justify-center rounded-xl ${
                            swipeDirection === 'right'
                              ? 'bg-blue-500'
                              : 'bg-green-500'
                          }`}
                          style={{
                            transform: `translateX(${
                              swipeDirection === 'right'
                                ? swipeProgress * 100
                                : -swipeProgress * 100
                            }%)`,
                          }}
                        >
                          <span className='text-white font-medium text-lg'>
                            {getSwipeActionText(task, swipeDirection)}
                          </span>
                        </OptimizedMotion>
                      )}
                    </AnimatePresence>

                    {/* Task Card */}
                    <OptimizedMotion
                      whileTap={{ scale: 0.98 }}
                      whileHover={{ scale: 1.02 }}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 25,
                      }}
                    >
                      <Card
                        className={`relative overflow-hidden transition-all duration-200 ${
                          isExpanded ? 'shadow-lg' : 'shadow-sm'
                        }`}
                        onTouchStart={e => {
                          const startX = e.touches[0]?.clientX || 0;
                          const startY = e.touches[0]?.clientY || 0;

                          const handleTouchMove = (moveEvent: TouchEvent) => {
                            const currentX = moveEvent.touches[0]?.clientX || 0;
                            const currentY = moveEvent.touches[0]?.clientY || 0;
                            const deltaX = currentX - startX;
                            const deltaY = currentY - startY;

                            // Only handle horizontal swipes
                            if (
                              Math.abs(deltaX) > Math.abs(deltaY) &&
                              Math.abs(deltaX) > 20
                            ) {
                              const direction = deltaX > 0 ? 'right' : 'left';
                              const progress = Math.min(
                                Math.abs(deltaX) / 150,
                                1
                              );

                              handleSwipeStart(direction);
                              handleSwipeMove(progress);
                            }
                          };

                          const handleTouchEnd = () => {
                            if (swipeDirection) {
                              handleSwipeEnd(task, swipeDirection);
                            }
                            document.removeEventListener(
                              'touchmove',
                              handleTouchMove
                            );
                            document.removeEventListener(
                              'touchend',
                              handleTouchEnd
                            );
                          };

                          document.addEventListener(
                            'touchmove',
                            handleTouchMove
                          );
                          document.addEventListener('touchend', handleTouchEnd);
                        }}
                        onClick={() => handleTaskPress(task)}
                      >
                        <CardHeader className='pb-3'>
                          <div className='flex items-start justify-between'>
                            <div className='flex-1 min-w-0'>
                              <h3 className='font-medium text-gray-900 truncate'>
                                {task.title}
                              </h3>
                              <p className='text-sm text-gray-600 mt-1 line-clamp-2'>
                                {task.description}
                              </p>
                            </div>

                            <div className='flex items-center space-x-2 space-x-reverse'>
                              <Badge className={statusInfo.color}>
                                <StatusIcon className='h-3 w-3 mr-1' />
                                {statusInfo.label}
                              </Badge>
                              <Badge className={priorityInfo.color}>
                                <PriorityIcon className='h-3 w-3 mr-1' />
                                {priorityInfo.label}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>

                        {/* Task Meta Information */}
                        <CardContent className='pt-0'>
                          <div className='flex items-center justify-between text-sm text-gray-500'>
                            <div className='flex items-center space-x-4 space-x-reverse'>
                              {task.assignee && (
                                <div className='flex items-center'>
                                  <User className='h-4 w-4 mr-1' />
                                  <span>{task.assignee.name}</span>
                                </div>
                              )}
                              {task.dueDate && (
                                <div className='flex items-center'>
                                  <Calendar className='h-4 w-4 mr-1' />
                                  <span>{formatDate(task.dueDate)}</span>
                                </div>
                              )}
                            </div>

                            <Button
                              variant='ghost'
                              size='sm'
                              className='h-8 w-8 p-0'
                              onClick={e => {
                                e.stopPropagation();
                                onTaskSelect(task);
                              }}
                            >
                              {isExpanded ? (
                                <ChevronUp className='h-4 w-4' />
                              ) : (
                                <ChevronDown className='h-4 w-4' />
                              )}
                            </Button>
                          </div>

                          {/* Expanded Content */}
                          <AnimatePresence>
                            {isExpanded && (
                              <OptimizedMotion
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className='overflow-hidden'
                              >
                                <Separator className='my-3' />

                                <div className='space-y-3'>
                                  {/* Tags */}
                                  {task.tags && task.tags.length > 0 && (
                                    <div>
                                      <h4 className='text-sm font-medium text-gray-700 mb-2'>
                                        برچسب‌ها
                                      </h4>
                                      <div className='flex flex-wrap gap-2'>
                                        {task.tags.map(tag => (
                                          <Badge
                                            key={tag}
                                            variant='outline'
                                            className='text-xs'
                                          >
                                            {tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Task Details */}
                                  <div className='grid grid-cols-2 gap-4 text-sm'>
                                    <div>
                                      <span className='text-gray-500'>
                                        ایجاد شده:
                                      </span>
                                      <p className='font-medium'>
                                        {formatDate(task.createdAt)}
                                      </p>
                                    </div>
                                    <div>
                                      <span className='text-gray-500'>
                                        آخرین بروزرسانی:
                                      </span>
                                      <p className='font-medium'>
                                        {formatDate(task.updatedAt)}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className='flex space-x-2 space-x-reverse pt-2'>
                                    <Button
                                      size='sm'
                                      variant='outline'
                                      className='flex-1'
                                      onClick={e => {
                                        e.stopPropagation();
                                        onTaskSelect(task);
                                      }}
                                    >
                                      مشاهده جزئیات
                                    </Button>
                                    <Button
                                      size='sm'
                                      className='flex-1'
                                      onClick={e => {
                                        e.stopPropagation();
                                        // Handle quick action based on status
                                        const nextStatus =
                                          task.status === 'TODO'
                                            ? 'IN_PROGRESS'
                                            : task.status === 'IN_PROGRESS'
                                              ? 'COMPLETED'
                                              : 'TODO';
                                        onStatusChange(task.id, nextStatus);
                                      }}
                                    >
                                      {task.status === 'TODO'
                                        ? 'شروع'
                                        : task.status === 'IN_PROGRESS'
                                          ? 'تکمیل'
                                          : 'بازگشایی'}
                                    </Button>
                                  </div>
                                </div>
                              </OptimizedMotion>
                            )}
                          </AnimatePresence>
                        </CardContent>
                      </Card>
                    </OptimizedMotion>
                  </OptimizedMotion>
                );
              })}
            </>
          )}
        </div>
      </PullToRefresh>

      {/* Empty State */}
      {!isLoading && tasks.length === 0 && (
        <OptimizedMotion
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center py-12'
        >
          <CheckSquare className='h-12 w-12 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            هیچ وظیفه‌ای یافت نشد
          </h3>
          <p className='text-gray-500 mb-4'>اولین وظیفه خود را ایجاد کنید</p>
          <Button
            onClick={onCreateTask}
            className='bg-blue-600 hover:bg-blue-700'
          >
            <CheckSquare className='h-4 w-4 mr-2' />
            ایجاد وظیفه جدید
          </Button>
        </OptimizedMotion>
      )}
    </div>
  );
}

