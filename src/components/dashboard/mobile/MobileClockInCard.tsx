'use client';

import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { Clock, Play, Square, Coffee } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ClockInData {
  isClockedIn: boolean;
  clockInTime?: string;
  clockOutTime?: string;
  breakTime?: number;
  totalHours?: number;
  status: 'working' | 'break' | 'offline';
}

export function MobileClockInCard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clockData, setClockData] = useState<ClockInData>({
    isClockedIn: false,
    status: 'offline',
  });

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const handleClockIn = () => {
    setClockData({
      isClockedIn: true,
      clockInTime: formatTime(new Date()),
      status: 'working',
    });
  };

  const handleClockOut = () => {
    setClockData({
      isClockedIn: false,
      clockOutTime: formatTime(new Date()),
      status: 'offline',
    });
  };

  const handleBreak = () => {
    setClockData(prev => ({
      ...prev,
      status: prev.status === 'break' ? 'working' : 'break',
    }));
  };

  return (
    <OptimizedMotion
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className='w-full'
    >
      <Card className='mobile-card bg-gradient-to-br from-[#ff0a54]/10 via-white to-purple-500/5'>
        <CardContent className='mobile-padding'>
          {/* Header */}
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center gap-3'>
              <div className='w-12 h-12 bg-[#ff0a54]/20 rounded-2xl flex items-center justify-center'>
                <Clock className='h-6 w-6 text-[#ff0a54]' />
              </div>
              <div>
                <h2 className='text-lg font-bold text-gray-900'>حضور و غیاب</h2>
                <p className='text-sm text-gray-600'>
                  {formatDate(currentTime)}
                </p>
              </div>
            </div>

            {/* Status Indicator */}
            <div
              className={cn(
                'px-3 py-1 rounded-full text-xs font-semibold',
                clockData.status === 'working'
                  ? 'bg-green-100 text-green-800'
                  : '',
                clockData.status === 'break'
                  ? 'bg-yellow-100 text-yellow-800'
                  : '',
                clockData.status === 'offline'
                  ? 'bg-gray-100 text-gray-800'
                  : ''
              )}
            >
              {clockData.status === 'working' && 'در حال کار'}
              {clockData.status === 'break' && 'استراحت'}
              {clockData.status === 'offline' && 'خارج از کار'}
            </div>
          </div>

          {/* Time Display */}
          <div className='text-center mb-6'>
            <div className='text-4xl font-bold text-gray-900 mb-2'>
              {formatTime(currentTime)}
            </div>
            <div className='text-sm text-gray-600'>
              {clockData.isClockedIn && clockData.clockInTime && (
                <span>شروع کار: {clockData.clockInTime}</span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex gap-3'>
            {!clockData.isClockedIn ? (
              <Button
                onClick={handleClockIn}
                className='mobile-button flex-1 bg-[#ff0a54] hover:bg-[#ff0a54]/90 text-white'
              >
                <Play className='h-5 w-5 ms-2' />
                شروع کار
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleBreak}
                  variant='outline'
                  className='mobile-button flex-1 border-gray-200'
                >
                  <Coffee className='h-5 w-5 ms-2' />
                  {clockData.status === 'break' ? 'ادامه کار' : 'استراحت'}
                </Button>
                <Button
                  onClick={handleClockOut}
                  className='mobile-button flex-1 bg-red-500 hover:bg-red-600 text-white'
                >
                  <Square className='h-5 w-5 ms-2' />
                  پایان کار
                </Button>
              </>
            )}
          </div>

          {/* Work Summary */}
          {clockData.isClockedIn && (
            <OptimizedMotion
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className='mt-4 pt-4 border-t border-gray-200'
            >
              <div className='flex items-center justify-between text-sm'>
                <span className='text-gray-600'>ساعات کار امروز:</span>
                <span className='font-semibold text-gray-900'>
                  8 ساعت 30 دقیقه
                </span>
              </div>
            </OptimizedMotion>
          )}
        </CardContent>
      </Card>
    </OptimizedMotion>
  );
}

function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

