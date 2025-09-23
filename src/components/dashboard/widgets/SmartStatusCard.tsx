'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LogIn, LogOut, CheckCircle, AlertCircle } from 'lucide-react';
import { WidgetCard } from './WidgetCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';

interface AttendanceData {
  isClockedIn: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  workDuration?: string;
  todayHours?: number;
}

interface SmartStatusCardProps {
  className?: string;
  variant?: 'mobile' | 'desktop';
}

export const SmartStatusCard = React.memo(function SmartStatusCard({ className, variant = 'desktop' }: SmartStatusCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const queryClient = useQueryClient();

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const { data: attendance, isLoading: attendanceLoading, error: attendanceError } = useQuery({
    queryKey: ['attendance', 'today'],
    queryFn: async (): Promise<AttendanceData> => {
      const response = await fetch('/api/attendance');
      
      if (!response.ok) {
        // const errorText = await response.text();
        throw new Error('Failed to fetch attendance data');
      }
      
      const data = await response.json();
      
      // Transform the API response to match our interface
      const attendanceData: AttendanceData = {
        isClockedIn: data.data?.isClockedIn || false,
        checkInTime: data.data?.currentAttendance?.checkIn ? 
          new Date(data.data.currentAttendance.checkIn).toLocaleTimeString('fa-IR', {
            hour: '2-digit',
            minute: '2-digit'
          }) : undefined,
        checkOutTime: data.data?.currentAttendance?.checkOut ? 
          new Date(data.data.currentAttendance.checkOut).toLocaleTimeString('fa-IR', {
            hour: '2-digit',
            minute: '2-digit'
          }) : undefined,
        workDuration: data.data?.currentAttendance?.checkIn && !data.data?.currentAttendance?.checkOut ? 
          calculateWorkDuration(data.data.currentAttendance.checkIn) : undefined,
        todayHours: 0, // We'll calculate this if needed
      };
      
      return attendanceData;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes - attendance changes frequently
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Helper function to calculate work duration
  const calculateWorkDuration = (checkInTime: string) => {
    const checkIn = new Date(checkInTime);
    const now = new Date();
    const diffMs = now.getTime() - checkIn.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours} ساعت و ${diffMinutes} دقیقه`;
  };

  const clockInMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/attendance', {
        method: 'POST',
      });
      
      if (!response.ok) {
        // const errorText = await response.text();
        throw new Error('Failed to clock in');
      }
      
      const data = await response.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/attendance', {
        method: 'POST',
      });
      
      if (!response.ok) {
        // const errorText = await response.text();
        throw new Error('Failed to clock out');
      }
      
      const data = await response.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });

  const handleClockAction = async () => {
    if (!attendance) return;
    
    setIsLoading(true);
    try {
      if (attendance.isClockedIn) {
        await clockOutMutation.mutateAsync();
      } else {
        await clockInMutation.mutateAsync();
      }
    } catch (error) {
      // Handle error silently or show user-friendly message
    } finally {
      setIsLoading(false);
    }
  };

  // const getGreeting = () => {
  //   const hour = new Date().getHours();
  //   if (hour < 12) return 'صبح بخیر';
  //   if (hour < 17) return 'ظهر بخیر';
  //   return 'عصر بخیر';
  // };

  const getStatusInfo = () => {
    if (!attendance) return null;
    
    if (attendance.isClockedIn) {
      return {
        label: 'در حال کار',
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        buttonText: 'ثبت خروج',
        buttonVariant: 'destructive' as const
      };
    } else {
      return {
        label: 'خارج از کار',
        icon: AlertCircle,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        buttonText: 'ثبت ورود',
        buttonVariant: 'default' as const
      };
    }
  };

  const isMobile = variant === 'mobile';

  if (attendanceLoading) {
    return (
      <WidgetCard
        title={isMobile ? 'وضعیت کار' : 'وضعیت حضور'}
        className={cn(
          'bg-gradient-to-br from-white to-gray-50',
          isMobile ? 'p-4' : 'p-6',
          className
        )}
        loading={true}
      >
        <div className="flex items-center justify-center h-32">
          <div className="text-sm text-gray-500">در حال بارگذاری...</div>
        </div>
      </WidgetCard>
    );
  }

  if (attendanceError) {
    return (
      <WidgetCard
        title={isMobile ? 'وضعیت کار' : 'وضعیت حضور'}
        className={cn(
          'bg-gradient-to-br from-red-50 to-pink-50',
          isMobile ? 'p-4' : 'p-6',
          className
        )}
      >
        <div className="text-center py-4">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 text-sm">خطا در بارگذاری اطلاعات</p>
        </div>
      </WidgetCard>
    );
  }

  const statusInfo = getStatusInfo();

  return (
    <WidgetCard
      title={isMobile ? 'وضعیت کار' : 'وضعیت حضور'}
      className={cn(
        'bg-gradient-to-br from-slate-50 via-white to-blue-50/30 border-0 shadow-xl',
        isMobile ? 'p-4' : 'p-6',
        className
      )}
    >
      <div className="space-y-6">
        {/* Modern Status Header */}
        <OptimizedMotion
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          {/* Current Time */}
          <div className="text-3xl font-bold text-gray-900 bg-white/60 rounded-2xl py-3 px-6 shadow-inner font-vazirmatn">
            {currentTime.toLocaleTimeString('fa-IR', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </div>
        </OptimizedMotion>

        {/* Modern Status Card */}
        {statusInfo && (
          <OptimizedMotion
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative overflow-hidden"
          >
            <div className={cn(
              "relative p-6 rounded-2xl border-2 transition-all duration-300",
              attendance?.isClockedIn 
                ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-green-100" 
                : "bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200 shadow-gray-100"
            )}>
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12"></div>
              </div>
              
              <div className="relative text-center space-y-4">
                {/* Status Icon and Text */}
                <div className="flex flex-col items-center space-y-3">
                  <div className={cn(
                    "p-3 rounded-xl shadow-md transition-all duration-300",
                    attendance?.isClockedIn 
                      ? "bg-gradient-to-br from-green-400 to-emerald-500 shadow-green-200" 
                      : "bg-gradient-to-br from-gray-400 to-slate-500 shadow-gray-200"
                  )}>
                    <statusInfo.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 font-vazirmatn">
                      {statusInfo.label}
                    </h3>
                    <p className="text-sm text-gray-600 font-vazirmatn">
                      {attendance?.checkInTime ? `ورود: ${attendance.checkInTime}` : 'آماده برای شروع کار'}
                    </p>
                  </div>
                </div>
                
                {/* Work Duration Badge */}
                {attendance?.isClockedIn && attendance.workDuration && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg">
                    <div className="text-xs text-gray-500 mb-1 font-vazirmatn">مدت کار</div>
                    <div className="text-lg font-bold text-gray-900 font-vazirmatn">
                      {attendance.workDuration}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </OptimizedMotion>
        )}

        {/* Modern Action Button */}
        <OptimizedMotion
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={handleClockAction}
            disabled={isLoading || attendanceLoading}
            className={cn(
              "w-full h-16 text-xl font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-xl",
              "rounded-2xl border-0 font-vazirmatn",
              statusInfo?.buttonVariant === 'destructive'
                ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-red-200"
                : "bg-gradient-to-r from-[#ff0a54] to-pink-600 hover:from-pink-600 hover:to-[#ff0a54] text-white shadow-pink-200"
            )}
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>در حال پردازش...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {attendance?.isClockedIn ? (
                  <LogOut className="h-5 w-5" />
                ) : (
                  <LogIn className="h-5 w-5" />
                )}
                <span>{statusInfo?.buttonText}</span>
              </div>
            )}
          </Button>
        </OptimizedMotion>
      </div>
    </WidgetCard>
  );
});