'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import {
  Clock,
  LogIn,
  LogOut,
  Coffee,
  CheckCircle,
  AlertCircle,
  Timer,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface AttendanceData {
  isClockedIn: boolean;
  status: 'not-started' | 'active' | 'completed' | 'on-break';
  currentAttendance?: {
    checkIn: string;
    checkOut?: string;
  };
  currentTime: string;
}

interface MobileClockInCardProps {
  className?: string;
}

// Mock attendance data - in real app, this would come from API
const mockAttendanceData: AttendanceData = {
  isClockedIn: false,
  status: 'not-started',
  currentTime: new Date().toLocaleTimeString('fa-IR'),
};

export function MobileClockInCard({ className }: MobileClockInCardProps) {
  const queryClient = useQueryClient();
  const [attendanceData, setAttendanceData] =
    useState<AttendanceData>(mockAttendanceData);
  const [isLoading, setIsLoading] = useState(false);
  const { hapticSuccess, hapticWarning } = useHapticFeedback();

  // Clock in/out mutation
  const clockInOutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/attendance', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to clock in/out');
      }
      return response.json();
    },
    onMutate: async () => {
      setIsLoading(true);
    },
    onSuccess: data => {
      // Update local state
      setAttendanceData(prev => ({
        ...prev,
        isClockedIn: data.action === 'clock-in',
        status: data.action === 'clock-in' ? 'active' : 'completed',
        currentAttendance: data.attendance,
      }));

      // Show success message
      const action = data.action === 'clock-in' ? 'ورود' : 'خروج';
      toast.success(`ثبت ${action} با موفقیت انجام شد`, {
        description: `زمان: ${new Date().toLocaleTimeString('fa-IR')}`,
      });

      // Haptic feedback for success
      hapticSuccess();

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: _error => {
      toast.error('خطا در ثبت حضور. لطفاً دوباره تلاش کنید.');
      hapticWarning();
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const handleClockInOut = () => {
    clockInOutMutation.mutate();
  };

  const getStatusInfo = () => {
    switch (attendanceData.status) {
      case 'active':
        return {
          icon: LogIn,
          label: 'شما در حال کار هستید',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          buttonText: 'ثبت خروج',
          buttonVariant: 'destructive' as const,
        };
      case 'on-break':
        return {
          icon: Coffee,
          label: 'شما در حال استراحت هستید',
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
          buttonText: 'بازگشت از استراحت',
          buttonVariant: 'default' as const,
        };
      case 'completed':
        return {
          icon: CheckCircle,
          label: 'روز کاری شما تمام شده',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          buttonText: 'شروع روز جدید',
          buttonVariant: 'default' as const,
        };
      default:
        return {
          icon: AlertCircle,
          label: 'هنوز وارد نشده‌اید',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          buttonText: 'ثبت ورود',
          buttonVariant: 'default' as const,
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  const getWorkDuration = () => {
    if (!attendanceData.currentAttendance?.checkIn) return null;

    const checkInTime = new Date(attendanceData.currentAttendance.checkIn);
    const now = new Date();
    const duration = now.getTime() - checkInTime.getTime();

    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <Card
      className={`overflow-hidden ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      }}
    >
      <CardHeader className='pb-4'>
        <div className='flex items-center gap-3'>
          <div className={`p-3 rounded-xl ${statusInfo.bgColor}`}>
            <StatusIcon className={`h-6 w-6 ${statusInfo.color}`} />
          </div>
          <div className='flex-1'>
            <CardTitle className='text-lg font-semibold text-gray-900'>
              حضور و غیاب
            </CardTitle>
            <p className='text-sm text-gray-600'>{statusInfo.label}</p>
          </div>
          <Badge
            className={`${statusInfo.bgColor} ${statusInfo.color} border-0`}
          >
            {attendanceData.status === 'active'
              ? 'فعال'
              : attendanceData.status === 'on-break'
                ? 'استراحت'
                : attendanceData.status === 'completed'
                  ? 'تمام شده'
                  : 'غیرفعال'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className='pt-0'>
        {/* Current Time */}
        <div className='mb-4 p-3 bg-gray-50/50 rounded-lg'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Timer className='h-4 w-4 text-gray-500' />
              <span className='text-sm text-gray-600'>زمان فعلی:</span>
            </div>
            <span className='font-mono text-lg font-bold text-gray-900'>
              {new Date().toLocaleTimeString('fa-IR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
          </div>
        </div>

        {/* Work Duration (if clocked in) */}
        {attendanceData.status === 'active' && (
          <OptimizedMotion
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='mb-4 p-3 bg-green-50/50 rounded-lg border border-green-200/50'
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Clock className='h-4 w-4 text-green-600' />
                <span className='text-sm text-green-700'>مدت کار:</span>
              </div>
              <span className='font-mono text-lg font-bold text-green-800'>
                {getWorkDuration()}
              </span>
            </div>
          </OptimizedMotion>
        )}

        {/* Clock In/Out Button */}
        <OptimizedMotion whileTap={{ scale: 0.98 }} transition={{ duration: 0.1 }}>
          <Button
            onClick={handleClockInOut}
            disabled={isLoading}
            className={`w-full h-14 text-lg font-semibold ${
              statusInfo.buttonVariant === 'destructive'
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-[#ff0a54] hover:bg-[#ff0a54]/90 text-white'
            }`}
            style={{
              boxShadow:
                statusInfo.buttonVariant === 'destructive'
                  ? '0 4px 20px rgba(239, 68, 68, 0.3)'
                  : '0 4px 20px rgba(255, 10, 84, 0.3)',
            }}
          >
            <AnimatePresence mode='wait'>
              {isLoading ? (
                <OptimizedMotion
                  key='loading'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className='flex items-center gap-2'
                >
                  <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
                  <span>در حال پردازش...</span>
                </OptimizedMotion>
              ) : (
                <OptimizedMotion
                  key='button'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className='flex items-center gap-2'
                >
                  {attendanceData.isClockedIn ? (
                    <LogOut className='h-5 w-5' />
                  ) : (
                    <LogIn className='h-5 w-5' />
                  )}
                  <span>{statusInfo.buttonText}</span>
                </OptimizedMotion>
              )}
            </AnimatePresence>
          </Button>
        </OptimizedMotion>

        {/* Quick Stats */}
        <div className='mt-4 grid grid-cols-2 gap-3'>
          <div className='p-3 bg-gray-50/50 rounded-lg text-center'>
            <div className='text-lg font-bold text-gray-900'>8:30</div>
            <div className='text-xs text-gray-600'>میانگین ورود</div>
          </div>
          <div className='p-3 bg-gray-50/50 rounded-lg text-center'>
            <div className='text-lg font-bold text-gray-900'>17:45</div>
            <div className='text-xs text-gray-600'>میانگین خروج</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

