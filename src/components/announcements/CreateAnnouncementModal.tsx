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
import { Checkbox } from '@/components/ui/checkbox';

interface CreateAnnouncementData {
  title: string;
  content: string;
  category: 'GENERAL' | 'TECHNICAL' | 'EVENT' | 'IMPORTANT';
  isPinned: boolean;
}

const createAnnouncement = async (data: CreateAnnouncementData) => {
  const response = await fetch('/api/admin/announcements', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'خطا در ایجاد اعلان');
  }

  return response.json();
};

interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateAnnouncementModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateAnnouncementModalProps) {
  const [formData, setFormData] = useState<CreateAnnouncementData>({
    title: '',
    content: '',
    category: 'GENERAL',
    isPinned: false,
  });

  const queryClient = useQueryClient();

  const createAnnouncementMutation = useMutation({
    mutationFn: createAnnouncement,
    onSuccess: () => {
      toast.success('اعلان با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      onSuccess();
      setFormData({
        title: '',
        content: '',
        category: 'GENERAL',
        isPinned: false,
      });
    },
    onError: (error: Error) => {
      toast.error('خطا در ایجاد اعلان', {
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('عنوان اعلان الزامی است');
      return;
    }

    if (!formData.content.trim()) {
      toast.error('محتوای اعلان الزامی است');
      return;
    }

    createAnnouncementMutation.mutate(formData);
  };

  const handleInputChange = (
    field: keyof CreateAnnouncementData,
    value: any
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
                ایجاد اعلان جدید
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className='space-y-6'>
              <div className='space-y-2'>
                <Label htmlFor='title'>عنوان اعلان *</Label>
                <Input
                  id='title'
                  value={formData.title}
                  onChange={e => handleInputChange('title', e.target.value)}
                  placeholder='عنوان اعلان را وارد کنید'
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='content'>محتوای اعلان *</Label>
                <Textarea
                  id='content'
                  value={formData.content}
                  onChange={e =>
                    handleInputChange('content', e.target.value)
                  }
                  placeholder='محتوای اعلان را وارد کنید'
                  rows={6}
                  required
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='category'>دسته‌بندی</Label>
                  <Select
                    value={formData.category}
                    onValueChange={value =>
                      handleInputChange('category', value as 'GENERAL' | 'TECHNICAL' | 'EVENT' | 'IMPORTANT')
                    }
                  >
                    <SelectTrigger className="w-full justify-end text-right">
                      <SelectValue placeholder='انتخاب دسته‌بندی' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='GENERAL'>عمومی</SelectItem>
                      <SelectItem value='TECHNICAL'>فنی</SelectItem>
                      <SelectItem value='EVENT'>رویداد</SelectItem>
                      <SelectItem value='IMPORTANT'>مهم</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='flex items-center space-x-2 rtl:space-x-reverse space-x-reverse'>
                  <Checkbox
                    id='isPinned'
                    checked={formData.isPinned}
                    onCheckedChange={(checked) => handleInputChange('isPinned', checked)}
                  />
                  <Label htmlFor='isPinned' className='text-sm font-medium text-gray-700'>
                    اعلان مهم (سنجاق شده)
                  </Label>
                </div>
              </div>

              <div className='flex justify-end rtl:justify-start gap-3 pt-4'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={onClose}
                  disabled={createAnnouncementMutation.isPending}
                >
                  انصراف
                </Button>
                <Button
                  type='submit'
                  disabled={createAnnouncementMutation.isPending}
                  className='bg-orange-500 hover:bg-orange-600 text-white'
                >
                  {createAnnouncementMutation.isPending ? (
                    <>
                      <Loader2 className='h-4 w-4 ms-2 animate-spin' />
                      در حال ایجاد...
                    </>
                  ) : (
                    'ایجاد اعلان'
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
