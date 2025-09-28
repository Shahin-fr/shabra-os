'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { Loader2, X } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CreateProjectData {
  name: string;
  description: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  startDate: string;
  endDate: string;
}

const createProject = async (data: CreateProjectData) => {
  const response = await fetch('/api/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...data,
      startDate: data.startDate ? new Date(data.startDate).toISOString() : null,
      endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'خطا در ایجاد پروژه');
  }

  return response.json();
};

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateProjectModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateProjectModalProps) {
  const [formData, setFormData] = useState<CreateProjectData>({
    name: '',
    description: '',
    status: 'ACTIVE',
    startDate: '',
    endDate: '',
  });

  const queryClient = useQueryClient();

  const createProjectMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      toast.success('پروژه با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      onSuccess();
      setFormData({
        name: '',
        description: '',
        status: 'ACTIVE',
        startDate: '',
        endDate: '',
      });
    },
    onError: (error: Error) => {
      toast.error('خطا در ایجاد پروژه', {
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('نام پروژه الزامی است');
      return;
    }

    createProjectMutation.mutate(formData);
  };

  const handleInputChange = (
    field: keyof CreateProjectData,
    value: string
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
                ایجاد پروژه جدید
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className='space-y-6'>
              <div className='space-y-2'>
                <Label htmlFor='name'>نام پروژه *</Label>
                <Input
                  id='name'
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  placeholder='نام پروژه را وارد کنید'
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
                  placeholder='توضیحات پروژه را وارد کنید'
                  rows={4}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='status'>وضعیت</Label>
                <Select
                  value={formData.status}
                  onValueChange={value =>
                    handleInputChange('status', value as 'ACTIVE' | 'PAUSED' | 'COMPLETED')
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='انتخاب وضعیت' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='ACTIVE'>فعال</SelectItem>
                    <SelectItem value='PAUSED'>متوقف</SelectItem>
                    <SelectItem value='COMPLETED'>تکمیل شده</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='startDate'>تاریخ شروع</Label>
                  <Input
                    id='startDate'
                    type='date'
                    value={formData.startDate}
                    onChange={e => handleInputChange('startDate', e.target.value)}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='endDate'>تاریخ پایان</Label>
                  <Input
                    id='endDate'
                    type='date'
                    value={formData.endDate}
                    onChange={e => handleInputChange('endDate', e.target.value)}
                  />
                </div>
              </div>

              <div className='flex justify-end gap-3 pt-4'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={onClose}
                  disabled={createProjectMutation.isPending}
                >
                  انصراف
                </Button>
                <Button
                  type='submit'
                  disabled={createProjectMutation.isPending}
                  className='bg-green-500 hover:bg-green-600 text-white'
                >
                  {createProjectMutation.isPending ? (
                    <>
                      <Loader2 className='h-4 w-4 ml-2 animate-spin' />
                      در حال ایجاد...
                    </>
                  ) : (
                    'ایجاد پروژه'
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
