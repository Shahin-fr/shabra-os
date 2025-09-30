'use client';

import { useState, useMemo } from 'react';
import { Calendar } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { jalaliLocalizer } from '@/lib/jalali-localizer';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Users, Clock, Calendar as CalendarIcon, Grid3X3, List, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreateMeetingForm } from '@/components/meetings/CreateMeetingForm';
import { MeetingDetails } from '@/components/meetings/MeetingDetails';
import { useAuth } from '@/hooks/useAuth';
import { isAdminOrManagerUser } from '@/lib/auth-utils';

// Use Jalali localizer for Persian calendar
const localizer = jalaliLocalizer;

interface Meeting {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  type: 'ONE_ON_ONE' | 'TEAM_MEETING';
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  attendees: Array<{
    user: {
      id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  }>;
  talkingPoints: Array<{
    id: string;
    content: string;
    isCompleted: boolean;
    addedBy: {
      id: string;
      firstName: string;
      lastName: string;
    };
    createdAt: string;
  }>;
  actionItems: Array<{
    id: string;
    content: string;
    isCompleted: boolean;
    relatedTaskId?: string;
    assignee: {
      id: string;
      firstName: string;
      lastName: string;
    };
    createdAt: string;
  }>;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Meeting;
}

export default function MeetingsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [view, setView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [overflowPopover, setOverflowPopover] = useState<{
    isOpen: boolean;
    date: Date | null;
    events: CalendarEvent[];
  }>({ isOpen: false, date: null, events: [] });
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // View change handler
  const handleViewChange = (newView: string) => {
    setView(newView);
  };

  // Fetch meetings
  const { data: meetings, isLoading, error } = useQuery({
    queryKey: ['meetings'],
    queryFn: async (): Promise<Meeting[]> => {
      const response = await fetch('/api/meetings');
      if (!response.ok) {
        throw new Error('Failed to fetch meetings');
      }
      const result = await response.json();
      return result.data || [];
    },
    // refetchInterval: 30000, // Refetch every 30 seconds - disabled for better performance
  });

  // Convert meetings to calendar events
  const events: CalendarEvent[] = useMemo(() => {
    if (!meetings) return [];

    return meetings.map((meeting) => ({
      id: meeting.id,
      title: meeting.title,
      start: new Date(meeting.startTime),
      end: new Date(meeting.endTime),
      resource: meeting,
    }));
  }, [meetings]);

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedMeeting(event.resource);
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setSelectedDate(slotInfo.start);
    setIsCreateDialogOpen(true);
  };


  const closeOverflowPopover = () => {
    setOverflowPopover({
      isOpen: false,
      date: null,
      events: []
    });
  };

