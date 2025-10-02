'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import {
  Clock,
  LogIn,
  LogOut,
  Timer,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AttendanceStatus {
  isClockedIn: boolean;
  status: 'not-started' | 'active' | 'completed' | 'on-break';
  currentAttendance?: {
    id: string;
    checkIn: string;
    checkOut?: string;
  };
  currentTime: string;
}

export function AttendanceDashboardWidget() {
  const queryClient = useQueryClient();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch current attendance status
  const { data: attendanceStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['attendance-status'],
    queryFn: async (): Promise<AttendanceStatus> => {
      const response = await fetch('/api/attendance');
      if (!response.ok) {
        throw new Error('Failed to fetch attendance status');
      }
      const result = await response.json();
      return result.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

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
    onSuccess: (data) => {
      const action = data.data.action === 'clock-in' ? 'ورود' : 'خروج';
      toast.success(`ثبت ${action} با موفقیت انجام شد`, {
        description: `زمان: ${new Date().toLocaleTimeString('fa-IR')}`,
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['attendance-status'] });
    },
    onError: () => {
      toast.error('خطا در ثبت حضور. لطفاً دوباره تلاش کنید.');
    },
  });

  const handleClockInOut = () => {
    clockInOutMutation.mutate();
  };

  const getWorkDuration = () => {
    if (!attendanceStatus?.currentAttendance?.checkIn) return null;

    const checkInTime = new Date(attendanceStatus.currentAttendance.checkIn);
    const now = new Date();
    const duration = now.getTime() - checkInTime.getTime();

    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const getStatusInfo = () => {
    if (!attendanceStatus) return null;

    switch (attendanceStatus.status) {
      case 'active':
        return {
          icon: LogIn,
          label: 'در حال کار',
          color: 'text-status-success-text',
          bgColor: 'bg-status-success',
          buttonText: 'ثبت خروج',
          buttonVariant: 'destructive' as const,
        };
      case 'on-break':
        return {
          icon: Clock,
          label: 'در حال استراحت',
          color: 'text-status-warning-text',
          bgColor: 'bg-status-warning',
          buttonText: 'بازگشت از استراحت',
          buttonVariant: 'default' as const,
        };
      case 'completed':
        return {
          icon: CheckCircle,
          label: 'روز کاری تمام شده',
          color: 'text-brand-pink-text',
          bgColor: 'bg-brand-pink',
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

  if (statusLoading) {
    return (
      <Card className='backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl'>
        <CardContent className='p-8 text-center'>
          <div className='w-8 h-8 border-2 border-[#ff0a54] border-t-transparent rounded-full animate-spin mx-auto mb-4' />
          <p className='text-gray-600'>در حال بارگذاری...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <OptimizedMotion
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className='backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl'>
        <CardHeader className='text-center pb-4'>
          <CardTitle className='text-2xl font-bold text-[#ff0a54] flex items-center justify-center gap-2'>
            <Clock className='h-6 w-6' />
            ساعت حضور
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Current Status */}
          {statusInfo && (
            <OptimizedMotion
              className='text-center'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className='flex items-center justify-center gap-3 p-4 bg-gray-50 rounded-lg'>
                <div className={`p-3 rounded-xl ${statusInfo.bgColor}`}>
                  <statusInfo.icon className={`h-6 w-6 ${statusInfo.color}`} />
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    {statusInfo.label}
                  </h3>
                  <p className='text-sm text-gray-600'>
                    {currentTime.toLocaleTimeString('fa-IR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </OptimizedMotion>
          )}

          {/* Work Duration (if clocked in) */}
          {attendanceStatus?.status === 'active' && getWorkDuration() && (
            <OptimizedMotion
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='p-4 bg-status-success rounded-lg border border-status-success'
            >
              <div className='flex items-center justify-center gap-2'>
                <Timer className='h-5 w-5 text-status-success-text' />
                <span className='text-status-success-text font-medium'>مدت کار:</span>
                <span className='text-2xl font-mono font-bold text-status-success-text'>
                  {getWorkDuration()}
                </span>
              </div>
            </OptimizedMotion>
          )}

          {/* Clock In/Out Button */}
          <OptimizedMotion
            className='text-center'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              onClick={handleClockInOut}
              disabled={clockInOutMutation.isPending}
              className={`w-full h-16 text-xl font-bold transition-all duration-300 ${
                statusInfo?.buttonVariant === 'destructive'
                  ? 'bg-status-danger hover:bg-status-danger text-white'
                  : 'bg-[#ff0a54] hover:bg-[#ff0a54]/90 text-white'
              }`}
            >
              {clockInOutMutation.isPending ? (
                <div className='flex items-center gap-2'>
                  <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
                  در حال پردازش...
                </div>
              ) : (
                <div className='flex items-center gap-2'>
                  {attendanceStatus?.isClockedIn ? (
                    <LogOut className='h-5 w-5' />
                  ) : (
                    <LogIn className='h-5 w-5' />
                  )}
                  <span>{statusInfo?.buttonText}</span>
                </div>
              )}
            </Button>
          </OptimizedMotion>

          {/* Status Badge */}
          <OptimizedMotion
            className='text-center'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Badge 
              className={`${
                statusInfo?.bgColor
              } ${statusInfo?.color} border-0 text-sm px-4 py-2`}
            >
              {attendanceStatus?.status === 'active'
                ? 'فعال'
                : attendanceStatus?.status === 'on-break'
                  ? 'استراحت'
                  : attendanceStatus?.status === 'completed'
                    ? 'تمام شده'
                    : 'غیرفعال'}
            </Badge>
          </OptimizedMotion>
        </CardContent>
      </Card>
    </OptimizedMotion>
  );
}
