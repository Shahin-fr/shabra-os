'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { CalendarIcon } from 'lucide-react';
import React, { useState } from 'react';
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

interface CreateTaskData {
  title: string;
  description: string;
  assignedTo: string;
  projectId: string;
  dueDate: Date | null;
  priority: 'low' | 'medium' | 'high';
}

const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch('/api/users/assignable');
  if (!response.ok) {
    throw new Error('خطا در دریافت کاربران');
  }
  const data = await response.json();
  // The API returns a wrapped response, so we need to extract the data array
  return data.data || [];
};

const fetchProjects = async (): Promise<Project[]> => {
  const response = await fetch('/api/projects');
  if (!response.ok) {
    throw new Error('خطا در دریافت پروژه‌ها');
  }
  const data = await response.json();
  // The API returns a wrapped response, so we need to extract the projects array
  return data.data?.projects || [];
};

const createTask = async (data: CreateTaskData) => {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...data,
      dueDate: data.dueDate ? data.dueDate.toISOString() : null,
      priority: data.priority.toUpperCase(),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'خطا در ایجاد تسک');
  }

  return response.json();
};

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateTaskModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateTaskModalProps) {
  const [formData, setFormData] = useState<CreateTaskData>({
    title: '',
    description: '',
    assignedTo: '',
    projectId: '',
    dueDate: null,
    priority: 'medium',
  });

  const queryClient = useQueryClient();

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    enabled: isOpen,
  });

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    enabled: isOpen,
  });

  // Safety checks to ensure data is always an array
  const safeUsers = Array.isArray(users) ? users : [];
  const safeProjects = Array.isArray(projects) ? projects : [];

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      toast.success('تسک با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      onSuccess();
      setFormData({
        title: '',
        description: '',
        assignedTo: '',
        projectId: '',
        dueDate: null,
        priority: 'medium',
      });
    },
    onError: (error: Error) => {
      toast.error('خطا در ایجاد تسک', {
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('عنوان تسک الزامی است');
      return;
    }

    createTaskMutation.mutate(formData);
  };

  const handleInputChange = (
    field: keyof CreateTaskData,
    value: string | Date | null
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className='sm:max-w-[700px] max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle className='text-xl font-semibold'>
                ایجاد تسک جدید
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

              <div className='space-y-2'>
                <Label htmlFor='priority'>اولویت</Label>
                <Select
                  value={formData.priority}
                  onValueChange={value =>
                    handleInputChange('priority', value as 'low' | 'medium' | 'high')
                  }
                >
                  <SelectTrigger className="w-full justify-end text-right w-full justify-end text-right">
                    <SelectValue placeholder='انتخاب اولویت' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='low'>پایین</SelectItem>
                    <SelectItem value='medium'>متوسط</SelectItem>
                    <SelectItem value='high'>بالا</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectTrigger className="text-right w-full justify-end text-right">
                      <SelectValue
                        placeholder={
                          usersLoading ? 'در حال بارگذاری...' : 'انتخاب مسئول'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {safeUsers.map(user => (
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
                    <SelectTrigger className="text-right w-full justify-end text-right">
                      <SelectValue
                        placeholder={
                          projectsLoading
                            ? 'در حال بارگذاری...'
                            : 'انتخاب پروژه'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {safeProjects.map(project => (
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
                      className='w-full justify-start rtl:justify-start text-start font-normal border-pink-200 hover:border-pink-300 hover:bg-pink-50'
                    >
                      <CalendarIcon className='me-2 h-4 w-4 text-pink-600' />
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

              <div className='flex justify-end rtl:justify-start gap-3 pt-4'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={onClose}
                  disabled={createTaskMutation.isPending}
                >
                  انصراف
                </Button>
                <Button
                  type='submit'
                  disabled={createTaskMutation.isPending}
                  className='bg-[#ff0a54] hover:bg-[#ff0a54]/90'
                >
                  {createTaskMutation.isPending ? (
                    <>
                      <Loader2 className='h-4 w-4 ms-2 animate-spin' />
                      در حال ایجاد...
                    </>
                  ) : (
                    'ایجاد تسک'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}

