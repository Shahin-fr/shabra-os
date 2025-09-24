'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import {
  Calendar as CalendarIcon,
  Users,
  AlertTriangle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
// import { toast } from 'sonner';

// import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CapacityForecastWidget } from './CapacityForecastWidget';

// Set up moment locale for Persian
import 'moment/locale/fa';
moment.locale('fa');

// Set up the localizer
const localizer = momentLocalizer(moment);

interface TeamCalendarData {
  leaveRequests: Array<{
    id: string;
    userId: string;
    userName: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    reason: string;
  }>;
  holidays: Array<{
    id: string;
    name: string;
    date: string;
  }>;
  workSchedules: Array<{
    userId: string;
    userName: string;
    weeklyDaysOff: string[];
  }>;
  teamMembers: Array<{
    id: string;
    name: string;
    isActive: boolean;
  }>;
  capacityForecast: Array<{
    date: string;
    totalTeamMembers: number;
    onLeave: number;
    availableHeadcount: number;
    isAtRisk: boolean;
  }>;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'leave' | 'holiday' | 'dayoff';
  resource?: any;
}

const LEAVE_TYPE_LABELS = {
  ANNUAL: 'مرخصی سالانه',
  SICK: 'مرخصی استعلاجی',
  UNPAID: 'مرخصی بدون حقوق',
  EMERGENCY: 'مرخصی اضطراری',
  MATERNITY: 'مرخصی زایمان',
  PATERNITY: 'مرخصی پدری',
  STUDY: 'مرخصی تحصیلی',
  OTHER: 'سایر',
};

const LEAVE_TYPE_COLORS = {
  ANNUAL: '#3B82F6', // Blue
  SICK: '#EF4444', // Red
  UNPAID: '#6B7280', // Gray
  EMERGENCY: '#F59E0B', // Orange
  MATERNITY: '#EC4899', // Pink
  PATERNITY: '#8B5CF6', // Purple
  STUDY: '#10B981', // Green
  OTHER: '#6366F1', // Indigo
};

