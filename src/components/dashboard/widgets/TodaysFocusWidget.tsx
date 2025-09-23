'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Circle, Clock, Calendar, Play, Pause, Eye, Edit3 } from 'lucide-react';
import { WidgetCard } from './WidgetCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'Todo' | 'InProgress' | 'Done';
  dueDate?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  project?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface TodaysFocusWidgetProps {
  className?: string;
  variant?: 'mobile' | 'desktop';
}

export function TodaysFocusWidget({ className, variant = 'desktop' }: TodaysFocusWidgetProps) {
  const queryClient = useQueryClient();
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks', 'today'],
    queryFn: async (): Promise<Task[]> => {
      const response = await fetch('/api/tasks');
      
      if (!response.ok) {
        throw new Error('Failed to fetch today\'s tasks');
      }
      
      const data = await response.json();
      
      // Filter tasks for today and relevant statuses
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todayTasks = data.filter((task: any) => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        return taskDate >= today && taskDate < tomorrow && 
               (task.status === 'Todo' || task.status === 'InProgress' || task.status === 'Done');
      });
      
      return todayTasks;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Update task status mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update task status');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'today'] });
      const statusText = variables.status === 'Done' ? 'تکمیل' : 
                        variables.status === 'InProgress' ? 'شروع' : 'بازگشت';
      toast.success(`تسک ${statusText} شد`);
    },
    onError: () => {
      toast.error('خطا در به‌روزرسانی تسک');
    },
  });

  const handleStatusChange = (taskId: string, newStatus: string) => {
    updateTaskMutation.mutate({ taskId, status: newStatus });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'text-red-600 bg-red-100';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-100';
      case 'LOW':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'بالا';
      case 'MEDIUM':
        return 'متوسط';
      case 'LOW':
        return 'پایین';
      default:
        return 'نامشخص';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done':
        return 'text-green-600 bg-green-100';
      case 'InProgress':
        return 'text-blue-600 bg-blue-100';
      case 'Todo':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Done':
        return 'انجام شده';
      case 'InProgress':
        return 'در حال انجام';
      case 'Todo':
        return 'انجام نشده';
      default:
        return 'نامشخص';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Done':
        return <CheckCircle className="h-4 w-4" />;
      case 'InProgress':
        return <Play className="h-4 w-4" />;
      case 'Todo':
        return <Circle className="h-4 w-4" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // const isMobile = variant === 'mobile';
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const completedTasks = safeTasks.filter(task => task.status === 'Done').length;
  const totalTasks = safeTasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  if (isLoading) {
    return (
      <WidgetCard
        title="تسک ها امروز"
        className={cn(
          'bg-gradient-to-br from-blue-50 to-indigo-50',
          className
        )}
        loading={true}
        variant={variant}
      />
    );
  }

  if (error) {
    return (
      <WidgetCard
        title="تسک ها امروز"
        className={cn(
          'bg-gradient-to-br from-red-50 to-pink-50',
          className
        )}
        variant={variant}
      >
        <div className="text-center py-4">
          <p className="text-red-600 text-sm">خطا در بارگذاری تسک‌ها</p>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard
      title="تسک ها امروز"
      className={cn(
        'bg-gradient-to-br from-blue-50 to-indigo-50',
        className
      )}
      variant={variant}
    >
      <div className="space-y-4">
        {/* Progress Header */}
        <div className="text-center space-y-2">
          <div className="text-2xl font-bold text-gray-900 font-vazirmatn">
            {completedTasks} از {totalTasks}
          </div>
          <div className="text-sm text-gray-600 font-vazirmatn">تسک انجام شده</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {safeTasks.length === 0 ? (
            <div className="text-center py-6">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 font-vazirmatn">هیچ تسکی برای امروز ندارید</p>
            </div>
          ) : (
            safeTasks.map((task, index) => (
              <OptimizedMotion
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
              >
                <div className="space-y-3">
                  {/* Task Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 font-vazirmatn mb-1">
                        {task.title}
                      </h3>
                      {task.project && (
                        <p className="text-xs text-gray-500 font-vazirmatn">
                          پروژه: {task.project.name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Priority Badge */}
                      <span className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium font-vazirmatn',
                        getPriorityColor(task.priority)
                      )}>
                        {getPriorityText(task.priority)}
                      </span>
                      {/* Status Badge */}
                      <span className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium font-vazirmatn flex items-center gap-1',
                        getStatusColor(task.status)
                      )}>
                        {getStatusIcon(task.status)}
                        {getStatusText(task.status)}
                      </span>
                    </div>
                  </div>

                  {/* Task Description */}
                  {task.description && (
                    <div className="text-sm text-gray-600 font-vazirmatn">
                      {expandedTask === task.id ? (
                        <div className="space-y-2">
                          <p>{task.description}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedTask(null)}
                            className="text-xs p-1 h-auto"
                          >
                            بستن
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className="line-clamp-2 flex-1">
                            {task.description.length > 100 
                              ? `${task.description.substring(0, 100)}...` 
                              : task.description
                            }
                          </p>
                          {task.description.length > 100 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedTask(task.id)}
                              className="text-xs p-1 h-auto"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Task Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {task.dueDate && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 font-vazirmatn">
                          <Clock className="h-3 w-3" />
                          {formatTime(task.dueDate)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {/* Status Change Buttons */}
                      {task.status === 'Todo' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(task.id, 'InProgress')}
                          disabled={updateTaskMutation.isPending}
                          className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 h-7"
                        >
                          <Play className="h-3 w-3 ml-1" />
                          شروع
                        </Button>
                      )}
                      
                      {task.status === 'InProgress' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(task.id, 'Done')}
                            disabled={updateTaskMutation.isPending}
                            className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 h-7"
                          >
                            <CheckCircle className="h-3 w-3 ml-1" />
                            تکمیل
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(task.id, 'Todo')}
                            disabled={updateTaskMutation.isPending}
                            variant="outline"
                            className="text-xs px-3 py-1 h-7"
                          >
                            <Pause className="h-3 w-3 ml-1" />
                            متوقف
                          </Button>
                        </>
                      )}
                      
                      {task.status === 'Done' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(task.id, 'InProgress')}
                          disabled={updateTaskMutation.isPending}
                          variant="outline"
                          className="text-xs px-3 py-1 h-7"
                        >
                          <Edit3 className="h-3 w-3 ml-1" />
                          بازگشت
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </OptimizedMotion>
            ))
          )}
        </div>

        {/* View All Button */}
        {safeTasks.length > 0 && (
          <div className="text-center pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/tasks'}
              className="text-xs font-vazirmatn"
            >
              مشاهده همه تسک‌ها
            </Button>
          </div>
        )}
      </div>
    </WidgetCard>
  );
}