  const getEventStyle = (event: CalendarEvent) => {
    const meeting = event.resource;
    const baseStyle = {
      borderRadius: '0.5rem',
      border: 'none',
      color: 'white',
      padding: '6px 10px',
      fontSize: '12px',
      fontWeight: '500',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      position: 'relative',
      overflow: 'hidden',
    };

    switch (meeting.type) {
      case 'ONE_ON_ONE':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #ff0a54 0%, #e5094f 100%)',
          boxShadow: '0 2px 8px rgba(255, 10, 84, 0.3)',
        };
      case 'TEAM_MEETING':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
          boxShadow: '0 2px 8px rgba(0, 212, 255, 0.3)',
        };
      default:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
          boxShadow: '0 2px 8px rgba(107, 114, 128, 0.3)',
        };
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'ONE_ON_ONE':
        return <Users className="h-3 w-3" />;
      case 'TEAM_MEETING':
        return <Users className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    const meeting = event.resource;
    return (
      <div className="flex items-center gap-2 w-full">
        <div className="flex-shrink-0">
          {getEventTypeIcon(meeting.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="truncate font-medium text-sm rbc-event-title">
            {event.title}
          </div>
          <div className="text-xs opacity-90 truncate rbc-event-time">
            {new Date(event.start).toLocaleTimeString('fa-IR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })} - {new Date(event.end).toLocaleTimeString('fa-IR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">جلسات</h1>
          </div>
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">جلسات</h1>
          </div>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-red-900 mb-2">خطا در بارگذاری جلسات</h3>
                <p className="text-red-700 mb-6">متأسفانه در بارگذاری جلسات مشکلی پیش آمده است.</p>
                <Button 
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.location.reload();
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  تلاش مجدد
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-[#ff0a54] to-[#ff6b9d] rounded-xl">
              <CalendarIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">جلسات</h1>
              <p className="text-gray-600 mt-1">
                مدیریت و برنامه‌ریزی جلسات تیم
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* View Controls */}
            <div className="flex items-center bg-muted rounded-lg p-1">
              <Button
                variant={view === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange('month')}
                className="h-8 px-3 rounded-md"
              >
                <Grid3X3 className="h-4 w-4 ms-1" />
                ماه
              </Button>
              <Button
                variant={view === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange('week')}
                className="h-8 px-3 rounded-md"
              >
                <CalendarIcon className="h-4 w-4 ms-1" />
                هفته
              </Button>
              <Button
                variant={view === 'agenda' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange('agenda')}
                className="h-8 px-3 rounded-md"
              >
                <List className="h-4 w-4 ms-1" />
                برنامه
              </Button>
            </div>

            {/* Create Meeting Button - Role-based */}
            {isAdminOrManagerUser(user) && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                    <Plus className="h-4 w-4 ms-2" />
                    جلسه جدید
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">ایجاد جلسه جدید</DialogTitle>
                  </DialogHeader>
                  <CreateMeetingForm
                    onSuccess={() => {
                      setIsCreateDialogOpen(false);
                      // Invalidate and refetch meetings
                      queryClient.invalidateQueries({ queryKey: ['meetings'] });
                      queryClient.invalidateQueries({ queryKey: ['calendar', 'next-event'] });
                    }}
                    initialDate={selectedDate}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Calendar */}
        <Card className="shadow-lg border-0 bg-white/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-gray-800">
                تقویم جلسات
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                  className="h-8 px-3 rounded-md"
                >
                  امروز
                </Button>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const unit = view === 'month' ? 'month' : view === 'week' ? 'week' : 'day';
                      setCurrentDate(localizer.subtract(currentDate, 1, unit));
                    }}
                    className="h-8 w-8 p-0 rounded-md"
                  >
                    <ChevronRight className="rtl:rotate-180 h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const unit = view === 'month' ? 'month' : view === 'week' ? 'week' : 'day';
                      setCurrentDate(localizer.add(currentDate, 1, unit));
                    }}
                    className="h-8 w-8 p-0 rounded-md"
                  >
                    <ChevronLeft className="rtl:rotate-180 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {events.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-32 h-32 bg-gradient-to-br from-[#ff0a54]/10 to-[#ff6b9d]/10 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CalendarIcon className="h-16 w-16 text-[#ff0a54]" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">هنوز جلسه‌ای برنامه‌ریزی نشده</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                  اولین جلسه خود را برنامه‌ریزی کنید و شروع به همکاری با تیم خود کنید.
                </p>
                {isAdminOrManagerUser(user) && (
                  <Button 
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg shadow-lg"
                  >
                    <Plus className="h-5 w-5 ms-2" />
                    ایجاد اولین جلسه
                  </Button>
                )}
              </div>
            ) : (
              <div className="calendar-container">
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  view={view}
                  date={currentDate}
                  style={{ height: 750 }}
                  onSelectEvent={handleSelectEvent}
                  onSelectSlot={handleSelectSlot}
                  onView={handleViewChange}
                  onNavigate={setCurrentDate}
                  popup
                  eventPropGetter={getEventStyle}
                  components={{
                    event: EventComponent,
                    toolbar: () => null, // Remove internal toolbar
                  }}
                  step={60}
                  timeslots={1}
                  min={new Date(2024, 0, 1, 8, 0)}
                  max={new Date(2024, 0, 1, 20, 0)}
                  formats={{
                    // Time formats (using 24-hour format compatible with date-fns-jalali)
                    timeGutterFormat: 'HH:mm',
                    eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) => 
                      `${jalaliLocalizer.format(start, 'HH:mm')} - ${jalaliLocalizer.format(end, 'HH:mm')}`,
                    agendaTimeFormat: 'HH:mm',
                    agendaTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) => 
                      `${jalaliLocalizer.format(start, 'HH:mm')} - ${jalaliLocalizer.format(end, 'HH:mm')}`,
                    
                    // Day formats (using Persian day names)
                    dayFormat: 'dddd',
                    weekdayFormat: 'dddd',
                    workWeekFormat: 'dddd',
                    dayHeaderFormat: 'dddd، d MMMM',
                    dayRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
                      `${jalaliLocalizer.format(start, 'd MMMM')} - ${jalaliLocalizer.format(end, 'd MMMM')}`,
                    
                    // Month formats (using Persian month names)
                    monthFormat: 'MMMM',
                    monthHeaderFormat: 'MMMM yyyy',
                    
                    // Year format
                    yearFormat: 'yyyy',
                    
                    // Date formats
                    dateFormat: 'yyyy/MM/dd',
                    dateTimeFormat: 'yyyy/MM/dd HH:mm',
                    
                    // Agenda formats
                    agendaDateFormat: 'dddd، d MMMM',
                    agendaDateRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
                      `${jalaliLocalizer.format(start, 'd MMMM')} - ${jalaliLocalizer.format(end, 'd MMMM')}`,
                  }}
                  messages={{
                    next: 'بعدی',
                    previous: 'قبلی',
                    today: 'امروز',
                    month: 'ماه',
                    week: 'هفته',
                    agenda: 'برنامه',
                    date: 'تاریخ',
                    time: 'زمان',
                    event: 'رویداد',
                    noEventsInRange: 'هیچ جلسه‌ای در این بازه زمانی وجود ندارد',
                    showMore: (total: number) => `+${total} بیشتر`,
                    allDay: 'تمام روز',
                    work_week: 'هفته کاری',
                    yesterday: 'دیروز',
                    tomorrow: 'فردا',
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Meeting Details Modal */}
        {selectedMeeting && (
          <Dialog open={!!selectedMeeting} onOpenChange={() => setSelectedMeeting(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>جزئیات جلسه</DialogTitle>
              </DialogHeader>
              <MeetingDetails
                meeting={selectedMeeting}
                onClose={() => setSelectedMeeting(null)}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Legend and Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Legend */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-800 mb-3">رنگ‌بندی جلسات</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-gradient-to-r from-[#ff0a54] to-[#ff6b9d] rounded-lg shadow-sm"></div>
                <span className="text-sm text-gray-700">جلسه یک به یک</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-gradient-to-r from-[#00d4ff] to-[#0099cc] rounded-lg shadow-sm"></div>
                <span className="text-sm text-gray-700">جلسه تیمی</span>
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-800 mb-3">آمار جلسات</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">کل جلسات:</span>
                <span className="font-semibold text-gray-800">{events.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">جلسات یک به یک:</span>
                <span className="font-semibold text-[#ff0a54]">
                  {events.filter(e => e.resource.type === 'ONE_ON_ONE').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">جلسات تیمی:</span>
                <span className="font-semibold text-[#00d4ff]">
                  {events.filter(e => e.resource.type === 'TEAM_MEETING').length}
                </span>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-800 mb-3">دسترسی سریع</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewChange('month')}
                className="w-full justify-start rtl:justify-start"
              >
                <Grid3X3 className="h-4 w-4 ms-2" />
                نمای ماهانه
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewChange('week')}
                className="w-full justify-start rtl:justify-start"
              >
                <CalendarIcon className="h-4 w-4 ms-2" />
                نمای هفتگی
              </Button>
              {isAdminOrManagerUser(user) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="w-full justify-start rtl:justify-start"
                >
                  <Plus className="h-4 w-4 ms-2" />
                  جلسه جدید
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Overflow Events Popover */}
      {overflowPopover.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  جلسات {overflowPopover.date?.toLocaleDateString('fa-IR', { 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeOverflowPopover}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="space-y-3">
                {overflowPopover.events.map((event, index) => (
                  <div
                    key={index}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedMeeting(event.resource);
                      closeOverflowPopover();
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {getEventTypeIcon(event.resource.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {event.title}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {new Date(event.start).toLocaleTimeString('fa-IR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })} - {new Date(event.end).toLocaleTimeString('fa-IR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Calendar Styles */}
      <style jsx global>{`
        .calendar-container .rbc-calendar {
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          overflow: hidden;
          border: 1px solid hsl(var(--border));
        }
        
        /* Hide internal toolbar */
        .calendar-container .rbc-toolbar {
          display: none !important;
        }
        
        /* Header Styling - Days of Week */
        .calendar-container .rbc-header {
          background: linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--background)) 100%);
          border-bottom: 1px solid hsl(var(--border));
          font-weight: 600;
          color: hsl(var(--foreground));
          padding: 16px 12px;
          font-size: 14px;
          text-align: center;
          position: relative;
        }
        
        .calendar-container .rbc-header:not(:last-child)::after {
          content: '';
          position: absolute;
          right: 0;
          top: 20%;
          bottom: 20%;
          width: 1px;
          background: hsl(var(--border));
        }
        
        /* Month View Styling */
        .calendar-container .rbc-month-view {
          border: none;
          background: hsl(var(--background));
        }
        
        .calendar-container .rbc-month-row {
          border-bottom: 1px solid hsl(var(--border));
          transition: background-color 0.2s ease;
          min-height: 140px;
        }
        
        .calendar-container .rbc-month-row:hover {
          background: hsl(var(--muted) / 0.3);
        }
        
        .calendar-container .rbc-month-row:last-child {
          border-bottom: none;
        }
        
        .calendar-container .rbc-row-bg {
          border-right: 1px solid hsl(var(--border));
          transition: background-color 0.2s ease;
          min-height: 140px;
        }
        
        .calendar-container .rbc-row-bg:last-child {
          border-right: none;
        }
        
        .calendar-container .rbc-row-bg:hover {
          background: hsl(var(--muted) / 0.2);
        }
        
        /* Date Cell Styling */
        .calendar-container .rbc-date-cell {
          padding: 8px 6px;
          position: relative;
          min-height: 140px;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          overflow: visible;
        }
        
        .calendar-container .rbc-date-cell:hover {
          background: hsl(var(--muted) / 0.3);
        }
        
        .calendar-container .rbc-date-cell > a {
          color: hsl(var(--foreground));
          font-weight: 500;
          text-decoration: none;
          font-size: 14px;
          display: block;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: flex-start;
          justify-content: flex-start;
        }
        
        /* Today Styling */
        .calendar-container .rbc-today {
          background: linear-gradient(135deg, hsl(var(--primary) / 0.1) 0%, hsl(var(--primary) / 0.05) 100%) !important;
          position: relative;
        }
        
        .calendar-container .rbc-today::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.7) 100%);
        }
        
        .calendar-container .rbc-today .rbc-date-cell > a {
          color: hsl(var(--primary));
          font-weight: 700;
          font-size: 15px;
        }
        
        /* Off-range dates */
        .calendar-container .rbc-off-range-bg {
          background: hsl(var(--muted) / 0.3);
        }
        
        .calendar-container .rbc-off-range .rbc-date-cell > a {
          color: hsl(var(--muted-foreground));
          opacity: 0.6;
        }
        
        /* Weekend Styling */
        .calendar-container .rbc-date-cell[data-day="0"],
        .calendar-container .rbc-date-cell[data-day="6"] {
          background: hsl(var(--muted) / 0.2);
        }
        
        /* Event Styling */
        .calendar-container .rbc-event {
          border-radius: 0.375rem;
          border: none;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          font-weight: 500;
          font-size: 11px;
          padding: 3px 6px;
          margin: 1px 0;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
          min-height: 18px;
          max-height: 18px;
          display: flex;
          align-items: center;
          gap: 3px;
          line-height: 1.2;
        }
        
        .calendar-container .rbc-event::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: currentColor;
          opacity: 0.8;
        }
        
        .calendar-container .rbc-event:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          transform: translateY(-1px);
          z-index: 10;
        }
        
        /* Month view event container */
        .calendar-container .rbc-month-view .rbc-events-container {
          margin-right: 0;
          flex: 1;
          overflow: visible;
          position: relative;
          min-height: 0;
        }
        
        /* Month view event wrapper */
        .calendar-container .rbc-month-view .rbc-event-content {
          overflow: visible;
          position: relative;
        }
        
        /* Show more link styling */
        .calendar-container .rbc-show-more {
          background: hsl(var(--primary) / 0.1);
          color: hsl(var(--primary));
          border-radius: 0.25rem;
          padding: 3px 8px;
          font-size: 10px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
          margin-top: 3px;
          display: inline-block;
          width: fit-content;
          border: 1px solid hsl(var(--primary) / 0.2);
          cursor: pointer;
          min-height: 18px;
          line-height: 1.2;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .calendar-container .rbc-show-more:hover {
          background: hsl(var(--primary) / 0.2);
          color: hsl(var(--primary));
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        /* Ensure show more link is visible */
        .calendar-container .rbc-date-cell .rbc-show-more {
          position: relative;
          z-index: 5;
        }
        
        /* Time View Styling (Week) */
        .calendar-container .rbc-time-view {
          border: none;
          background: hsl(var(--background));
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        
        .calendar-container .rbc-time-header {
          border-bottom: 2px solid hsl(var(--border));
          background: linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--background)) 100%);
          display: flex;
          min-height: 50px;
        }
        
        .calendar-container .rbc-time-header-content {
          border-right: 1px solid hsl(var(--border));
          flex: 1;
          display: flex;
        }
        
        .calendar-container .rbc-time-content {
          border: none;
          display: flex;
          flex: 1;
          overflow-y: auto;
          height: 100%;
        }
        
        .calendar-container .rbc-time-gutter {
          background: hsl(var(--muted) / 0.5);
          border-right: 1px solid hsl(var(--border));
          width: 60px;
          flex-shrink: 0;
        }
        
        .calendar-container .rbc-timeslot-group {
          border-bottom: 1px solid hsl(var(--border));
          transition: background-color 0.2s ease;
          min-height: 40px;
        }
        
        .calendar-container .rbc-timeslot-group:hover {
          background: hsl(var(--muted) / 0.2);
        }
        
        .calendar-container .rbc-time-slot {
          color: hsl(var(--muted-foreground));
          font-size: 12px;
          font-weight: 500;
          padding: 8px 12px;
          min-height: 40px;
          display: flex;
          align-items: center;
        }
        
        .calendar-container .rbc-time-slot.rbc-label {
          font-weight: 600;
          color: hsl(var(--foreground));
        }
        
        /* Week View Specific Styling */
        .calendar-container .rbc-time-view .rbc-header {
          flex: 1;
          text-align: center;
          padding: 12px 8px;
          font-weight: 600;
          color: hsl(var(--foreground));
          background: linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--background)) 100%);
          border-right: 1px solid hsl(var(--border));
          position: relative;
        }
        
        .calendar-container .rbc-time-view .rbc-header:last-child {
          border-right: none;
        }
        
        .calendar-container .rbc-time-view .rbc-header::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: hsl(var(--primary) / 0.3);
        }
        
        /* Day View Specific Styling */
        .calendar-container .rbc-time-view .rbc-day-slot {
          position: relative;
          min-height: 40px;
        }
        
        .calendar-container .rbc-time-view .rbc-day-slot .rbc-events-container {
          margin-right: 0;
        }
        
        .calendar-container .rbc-time-view .rbc-day-slot .rbc-event {
          position: absolute;
          left: 0;
          right: 0;
          margin: 0;
          border-radius: 0.375rem;
          font-size: 11px;
          padding: 4px 8px;
        }
        
        /* Time Grid Styling */
        .calendar-container .rbc-time-grid {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .calendar-container .rbc-time-grid .rbc-time-gutter {
          position: sticky;
          right: 0;
          z-index: 10;
        }
        
        .calendar-container .rbc-time-grid .rbc-time-content {
          flex: 1;
          display: flex;
        }
        
        .calendar-container .rbc-time-grid .rbc-day-slot {
          flex: 1;
          border-right: 1px solid hsl(var(--border));
          position: relative;
        }
        
        .calendar-container .rbc-time-grid .rbc-day-slot:last-child {
          border-right: none;
        }
        
        /* Event positioning in time views */
        .calendar-container .rbc-time-view .rbc-event {
          position: absolute;
          left: 0;
          right: 0;
          margin: 0;
          border-radius: 0.375rem;
          font-size: 11px;
          padding: 4px 8px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .calendar-container .rbc-time-view .rbc-event:hover {
          z-index: 20;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        
        /* Current Time Indicator */
        .calendar-container .rbc-current-time-indicator {
          background: linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.7) 100%);
          height: 2px;
          box-shadow: 0 0 8px hsl(var(--primary) / 0.5);
        }
        
        /* Agenda View Styling - Clean and Professional */
        .calendar-container .rbc-agenda-view {
          background: hsl(var(--background));
          border-radius: 0.5rem;
          overflow: hidden;
        }
        
        .calendar-container .rbc-agenda-view table {
          border: none;
          background: transparent;
          width: 100%;
          border-collapse: collapse;
        }
        
        .calendar-container .rbc-agenda-view .rbc-agenda-date-cell {
          background: linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--background)) 100%);
          border-left: 1px solid hsl(var(--border));
          font-weight: 600;
          color: hsl(var(--foreground));
          padding: 16px 20px;
          width: 200px;
          text-align: right;
          vertical-align: top;
          position: sticky;
          right: 0;
          z-index: 5;
        }
        
        .calendar-container .rbc-agenda-view .rbc-agenda-time-cell {
          background: hsl(var(--background));
          border-left: 1px solid hsl(var(--border));
          color: hsl(var(--muted-foreground));
          padding: 16px 20px;
          width: 120px;
          text-align: right;
          vertical-align: top;
          font-weight: 500;
          font-size: 14px;
        }
        
        .calendar-container .rbc-agenda-view .rbc-agenda-event-cell {
          background: hsl(var(--background));
          padding: 16px 20px;
          border-bottom: 1px solid hsl(var(--border));
          text-align: right;
          vertical-align: top;
        }
        
        .calendar-container .rbc-agenda-view .rbc-agenda-event-cell:hover {
          background: hsl(var(--muted) / 0.3);
        }
        
        /* Agenda event styling */
        .calendar-container .rbc-agenda-view .rbc-event {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          margin: 0 !important;
          border-radius: 0 !important;
          max-height: none !important;
          position: static !important;
        }
        
        .calendar-container .rbc-agenda-view .rbc-event::before {
          display: none;
        }
        
        .calendar-container .rbc-agenda-view .rbc-event-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
          align-items: flex-start;
        }
        
        .calendar-container .rbc-agenda-view .rbc-event-title {
          font-weight: 600;
          color: hsl(var(--foreground));
          font-size: 14px;
          margin-bottom: 4px;
        }
        
        .calendar-container .rbc-agenda-view .rbc-event-time {
          color: hsl(var(--muted-foreground));
          font-size: 12px;
          font-weight: 500;
        }
        
        /* Agenda row styling */
        .calendar-container .rbc-agenda-view tbody tr {
          border-bottom: 1px solid hsl(var(--border));
          transition: background-color 0.2s ease;
        }
        
        .calendar-container .rbc-agenda-view tbody tr:hover {
          background: hsl(var(--muted) / 0.2);
        }
        
        .calendar-container .rbc-agenda-view tbody tr:last-child {
          border-bottom: none;
        }
        
        /* Empty state for agenda */
        .calendar-container .rbc-agenda-view .rbc-agenda-empty {
          text-align: center;
          padding: 40px 20px;
          color: hsl(var(--muted-foreground));
          font-style: italic;
        }
        
        /* Show More Link */
        .calendar-container .rbc-show-more {
          background: hsl(var(--primary) / 0.1);
          color: hsl(var(--primary));
          border-radius: 0.375rem;
          padding: 4px 8px;
          font-size: 11px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        
        .calendar-container .rbc-show-more:hover {
          background: hsl(var(--primary) / 0.2);
          color: hsl(var(--primary));
          transform: translateY(-1px);
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
          .calendar-container .rbc-toolbar {
            padding: 16px;
            flex-direction: column;
            gap: 8px;
          }
          
          .calendar-container .rbc-toolbar button {
            padding: 8px 14px;
            font-size: 13px;
            min-height: 36px;
          }
          
          .calendar-container .rbc-date-cell {
            min-height: 50px;
            padding: 8px 4px;
          }
          
          .calendar-container .rbc-event {
            font-size: 11px;
            padding: 4px 6px;
          }
        }
      `}</style>
    </div>
  );
}
