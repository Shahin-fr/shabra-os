'use client';

import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { Clock, Calendar, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AttendanceClockWidget() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<string | null>(null);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  // Get greeting based on time
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'صبح بخیر';
    if (hour < 17) return 'ظهر بخیر';
    if (hour < 20) return 'عصر بخیر';
    return 'شب بخیر';
  };

  // Handle clock in/out
  const handleClockInOut = () => {
    if (isClockedIn) {
      // Clock out
      setIsClockedIn(false);
      setClockInTime(null);
    } else {
      // Clock in
      setIsClockedIn(true);
      setClockInTime(formatTime(currentTime));
    }
  };

  // Calculate work duration
  const getWorkDuration = () => {
    if (!isClockedIn || !clockInTime) return '00:00:00';

    const timeParts = clockInTime.split(':');
    if (timeParts.length !== 3) return '00:00:00';

    const clockInDate = new Date();
    clockInDate.setHours(parseInt(timeParts[0] || '0'));
    clockInDate.setMinutes(parseInt(timeParts[1] || '0'));
    clockInDate.setSeconds(parseInt(timeParts[2] || '0'));

    const now = new Date();
    const diff = now.getTime() - clockInDate.getTime();

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

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
          {/* Greeting */}
          <OptimizedMotion
            className='text-center'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className='text-lg font-semibold text-gray-700 mb-2'>
              {getGreeting()}
            </h3>
            <p className='text-sm text-gray-500'>{formatDate(currentTime)}</p>
          </OptimizedMotion>

          {/* Digital Clock */}
          <OptimizedMotion
            className='text-center'
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className='bg-gradient-to-br from-[#ff0a54]/10 to-purple-500/10 p-6 rounded-2xl border border-[#ff0a54]/20'>
              <div className='text-4xl font-mono font-bold text-[#ff0a54] mb-2'>
                {formatTime(currentTime)}
              </div>
              <div className='flex items-center justify-center gap-2 text-sm text-gray-600'>
                <Calendar className='h-4 w-4' />
                <span>{formatDate(currentTime)}</span>
              </div>
            </div>
          </OptimizedMotion>

          {/* Clock In/Out Button */}
          <OptimizedMotion
            className='text-center'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              onClick={handleClockInOut}
              size='lg'
              className={`w-full h-16 text-xl font-bold transition-all duration-300 ${
                isClockedIn
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-[#ff0a54] hover:bg-[#ff0a54]/90 text-white'
              }`}
            >
              {isClockedIn ? 'ثبت خروج' : 'ثبت ورود'}
            </Button>
          </OptimizedMotion>

          {/* Status and Duration */}
          {isClockedIn && (
            <OptimizedMotion
              className='space-y-4'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
                <div className='flex items-center justify-center gap-2 text-green-700 mb-2'>
                  <Sun className='h-5 w-5' />
                  <span className='font-semibold'>در حال کار</span>
                </div>
                <div className='text-center'>
                  <div className='text-sm text-green-600 mb-1'>زمان ورود:</div>
                  <div className='text-lg font-mono font-bold text-green-700'>
                    {clockInTime}
                  </div>
                </div>
              </div>

              <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                <div className='text-center'>
                  <div className='text-sm text-blue-600 mb-1'>مدت کار:</div>
                  <div className='text-2xl font-mono font-bold text-blue-700'>
                    {getWorkDuration()}
                  </div>
                </div>
              </div>
            </OptimizedMotion>
          )}

          {/* Quick Stats */}
          <OptimizedMotion
            className='grid grid-cols-2 gap-4 pt-4 border-t border-gray-200'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className='text-center'>
              <div className='text-2xl font-bold text-[#ff0a54]'>8</div>
              <div className='text-xs text-gray-500'>ساعت کار امروز</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-500'>92%</div>
              <div className='text-xs text-gray-500'>نرخ حضور</div>
            </div>
          </OptimizedMotion>
        </CardContent>
      </Card>
    </OptimizedMotion>
  );
}

