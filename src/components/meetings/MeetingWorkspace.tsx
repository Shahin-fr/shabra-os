'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Plus, 
  CheckSquare, 
  FileText, 
  Edit,
  ExternalLink,
  CheckCircle,
  Circle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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

interface MeetingWorkspaceProps {
  meeting: Meeting;
}

export function MeetingWorkspace({ meeting }: MeetingWorkspaceProps) {
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

  const completedTalkingPoints = meeting.talkingPoints.filter(point => point.isCompleted).length;
  const totalTalkingPoints = meeting.talkingPoints.length;
  const completedActionItems = meeting.actionItems.filter(item => item.isCompleted).length;
  const totalActionItems = meeting.actionItems.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Section 1: Talking Points (Agenda) */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              نکات گفتگو
            </div>
            <Badge variant="outline">
              {completedTalkingPoints}/{totalTalkingPoints}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add new talking point */}
          <div className="flex gap-2">
            <Input
              value={newTalkingPoint}
              onChange={(e) => setNewTalkingPoint(e.target.value)}
              placeholder="نکته گفتگو جدید..."
              className="flex-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddTalkingPoint();
                }
              }}
            />
            <Button 
              onClick={handleAddTalkingPoint} 
              disabled={!newTalkingPoint.trim()}
              size="sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Talking points list */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {meeting.talkingPoints.map((point) => (
              <div key={point.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <button
                  onClick={() => handleToggleTalkingPoint(point.id, point.isCompleted)}
                  className="mt-1"
                >
                  {point.isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${point.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {point.content}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {point.addedBy.firstName} {point.addedBy.lastName}
                  </p>
                </div>
              </div>
            ))}
            {meeting.talkingPoints.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">هیچ نکته گفتگویی اضافه نشده است</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Shared Notes */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              یادداشت‌های مشترک
            </CardTitle>
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
                rows={12}
                placeholder="یادداشت‌های جلسه..."
                className="resize-none"
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
            <div className="h-64 overflow-y-auto">
              {meeting.notes ? (
                <div className="prose max-w-none text-sm">
                  <pre className="whitespace-pre-wrap font-sans">{meeting.notes}</pre>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">هیچ یادداشتی ثبت نشده است</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setIsEditingNotes(true)}
                  >
                    <Plus className="h-4 w-4 ml-1" />
                    اضافه کردن یادداشت
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 3: Action Items */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              موارد اقدام
            </div>
            <Badge variant="outline">
              {completedActionItems}/{totalActionItems}
            </Badge>
          </CardTitle>
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
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Action items list */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {meeting.actionItems.map((item) => (
              <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <button
                  onClick={() => handleToggleActionItem(item.id, item.isCompleted)}
                  className="mt-1"
                >
                  {item.isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${item.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {item.content}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={(item.assignee as any).avatar} />
                        <AvatarFallback className="text-xs">
                          {item.assignee.firstName.charAt(0)}{item.assignee.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-gray-500">
                        {item.assignee.firstName} {item.assignee.lastName}
                      </span>
                    </div>
                    <div>
                      {item.relatedTaskId ? (
                        <Link href={`/tasks/${item.relatedTaskId}`}>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-3 w-3 ml-1" />
                            تسک
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCreateTask(item.id)}
                        >
                          <Plus className="h-3 w-3 ml-1" />
                          تسک
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {meeting.actionItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CheckSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">هیچ مورد اقدامی اضافه نشده است</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
