'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, CheckCircle, Calendar, User, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataFreshnessIndicator } from '@/components/ui/DataFreshnessIndicator';
import {
  useCriticalDataFetching,
  useStaticDataFetching,
} from '@/hooks/useSmartDataFetching';
import { logError } from '@/lib/logger';

interface AttendanceData {
  success: boolean;
  currentAttendance: {
    id: string;
    clockIn: string;
    clockOut?: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  } | null;
  status: 'not-started' | 'active' | 'completed';
  isClockedIn: boolean;
  currentTime: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
}

// Clock in/out mutation
const clockInOut = async (): Promise<any> => {
  const response = await fetch('/api/attendance', {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to clock in/out');
  }
  return response.json();
};

export function EmployeeDashboard() {
  const queryClient = useQueryClient();

  // Smart attendance data fetching - critical data that needs frequent updates
  const {
    data: attendanceData,
    refetch: refetchAttendance,
    isRefetching: isRefetchingAttendance,
    lastUpdated: attendanceLastUpdated,
  } = useCriticalDataFetching<AttendanceData>(
    ['attendance'],
    async (): Promise<AttendanceData> => {
      const response = await fetch('/api/attendance');
      if (!response.ok) {
        throw new Error('Failed to fetch attendance status');
      }
      return response.json();
    }
  );

  // Smart user tasks fetching - static data that rarely changes
  const {
    data: tasks,
    isLoading: tasksLoading,
    refetch: refetchTasks,
    isRefetching: isRefetchingTasks,
    lastUpdated: tasksLastUpdated,
  } = useStaticDataFetching<Task[]>(
    ['userTasks'],
    async (): Promise<Task[]> => {
      const response = await fetch('/api/tasks?assignedTo=me');
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      return response.json();
    }
  );

  // Clock in/out mutation
  const clockInOutMutation = useMutation({
    mutationFn: clockInOut,
    onSuccess: data => {
      // Invalidate and refetch attendance data immediately
      queryClient.invalidateQueries({ queryKey: ['attendance'] });

      // Show success message
      const action = data.action === 'clock-in' ? 'ورود' : 'خروج';
      toast.success(`ثبت ${action} با موفقیت انجام شد`);
    },
    onError: error => {
      toast.error('خطا در ثبت حضور. لطفاً دوباره تلاش کنید.');
      logError(
        'Clock in/out operation failed',
        error instanceof Error ? error : new Error(String(error)),
        {
          operation: 'clockInOut',
          currentState: attendanceData?.isClockedIn,
        }
      );
    },
  });

  const handleClockInOut = () => {
    clockInOutMutation.mutate();
  };

  const getStatusText = () => {
    if (!attendanceData) return 'در حال بارگذاری...';

    switch (attendanceData.status) {
      case 'not-started':
        return 'شما حضور ندارید';
      case 'active':
        return 'در حال کار';
      case 'completed':
        return 'ساعت کاری امروز شما تمام شده';
      default:
        return 'وضعیت نامشخص';
    }
  };

  const getStatusColor = () => {
    if (!attendanceData) return 'bg-gray-100';

    switch (attendanceData.status) {
      case 'not-started':
        return 'bg-red-50 border-red-200';
      case 'active':
        return 'bg-green-50 border-green-200';
      case 'completed':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getButtonProps = () => {
    if (!attendanceData) {
      return {
        text: 'در حال بارگذاری...',
        variant: 'secondary' as const,
        disabled: true,
      };
    }

    if (attendanceData.isClockedIn) {
      return {
        text: 'ثبت خروج',
        variant: 'destructive' as const,
        disabled: false,
      };
    } else {
      return {
        text: 'ثبت ورود',
        variant: 'default' as const,
        disabled: false,
      };
    }
  };

  const buttonProps = getButtonProps();

  return (
    <div className='space-y-6'>
      {/* Enhanced Header with Data Freshness */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>داشبورد کارمند</h1>
          <p className='text-gray-600 mt-2'>مدیریت حضور و وظایف روزانه</p>
        </div>

        {/* Data Freshness Indicators */}
        <div className='flex items-center gap-4'>
          <DataFreshnessIndicator
            lastUpdated={attendanceLastUpdated}
            isRefetching={isRefetchingAttendance}
            onRefresh={refetchAttendance}
            showRefreshButton={true}
            className='text-sm'
          />
          <DataFreshnessIndicator
            lastUpdated={tasksLastUpdated}
            isRefetching={isRefetchingTasks}
            onRefresh={refetchTasks}
            showRefreshButton={true}
            className='text-sm'
          />
        </div>
      </div>

      {/* Attendance Status Card */}
      <Card className='backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Clock className='h-5 w-5 text-[#ff0a54]' />
            وضعیت حضور
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Status Display */}
            <div className='space-y-4'>
              <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium text-gray-700'>
                    وضعیت فعلی
                  </span>
                  <Badge variant='outline' className='text-xs'>
                    {getStatusText()}
                  </Badge>
                </div>

                {attendanceData?.currentAttendance && (
                  <div className='mt-3 space-y-2'>
                    <div className='flex items-center gap-2 text-sm text-gray-600'>
                      <User className='h-4 w-4' />
                      <span>
                        {attendanceData.currentAttendance.user.firstName}{' '}
                        {attendanceData.currentAttendance.user.lastName}
                      </span>
                    </div>

                    {attendanceData.currentAttendance.clockIn && (
                      <div className='flex items-center gap-2 text-sm text-gray-600'>
                        <CheckCircle className='h-4 w-4 text-green-500' />
                        <span>
                          ورود:{' '}
                          {new Date(
                            attendanceData.currentAttendance.clockIn
                          ).toLocaleTimeString('fa-IR')}
                        </span>
                      </div>
                    )}

                    {attendanceData.currentAttendance.clockOut && (
                      <div className='flex items-center gap-2 text-sm text-gray-600'>
                        <Calendar className='h-4 w-4 text-blue-500' />
                        <span>
                          خروج:{' '}
                          {new Date(
                            attendanceData.currentAttendance.clockOut
                          ).toLocaleTimeString('fa-IR')}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className='space-y-4'>
              <Button
                onClick={handleClockInOut}
                disabled={buttonProps.disabled || clockInOutMutation.isPending}
                variant={buttonProps.variant}
                size='lg'
                className='w-full h-12 text-lg font-semibold'
              >
                {clockInOutMutation.isPending ? (
                  <div className='flex items-center gap-2'>
                    <RefreshCw className='h-5 w-5 animate-spin' />
                    در حال پردازش...
                  </div>
                ) : (
                  buttonProps.text
                )}
              </Button>

              {/* Manual Refresh Button */}
              <Button
                onClick={refetchAttendance}
                disabled={isRefetchingAttendance}
                variant='outline'
                size='sm'
                className='w-full'
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isRefetchingAttendance ? 'animate-spin' : ''}`}
                />
                به‌روزرسانی وضعیت
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Overview */}
      <Card className='backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <CheckCircle className='h-5 w-5 text-[#ff0a54]' />
            وظایف من
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tasksLoading ? (
            <div className='text-center py-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
              <p className='mt-3 text-muted-foreground'>
                در حال بارگذاری وظایف...
              </p>
            </div>
          ) : tasks && tasks.length > 0 ? (
            <div className='space-y-3'>
              {tasks.slice(0, 5).map(task => (
                <div
                  key={task.id}
                  className='flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-200'
                >
                  <div className='flex-1'>
                    <h4 className='font-medium text-gray-900'>{task.title}</h4>
                    {task.description && (
                      <p className='text-sm text-gray-600 mt-1'>
                        {task.description}
                      </p>
                    )}
                  </div>
                  <div className='flex items-center gap-2'>
                    <Badge variant='outline' className='text-xs'>
                      {task.status}
                    </Badge>
                    <Badge variant='outline' className='text-xs'>
                      {task.priority}
                    </Badge>
                  </div>
                </div>
              ))}

              {tasks.length > 5 && (
                <div className='text-center pt-4'>
                  <Button variant='outline' size='sm'>
                    مشاهده همه وظایف ({tasks.length})
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className='text-center py-8'>
              <CheckCircle className='h-12 w-12 text-green-500 mx-auto mb-4' />
              <p className='text-gray-600'>
                هیچ وظیفه‌ای برای شما تعریف نشده است
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
