'use client';

import { Calendar, Clock, Users, FileText, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
// Simple date formatting functions
const formatDateTime = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('fa-IR');
};

const formatTime = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString('fa-IR');
};

interface SimpleMeetingCardProps {
  meeting: {
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
      id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
    }>;
    talkingPointsCount?: number;
    actionItemsCount?: number;
  };
  onViewDetails?: (meetingId: string) => void;
  onEdit?: (meetingId: string) => void;
  onDelete?: (meetingId: string) => void;
  className?: string;
}

export function SimpleMeetingCard({
  meeting,
  onViewDetails,
  onEdit,
  onDelete,
  className
}: SimpleMeetingCardProps) {

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'برنامه‌ریزی شده';
      case 'COMPLETED':
        return 'تکمیل شده';
      case 'CANCELLED':
        return 'لغو شده';
      default:
        return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'ONE_ON_ONE':
        return 'جلسه دو نفره';
      case 'TEAM_MEETING':
        return 'جلسه تیمی';
      default:
        return type;
    }
  };

  const handleAction = async (action: () => void) => {
    try {
      await action();
    } catch (error) {
      console.error('Action failed:', error);
    }
  };

  const startTime = new Date(meeting.startTime);
  const endTime = new Date(meeting.endTime);
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-gray-900 truncate">
              {meeting.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={getStatusColor(meeting.status)}>
                {getStatusText(meeting.status)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {getTypeText(meeting.type)}
              </Badge>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onViewDetails && (
                <DropdownMenuItem onClick={() => handleAction(() => onViewDetails(meeting.id))}>
                  <FileText className="h-4 w-4 me-2" />
                  مشاهده جزئیات
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => handleAction(() => onEdit(meeting.id))}>
                  <Calendar className="h-4 w-4 me-2" />
                  ویرایش
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem 
                  onClick={() => handleAction(() => onDelete(meeting.id))}
                  className="text-red-600"
                >
                  <Clock className="h-4 w-4 me-2" />
                  حذف
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Date and Time */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{formatDateTime(meeting.startTime)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}</span>
            <span className="text-xs text-gray-500">({duration} دقیقه)</span>
          </div>

          {/* Creator */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Avatar className="h-6 w-6">
              <AvatarImage src={meeting.creator.avatar} />
              <AvatarFallback className="text-xs">
                {meeting.creator.firstName[0]}{meeting.creator.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <span>ایجاد شده توسط: {meeting.creator.firstName} {meeting.creator.lastName}</span>
          </div>

          {/* Attendees */}
          {meeting.attendees.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <div className="flex items-center gap-1">
                <span>شرکت‌کنندگان:</span>
                <div className="flex -space-x-1">
                  {meeting.attendees.slice(0, 3).map((attendee) => (
                    <Avatar key={attendee.id} className="h-6 w-6 border-2 border-white">
                      <AvatarImage src={attendee.avatar} />
                      <AvatarFallback className="text-xs">
                        {attendee.firstName[0]}{attendee.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {meeting.attendees.length > 3 && (
                    <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 border-2 border-white">
                      +{meeting.attendees.length - 3}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          {(meeting.talkingPointsCount || meeting.actionItemsCount) && (
            <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t">
              {meeting.talkingPointsCount && (
                <span>نکات گفتگو: {meeting.talkingPointsCount}</span>
              )}
              {meeting.actionItemsCount && (
                <span>موارد اقدام: {meeting.actionItemsCount}</span>
              )}
            </div>
          )}

          {/* Notes preview */}
          {meeting.notes && (
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              <p className="line-clamp-2">{meeting.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
