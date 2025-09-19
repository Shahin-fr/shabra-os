'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { Loader2, Trash2 } from 'lucide-react';
import { CalendarIcon } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { JalaliCalendar } from '@/components/ui/jalali-calendar';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { formatJalaliDate } from '@/lib/date-utils';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
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

interface EditTaskData {
  title: string;
  description: string;
  assignedTo: string;
  projectId: string;
  dueDate: Date | null;
}

const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch('/api/users');
  if (!response.ok) {
    throw new Error('خطا در دریافت کاربران');
  }
  return response.json();
};

const fetchProjects = async (): Promise<Project[]> => {
  const response = await fetch('/api/projects');
  if (!response.ok) {
    throw new Error('خطا در دریافت پروژه‌ها');
  }
  const data = await response.json();
  return data.data?.projects || [];
};

const updateTask = async (taskId: string, data: EditTaskData) => {
  const response = await fetch(`/api/tasks/${taskId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...data,
      dueDate: data.dueDate ? data.dueDate.toISOString() : null,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'خطا در بروزرسانی تسک');
  }

  return response.json();
};

const deleteTask = async (taskId: string) => {
  const response = await fetch(`/api/tasks/${taskId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'خطا در حذف تسک');
  }

  return response.json();
};

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  task: Task | null;
}

export function EditTaskModal({
  isOpen,
  onClose,
  onSuccess,
  task,
}: EditTaskModalProps) {
  const [formData, setFormData] = useState<EditTaskData>({
    title: '',
    description: '',
    assignedTo: '',
    projectId: '',
    dueDate: null,
  });

  const queryClient = useQueryClient();

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    enabled: isOpen,
  });

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    enabled: isOpen,
  });

  // Update form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        assignedTo: task.assignedTo || '',
        projectId: task.projectId || '',
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
      });
    }
  }, [task]);

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: EditTaskData }) =>
      updateTask(taskId, data),
    onSuccess: () => {
      toast.success('تسک با موفقیت بروزرسانی شد');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error('خطا در بروزرسانی تسک', {
        description: error.message,
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      toast.success('تسک با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error('خطا در حذف تسک', {
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!task) return;

    if (!formData.title.trim()) {
      toast.error('عنوان تسک الزامی است');
      return;
    }

    updateTaskMutation.mutate({ taskId: task.id, data: formData });
  };

  const handleDelete = () => {
    if (!task) return;

    if (window.confirm('آیا مطمئن هستید که می‌خواهید این تسک را حذف کنید؟')) {
      deleteTaskMutation.mutate(task.id);
    }
  };

  const handleInputChange = (
    field: keyof EditTaskData,
    value: string | Date | null
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!task) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className='sm:max-w-[500px]'>
            <DialogHeader>
              <DialogTitle className='text-xl font-semibold'>
                ویرایش تسک
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='title'>عنوان تسک *</Label>
                <Input
                  id='title'
                  value={formData.title}
                  onChange={e => handleInputChange('title', e.target.value)}
                  placeholder='عنوان تسک را وارد کنید'
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='description'>توضیحات</Label>
                <Textarea
                  id='description'
                  value={formData.description}
                  onChange={e =>
                    handleInputChange('description', e.target.value)
                  }
                  placeholder='توضیحات تسک را وارد کنید'
                  rows={3}
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='assignedTo'>مسئول</Label>
                  <Select
                    value={formData.assignedTo}
                    onValueChange={value =>
                      handleInputChange('assignedTo', value)
                    }
                    disabled={usersLoading}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          usersLoading ? 'در حال بارگذاری...' : 'انتخاب مسئول'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.firstName} {user.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='projectId'>پروژه</Label>
                  <Select
                    value={formData.projectId}
                    onValueChange={value =>
                      handleInputChange('projectId', value)
                    }
                    disabled={projectsLoading}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          projectsLoading
                            ? 'در حال بارگذاری...'
                            : 'انتخاب پروژه'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='dueDate'>مهلت انجام</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className='w-full justify-start text-left font-normal border-pink-200 hover:border-pink-300 hover:bg-pink-50'
                    >
                      <CalendarIcon className='mr-2 h-4 w-4 text-pink-600' />
                      {formData.dueDate
                        ? formatJalaliDate(formData.dueDate, 'yyyy/M/d')
                        : 'انتخاب تاریخ'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <JalaliCalendar
                      selected={formData.dueDate || undefined}
                      onSelect={date =>
                        handleInputChange('dueDate', date || null)
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className='flex justify-between pt-4'>
                <Button
                  type='button'
                  variant='destructive'
                  onClick={handleDelete}
                  disabled={deleteTaskMutation.isPending}
                  className='flex items-center gap-2'
                >
                  <Trash2 className='h-4 w-4' />
                  {deleteTaskMutation.isPending ? 'در حال حذف...' : 'حذف تسک'}
                </Button>

                <div className='flex gap-3'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={onClose}
                    disabled={
                      updateTaskMutation.isPending ||
                      deleteTaskMutation.isPending
                    }
                  >
                    انصراف
                  </Button>
                  <Button
                    type='submit'
                    disabled={
                      updateTaskMutation.isPending ||
                      deleteTaskMutation.isPending
                    }
                    className='bg-[#ff0a54] hover:bg-[#ff0a54]/90'
                  >
                    {updateTaskMutation.isPending ? (
                      <>
                        <Loader2 className='h-4 w-4 ml-2 animate-spin' />
                        در حال بروزرسانی...
                      </>
                    ) : (
                      'بروزرسانی تسک'
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}

