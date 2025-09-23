'use client';

import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { WidgetCard } from './WidgetCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NextEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  type: string;
  location?: string;
  attendees?: number;
}

interface NextUpWidgetProps {
  className?: string;
  variant?: 'mobile' | 'desktop';
}

export function NextUpWidget({ className, variant = 'desktop' }: NextUpWidgetProps) {
  const { data: nextEvent, isLoading, error } = useQuery({
    queryKey: ['calendar', 'next-event'],
    queryFn: async (): Promise<NextEvent | null> => {
      const response = await fetch('/api/calendar/next-event');
      
      if (!response.ok) {
        // const errorText = await response.text();
        throw new Error('Failed to fetch next event');
      }
      
      const data = await response.json();
      return data.data;
    },
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      month: 'long',
      day: 'numeric'
    });
  };

  const getTimeUntilEvent = (startDate: string) => {
    const now = new Date();
    const eventDate = new Date(startDate);
    const diffMs = eventDate.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours} ساعت و ${diffMinutes} دقیقه دیگر`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} دقیقه دیگر`;
    } else {
      return 'همین الان';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'meeting':
        return 'bg-blue-100 text-blue-700';
      case 'event':
        return 'bg-green-100 text-green-700';
      case 'deadline':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'meeting':
        return <Users className="h-4 w-4" />;
      case 'event':
        return <Calendar className="h-4 w-4" />;
      case 'deadline':
        return <Clock className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const isMobile = variant === 'mobile';

  return (
    <WidgetCard
      title="جلسه بعدی"
      className={cn(
        'bg-gradient-to-br from-purple-50 to-pink-50',
        className
      )}
      loading={isLoading}
      error={error?.message}
      empty={!isLoading && !nextEvent}
      emptyMessage="رویداد بعدی وجود ندارد"
      emptyIcon={<Calendar className="h-8 w-8 text-purple-400" />}
    >
      {nextEvent && (
        <div className="space-y-4">
          {/* Event Header */}
          <div className="text-center">
            <div className={cn(
              'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-vazirmatn font-medium',
              getEventTypeColor(nextEvent.type)
            )}>
              {getEventTypeIcon(nextEvent.type)}
              {nextEvent.type}
            </div>
          </div>

          {/* Event Title */}
          <div className="text-center">
            <h3 className={cn(
              'font-vazirmatn font-semibold text-gray-900 leading-tight',
              isMobile ? 'text-base' : 'text-lg'
            )}>
              {nextEvent.title}
            </h3>
            {nextEvent.description && (
              <p className={cn(
                'text-gray-600 font-vazirmatn mt-1',
                isMobile ? 'text-sm' : 'text-base'
              )}>
                {nextEvent.description}
              </p>
            )}
          </div>

          {/* Event Details */}
          <div className="space-y-3">
            {/* Time */}
            <div className="flex items-center gap-3 text-gray-600">
              <Clock className="h-4 w-4 text-gray-400" />
              <div className="flex-1">
                <div className="font-vazirmatn text-sm">
                  {formatDate(nextEvent.startDate)} - {formatTime(nextEvent.startDate)}
                </div>
                <div className="text-xs text-gray-500 font-vazirmatn">
                  {getTimeUntilEvent(nextEvent.startDate)}
                </div>
              </div>
            </div>

            {/* Location */}
            {nextEvent.location && (
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="font-vazirmatn text-sm">{nextEvent.location}</span>
              </div>
            )}

            {/* Attendees */}
            {nextEvent.attendees && (
              <div className="flex items-center gap-3 text-gray-600">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="font-vazirmatn text-sm">
                  {nextEvent.attendees} نفر شرکت‌کننده
                </span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-white/40">
            <Button
              variant="outline"
              className="w-full font-vazirmatn text-sm"
              onClick={() => {
                // Navigate to calendar page
                window.location.href = '/calendar';
              }}
            >
              مشاهده تقویم
            </Button>
          </div>
        </div>
      )}
    </WidgetCard>
  );
}
