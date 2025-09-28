'use client';

// import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { Trash2, AlertTriangle, User, Calendar, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

interface DeleteAttendanceModalProps {
  record: AttendanceRecord;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteAttendanceModal({
  record,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: DeleteAttendanceModalProps) {
  const handleClose = () => {
    if (!isLoading) {
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
          <DialogTitle className='flex items-center gap-2 text-red-600'>
            <AlertTriangle className='h-5 w-5' />
            حذف رکورد حضور
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Warning Message */}
          <div className='p-4 bg-red-50 border border-red-200 rounded-lg'>
            <div className='flex items-start rtl:items-start gap-3'>
              <AlertTriangle className='h-5 w-5 text-red-600 mt-0.5' />
              <div>
                <h3 className='font-semibold text-red-900 mb-1'>
                  هشدار: این عمل قابل بازگشت نیست
                </h3>
                <p className='text-sm text-red-800'>
                  آیا مطمئن هستید که می‌خواهید این رکورد حضور را حذف کنید؟ این عمل قابل بازگشت نیست.
                </p>
              </div>
            </div>
          </div>

          {/* Record Details */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base flex items-center gap-2'>
                <Trash2 className='h-4 w-4 text-red-600' />
                جزئیات رکورد
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
                    {record.user.firstName} {record.user.lastName}
                  </h4>
                  <p className='text-sm text-gray-600'>{record.user.email}</p>
                </div>
              </div>

              {/* Attendance Details */}
              <div className='space-y-3'>
                <div className='flex items-center justify-between py-2 border-b border-gray-100'>
                  <span className='text-sm font-medium text-gray-600'>تاریخ:</span>
                  <div className='flex items-center gap-2'>
                    <Calendar className='h-4 w-4 text-gray-400' />
                    <span className='text-sm'>{formatDate(record.checkIn)}</span>
                  </div>
                </div>

                <div className='flex items-center justify-between py-2 border-b border-gray-100'>
                  <span className='text-sm font-medium text-gray-600'>زمان ورود:</span>
                  <div className='flex items-center gap-2'>
                    <Clock className='h-4 w-4 text-green-600' />
                    <span className='text-sm font-mono'>{formatTime(record.checkIn)}</span>
                  </div>
                </div>

                <div className='flex items-center justify-between py-2 border-b border-gray-100'>
                  <span className='text-sm font-medium text-gray-600'>زمان خروج:</span>
                  <div className='flex items-center gap-2'>
                    <Clock className='h-4 w-4 text-red-600' />
                    <span className='text-sm font-mono'>
                      {record.checkOut ? formatTime(record.checkOut) : 'هنوز خروج نکرده'}
                    </span>
                  </div>
                </div>

                {record.totalDuration && (
                  <div className='flex items-center justify-between py-2'>
                    <span className='text-sm font-medium text-gray-600'>مدت کار:</span>
                    <span className='text-sm font-mono'>{record.totalDuration}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className='flex justify-end rtl:justify-start gap-3 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={handleClose}
              disabled={isLoading}
            >
              انصراف
            </Button>
            <Button
              type='button'
              variant='destructive'
              onClick={onConfirm}
              disabled={isLoading}
              className='bg-red-600 hover:bg-red-700 text-white'
            >
              {isLoading ? (
                <div className='flex items-center gap-2'>
                  <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                  در حال حذف...
                </div>
              ) : (
                <div className='flex items-center gap-2'>
                  <Trash2 className='h-4 w-4' />
                  حذف رکورد
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
