'use client';

import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import {
  ClipboardList,
  Users,
  Clock,
  User,
  Shield,
  Settings,
  Calendar,
  CheckCircle,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// import { Separator } from '@/components/ui/separator';

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
  isActive: boolean;
  createdAt: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  tasks: ChecklistTemplateTask[];
  _count: {
    employeeChecklists: number;
  };
}

interface ChecklistTemplateDetailsProps {
  template: ChecklistTemplate;
  onClose: () => void;
}

const TEMPLATE_TYPE_LABELS = {
  ONBOARDING: 'فرآیند استخدام',
  OFFBOARDING: 'فرآیند ترک کار',
};

const TEMPLATE_TYPE_COLORS = {
  ONBOARDING: 'bg-green-100 text-green-800',
  OFFBOARDING: 'bg-red-100 text-red-800',
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

export function ChecklistTemplateDetails({ template, onClose }: ChecklistTemplateDetailsProps) {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{template.name}</h2>
          <div className="flex items-center gap-3">
            <Badge className={TEMPLATE_TYPE_COLORS[template.type]}>
              {TEMPLATE_TYPE_LABELS[template.type]}
            </Badge>
            <Badge variant={template.isActive ? 'default' : 'secondary'}>
              {template.isActive ? 'فعال' : 'غیرفعال'}
            </Badge>
          </div>
        </div>
        <Button variant="ghost" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Description */}
      {template.description && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-700 leading-relaxed">{template.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Template Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ClipboardList className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">تعداد وظایف</p>
                <p className="text-2xl font-bold text-gray-900">{template.tasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">تعداد استفاده</p>
                <p className="text-2xl font-bold text-gray-900">{template._count.employeeChecklists}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">تاریخ ایجاد</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(template.createdAt).toLocaleDateString('fa-IR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Created By */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ایجاد شده توسط</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
              {template.createdBy.firstName.charAt(0)}{template.createdBy.lastName.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {template.createdBy.firstName} {template.createdBy.lastName}
              </p>
              <p className="text-sm text-gray-600">مدیر سیستم</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">وظایف قالب</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {template.tasks.map((task, index) => {
              const AssigneeIcon = getAssigneeIcon(task.defaultAssigneeRole);
              
              return (
                <OptimizedMotion
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                      {index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
                          {task.description && (
                            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {task.isRequired && (
                            <Badge variant="destructive" className="text-xs">
                              اجباری
                            </Badge>
                          )}
                          <Badge className={getAssigneeColor(task.defaultAssigneeRole)}>
                            <AssigneeIcon className="h-3 w-3 mr-1" />
                            {ASSIGNEE_ROLE_LABELS[task.defaultAssigneeRole]}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        {task.estimatedDays && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{task.estimatedDays} روز</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          <span>ترتیب: {task.order + 1}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </OptimizedMotion>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      {template._count.employeeChecklists > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">آمار استفاده</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  این قالب در {template._count.employeeChecklists} فرآیند استفاده شده است
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  قالب‌های در حال استفاده قابل حذف نیستند
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end">
        <Button onClick={onClose}>
          بستن
        </Button>
      </div>
    </div>
  );
}