export function TeamCalendarDashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>('month');

  // Calculate date range for the current view
  const getDateRange = (date: Date, view: View) => {
    const start = new Date(date);
    const end = new Date(date);

    switch (view) {
      case 'month':
        start.setDate(1);
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
        break;
      case 'week':
        start.setDate(date.getDate() - date.getDay());
        end.setDate(start.getDate() + 6);
        break;
      case 'day':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
    }

    return { start, end };
  };

  const { start, end } = getDateRange(currentDate, view);

  // Fetch team calendar data
  const {
    data: calendarData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['team-calendar', start.toISOString(), end.toISOString()],
    queryFn: async (): Promise<TeamCalendarData> => {
      const params = new URLSearchParams({
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });

      const response = await fetch(`/api/admin/team-calendar?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch team calendar data');
      }
      return response.json();
    },
    retry: 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Process data into calendar events
  const events: CalendarEvent[] = useMemo(() => {
    if (!calendarData) return [];

    const events: CalendarEvent[] = [];

    // Add leave requests
    calendarData.leaveRequests.forEach(leave => {
      events.push({
        id: `leave-${leave.id}`,
        title: `${leave.userName} - ${LEAVE_TYPE_LABELS[leave.leaveType as keyof typeof LEAVE_TYPE_LABELS] || leave.leaveType}`,
        start: new Date(leave.startDate),
        end: new Date(leave.endDate),
        type: 'leave',
        resource: {
          leaveType: leave.leaveType,
          userName: leave.userName,
          reason: leave.reason,
        },
      });
    });

    // Add holidays
    calendarData.holidays.forEach(holiday => {
      const holidayDate = new Date(holiday.date);
      events.push({
        id: `holiday-${holiday.id}`,
        title: holiday.name,
        start: holidayDate,
        end: holidayDate,
        type: 'holiday',
        resource: {
          name: holiday.name,
        },
      });
    });

    return events;
  }, [calendarData]);

  // Event style getter
  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3174ad';
    let borderColor = '#3174ad';

    switch (event.type) {
      case 'leave': {
        const leaveType = event.resource?.leaveType;
        backgroundColor = LEAVE_TYPE_COLORS[leaveType as keyof typeof LEAVE_TYPE_COLORS] || '#3174ad';
        borderColor = backgroundColor;
        break;
      }
      case 'holiday':
        backgroundColor = '#F59E0B';
        borderColor = '#F59E0B';
        break;
      case 'dayoff':
        backgroundColor = '#6B7280';
        borderColor = '#6B7280';
        break;
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: 'none',
        display: 'block',
        fontSize: '12px',
        padding: '2px 4px',
      },
    };
  };

  // Navigation handlers
  const navigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
    switch (action) {
      case 'PREV':
        if (view === 'month') {
          setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
        } else if (view === 'week') {
          setCurrentDate(prev => new Date(prev.getTime() - 7 * 24 * 60 * 60 * 1000));
        } else {
          setCurrentDate(prev => new Date(prev.getTime() - 24 * 60 * 60 * 1000));
        }
        break;
      case 'NEXT':
        if (view === 'month') {
          setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
        } else if (view === 'week') {
          setCurrentDate(prev => new Date(prev.getTime() + 7 * 24 * 60 * 60 * 1000));
        } else {
          setCurrentDate(prev => new Date(prev.getTime() + 24 * 60 * 60 * 1000));
        }
        break;
      case 'TODAY':
        setCurrentDate(new Date());
        break;
    }
  };

  // Get at-risk days for the current month
  const atRiskDays = useMemo(() => {
    if (!calendarData) return [];
    return calendarData.capacityForecast.filter(day => day.isAtRisk);
  }, [calendarData]);

  if (error) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center justify-center py-12'>
          <AlertCircle className='h-12 w-12 text-red-500 mb-4' />
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>
            خطا در بارگذاری تقویم
          </h3>
          <p className='text-gray-600 text-center mb-4'>
            متأسفانه خطایی در بارگذاری داده‌های تقویم رخ داده است.
          </p>
          <Button onClick={() => refetch()} variant='outline'>
            <RefreshCw className='h-4 w-4 mr-2' />
            تلاش مجدد
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Capacity Forecast Widget */}
      <OptimizedMotion
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">کل اعضای تیم</span>
              </div>
              <div className="text-2xl font-bold mt-1">
                {calendarData?.teamMembers.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">درخواست‌های مرخصی</span>
              </div>
              <div className="text-2xl font-bold mt-1">
                {calendarData?.leaveRequests.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">تعطیلات</span>
              </div>
              <div className="text-2xl font-bold mt-1">
                {calendarData?.holidays.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium">روزهای پرخطر</span>
              </div>
              <div className="text-2xl font-bold mt-1">
                {atRiskDays.length}
              </div>
            </CardContent>
          </Card>
        </div>
      </OptimizedMotion>

      {/* At-Risk Days Alert */}
      {atRiskDays.length > 0 && (
        <OptimizedMotion
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>هشدار:</strong> {atRiskDays.length} روز در این ماه دارای ظرفیت کمتر از ۵۰٪ هستند. 
              لطفاً برنامه‌ریزی خود را بررسی کنید.
            </AlertDescription>
          </Alert>
        </OptimizedMotion>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="xl:col-span-2">
          <OptimizedMotion
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>تقویم تیم</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  بروزرسانی
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="mr-3 text-gray-600">در حال بارگذاری تقویم...</span>
              </div>
            ) : (
              <div className="h-[600px]">
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  view={view}
                  onView={setView}
                  date={currentDate}
                  onNavigate={setCurrentDate}
                  eventPropGetter={eventStyleGetter}
                  style={{ height: '100%' }}
                  messages={{
                    next: 'بعدی',
                    previous: 'قبلی',
                    today: 'امروز',
                    month: 'ماه',
                    week: 'هفته',
                    day: 'روز',
                    agenda: 'برنامه',
                    date: 'تاریخ',
                    time: 'زمان',
                    event: 'رویداد',
                    noEventsInRange: 'هیچ رویدادی در این بازه زمانی وجود ندارد',
                    showMore: (total: number) => `+${total} بیشتر`,
                  }}
                  components={{
                    toolbar: (_props: any) => (
                      <div className="flex items-center justify-between mb-4 p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => navigate('PREV')}
                            variant="outline"
                            size="sm"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => navigate('TODAY')}
                            variant="outline"
                            size="sm"
                          >
                            امروز
                          </Button>
                          <Button
                            onClick={() => navigate('NEXT')}
                            variant="outline"
                            size="sm"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-lg font-semibold">
                          {moment(currentDate).format('MMMM YYYY')}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => setView('month')}
                            variant={view === 'month' ? 'default' : 'outline'}
                            size="sm"
                          >
                            ماه
                          </Button>
                          <Button
                            onClick={() => setView('week')}
                            variant={view === 'week' ? 'default' : 'outline'}
                            size="sm"
                          >
                            هفته
                          </Button>
                          <Button
                            onClick={() => setView('day')}
                            variant={view === 'day' ? 'default' : 'outline'}
                            size="sm"
                          >
                            روز
                          </Button>
                        </div>
                      </div>
                    ),
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </OptimizedMotion>
        </div>

        {/* Capacity Forecast Widget */}
        <div className="xl:col-span-1">
          <OptimizedMotion
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <CapacityForecastWidget 
              data={calendarData?.capacityForecast || []} 
              currentMonth={currentDate}
            />
          </OptimizedMotion>
        </div>
      </div>

      {/* Legend */}
      <OptimizedMotion
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">راهنمای رنگ‌ها</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F59E0B' }}></div>
                <span className="text-sm">تعطیلات</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3B82F6' }}></div>
                <span className="text-sm">مرخصی سالانه</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#EF4444' }}></div>
                <span className="text-sm">مرخصی استعلاجی</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F59E0B' }}></div>
                <span className="text-sm">مرخصی اضطراری</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </OptimizedMotion>
    </div>
  );
}
