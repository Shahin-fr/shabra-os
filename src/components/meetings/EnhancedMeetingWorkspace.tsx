'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  CheckSquare, 
  FileText, 
  Edit,
  ExternalLink,
  CheckCircle,
  Circle,
  User,
  Sparkles,
  Loader2
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

interface EnhancedMeetingWorkspaceProps {
  meeting: Meeting;
}

export function EnhancedMeetingWorkspace({ meeting }: EnhancedMeetingWorkspaceProps) {
  const [newTalkingPoint, setNewTalkingPoint] = useState('');
  const [newActionItem, setNewActionItem] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(meeting.notes || '');
  const [isAddingTalkingPoint, setIsAddingTalkingPoint] = useState(false);
  const [isAddingActionItem, setIsAddingActionItem] = useState(false);

  const queryClient = useQueryClient();

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

  // Add talking point mutation
  const addTalkingPointMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch(`/api/meetings/${meeting.id}/talking-points`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to add talking point');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting', meeting.id] });
      setNewTalkingPoint('');
      toast.success('نکته گفتگو اضافه شد', {
        icon: <Sparkles className="h-4 w-4" />,
      });
    },
    onError: () => {
      toast.error('خطا در اضافه کردن نکته گفتگو');
    },
  });

  // Add action item mutation
  const addActionItemMutation = useMutation({
    mutationFn: async ({ content, assigneeId }: { content: string; assigneeId: string }) => {
      const response = await fetch(`/api/meetings/${meeting.id}/action-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, assigneeId }),
      });

      if (!response.ok) {
        throw new Error('Failed to add action item');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting', meeting.id] });
      setNewActionItem('');
      setSelectedAssignee('');
      toast.success('مورد اقدام اضافه شد', {
        icon: <CheckSquare className="h-4 w-4" />,
      });
    },
    onError: () => {
      toast.error('خطا در اضافه کردن مورد اقدام');
    },
  });

  // Toggle talking point mutation
  const toggleTalkingPointMutation = useMutation({
    mutationFn: async ({ talkingPointId, isCompleted }: { talkingPointId: string; isCompleted: boolean }) => {
      const response = await fetch(`/api/meetings/${meeting.id}/talking-points/${talkingPointId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: !isCompleted }),
      });

      if (!response.ok) {
        throw new Error('Failed to update talking point');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting', meeting.id] });
    },
    onError: () => {
      toast.error('خطا در به‌روزرسانی نکته گفتگو');
    },
  });

  // Toggle action item mutation
  const toggleActionItemMutation = useMutation({
    mutationFn: async ({ actionItemId, isCompleted }: { actionItemId: string; isCompleted: boolean }) => {
      const response = await fetch(`/api/meetings/${meeting.id}/action-items/${actionItemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: !isCompleted }),
      });

      if (!response.ok) {
        throw new Error('Failed to update action item');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting', meeting.id] });
    },
    onError: () => {
      toast.error('خطا در به‌روزرسانی مورد اقدام');
    },
  });

  // Create task from action item mutation
  const createTaskMutation = useMutation({
    mutationFn: async (actionItemId: string) => {
      const response = await fetch(`/api/meetings/action-items/${actionItemId}/create-task`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['meeting', meeting.id] });
      toast.success('تسک با موفقیت ایجاد شد', {
        icon: <ExternalLink className="h-4 w-4" />,
        action: {
          label: 'مشاهده تسک',
          onClick: () => {
            if (typeof window !== 'undefined') {
              window.open(`/tasks/${data.data.task.id}`, '_blank');
            }
          },
        },
      });
    },
    onError: () => {
      toast.error('خطا در ایجاد تسک');
    },
  });

  // Update notes mutation
  const updateNotesMutation = useMutation({
    mutationFn: async (notes: string) => {
      const response = await fetch(`/api/meetings/${meeting.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        throw new Error('Failed to update notes');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting', meeting.id] });
      setIsEditingNotes(false);
      toast.success('یادداشت‌ها به‌روزرسانی شد');
    },
    onError: () => {
      toast.error('خطا در به‌روزرسانی یادداشت‌ها');
    },
  });

  const handleAddTalkingPoint = async () => {
    if (!newTalkingPoint.trim()) return;
    setIsAddingTalkingPoint(true);
    await addTalkingPointMutation.mutateAsync(newTalkingPoint);
    setIsAddingTalkingPoint(false);
  };

  const handleAddActionItem = async () => {
    if (!newActionItem.trim() || !selectedAssignee) return;
    setIsAddingActionItem(true);
    await addActionItemMutation.mutateAsync({
      content: newActionItem,
      assigneeId: selectedAssignee,
    });
    setIsAddingActionItem(false);
  };

  const handleToggleTalkingPoint = (talkingPointId: string, isCompleted: boolean) => {
    toggleTalkingPointMutation.mutate({ talkingPointId, isCompleted });
  };

  const handleToggleActionItem = (actionItemId: string, isCompleted: boolean) => {
    toggleActionItemMutation.mutate({ actionItemId, isCompleted });
  };

  const handleCreateTask = (actionItemId: string) => {
    createTaskMutation.mutate(actionItemId);
  };

  const handleUpdateNotes = () => {
    updateNotesMutation.mutate(notes);
  };

  const completedTalkingPoints = meeting.talkingPoints.filter(point => point.isCompleted).length;
  const totalTalkingPoints = meeting.talkingPoints.length;
  const completedActionItems = meeting.actionItems.filter(item => item.isCompleted).length;
  const totalActionItems = meeting.actionItems.length;

  const talkingPointProgress = totalTalkingPoints > 0 ? (completedTalkingPoints / totalTalkingPoints) * 100 : 0;
  const actionItemProgress = totalActionItems > 0 ? (completedActionItems / totalActionItems) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">نکات گفتگو</h3>
                  <p className="text-sm text-gray-600">{completedTalkingPoints} از {totalTalkingPoints} تکمیل شده</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-blue-100 text-blue-700">
                {Math.round(talkingPointProgress)}%
              </Badge>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <motion.div
                className="bg-blue-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${talkingPointProgress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckSquare className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">موارد اقدام</h3>
                  <p className="text-sm text-gray-600">{completedActionItems} از {totalActionItems} تکمیل شده</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-green-100 text-green-700">
                {Math.round(actionItemProgress)}%
              </Badge>
            </div>
            <div className="w-full bg-green-200 rounded-full h-2">
              <motion.div
                className="bg-green-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${actionItemProgress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Talking Points Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  نکات گفتگو
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {completedTalkingPoints}/{totalTalkingPoints}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add new talking point */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2"
              >
                <Input
                  value={newTalkingPoint}
                  onChange={(e) => setNewTalkingPoint(e.target.value)}
                  placeholder="نکته گفتگو جدید..."
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isAddingTalkingPoint) {
                      handleAddTalkingPoint();
                    }
                  }}
                />
                <Button 
                  onClick={handleAddTalkingPoint} 
                  disabled={!newTalkingPoint.trim() || isAddingTalkingPoint}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isAddingTalkingPoint ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </motion.div>

              {/* Talking points list */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {meeting.talkingPoints.map((point, index) => (
                    <motion.div
                      key={point.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start rtl:items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <motion.button
                        onClick={() => handleToggleTalkingPoint(point.id, point.isCompleted)}
                        className="mt-1 hover:scale-110 transition-transform"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {point.isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </motion.button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${point.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {point.content}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {point.addedBy.firstName.charAt(0)}{point.addedBy.lastName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-gray-500">
                            {point.addedBy.firstName} {point.addedBy.lastName}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {meeting.talkingPoints.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 text-gray-500"
                  >
                    <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">هیچ نکته گفتگویی اضافه نشده است</p>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Shared Notes Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  یادداشت‌های مشترک
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingNotes(!isEditingNotes)}
                  className="hover:bg-purple-50"
                >
                  <Edit className="h-4 w-4 ms-1" />
                  {isEditingNotes ? 'لغو' : 'ویرایش'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isEditingNotes ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4"
                >
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={12}
                    placeholder="یادداشت‌های جلسه..."
                    className="resize-none"
                  />
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleUpdateNotes} 
                      size="sm"
                      disabled={updateNotesMutation.isPending}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {updateNotesMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin ms-1" />
                      ) : null}
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
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-64 overflow-y-auto"
                >
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
                        className="mt-3 hover:bg-purple-50"
                        onClick={() => setIsEditingNotes(true)}
                      >
                        <Plus className="h-4 w-4 ms-1" />
                        اضافه کردن یادداشت
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Items Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-green-600" />
                  موارد اقدام
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {completedActionItems}/{totalActionItems}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add new action item */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <Input
                  value={newActionItem}
                  onChange={(e) => setNewActionItem(e.target.value)}
                  placeholder="مورد اقدام جدید..."
                />
                <div className="flex gap-2">
                  <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                    <SelectTrigger className="flex-1 w-full justify-end text-right">
                      <SelectValue placeholder="انتخاب مسئول..." />
                    </SelectTrigger>
                    <SelectContent>
                      {users?.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback className="text-xs">
                                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {user.firstName} {user.lastName}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAddActionItem}
                    disabled={!newActionItem.trim() || !selectedAssignee || isAddingActionItem}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isAddingActionItem ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </motion.div>

              {/* Action items list */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {meeting.actionItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start rtl:items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <motion.button
                        onClick={() => handleToggleActionItem(item.id, item.isCompleted)}
                        className="mt-1 hover:scale-110 transition-transform"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {item.isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </motion.button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${item.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {item.content}
                        </p>
                        <div className="flex items-center justify-between mt-3">
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
                                <Button variant="outline" size="sm" className="hover:bg-green-50">
                                  <ExternalLink className="h-3 w-3 ms-1" />
                                  تسک
                                </Button>
                              </Link>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCreateTask(item.id)}
                                disabled={createTaskMutation.isPending}
                                className="hover:bg-green-50"
                              >
                                {createTaskMutation.isPending ? (
                                  <Loader2 className="h-3 w-3 animate-spin ms-1" />
                                ) : (
                                  <Plus className="h-3 w-3 ms-1" />
                                )}
                                تسک
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {meeting.actionItems.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 text-gray-500"
                  >
                    <CheckSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">هیچ مورد اقدامی اضافه نشده است</p>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
