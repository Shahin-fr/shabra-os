'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { XCircle, Calendar, User, FileText, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Validation schema
const RejectLeaveSchema = z.object({
  rejectionReason: z.string().min(10, 'دلیل رد باید حداقل ۱۰ کاراکتر باشد').max(500, 'دلیل رد نمی‌تواند بیش از ۵۰۰ کاراکتر باشد'),
});

type RejectLeaveFormData = z.infer<typeof RejectLeaveSchema>;

interface LeaveRequest {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface RejectLeaveModalProps {
  request: LeaveRequest;
  isOpen: boolean;
  onClose: () => void;
}

const leaveTypeLabels: Record<string, string> = {
  ANNUAL: 'مرخصی سالانه',
  SICK: 'مرخصی استعلاجی',
  UNPAID: 'مرخصی بدون حقوق',
  EMERGENCY: 'مرخصی اضطراری',
  MATERNITY: 'مرخصی زایمان',
  PATERNITY: 'مرخصی پدری',
  STUDY: 'مرخصی تحصیلی',
  OTHER: 'سایر',
};

export function RejectLeaveModal({
  request,
  isOpen,
  onClose,
}: RejectLeaveModalProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<RejectLeaveFormData>({
    resolver: zodResolver(RejectLeaveSchema),
    defaultValues: {
      rejectionReason: '',
    },
  });

  // Reject leave request mutation
  const rejectMutation = useMutation({
    mutationFn: async (data: RejectLeaveFormData) => {
      const response = await fetch(`/api/admin/leave-requests/${request.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'REJECTED',
          rejectionReason: data.rejectionReason,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'خطا در رد درخواست مرخصی');
      }

      return response.json();
    },
    onMutate: async () => {
      setIsSubmitting(true);
    },
    onSuccess: () => {
      toast.success('درخواست مرخصی رد شد', {
        description: `درخواست ${request.user.firstName} ${request.user.lastName} رد شد`,
      });

      // Reset form
      reset();

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['admin-leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });

      onClose();
    },
    onError: (error: Error) => {
      toast.error('خطا در رد درخواست مرخصی', {
        description: error.message,
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: RejectLeaveFormData) => {
    rejectMutation.mutate(data);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
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

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-red-600'>
            <XCircle className='h-5 w-5' />
            رد درخواست مرخصی
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Warning Message */}
          <div className='p-4 bg-red-50 border border-red-200 rounded-lg'>
            <div className='flex items-start gap-3'>
              <AlertTriangle className='h-5 w-5 text-red-600 mt-0.5' />
              <div>
                <h3 className='font-semibold text-red-900 mb-1'>
                  رد درخواست مرخصی
                </h3>
                <p className='text-sm text-red-800'>
                  لطفاً دلیل رد این درخواست مرخصی را به تفصیل شرح دهید.
                </p>
              </div>
            </div>
          </div>

          {/* Request Details */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base flex items-center gap-2'>
                <FileText className='h-4 w-4 text-[#ff0a54]' />
                جزئیات درخواست
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* Employee Info */}
              <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
                <div className='w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center'>
                  <User className='h-5 w-5 text-gray-600' />
                </div>
                <div>
                  <h4 className='font-semibold text-gray-900'>
                    {request.user.firstName} {request.user.lastName}
                  </h4>
                  <p className='text-sm text-gray-600'>{request.user.email}</p>
                </div>
              </div>

              {/* Leave Details */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label className='text-sm font-medium text-gray-600'>نوع مرخصی</Label>
                  <div className='flex items-center gap-2'>
                    <FileText className='h-4 w-4 text-gray-400' />
                    <span>{leaveTypeLabels[request.leaveType] || request.leaveType}</span>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label className='text-sm font-medium text-gray-600'>مدت مرخصی</Label>
                  <span className='font-mono text-lg'>
                    {calculateDays(request.startDate, request.endDate)} روز
                  </span>
                </div>

                <div className='space-y-2'>
                  <Label className='text-sm font-medium text-gray-600'>تاریخ شروع</Label>
                  <div className='flex items-center gap-2'>
                    <Calendar className='h-4 w-4 text-green-600' />
                    <span>{formatDate(request.startDate)}</span>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label className='text-sm font-medium text-gray-600'>تاریخ پایان</Label>
                  <div className='flex items-center gap-2'>
                    <Calendar className='h-4 w-4 text-red-600' />
                    <span>{formatDate(request.endDate)}</span>
                  </div>
                </div>
              </div>

              {/* Original Reason */}
              <div className='space-y-2'>
                <Label className='text-sm font-medium text-gray-600'>دلیل درخواست کارمند</Label>
                <div className='p-3 bg-gray-50 rounded-lg'>
                  <p className='text-sm'>{request.reason}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rejection Form */}
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='rejectionReason' className='flex items-center gap-2'>
                <AlertTriangle className='h-4 w-4 text-red-600' />
                دلیل رد درخواست
              </Label>
              <Textarea
                id='rejectionReason'
                placeholder='دلیل رد این درخواست مرخصی را به تفصیل شرح دهید...'
                {...register('rejectionReason')}
                className={errors.rejectionReason ? 'border-red-500' : ''}
                rows={4}
              />
              <div className='flex justify-between items-center'>
                {errors.rejectionReason ? (
                  <p className='text-sm text-red-600 flex items-center gap-1'>
                    <AlertTriangle className='h-4 w-4' />
                    {errors.rejectionReason.message}
                  </p>
                ) : (
                  <p className='text-sm text-gray-500'>
                    {watch('rejectionReason')?.length || 0} / 500 کاراکتر
                  </p>
                )}
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
                className='bg-red-600 hover:bg-red-700 text-white'
              >
                {isSubmitting ? (
                  <div className='flex items-center gap-2'>
                    <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                    در حال رد...
                  </div>
                ) : (
                  <div className='flex items-center gap-2'>
                    <XCircle className='h-4 w-4' />
                    رد درخواست
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
