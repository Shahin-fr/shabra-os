'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import {
  ClipboardList,
  Plus,
  Eye,
  // Play,
  // Pause,
  CheckCircle,
  // Clock,
  AlertCircle,
  Loader2,
  RefreshCw,
  // Users,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// import { Alert, AlertDescription } from '@/components/ui/alert'; // Removed unused imports
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { ChecklistDetails } from './ChecklistDetails';

interface ChecklistTemplate {
  id: string;
  name: string;
  type: 'ONBOARDING' | 'OFFBOARDING';
  description?: string;
  tasks: Array<{
    id: string;
    title: string;
    description?: string;
    defaultAssigneeRole: 'EMPLOYEE' | 'MANAGER' | 'ADMIN';
    order: number;
    isRequired: boolean;
    estimatedDays?: number;
  }>;
}

interface EmployeeChecklist {
  id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startDate: string;
  completedAt?: string;
  notes?: string;
  template: ChecklistTemplate;
  relatedTasks: Array<{
    id: string;
    title: string;
    status: 'Todo' | 'InProgress' | 'Done';
    assignee: {
      id: string;
      firstName: string;
      lastName: string;
    };
    dueDate: string;
  }>;
}

interface EmployeeChecklistsResponse {
  success: boolean;
  checklists: EmployeeChecklist[];
}

interface ChecklistTemplatesResponse {
  success: boolean;
  templates: ChecklistTemplate[];
}

const CHECKLIST_STATUS_LABELS = {
  PENDING: 'در انتظار',
  IN_PROGRESS: 'در حال انجام',
  COMPLETED: 'تکمیل شده',
  CANCELLED: 'لغو شده',
};

const CHECKLIST_STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const TEMPLATE_TYPE_LABELS = {
  ONBOARDING: 'فرآیند استخدام',
  OFFBOARDING: 'فرآیند ترک کار',
};

const TEMPLATE_TYPE_COLORS = {
  ONBOARDING: 'bg-green-100 text-green-800',
  OFFBOARDING: 'bg-red-100 text-red-800',
};

interface ProfileChecklistsProps {
  userId: string;
}

