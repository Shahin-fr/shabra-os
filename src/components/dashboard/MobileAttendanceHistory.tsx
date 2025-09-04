'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Calendar,
  LogIn,
  LogOut,
  Coffee,
  TrendingUp,
  Download,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  totalHours?: number;
  status: 'completed' | 'in-progress' | 'late' | 'early';
  breakDuration?: number;
}

// Mock attendance data
const mockAttendanceData: AttendanceRecord[] = [
  {
    id: '1',
    date: '2024-01-15',
    checkIn: '08:30',
    checkOut: '17:45',
    totalHours: 9.25,
    status: 'completed',
    breakDuration: 60,
  },
  {
    id: '2',
    date: '2024-01-14',
    checkIn: '08:45',
    checkOut: '18:00',
    totalHours: 9.25,
    status: 'late',
    breakDuration: 60,
  },
  {
    id: '3',
    date: '2024-01-13',
    checkIn: '08:15',
    checkOut: '17:30',
    totalHours: 9.25,
    status: 'completed',
    breakDuration: 60,
  },
  {
    id: '4',
    date: '2024-01-12',
    checkIn: '08:30',
    checkOut: undefined,
    totalHours: undefined,
    status: 'in-progress',
    breakDuration: 30,
  },
  {
    id: '5',
    date: '2024-01-11',
    checkIn: '08:20',
    checkOut: '17:00',
    totalHours: 8.67,
    status: 'early',
    breakDuration: 60,
  },
];

const statusConfig = {
  completed: {
    label: 'تکمیل شده',
    color: 'bg-green-100 text-green-800',
    icon: LogOut,
  },
  'in-progress': {
    label: 'در حال انجام',
    color: 'bg-blue-100 text-blue-800',
    icon: LogIn,
  },
  late: {
    label: 'تأخیر',
    color: 'bg-orange-100 text-orange-800',
    icon: Clock,
  },
  early: {
    label: 'زودتر از موعد',
    color: 'bg-purple-100 text-purple-800',
    icon: Clock,
  },
};

interface MobileAttendanceHistoryProps {
  className?: string;
}

export function MobileAttendanceHistory({
  className,
}: MobileAttendanceHistoryProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [filteredData, setFilteredData] = useState(mockAttendanceData);

  const getPeriodData = (period: string) => {
    const now = new Date();
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 90;

    return mockAttendanceData.filter(record => {
      const recordDate = new Date(record.date);
      const diffTime = now.getTime() - recordDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= days;
    });
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    setFilteredData(getPeriodData(period));
  };

  const getTotalHours = () => {
    return filteredData
      .filter(record => record.totalHours)
      .reduce((sum, record) => sum + (record.totalHours || 0), 0);
  };

  const getAverageHours = () => {
    const completedRecords = filteredData.filter(record => record.totalHours);
    return completedRecords.length > 0
      ? getTotalHours() / completedRecords.length
      : 0;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className={`space-y-4 ${className}`}
      variants={containerVariants}
      initial='hidden'
      animate='visible'
    >
      {/* Header with Stats */}
      <motion.div variants={itemVariants}>
        <Card
          style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          <CardHeader className='pb-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-[#ff0a54]/10 rounded-xl'>
                  <Calendar className='h-5 w-5 text-[#ff0a54]' />
                </div>
                <div>
                  <CardTitle className='text-lg font-semibold'>
                    تاریخچه حضور
                  </CardTitle>
                  <p className='text-sm text-gray-600'>آمار حضور و غیاب</p>
                </div>
              </div>
              <Button variant='outline' size='sm'>
                <Download className='h-4 w-4 ml-2' />
                گزارش
              </Button>
            </div>
          </CardHeader>
          <CardContent className='pt-0'>
            {/* Period Selector */}
            <div className='mb-4'>
              <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='انتخاب دوره' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='week'>هفته جاری</SelectItem>
                  <SelectItem value='month'>ماه جاری</SelectItem>
                  <SelectItem value='quarter'>سه ماهه</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Summary Stats */}
            <div className='grid grid-cols-2 gap-4'>
              <div className='p-3 bg-gray-50/50 rounded-lg text-center'>
                <div className='text-2xl font-bold text-gray-900'>
                  {getTotalHours().toFixed(1)}
                </div>
                <div className='text-xs text-gray-600'>ساعت کل</div>
              </div>
              <div className='p-3 bg-gray-50/50 rounded-lg text-center'>
                <div className='text-2xl font-bold text-gray-900'>
                  {getAverageHours().toFixed(1)}
                </div>
                <div className='text-xs text-gray-600'>میانگین روزانه</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Attendance Records */}
      <motion.div variants={itemVariants}>
        <Card
          style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          <CardHeader className='pb-3'>
            <CardTitle className='text-lg font-semibold'>
              رکوردهای حضور
            </CardTitle>
          </CardHeader>
          <CardContent className='pt-0'>
            <div className='space-y-3'>
              <AnimatePresence>
                {filteredData.map((record, index) => {
                  const status = statusConfig[record.status];
                  const StatusIcon = status.icon;

                  return (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className='p-4 rounded-lg border border-gray-200/50 bg-white/50'
                    >
                      <div className='flex items-center justify-between mb-3'>
                        <div className='flex items-center gap-3'>
                          <div className='p-2 bg-gray-100 rounded-lg'>
                            <StatusIcon className='h-4 w-4 text-gray-600' />
                          </div>
                          <div>
                            <div className='font-medium text-gray-900'>
                              {formatDate(record.date)}
                            </div>
                            <div className='text-sm text-gray-600'>
                              {record.checkIn} -{' '}
                              {record.checkOut || 'در حال کار'}
                            </div>
                          </div>
                        </div>
                        <Badge className={status.color}>{status.label}</Badge>
                      </div>

                      <div className='grid grid-cols-2 gap-4 text-sm'>
                        <div className='flex items-center gap-2'>
                          <LogIn className='h-4 w-4 text-green-600' />
                          <span className='text-gray-600'>ورود:</span>
                          <span className='font-medium'>{record.checkIn}</span>
                        </div>
                        {record.checkOut && (
                          <div className='flex items-center gap-2'>
                            <LogOut className='h-4 w-4 text-red-600' />
                            <span className='text-gray-600'>خروج:</span>
                            <span className='font-medium'>
                              {record.checkOut}
                            </span>
                          </div>
                        )}
                        {record.totalHours && (
                          <div className='flex items-center gap-2'>
                            <TrendingUp className='h-4 w-4 text-blue-600' />
                            <span className='text-gray-600'>کل ساعت:</span>
                            <span className='font-medium'>
                              {record.totalHours}h
                            </span>
                          </div>
                        )}
                        {record.breakDuration && (
                          <div className='flex items-center gap-2'>
                            <Coffee className='h-4 w-4 text-orange-600' />
                            <span className='text-gray-600'>استراحت:</span>
                            <span className='font-medium'>
                              {record.breakDuration}min
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
