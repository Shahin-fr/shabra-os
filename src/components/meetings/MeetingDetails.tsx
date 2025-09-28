'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Calendar, 
  Clock, 
  Users, 
  Plus,
  Edit,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import Link from 'next/link';

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

interface User {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

interface MeetingDetailsProps {
  meeting: Meeting;
  onClose: () => void;
}

export function MeetingDetails({ meeting, onClose }: MeetingDetailsProps) {
  const [newTalkingPoint, setNewTalkingPoint] = useState('');
  const [newActionItem, setNewActionItem] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(meeting.notes || '');

  // Fetch users for action item assignment
  const { data: users } = useQuery({
    queryKey: ['users', 'assignable'],
    queryFn: async (): Promise<User[]> => {
      const response = await fetch('/api/users/assignable');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const result = await response.json();
      return result.data || [];
    },
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

  const handleAddTalkingPoint = async () => {
    if (!newTalkingPoint.trim()) return;

    try {
      const response = await fetch(`/api/meetings/${meeting.id}/talking-points`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newTalkingPoint,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add talking point');
      }

      toast.success('نکته گفتگو اضافه شد');
      setNewTalkingPoint('');
      // Refetch meeting data
      window.location.reload();
    } catch (error) {
      console.error('Error adding talking point:', error);
      toast.error('خطا در اضافه کردن نکته گفتگو');
    }
  };

  const handleAddActionItem = async () => {
    if (!newActionItem.trim() || !selectedAssignee) return;

    try {
      const response = await fetch(`/api/meetings/${meeting.id}/action-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newActionItem,
          assigneeId: selectedAssignee,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add action item');
      }

      toast.success('مورد اقدام اضافه شد');
      setNewActionItem('');
      setSelectedAssignee('');
      // Refetch meeting data
      window.location.reload();
    } catch (error) {
      console.error('Error adding action item:', error);
      toast.error('خطا در اضافه کردن مورد اقدام');
    }
  };

  const handleToggleTalkingPoint = async (talkingPointId: string, isCompleted: boolean) => {
    try {
      const response = await fetch(`/api/meetings/${meeting.id}/talking-points/${talkingPointId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isCompleted: !isCompleted,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update talking point');
      }

      // Refetch meeting data
      window.location.reload();
    } catch (error) {
      console.error('Error updating talking point:', error);
      toast.error('خطا در به‌روزرسانی نکته گفتگو');
    }
  };

  const handleToggleActionItem = async (actionItemId: string, isCompleted: boolean) => {
    try {
      const response = await fetch(`/api/meetings/${meeting.id}/action-items/${actionItemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isCompleted: !isCompleted,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update action item');
      }

      // Refetch meeting data
      window.location.reload();
    } catch (error) {
      console.error('Error updating action item:', error);
      toast.error('خطا در به‌روزرسانی مورد اقدام');
    }
  };

  const handleCreateTask = async (actionItemId: string) => {
    try {
      const response = await fetch(`/api/meetings/action-items/${actionItemId}/create-task`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      toast.success('تسک با موفقیت ایجاد شد');
      // Refetch meeting data
      window.location.reload();
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('خطا در ایجاد تسک');
    }
  };

  const handleUpdateNotes = async () => {
    try {
      const response = await fetch(`/api/meetings/${meeting.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update notes');
      }

      toast.success('یادداشت‌ها به‌روزرسانی شد');
      setIsEditingNotes(false);
    } catch (error) {
      console.error('Error updating notes:', error);
      toast.error('خطا در به‌روزرسانی یادداشت‌ها');
    }
  };

  return (
    <div className="space-y-6">
      {/* Meeting Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{meeting.title}</h2>
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
        <Button variant="outline" onClick={onClose}>
          بستن
        </Button>
      </div>

      {/* Meeting Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>

      {/* Attendees */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            شرکت‌کنندگان
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {meeting.attendees.map((attendee) => (
              <div key={attendee.user.id} className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={attendee.user.avatar} />
                  <AvatarFallback>
                    {attendee.user.firstName.charAt(0)}{attendee.user.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">
                  {attendee.user.firstName} {attendee.user.lastName}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Talking Points, Notes, and Action Items */}
      <Tabs defaultValue="talking-points" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="talking-points">نکات گفتگو</TabsTrigger>
          <TabsTrigger value="notes">یادداشت‌ها</TabsTrigger>
          <TabsTrigger value="action-items">موارد اقدام</TabsTrigger>
        </TabsList>

        {/* Talking Points Tab */}
        <TabsContent value="talking-points" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>نکات گفتگو</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add new talking point */}
              <div className="flex gap-2">
                <Input
                  value={newTalkingPoint}
                  onChange={(e) => setNewTalkingPoint(e.target.value)}
                  placeholder="نکته گفتگو جدید..."
                  className="flex-1"
                />
                <Button onClick={handleAddTalkingPoint} disabled={!newTalkingPoint.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Talking points list */}
              <div className="space-y-3">
                {meeting.talkingPoints.map((point) => (
                  <div key={point.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <Checkbox
                      checked={point.isCompleted}
                      onCheckedChange={() => handleToggleTalkingPoint(point.id, point.isCompleted)}
                    />
                    <div className="flex-1">
                      <p className={`text-sm ${point.isCompleted ? 'line-through text-gray-500' : ''}`}>
                        {point.content}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        اضافه شده توسط {point.addedBy.firstName} {point.addedBy.lastName}
                      </p>
                    </div>
                  </div>
                ))}
                {meeting.talkingPoints.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    هیچ نکته گفتگویی اضافه نشده است
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>یادداشت‌ها</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingNotes(!isEditingNotes)}
                >
                  <Edit className="h-4 w-4 ml-1" />
                  {isEditingNotes ? 'لغو' : 'ویرایش'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isEditingNotes ? (
                <div className="space-y-4">
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={6}
                    placeholder="یادداشت‌های جلسه..."
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleUpdateNotes} size="sm">
                      ذخیره
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditingNotes(false);
                        setNotes(meeting.notes || '');
                      }}
                    >
                      لغو
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="prose max-w-none">
                  {meeting.notes ? (
                    <p className="whitespace-pre-wrap">{meeting.notes}</p>
                  ) : (
                    <p className="text-gray-500">هیچ یادداشتی ثبت نشده است</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Action Items Tab */}
        <TabsContent value="action-items" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>موارد اقدام</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add new action item */}
              <div className="space-y-3">
                <Input
                  value={newActionItem}
                  onChange={(e) => setNewActionItem(e.target.value)}
                  placeholder="مورد اقدام جدید..."
                />
                <div className="flex gap-2">
                  <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="انتخاب مسئول..." />
                    </SelectTrigger>
                    <SelectContent>
                      {users?.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.firstName} {user.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAddActionItem}
                    disabled={!newActionItem.trim() || !selectedAssignee}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Action items list */}
              <div className="space-y-3">
                {meeting.actionItems.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <Checkbox
                      checked={item.isCompleted}
                      onCheckedChange={() => handleToggleActionItem(item.id, item.isCompleted)}
                    />
                    <div className="flex-1">
                      <p className={`text-sm ${item.isCompleted ? 'line-through text-gray-500' : ''}`}>
                        {item.content}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">
                          مسئول: {item.assignee.firstName} {item.assignee.lastName}
                        </p>
                        <div className="flex gap-2">
                          {item.relatedTaskId ? (
                            <Link href={`/tasks/${item.relatedTaskId}`}>
                              <Button variant="outline" size="sm">
                                <ExternalLink className="h-3 w-3 ml-1" />
                                مشاهده تسک
                              </Button>
                            </Link>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCreateTask(item.id)}
                            >
                              <Plus className="h-3 w-3 ml-1" />
                              ایجاد تسک
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {meeting.actionItems.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    هیچ مورد اقدامی اضافه نشده است
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