export function ProfileChecklists({ userId }: ProfileChecklistsProps) {
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<EmployeeChecklist | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  // Check if user can assign checklists
  const canAssignChecklists = currentUser?.roles?.includes('ADMIN') || 
                             currentUser?.roles?.includes('MANAGER');

  // Fetch employee checklists
  const {
    data: checklistsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['employee-checklists', userId],
    queryFn: async (): Promise<EmployeeChecklistsResponse> => {
      const response = await fetch(`/api/admin/employee-checklists?employeeId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch employee checklists');
      }
      return response.json();
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch available templates for assignment
  const {
    data: templatesData,
    isLoading: _templatesLoading,
  } = useQuery({
    queryKey: ['checklist-templates-for-assignment'],
    queryFn: async (): Promise<ChecklistTemplatesResponse> => {
      const response = await fetch('/api/admin/checklist-templates?isActive=true');
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      return response.json();
    },
    enabled: canAssignChecklists,
    retry: 2,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Assign checklist mutation
  const assignMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const response = await fetch('/api/admin/employee-checklists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId: userId,
          templateId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign checklist');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success(`چک‌لیست با موفقیت اختصاص داده شد. ${data.generatedTasks.length} وظیفه ایجاد شد.`);
      queryClient.invalidateQueries({ queryKey: ['employee-checklists', userId] });
      setIsAssignDialogOpen(false);
      setSelectedTemplateId('');
    },
    onError: (error: Error) => {
      toast.error(`خطا در اختصاص چک‌لیست: ${error.message}`);
    },
  });

  // Update checklist status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ checklistId, status }: { checklistId: string; status: string }) => {
      const response = await fetch(`/api/admin/employee-checklists/${checklistId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update checklist');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('وضعیت چک‌لیست به‌روزرسانی شد');
      queryClient.invalidateQueries({ queryKey: ['employee-checklists', userId] });
    },
    onError: (error: Error) => {
      toast.error(`خطا در به‌روزرسانی چک‌لیست: ${error.message}`);
    },
  });

  const handleAssignChecklist = () => {
    if (!selectedTemplateId) {
      toast.error('لطفاً یک قالب انتخاب کنید');
      return;
    }
    assignMutation.mutate(selectedTemplateId);
  };

  const handleViewChecklist = (checklist: EmployeeChecklist) => {
    setSelectedChecklist(checklist);
    setIsDetailsDialogOpen(true);
  };

  const handleUpdateStatus = (checklistId: string, newStatus: string) => {
    updateStatusMutation.mutate({ checklistId, status: newStatus });
  };

  const checklists = checklistsData?.checklists || [];

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            خطا در بارگذاری چک‌لیست‌ها
          </h3>
          <p className="text-gray-600 text-center mb-4">
            متأسفانه خطایی در بارگذاری چک‌لیست‌ها رخ داده است.
          </p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            تلاش مجدد
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">چک‌لیست‌های فرآیند</h2>
          <p className="text-gray-600">
            {checklists.length} چک‌لیست موجود
          </p>
        </div>
        {canAssignChecklists && (
          <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                اختصاص چک‌لیست جدید
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>اختصاص چک‌لیست جدید</DialogTitle>
                <DialogDescription>
                  یک قالب چک‌لیست را برای این کارمند انتخاب کنید.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    انتخاب قالب
                  </label>
                  <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                    <SelectTrigger>
                      <SelectValue placeholder="قالب چک‌لیست را انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent>
                      {templatesData?.templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex items-center gap-2">
                            <Badge className={TEMPLATE_TYPE_COLORS[template.type]}>
                              {TEMPLATE_TYPE_LABELS[template.type]}
                            </Badge>
                            <span>{template.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAssignDialogOpen(false)}
                  >
                    انصراف
                  </Button>
                  <Button
                    onClick={handleAssignChecklist}
                    disabled={!selectedTemplateId || assignMutation.isPending}
                  >
                    {assignMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    اختصاص
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Checklists List */}
      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="mr-3 text-gray-600">در حال بارگذاری چک‌لیست‌ها...</span>
          </CardContent>
        </Card>
      ) : checklists.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardList className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              هیچ چک‌لیستی یافت نشد
            </h3>
            <p className="text-gray-600 text-center mb-4">
              هنوز هیچ چک‌لیستی برای این کارمند اختصاص داده نشده است.
            </p>
            {canAssignChecklists && (
              <Button onClick={() => setIsAssignDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                اختصاص اولین چک‌لیست
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {checklists.map((checklist, index) => (
            <OptimizedMotion
              key={checklist.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {checklist.template.name}
                        </h3>
                        <Badge className={TEMPLATE_TYPE_COLORS[checklist.template.type]}>
                          {TEMPLATE_TYPE_LABELS[checklist.template.type]}
                        </Badge>
                        <Badge className={CHECKLIST_STATUS_COLORS[checklist.status]}>
                          {CHECKLIST_STATUS_LABELS[checklist.status]}
                        </Badge>
                      </div>

                      {checklist.template.description && (
                        <p className="text-gray-600 mb-3">{checklist.template.description}</p>
                      )}

                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <ClipboardList className="h-4 w-4" />
                          <span>{checklist.template.tasks.length} وظیفه</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>شروع: {new Date(checklist.startDate).toLocaleDateString('fa-IR')}</span>
                        </div>
                        {checklist.completedAt && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            <span>تکمیل: {new Date(checklist.completedAt).toLocaleDateString('fa-IR')}</span>
                          </div>
                        )}
                      </div>

                      {/* Progress */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>پیشرفت وظایف</span>
                          <span>
                            {checklist.relatedTasks.filter(task => task.status === 'Done').length} / {checklist.relatedTasks.length}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${(checklist.relatedTasks.filter(task => task.status === 'Done').length / checklist.relatedTasks.length) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewChecklist(checklist)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        مشاهده
                      </Button>

                      {canAssignChecklists && checklist.status !== 'COMPLETED' && checklist.status !== 'CANCELLED' && (
                        <Select
                          value={checklist.status}
                          onValueChange={(value) => handleUpdateStatus(checklist.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">در انتظار</SelectItem>
                            <SelectItem value="IN_PROGRESS">در حال انجام</SelectItem>
                            <SelectItem value="COMPLETED">تکمیل شده</SelectItem>
                            <SelectItem value="CANCELLED">لغو شده</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </OptimizedMotion>
          ))}
        </div>
      )}

      {/* Checklist Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>جزئیات چک‌لیست</DialogTitle>
            <DialogDescription>
              مشاهده جزئیات کامل چک‌لیست و وضعیت وظایف.
            </DialogDescription>
          </DialogHeader>
          {selectedChecklist && (
            <ChecklistDetails
              checklist={selectedChecklist}
              onClose={() => setIsDetailsDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
