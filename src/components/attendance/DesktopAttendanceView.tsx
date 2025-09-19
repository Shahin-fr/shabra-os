'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import {
  Clock,
  LogIn,
  LogOut,
  Calendar,
  TrendingUp,
  Timer,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Clock3,
  CalendarDays,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

interface AttendanceStats {
  today: {
    totalHours: number;
    records: number;
    isClockedIn: boolean;
  };
  thisWeek: {
    totalHours: number;
    averageHours: number;
    workingDays: number;
    records: number;
  };
  thisMonth: {
    totalHours: number;
    averageHours: number;
    workingDays: number;
    records: number;
  };
  thisYear: {
    totalHours: number;
    averageHours: number;
    workingDays: number;
    records: number;
  };
  recentRecords: Array<{
    id: string;
    date: string;
    checkIn: string;
    checkOut: string | null;
    totalHours: number | null;
    status: 'completed' | 'in-progress';
  }>;
}

interface DesktopAttendanceViewProps {
  className?: string;
}

export function DesktopAttendanceView({ className }: DesktopAttendanceViewProps) {
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

  // Fetch attendance statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['attendance-stats'],
    queryFn: async (): Promise<AttendanceStats> => {
      const response = await fetch('/api/attendance/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch attendance stats');
      }
      const result = await response.json();
      return result.data;
    },
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
      queryClient.invalidateQueries({ queryKey: ['attendance-stats'] });
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
          label: 'شما در حال کار هستید',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          buttonText: 'ثبت خروج',
          buttonVariant: 'destructive' as const,
        };
      case 'on-break':
        return {
          icon: Clock,
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const statusInfo = getStatusInfo();

  if (statusLoading || statsLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='text-center'>
          <div className='w-8 h-8 border-2 border-[#ff0a54] border-t-transparent rounded-full animate-spin mx-auto mb-4' />
          <p className='text-gray-600'>در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <OptimizedMotion
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className='mb-6'
      >
        <div className='flex items-center gap-3 mb-4'>
          <div className='p-2 bg-[#ff0a54]/10 rounded-xl'>
            <Calendar className='h-6 w-6 text-[#ff0a54]' />
          </div>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              مدیریت حضور و غیاب
            </h1>
            <p className='text-gray-600'>سیستم حضور و غیاب دسکتاپ</p>
          </div>
        </div>
      </OptimizedMotion>

      {/* Two Column Layout */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Main Column - Clock In/Out and Today's Records */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Clock In/Out Card */}
          <OptimizedMotion
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Clock className='h-5 w-5 text-[#ff0a54]' />
                  وضعیت حضور
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                {/* Current Status */}
                {statusInfo && (
                  <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
                    <div className='flex items-center gap-3'>
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
                    <Badge className={`${statusInfo.bgColor} ${statusInfo.color} border-0`}>
                      {attendanceStatus?.status === 'active'
                        ? 'فعال'
                        : attendanceStatus?.status === 'on-break'
                          ? 'استراحت'
                          : attendanceStatus?.status === 'completed'
                            ? 'تمام شده'
                            : 'غیرفعال'}
                    </Badge>
                  </div>
                )}

                {/* Work Duration (if clocked in) */}
                {attendanceStatus?.status === 'active' && getWorkDuration() && (
                  <OptimizedMotion
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className='p-4 bg-green-50 rounded-lg border border-green-200'
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <Timer className='h-5 w-5 text-green-600' />
                        <span className='text-green-700 font-medium'>مدت کار:</span>
                      </div>
                      <span className='text-2xl font-mono font-bold text-green-800'>
                        {getWorkDuration()}
                      </span>
                    </div>
                  </OptimizedMotion>
                )}

                {/* Clock In/Out Button */}
                <Button
                  onClick={handleClockInOut}
                  disabled={clockInOutMutation.isPending}
                  className={`w-full h-12 text-lg font-semibold ${
                    statusInfo?.buttonVariant === 'destructive'
                      ? 'bg-red-500 hover:bg-red-600 text-white'
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
              </CardContent>
            </Card>
          </OptimizedMotion>

          {/* Today's Attendance Records */}
          <OptimizedMotion
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <CalendarDays className='h-5 w-5 text-[#ff0a54]' />
                  رکوردهای امروز
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.recentRecords && stats.recentRecords.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>تاریخ</TableHead>
                        <TableHead>ورود</TableHead>
                        <TableHead>خروج</TableHead>
                        <TableHead>مدت کار</TableHead>
                        <TableHead>وضعیت</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.recentRecords.map((record, index) => (
                        <OptimizedMotion
                          key={record.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <TableRow>
                            <TableCell className='font-medium'>
                              {formatDate(record.date)}
                            </TableCell>
                            <TableCell>
                              <div className='flex items-center gap-2'>
                                <LogIn className='h-4 w-4 text-green-600' />
                                {record.checkIn}
                              </div>
                            </TableCell>
                            <TableCell>
                              {record.checkOut ? (
                                <div className='flex items-center gap-2'>
                                  <LogOut className='h-4 w-4 text-red-600' />
                                  {record.checkOut}
                                </div>
                              ) : (
                                <span className='text-gray-400'>-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {record.totalHours ? (
                                <span className='font-mono'>
                                  {Math.floor(record.totalHours)}:{(record.totalHours % 1 * 60).toFixed(0).padStart(2, '0')}
                                </span>
                              ) : (
                                <span className='text-gray-400'>-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  record.status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-blue-100 text-blue-800'
                                }
                              >
                                {record.status === 'completed' ? 'تکمیل شده' : 'در حال انجام'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        </OptimizedMotion>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className='text-center py-8'>
                    <Calendar className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                    <p className='text-gray-600'>هیچ رکورد حضوری برای امروز یافت نشد</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </OptimizedMotion>
        </div>

        {/* Sidebar - Statistics */}
        <div className='space-y-6'>
          {/* Statistics Card */}
          <OptimizedMotion
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <BarChart3 className='h-5 w-5 text-[#ff0a54]' />
                  آمار حضور
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* Today's Stats */}
                <div className='p-3 bg-blue-50 rounded-lg'>
                  <div className='flex items-center gap-2 mb-2'>
                    <Clock3 className='h-4 w-4 text-blue-600' />
                    <span className='text-sm font-medium text-blue-800'>امروز</span>
                  </div>
                  <div className='text-2xl font-bold text-blue-900'>
                    {stats?.today.totalHours.toFixed(1) || 0} ساعت
                  </div>
                  <div className='text-xs text-blue-600'>
                    {stats?.today.records || 0} رکورد
                  </div>
                </div>

                {/* This Week's Stats */}
                <div className='p-3 bg-green-50 rounded-lg'>
                  <div className='flex items-center gap-2 mb-2'>
                    <TrendingUp className='h-4 w-4 text-green-600' />
                    <span className='text-sm font-medium text-green-800'>این هفته</span>
                  </div>
                  <div className='text-xl font-bold text-green-900'>
                    {stats?.thisWeek.totalHours.toFixed(1) || 0} ساعت
                  </div>
                  <div className='text-xs text-green-600'>
                    میانگین: {stats?.thisWeek.averageHours.toFixed(1) || 0} ساعت/روز
                  </div>
                </div>

                {/* This Month's Stats */}
                <div className='p-3 bg-orange-50 rounded-lg'>
                  <div className='flex items-center gap-2 mb-2'>
                    <Calendar className='h-4 w-4 text-orange-600' />
                    <span className='text-sm font-medium text-orange-800'>این ماه</span>
                  </div>
                  <div className='text-xl font-bold text-orange-900'>
                    {stats?.thisMonth.totalHours.toFixed(1) || 0} ساعت
                  </div>
                  <div className='text-xs text-orange-600'>
                    {stats?.thisMonth.workingDays || 0} روز کاری
                  </div>
                </div>

                {/* This Year's Stats */}
                <div className='p-3 bg-purple-50 rounded-lg'>
                  <div className='flex items-center gap-2 mb-2'>
                    <BarChart3 className='h-4 w-4 text-purple-600' />
                    <span className='text-sm font-medium text-purple-800'>امسال</span>
                  </div>
                  <div className='text-xl font-bold text-purple-900'>
                    {stats?.thisYear.totalHours.toFixed(1) || 0} ساعت
                  </div>
                  <div className='text-xs text-purple-600'>
                    {stats?.thisYear.records || 0} رکورد کل
                  </div>
                </div>
              </CardContent>
            </Card>
          </OptimizedMotion>

          {/* Quick Actions */}
          <OptimizedMotion
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>دسترسی سریع</CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                <Button variant='outline' className='w-full justify-start'>
                  <Calendar className='h-4 w-4 mr-2' />
                  مشاهده تقویم
                </Button>
                <Button variant='outline' className='w-full justify-start'>
                  <TrendingUp className='h-4 w-4 mr-2' />
                  گزارش‌های تفصیلی
                </Button>
                <Button variant='outline' className='w-full justify-start'>
                  <Clock className='h-4 w-4 mr-2' />
                  تنظیمات حضور
                </Button>
              </CardContent>
            </Card>
          </OptimizedMotion>
        </div>
      </div>
    </div>
  );
}
