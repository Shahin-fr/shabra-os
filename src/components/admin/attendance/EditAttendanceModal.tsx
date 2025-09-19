'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { Clock, Calendar, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Validation schema
const EditAttendanceSchema = z.object({
  checkIn: z.string().min(1, 'زمان ورود الزامی است'),
  checkOut: z.string().optional(),
}).refine((data) => {
  if (data.checkOut) {
    const checkIn = new Date(data.checkIn);
    const checkOut = new Date(data.checkOut);
    return checkOut > checkIn;
  }
  return true;
}, {
  message: 'زمان خروج باید بعد از زمان ورود باشد',
  path: ['checkOut'],
});

type EditAttendanceFormData = z.infer<typeof EditAttendanceSchema>;

interface AttendanceRecord {
  id: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    roles: string;
  };
  checkIn: string;
  checkOut: string | null;
  totalDuration: string | null;
  status: 'completed' | 'in-progress';
  isLate: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EditAttendanceModalProps {
  record: AttendanceRecord;
  isOpen: boolean;
  onClose: () => void;
}

export function EditAttendanceModal({
  record,
  isOpen,
  onClose,
}: EditAttendanceModalProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    // watch,
  } = useForm<EditAttendanceFormData>({
    resolver: zodResolver(EditAttendanceSchema),
    defaultValues: {
      checkIn: record.checkIn ? new Date(record.checkIn).toISOString().slice(0, 16) : '',
      checkOut: record.checkOut ? new Date(record.checkOut).toISOString().slice(0, 16) : '',
    },
  });

  // Reset form when record changes
  useEffect(() => {
    if (record) {
      reset({
        checkIn: record.checkIn ? new Date(record.checkIn).toISOString().slice(0, 16) : '',
        checkOut: record.checkOut ? new Date(record.checkOut).toISOString().slice(0, 16) : '',
      });
    }
  }, [record, reset]);

  // Update attendance record mutation
  const updateMutation = useMutation({
    mutationFn: async (data: EditAttendanceFormData) => {
      const response = await fetch(`/api/admin/attendance/${record.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          checkIn: new Date(data.checkIn).toISOString(),
          checkOut: data.checkOut ? new Date(data.checkOut).toISOString() : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'خطا در به‌روزرسانی رکورد حضور');
      }

      return response.json();
    },
    onMutate: async () => {
      setIsSubmitting(true);
    },
    onSuccess: (_data) => {
      toast.success('رکورد حضور با موفقیت به‌روزرسانی شد', {
        description: `کارمند: ${record.user.firstName} ${record.user.lastName}`,
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['admin-attendance'] });
      queryClient.invalidateQueries({ queryKey: ['admin-attendance-stats'] });

      onClose();
    },
    onError: (error: Error) => {
      toast.error('خطا در به‌روزرسانی رکورد حضور', {
        description: error.message,
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: EditAttendanceFormData) => {
    updateMutation.mutate(data);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Clock className='h-5 w-5 text-[#ff0a54]' />
            ویرایش رکورد حضور
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Employee Info */}
          <div className='p-4 bg-gray-50 rounded-lg'>
            <div className='flex items-center gap-3 mb-2'>
              <div className='w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center'>
                <User className='h-5 w-5 text-gray-600' />
              </div>
              <div>
                <h3 className='font-semibold text-gray-900'>
                  {record.user.firstName} {record.user.lastName}
                </h3>
                <p className='text-sm text-gray-600'>{record.user.email}</p>
              </div>
            </div>
            <div className='flex items-center gap-2 text-sm text-gray-600'>
              <Calendar className='h-4 w-4' />
              <span>{formatDate(record.checkIn)}</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            {/* Check In Time */}
            <div className='space-y-2'>
              <Label htmlFor='checkIn' className='flex items-center gap-2'>
                <Clock className='h-4 w-4' />
                زمان ورود
              </Label>
              <Input
                id='checkIn'
                type='datetime-local'
                {...register('checkIn')}
                className={errors.checkIn ? 'border-red-500' : ''}
              />
              {errors.checkIn && (
                <p className='text-sm text-red-600 flex items-center gap-1'>
                  <AlertCircle className='h-4 w-4' />
                  {errors.checkIn.message}
                </p>
              )}
            </div>

            {/* Check Out Time */}
            <div className='space-y-2'>
              <Label htmlFor='checkOut' className='flex items-center gap-2'>
                <Clock className='h-4 w-4' />
                زمان خروج (اختیاری)
              </Label>
              <Input
                id='checkOut'
                type='datetime-local'
                {...register('checkOut')}
                className={errors.checkOut ? 'border-red-500' : ''}
              />
              {errors.checkOut && (
                <p className='text-sm text-red-600 flex items-center gap-1'>
                  <AlertCircle className='h-4 w-4' />
                  {errors.checkOut.message}
                </p>
              )}
            </div>

            {/* Current Values Display */}
            <div className='p-3 bg-blue-50 rounded-lg'>
              <h4 className='text-sm font-medium text-blue-900 mb-2'>مقادیر فعلی:</h4>
              <div className='space-y-1 text-sm text-blue-800'>
                <div>ورود: {formatTime(record.checkIn)}</div>
                <div>
                  خروج: {record.checkOut ? formatTime(record.checkOut) : 'هنوز خروج نکرده'}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex justify-end gap-3 pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={handleClose}
                disabled={isSubmitting}
              >
                انصراف
              </Button>
              <Button
                type='submit'
                disabled={isSubmitting}
                className='bg-[#ff0a54] hover:bg-[#ff0a54]/90 text-white'
              >
                {isSubmitting ? (
                  <div className='flex items-center gap-2'>
                    <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                    در حال ذخیره...
                  </div>
                ) : (
                  <div className='flex items-center gap-2'>
                    <CheckCircle className='h-4 w-4' />
                    ذخیره تغییرات
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
