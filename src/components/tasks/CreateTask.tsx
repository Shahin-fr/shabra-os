'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { projectsKeys } from '@/lib/queries';
import { tasksKeys } from '@/lib/queries';
import { showStatusMessage } from '@/lib/utils';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface CreateTaskProps {
  projectId: string;
  trigger?: React.ReactNode;
  mode?: 'create' | 'view' | 'edit';
  taskData?: {
    title: string;
    description: string;
    assignedTo?: string;
  };
}

export default function CreateTask({
  projectId,
  trigger,
  mode = 'create',
  taskData,
}: CreateTaskProps) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    title: taskData?.title || '',
    description: taskData?.description || '',
    assigneeId: taskData?.assignedTo || '',
  });
  const queryClient = useQueryClient();

  // Fetch users when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch {
        // Silent error handling
      }
    };

    if (open) {
      fetchUsers();
    }
  }, [open]);

  // Use TanStack Query mutation for creating tasks
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: {
      title: string;
      description: string;
      assigneeId: string;
    }) => {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...taskData,
          projectId,
        }),
      });

      if (!response.ok) {
        throw new Error('خطا در ایجاد وظیفه');
      }

      return response.json();
    },
    onMutate: async () => {
      // Show loading message
      showStatusMessage('در حال ایجاد وظیفه...', 2000);
    },
    onSuccess: async () => {
      // Show success message
      showStatusMessage('وظیفه با موفقیت ایجاد شد!', 3000);

      // Reset form
      setFormData({ title: '', description: '', assigneeId: '' });

      // Close dialog
      setOpen(false);

      // Invalidate and refetch to get the real data from the server
      try {
        // Invalidate the tasks query for this project
        await queryClient.invalidateQueries({
          queryKey: tasksKeys.list(`projectId:${projectId}`),
        });

        // Also invalidate project queries to ensure consistency
        await queryClient.invalidateQueries({
          queryKey: projectsKeys.detail(projectId),
        });
      } catch {
        // Silent error handling for query invalidation
      }
    },
    onError: () => {
      // Show error message
      showStatusMessage('خطا در ایجاد وظیفه. لطفاً دوباره تلاش کنید.', 4000);
    },
  });

  // Use TanStack Query mutation for updating tasks
  const updateTaskMutation = useMutation({
    mutationFn: async (taskData: {
      title: string;
      description: string;
      assigneeId: string;
    }) => {
      // For now, we'll use the same endpoint but with PATCH method
      // In a real implementation, you'd need the taskId
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...taskData,
          projectId,
        }),
      });

      if (!response.ok) {
        throw new Error('خطا در بروزرسانی وظیفه');
      }

      return response.json();
    },
    onMutate: async () => {
      // Show loading message
      showStatusMessage('در حال بروزرسانی وظیفه...', 2000);
    },
    onSuccess: async () => {
      // Show success message
      showStatusMessage('وظیفه با موفقیت بروزرسانی شد!', 3000);

      // Close dialog
      setOpen(false);

      // Invalidate and refetch to get the real data from the server
      try {
        // Invalidate the tasks query for this project
        await queryClient.invalidateQueries({
          queryKey: tasksKeys.list(`projectId:${projectId}`),
        });

        // Also invalidate project queries to ensure consistency
        await queryClient.invalidateQueries({
          queryKey: projectsKeys.detail(projectId),
        });
      } catch {
        // Silent error handling for query invalidation
      }
    },
    onError: () => {
      // Show error message
      showStatusMessage(
        'خطا در بروزرسانی وظیفه. لطفاً دوباره تلاش کنید.',
        4000
      );
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'edit') {
      updateTaskMutation.mutate(formData);
    } else {
      createTaskMutation.mutate(formData);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      assigneeId: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className='bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 shadow-lg'>
            وظیفه جدید
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'ایجاد وظیفه جدید' : 'جزئیات وظیفه'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'اطلاعات وظیفه جدید را وارد کنید'
              : 'جزئیات وظیفه'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='title' className='text-right'>
                عنوان
              </Label>
              <Input
                id='title'
                name='title'
                value={formData.title}
                onChange={handleInputChange}
                className='col-span-3'
                placeholder='عنوان وظیفه را وارد کنید'
                required
                disabled={
                  mode === 'view' ||
                  createTaskMutation.isPending ||
                  updateTaskMutation.isPending
                }
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='description' className='text-right'>
                توضیحات
              </Label>
              <Textarea
                id='description'
                name='description'
                value={formData.description}
                onChange={handleInputChange}
                className='col-span-3'
                placeholder='توضیحات وظیفه را وارد کنید'
                rows={3}
                disabled={
                  mode === 'view' ||
                  createTaskMutation.isPending ||
                  updateTaskMutation.isPending
                }
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='assignee' className='text-right'>
                مسئول
              </Label>
              <Select
                value={formData.assigneeId}
                onValueChange={handleSelectChange}
                disabled={
                  mode === 'view' ||
                  createTaskMutation.isPending ||
                  updateTaskMutation.isPending
                }
              >
                <SelectTrigger className='col-span-3'>
                  <SelectValue placeholder='انتخاب مسئول' />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {(mode === 'create' || mode === 'edit') && (
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => setOpen(false)}
                disabled={
                  createTaskMutation.isPending || updateTaskMutation.isPending
                }
              >
                انصراف
              </Button>
              <Button
                type='submit'
                disabled={
                  createTaskMutation.isPending || updateTaskMutation.isPending
                }
                className='bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700'
              >
                {mode === 'create' &&
                  (createTaskMutation.isPending
                    ? 'در حال ایجاد...'
                    : 'ایجاد وظیفه')}
                {mode === 'edit' &&
                  (updateTaskMutation.isPending
                    ? 'در حال بروزرسانی...'
                    : 'بروزرسانی وظیفه')}
              </Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
