'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { JalaliDateTimePicker } from '@/components/ui/jalali-datetime-picker';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface CreateMeetingData {
  title: string;
  description: string;
  startTime: Date | null;
  endTime: Date | null;
  type: 'ONE_ON_ONE' | 'TEAM_MEETING';
  attendeeIds: string[];
  location: string;
}

const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch('/api/users/assignable');
  if (!response.ok) {
    throw new Error('خطا در دریافت کاربران');
  }
  const data = await response.json();
  return data.data || [];
};

const createMeeting = async (data: CreateMeetingData) => {
  const response = await fetch('/api/meetings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...data,
      startTime: data.startTime ? data.startTime.toISOString() : null,
      endTime: data.endTime ? data.endTime.toISOString() : null,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'خطا در ایجاد جلسه');
  }

  return response.json();
};

interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateMeetingModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateMeetingModalProps) {
  const [formData, setFormData] = useState<CreateMeetingData>({
    title: '',
    description: '',
    startTime: null,
    endTime: null,
    type: 'ONE_ON_ONE',
    attendeeIds: [],
    location: '',
  });

  const queryClient = useQueryClient();

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users', 'assignable'],
    queryFn: fetchUsers,
    enabled: isOpen,
  });

  const safeUsers = Array.isArray(users) ? users : [];

  const createMeetingMutation = useMutation({
    mutationFn: createMeeting,
    onSuccess: () => {
      toast.success('جلسه با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      onSuccess();
      setFormData({
        title: '',
        description: '',
        startTime: null,
        endTime: null,
        type: 'ONE_ON_ONE',
        attendeeIds: [],
        location: '',
      });
    },
    onError: (error: Error) => {
      toast.error('خطا در ایجاد جلسه', {
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('عنوان جلسه الزامی است');
      return;
    }

    if (!formData.startTime) {
      toast.error('زمان شروع الزامی است');
      return;
    }

    if (!formData.endTime) {
      toast.error('زمان پایان الزامی است');
      return;
    }

    if (formData.attendeeIds.length === 0) {
      toast.error('حداقل یک شرکت‌کننده الزامی است');
      return;
    }

    createMeetingMutation.mutate(formData);
  };

  const handleInputChange = (
    field: keyof CreateMeetingData,
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAttendeeToggle = (userId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      attendeeIds: checked
        ? [...prev.attendeeIds, userId]
        : prev.attendeeIds.filter(id => id !== userId),
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className='sm:max-w-[700px] max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle className='text-xl font-semibold'>
                برنامه‌ریزی جلسه جدید
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className='space-y-6'>
              <div className='space-y-2'>
                <Label htmlFor='title'>عنوان جلسه *</Label>
                <Input
                  id='title'
                  value={formData.title}
                  onChange={e => handleInputChange('title', e.target.value)}
                  placeholder='عنوان جلسه را وارد کنید'
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
                  placeholder='توضیحات جلسه را وارد کنید'
                  rows={3}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='type'>نوع جلسه</Label>
                <Select
                  value={formData.type}
                  onValueChange={value =>
                    handleInputChange('type', value as 'ONE_ON_ONE' | 'TEAM_MEETING')
                  }
                >
                  <SelectTrigger className="w-full justify-end text-right">
                    <SelectValue placeholder='انتخاب نوع جلسه' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='ONE_ON_ONE'>یک به یک</SelectItem>
                    <SelectItem value='TEAM_MEETING'>جلسه تیمی</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label>زمان شروع *</Label>
                  <JalaliDateTimePicker
                    value={formData.startTime || undefined}
                    onChange={(date) => handleInputChange('startTime', date)}
                    placeholder='انتخاب زمان شروع'
                  />
                </div>

                <div className='space-y-2'>
                  <Label>زمان پایان *</Label>
                  <JalaliDateTimePicker
                    value={formData.endTime || undefined}
                    onChange={(date) => handleInputChange('endTime', date)}
                    placeholder='انتخاب زمان پایان'
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='location'>مکان جلسه</Label>
                <Input
                  id='location'
                  value={formData.location}
                  onChange={e => handleInputChange('location', e.target.value)}
                  placeholder='مکان جلسه را وارد کنید'
                />
              </div>

              <div className='space-y-2'>
                <Label>شرکت‌کنندگان *</Label>
                <div className='max-h-40 overflow-y-auto border rounded-md p-3 space-y-2'>
                  {usersLoading ? (
                    <div className='text-center py-4'>
                      <Loader2 className='h-4 w-4 animate-spin mx-auto' />
                      <p className='text-sm text-gray-500 mt-2'>در حال بارگذاری...</p>
                    </div>
                  ) : (
                    safeUsers.map(user => (
                      <div key={user.id} className='flex items-center space-x-2 rtl:space-x-reverse space-x-reverse'>
                        <input
                          type='checkbox'
                          id={`attendee-${user.id}`}
                          checked={formData.attendeeIds.includes(user.id)}
                          onChange={e => handleAttendeeToggle(user.id, e.target.checked)}
                          className='h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded'
                        />
                        <label
                          htmlFor={`attendee-${user.id}`}
                          className='text-sm font-medium text-gray-700 cursor-pointer'
                        >
                          {user.firstName} {user.lastName}
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className='flex justify-end rtl:justify-start gap-3 pt-4'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={onClose}
                  disabled={createMeetingMutation.isPending}
                >
                  انصراف
                </Button>
                <Button
                  type='submit'
                  disabled={createMeetingMutation.isPending}
                  className='bg-purple-500 hover:bg-purple-600 text-white'
                >
                  {createMeetingMutation.isPending ? (
                    <>
                      <Loader2 className='h-4 w-4 ms-2 animate-spin' />
                      در حال ایجاد...
                    </>
                  ) : (
                    'ایجاد جلسه'
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
