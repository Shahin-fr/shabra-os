'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { EnhancedWidgetCard } from '@/components/ui/EnhancedWidgetCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface QuickTaskWidgetProps {
  className?: string;
  variant?: 'mobile' | 'desktop';
  priority?: 'high' | 'medium' | 'low';
}

export function QuickTaskWidget({ priority = 'medium' }: QuickTaskWidgetProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const queryClient = useQueryClient();

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: { title: string; priority: string }) => {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });
      if (!response.ok) {
        throw new Error('Failed to create task');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const handleCreateTask = async () => {
    if (!taskTitle.trim()) return;
    
    await createTaskMutation.mutateAsync({
      title: taskTitle.trim(),
      priority: taskPriority,
    });
  };

  // const getPriorityColor = (priority: string) => {
  //   switch (priority) {
  //     case 'HIGH':
  //       return 'text-red-600 bg-red-100';
  //     case 'MEDIUM':
  //       return 'text-yellow-600 bg-yellow-100';
  //     case 'LOW':
  //       return 'text-green-600 bg-green-100';
  //     default:
  //       return 'text-gray-600 bg-gray-100';
  //   }
  // };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  // const isMobile = variant === 'mobile';

  return (
    <EnhancedWidgetCard
      title="کار سریع"
      variant="employee"
      priority={priority}
    >
      {!isCreating ? (
        <motion.div
          className="text-center py-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
              <Plus className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 font-vazirmatn mb-2">
              کار جدید ایجاد کنید
            </h3>
            <p className="text-gray-600 font-vazirmatn text-sm">
              کار جدید خود را به سرعت اضافه کنید
            </p>
          </div>
          
          <Button
            onClick={() => setIsCreating(true)}
            className="w-full font-vazirmatn bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Plus className="h-4 w-4 ms-2" />
            شروع کار جدید
          </Button>
        </motion.div>
      ) : (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Task Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 font-vazirmatn mb-2">
              عنوان کار
            </label>
            <Input
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="عنوان کار را وارد کنید..."
              className="font-vazirmatn"
              dir="rtl"
            />
          </div>

          {/* Priority Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 font-vazirmatn mb-2">
              اولویت
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['LOW', 'MEDIUM', 'HIGH'] as const).map((priority) => (
                <button
                  key={priority}
                  onClick={() => setTaskPriority(priority)}
                  className={cn(
                    'p-2 rounded-lg border text-sm font-vazirmatn transition-all duration-200',
                    taskPriority === priority
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-lg">
                      {getPriorityIcon(priority)}
                    </span>
                    <span className="text-xs">
                      {priority === 'HIGH' ? 'بالا' : priority === 'MEDIUM' ? 'متوسط' : 'پایین'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleCreateTask}
              disabled={!taskTitle.trim() || createTaskMutation.isPending}
              className="flex-1 font-vazirmatn bg-blue-500 hover:bg-blue-600 text-white"
            >
              {createTaskMutation.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Plus className="h-4 w-4 ms-2" />
                  ایجاد کار
                </>
              )}
            </Button>
            <Button
              onClick={() => {
                setIsCreating(false);
                setTaskTitle('');
              }}
              variant="outline"
              className="flex-1 font-vazirmatn"
            >
              انصراف
            </Button>
          </div>
        </motion.div>
      )}

      {/* Quick Stats */}
      <div className="mt-6 pt-4 border-t border-white/40">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900 font-vazirmatn">
              12
            </div>
            <div className="text-xs text-gray-600 font-vazirmatn">
              کار امروز
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600 font-vazirmatn">
              8
            </div>
            <div className="text-xs text-gray-600 font-vazirmatn">
              تکمیل شده
            </div>
          </div>
        </div>
      </div>
    </EnhancedWidgetCard>
  );
}
