'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EnhancedMeetingWorkspace } from '@/components/meetings/EnhancedMeetingWorkspace';

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

export default function MeetingPage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = params.meetingId as string;

  const { data: meeting, isLoading, error } = useQuery({
    queryKey: ['meeting', meetingId],
    queryFn: async (): Promise<Meeting> => {
      const response = await fetch(`/api/meetings/${meetingId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch meeting');
      }
      const result = await response.json();
      return result.data;
    },
    enabled: !!meetingId,
  });

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ONE_ON_ONE':
        return 'bg-pink-100 text-pink-800';
      case 'TEAM_MEETING':
        return 'bg-cyan-100 text-cyan-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">جلسه یافت نشد</h1>
            <p className="text-gray-600 mb-6">
              جلسه مورد نظر وجود ندارد یا شما دسترسی به آن ندارید.
            </p>
            <Button onClick={() => router.push('/meetings')}>
              <ArrowLeft className="h-4 w-4 ml-2" />
              بازگشت به جلسات
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/meetings')}
            >
              <ArrowLeft className="h-4 w-4 ml-2" />
              بازگشت
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{meeting.title}</h1>
              <div className="flex items-center gap-4 mt-2">
                <Badge className={getStatusColor(meeting.status)}>
                  {meeting.status === 'SCHEDULED' && 'برنامه‌ریزی شده'}
                  {meeting.status === 'COMPLETED' && 'تکمیل شده'}
                  {meeting.status === 'CANCELLED' && 'لغو شده'}
                </Badge>
                <Badge className={getTypeColor(meeting.type)}>
                  {meeting.type === 'ONE_ON_ONE' && 'یک به یک'}
                  {meeting.type === 'TEAM_MEETING' && 'تیمی'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Meeting Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">تاریخ</p>
                  <p className="font-medium">{formatDate(meeting.startTime)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">زمان</p>
                  <p className="font-medium">
                    {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">شرکت‌کنندگان</p>
                  <p className="font-medium">{meeting.attendees.length} نفر</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendees */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              شرکت‌کنندگان
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {meeting.attendees.map((attendee) => (
                <div key={attendee.user.id} className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={attendee.user.avatar} />
                    <AvatarFallback>
                      {attendee.user.firstName.charAt(0)}{attendee.user.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {attendee.user.firstName} {attendee.user.lastName}
                    </p>
                    {attendee.user.id === meeting.creator.id && (
                      <p className="text-xs text-gray-500">سازنده جلسه</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Meeting Workspace */}
        <EnhancedMeetingWorkspace meeting={meeting} />
      </div>
    </div>
  );
}
