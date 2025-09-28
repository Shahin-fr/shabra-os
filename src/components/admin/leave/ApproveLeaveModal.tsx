'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { CheckCircle, Calendar, User, FileText } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

interface ApproveLeaveModalProps {
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

export function ApproveLeaveModal({
  request,
  isOpen,
  onClose,
}: ApproveLeaveModalProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Approve leave request mutation
  const approveMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/admin/leave-requests/${request.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'APPROVED',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'خطا در تایید درخواست مرخصی');
      }

      return response.json();
    },
    onMutate: async () => {
      setIsSubmitting(true);
    },
    onSuccess: () => {
      toast.success('درخواست مرخصی با موفقیت تایید شد', {
        description: `درخواست ${request.user.firstName} ${request.user.lastName} تایید شد`,
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['admin-leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });

      onClose();
    },
    onError: (error: Error) => {
      toast.error('خطا در تایید درخواست مرخصی', {
        description: error.message,
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleApprove = () => {
    approveMutation.mutate();
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
          <DialogTitle className='flex items-center gap-2 text-green-600'>
            <CheckCircle className='h-5 w-5' />
            تایید درخواست مرخصی
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Confirmation Message */}
          <div className='p-4 bg-green-50 border border-green-200 rounded-lg'>
            <div className='flex items-start rtl:items-start gap-3'>
              <CheckCircle className='h-5 w-5 text-green-600 mt-0.5' />
              <div>
                <h3 className='font-semibold text-green-900 mb-1'>
                  تایید درخواست مرخصی
                </h3>
                <p className='text-sm text-green-800'>
                  آیا مطمئن هستید که می‌خواهید این درخواست مرخصی را تایید کنید؟
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

              {/* Reason */}
              <div className='space-y-2'>
                <Label className='text-sm font-medium text-gray-600'>دلیل مرخصی</Label>
                <div className='p-3 bg-gray-50 rounded-lg'>
                  <p className='text-sm'>{request.reason}</p>
                </div>
              </div>

              {/* Request Date */}
              <div className='space-y-2'>
                <Label className='text-sm font-medium text-gray-600'>تاریخ ارسال درخواست</Label>
                <span className='text-sm text-gray-600'>
                  {new Date(request.createdAt).toLocaleString('fa-IR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className='flex justify-end rtl:justify-start gap-3 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={handleClose}
              disabled={isSubmitting}
            >
              انصراف
            </Button>
            <Button
              type='button'
              onClick={handleApprove}
              disabled={isSubmitting}
              className='bg-green-600 hover:bg-green-700 text-white'
            >
              {isSubmitting ? (
                <div className='flex items-center gap-2'>
                  <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                  در حال تایید...
                </div>
              ) : (
                <div className='flex items-center gap-2'>
                  <CheckCircle className='h-4 w-4' />
                  تایید درخواست
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
