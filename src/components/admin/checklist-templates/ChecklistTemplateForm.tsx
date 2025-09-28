'use client';

import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import {
  Plus,
  Trash2,
  AlertCircle,
  Loader2,
  Save,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';

interface ChecklistTemplateTask {
  id?: string;
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
  tasks: ChecklistTemplateTask[];
}

interface ChecklistTemplateFormProps {
  template: ChecklistTemplate | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const TEMPLATE_TYPE_LABELS = {
  ONBOARDING: 'فرآیند استخدام',
  OFFBOARDING: 'فرآیند ترک کار',
};

const ASSIGNEE_ROLE_LABELS = {
  EMPLOYEE: 'کارمند',
  MANAGER: 'مدیر',
  ADMIN: 'مدیر سیستم',
};

export function ChecklistTemplateForm({ template, onSuccess, onCancel }: ChecklistTemplateFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'ONBOARDING' as 'ONBOARDING' | 'OFFBOARDING',
    description: '',
    isActive: true,
  });

  const [tasks, setTasks] = useState<ChecklistTemplateTask[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data
  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        type: template.type,
        description: template.description || '',
        isActive: template.isActive,
      });
      setTasks(template.tasks.map((task, index) => ({
        ...task,
        order: index,
      })));
    } else {
      // Add a default task for new templates
      setTasks([{
        title: '',
        description: '',
        defaultAssigneeRole: 'EMPLOYEE',
        order: 0,
        isRequired: true,
        estimatedDays: 1,
      }]);
    }
  }, [template]);

  // Create/Update template mutation
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = template 
        ? `/api/admin/checklist-templates/${template.id}`
        : '/api/admin/checklist-templates';
      
      const method = template ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save template');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success(template ? 'قالب با موفقیت به‌روزرسانی شد' : 'قالب با موفقیت ایجاد شد');
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(`خطا در ذخیره قالب: ${error.message}`);
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'نام قالب الزامی است';
    }

    if (tasks.length === 0) {
      newErrors.tasks = 'حداقل یک وظیفه باید اضافه شود';
    }

    tasks.forEach((task, index) => {
      if (!task.title.trim()) {
        newErrors[`task_${index}_title`] = 'عنوان وظیفه الزامی است';
      }
      if (task.estimatedDays && task.estimatedDays < 1) {
        newErrors[`task_${index}_days`] = 'تعداد روزها باید حداقل 1 باشد';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      tasks: tasks.map((task, index) => ({
        ...task,
        order: index,
      })),
    };

    saveMutation.mutate(submitData);
  };

  const addTask = () => {
    const newTask: ChecklistTemplateTask = {
      title: '',
      description: '',
      defaultAssigneeRole: 'EMPLOYEE',
      order: tasks.length,
      isRequired: true,
      estimatedDays: 1,
    };
    setTasks([...tasks, newTask]);
  };

  const removeTask = (index: number) => {
    if (tasks.length > 1) {
      const newTasks = tasks.filter((_, i) => i !== index);
      setTasks(newTasks.map((task, i) => ({ ...task, order: i })));
    }
  };

  const updateTask = (index: number, field: keyof ChecklistTemplateTask, value: any) => {
    const newTasks = [...tasks];
    if (newTasks[index]) {
      newTasks[index] = { ...newTasks[index], [field]: value };
      setTasks(newTasks);
    }
  };

  const moveTask = (fromIndex: number, toIndex: number) => {
    const newTasks = [...tasks];
    const [movedTask] = newTasks.splice(fromIndex, 1);
    if (movedTask) {
      newTasks.splice(toIndex, 0, movedTask);
      setTasks(newTasks.map((task, index) => ({ ...task, order: index })));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>اطلاعات پایه</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">نام قالب *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="نام قالب را وارد کنید"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="type">نوع قالب *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'ONBOARDING' | 'OFFBOARDING') =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger className="w-full justify-end text-right">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ONBOARDING">
                    {TEMPLATE_TYPE_LABELS.ONBOARDING}
                  </SelectItem>
                  <SelectItem value="OFFBOARDING">
                    {TEMPLATE_TYPE_LABELS.OFFBOARDING}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">توضیحات</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="توضیحات قالب را وارد کنید"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse space-x-reverse">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="isActive">قالب فعال است</Label>
          </div>
        </CardContent>
      </Card>

      {/* Tasks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>وظایف قالب</CardTitle>
            <Button type="button" onClick={addTask} size="sm">
              <Plus className="h-4 w-4 me-2" />
              افزودن وظیفه
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {errors.tasks && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.tasks}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {tasks.map((task, index) => (
              <OptimizedMotion
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-s-4 border-s-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start rtl:items-start gap-3">
                      <div className="flex flex-col gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => moveTask(index, Math.max(0, index - 1))}
                          disabled={index === 0}
                        >
                          ↑
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => moveTask(index, Math.min(tasks.length - 1, index + 1))}
                          disabled={index === tasks.length - 1}
                        >
                          ↓
                        </Button>
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label>عنوان وظیفه *</Label>
                            <Input
                              value={task.title}
                              onChange={(e) => updateTask(index, 'title', e.target.value)}
                              placeholder="عنوان وظیفه را وارد کنید"
                              className={errors[`task_${index}_title`] ? 'border-red-500' : ''}
                            />
                            {errors[`task_${index}_title`] && (
                              <p className="text-sm text-red-500 mt-1">
                                {errors[`task_${index}_title`]}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label>مسئول پیش‌فرض</Label>
                            <Select
                              value={task.defaultAssigneeRole}
                              onValueChange={(value: 'EMPLOYEE' | 'MANAGER' | 'ADMIN') =>
                                updateTask(index, 'defaultAssigneeRole', value)
                              }
                            >
                              <SelectTrigger className="w-full justify-end text-right">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="EMPLOYEE">
                                  {ASSIGNEE_ROLE_LABELS.EMPLOYEE}
                                </SelectItem>
                                <SelectItem value="MANAGER">
                                  {ASSIGNEE_ROLE_LABELS.MANAGER}
                                </SelectItem>
                                <SelectItem value="ADMIN">
                                  {ASSIGNEE_ROLE_LABELS.ADMIN}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label>توضیحات</Label>
                          <Textarea
                            value={task.description || ''}
                            onChange={(e) => updateTask(index, 'description', e.target.value)}
                            placeholder="توضیحات وظیفه را وارد کنید"
                            rows={2}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <Label>تخمین روزها</Label>
                            <Input
                              type="number"
                              min="1"
                              value={task.estimatedDays || ''}
                              onChange={(e) => updateTask(index, 'estimatedDays', 
                                e.target.value ? parseInt(e.target.value) : undefined
                              )}
                              placeholder="تعداد روزها"
                              className={errors[`task_${index}_days`] ? 'border-red-500' : ''}
                            />
                            {errors[`task_${index}_days`] && (
                              <p className="text-sm text-red-500 mt-1">
                                {errors[`task_${index}_days`]}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center space-x-2 rtl:space-x-reverse space-x-reverse">
                            <Switch
                              id={`required_${index}`}
                              checked={task.isRequired}
                              onCheckedChange={(checked) => updateTask(index, 'isRequired', checked)}
                            />
                            <Label htmlFor={`required_${index}`}>وظیفه اجباری</Label>
                          </div>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTask(index)}
                        disabled={tasks.length === 1}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </OptimizedMotion>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end rtl:justify-start gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 me-2" />
          انصراف
        </Button>
        <Button type="submit" disabled={saveMutation.isPending}>
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 me-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 me-2" />
          )}
          {template ? 'به‌روزرسانی' : 'ایجاد'} قالب
        </Button>
      </div>
    </form>
  );
}
