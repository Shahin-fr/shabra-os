'use client';

import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import {
  // ClipboardList,
  CheckCircle,
  Clock,
  User,
  Settings,
  Shield,
  Calendar,
  // AlertCircle,
  X,
  // Play,
  // Pause,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
// import { Separator } from '@/components/ui/separator'; // Removed unused import

interface ChecklistTemplateTask {
  id: string;
  title: string;
  description?: string;
  defaultAssigneeRole: 'EMPLOYEE' | 'MANAGER' | 'ADMIN';
  order: number;
  isRequired: boolean;
  estimatedDays?: number;
}

interface ChecklistTemplate {
  id: string;
  name: string;
  type: 'ONBOARDING' | 'OFFBOARDING';
  description?: string;
  tasks: ChecklistTemplateTask[];
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

interface ChecklistDetailsProps {
  checklist: EmployeeChecklist;
  onClose: () => void;
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

const TASK_STATUS_LABELS = {
  Todo: 'در انتظار',
  InProgress: 'در حال انجام',
  Done: 'تکمیل شده',
};

const TASK_STATUS_COLORS = {
  Todo: 'bg-gray-100 text-gray-800',
  InProgress: 'bg-blue-100 text-blue-800',
  Done: 'bg-green-100 text-green-800',
};

const ASSIGNEE_ROLE_LABELS = {
  EMPLOYEE: 'کارمند',
  MANAGER: 'مدیر',
  ADMIN: 'مدیر سیستم',
};

const ASSIGNEE_ROLE_ICONS = {
  EMPLOYEE: User,
  MANAGER: Settings,
  ADMIN: Shield,
};

export function ChecklistDetails({ checklist, onClose }: ChecklistDetailsProps) {
  const getAssigneeIcon = (role: 'EMPLOYEE' | 'MANAGER' | 'ADMIN') => {
    const IconComponent = ASSIGNEE_ROLE_ICONS[role];
    return IconComponent;
  };

  const getAssigneeColor = (role: 'EMPLOYEE' | 'MANAGER' | 'ADMIN') => {
    switch (role) {
      case 'EMPLOYEE':
        return 'bg-blue-100 text-blue-800';
      case 'MANAGER':
        return 'bg-yellow-100 text-yellow-800';
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const completedTasks = checklist.relatedTasks.filter(task => task.status === 'Done').length;
  const totalTasks = checklist.relatedTasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Group tasks by status
  const tasksByStatus = {
    Todo: checklist.relatedTasks.filter(task => task.status === 'Todo'),
    InProgress: checklist.relatedTasks.filter(task => task.status === 'InProgress'),
    Done: checklist.relatedTasks.filter(task => task.status === 'Done'),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start rtl:items-start justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{checklist.template.name}</h2>
          <div className="flex items-center gap-3">
            <Badge className={TEMPLATE_TYPE_COLORS[checklist.template.type]}>
              {TEMPLATE_TYPE_LABELS[checklist.template.type]}
            </Badge>
            <Badge className={CHECKLIST_STATUS_COLORS[checklist.status]}>
              {CHECKLIST_STATUS_LABELS[checklist.status]}
            </Badge>
          </div>
        </div>
        <Button variant="ghost" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Description */}
      {checklist.template.description && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-700 leading-relaxed">{checklist.template.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">پیشرفت کلی</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">تکمیل شده</span>
              <span className="text-sm font-medium text-gray-900">
                {completedTasks} از {totalTasks} وظیفه
              </span>
            </div>
            <Progress value={progressPercentage} className="w-full" />
            <div className="text-center text-sm text-gray-600">
              {Math.round(progressPercentage)}% تکمیل شده
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checklist Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">تاریخ شروع</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(checklist.startDate).toLocaleDateString('fa-IR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {checklist.completedAt && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">تاریخ تکمیل</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(checklist.completedAt).toLocaleDateString('fa-IR')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">مدت زمان</p>
                <p className="text-sm font-medium text-gray-900">
                  {checklist.completedAt
                    ? `${Math.ceil((new Date(checklist.completedAt).getTime() - new Date(checklist.startDate).getTime()) / (1000 * 60 * 60 * 24))} روز`
                    : `${Math.ceil((new Date().getTime() - new Date(checklist.startDate).getTime()) / (1000 * 60 * 60 * 24))} روز`
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {checklist.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">یادداشت‌ها</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{checklist.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Tasks by Status */}
      <div className="space-y-6">
        {Object.entries(tasksByStatus).map(([status, tasks]) => {
          if (tasks.length === 0) return null;

          return (
            <Card key={status}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Badge className={TASK_STATUS_COLORS[status as keyof typeof TASK_STATUS_COLORS]}>
                    {TASK_STATUS_LABELS[status as keyof typeof TASK_STATUS_LABELS]}
                  </Badge>
                  <span>{tasks.length} وظیفه</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasks.map((task, index) => {
                    const templateTask = checklist.template.tasks.find(t => t.title === task.title);
                    const AssigneeIcon = templateTask ? getAssigneeIcon(templateTask.defaultAssigneeRole) : User;
                    
                    return (
                      <OptimizedMotion
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-start rtl:items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                            {templateTask ? templateTask.order + 1 : index + 1}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start rtl:items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
                                {templateTask?.description && (
                                  <p className="text-sm text-gray-600 mb-2">{templateTask.description}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={TASK_STATUS_COLORS[task.status]}>
                                  {TASK_STATUS_LABELS[task.status]}
                                </Badge>
                                {templateTask && (
                                  <Badge className={getAssigneeColor(templateTask.defaultAssigneeRole)}>
                                    <AssigneeIcon className="h-3 w-3 me-1" />
                                    {ASSIGNEE_ROLE_LABELS[templateTask.defaultAssigneeRole]}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span>{task.assignee.firstName} {task.assignee.lastName}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>مهلت: {new Date(task.dueDate).toLocaleDateString('fa-IR')}</span>
                              </div>
                              {templateTask?.estimatedDays && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>تخمین: {templateTask.estimatedDays} روز</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </OptimizedMotion>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex justify-end rtl:justify-start">
        <Button onClick={onClose}>
          بستن
        </Button>
      </div>
    </div>
  );
}
