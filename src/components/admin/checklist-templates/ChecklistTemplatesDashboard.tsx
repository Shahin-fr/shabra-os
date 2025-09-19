'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import {
  ClipboardList,
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  Clock,
  AlertCircle,
  Loader2,
  RefreshCw,
  Filter,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChecklistTemplateForm } from './ChecklistTemplateForm';
import { ChecklistTemplateDetails } from './ChecklistTemplateDetails';

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
  tasks: Array<{
    id: string;
    title: string;
    description?: string;
    defaultAssigneeRole: 'EMPLOYEE' | 'MANAGER' | 'ADMIN';
    order: number;
    isRequired: boolean;
    estimatedDays?: number;
  }>;
  _count: {
    employeeChecklists: number;
  };
}

interface ChecklistTemplatesResponse {
  success: boolean;
  templates: ChecklistTemplate[];
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

export function ChecklistTemplatesDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate | null>(null);

  const queryClient = useQueryClient();

  // Fetch templates
  const {
    data: templatesData,
    isLoading,
    error,
    refetch,
    isError,
    isSuccess,
  } = useQuery({
    queryKey: ['checklist-templates', typeFilter, statusFilter],
    queryFn: async (): Promise<ChecklistTemplatesResponse> => {
      try {
        const params = new URLSearchParams();
        if (typeFilter !== 'all') params.append('type', typeFilter);
        if (statusFilter !== 'all') params.append('isActive', statusFilter === 'active' ? 'true' : 'false');

        const response = await fetch(`/api/admin/checklist-templates?${params}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch checklist templates`);
        }
        
        const result = await response.json();
        
        // Validate response structure
        if (!result || typeof result !== 'object') {
          throw new Error('Invalid response format from server');
        }
        
        if (!result.success) {
          throw new Error(result.error || 'Server returned error status');
        }
        
        return result;
      } catch (error) {
        console.error('Error fetching checklist templates:', error);
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error instanceof Error && error.message.includes('HTTP 4')) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Delete template mutation
  const deleteMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const response = await fetch(`/api/admin/checklist-templates/${templateId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete template');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('قالب با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: ['checklist-templates'] });
    },
    onError: (error: Error) => {
      toast.error(`خطا در حذف قالب: ${error.message}`);
    },
  });

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setIsCreateDialogOpen(true);
  };

  const handleEditTemplate = (template: ChecklistTemplate) => {
    setSelectedTemplate(template);
    setIsEditDialogOpen(true);
  };

  const handleViewTemplate = (template: ChecklistTemplate) => {
    setSelectedTemplate(template);
    setIsDetailsDialogOpen(true);
  };

  const handleDeleteTemplate = (template: ChecklistTemplate) => {
    if (confirm(`آیا مطمئن هستید که می‌خواهید قالب "${template.name}" را حذف کنید؟`)) {
      deleteMutation.mutate(template.id);
    }
  };

  // Filter templates based on search term
  const filteredTemplates = templatesData?.templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) || [];

  if (isError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            خطا در بارگذاری قالب‌ها
          </h3>
          <p className="text-gray-600 text-center mb-4">
            {error instanceof Error ? error.message : 'متأسفانه خطایی در بارگذاری قالب‌های چک‌لیست رخ داده است.'}
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
      {/* Header Actions */}
      <OptimizedMotion
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="جستجو در قالب‌ها..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="نوع قالب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه انواع</SelectItem>
                  <SelectItem value="ONBOARDING">فرآیند استخدام</SelectItem>
                  <SelectItem value="OFFBOARDING">فرآیند ترک کار</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="وضعیت" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه</SelectItem>
                  <SelectItem value="active">فعال</SelectItem>
                  <SelectItem value="inactive">غیرفعال</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleCreateTemplate}>
            <Plus className="h-4 w-4 mr-2" />
            ایجاد قالب جدید
          </Button>
        </div>
      </OptimizedMotion>

      {/* Templates List */}
      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="mr-3 text-gray-600">در حال بارگذاری قالب‌ها...</span>
          </CardContent>
        </Card>
      ) : isSuccess && filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardList className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              هیچ قالب چک‌لیستی یافت نشد
            </h3>
            <p className="text-gray-600 text-center mb-4">
              {templatesData?.templates?.length === 0 
                ? 'هنوز هیچ قالب چک‌لیستی ایجاد نشده است.'
                : 'هیچ قالب چک‌لیستی با فیلترهای انتخاب شده یافت نشد.'
              }
            </p>
            <Button onClick={handleCreateTemplate}>
              <Plus className="h-4 w-4 mr-2" />
              ایجاد اولین قالب
            </Button>
          </CardContent>
        </Card>
      ) : isSuccess && filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template, index) => (
            <OptimizedMotion
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{template.name}</CardTitle>
                      <Badge className={TEMPLATE_TYPE_COLORS[template.type]}>
                        {TEMPLATE_TYPE_LABELS[template.type]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewTemplate(template)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTemplate(template)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template)}
                        className="text-red-600 hover:text-red-700"
                        disabled={template._count.employeeChecklists > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {template.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {template.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <ClipboardList className="h-4 w-4" />
                        <span>{template.tasks.length} وظیفه</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{template._count.employeeChecklists} استفاده</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        ایجاد شده توسط: {template.createdBy.firstName} {template.createdBy.lastName}
                      </span>
                      <span>
                        {new Date(template.createdAt).toLocaleDateString('fa-IR')}
                      </span>
                    </div>

                    {template._count.employeeChecklists > 0 && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          این قالب در حال استفاده است و نمی‌توان آن را حذف کرد.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            </OptimizedMotion>
          ))}
        </div>
      ) : null}

      {/* Create Template Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ایجاد قالب چک‌لیست جدید</DialogTitle>
            <DialogDescription>
              قالب جدیدی برای فرآیندهای استخدام یا ترک کار ایجاد کنید.
            </DialogDescription>
          </DialogHeader>
          <ChecklistTemplateForm
            template={null}
            onSuccess={() => {
              setIsCreateDialogOpen(false);
              queryClient.invalidateQueries({ queryKey: ['checklist-templates'] });
            }}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ویرایش قالب چک‌لیست</DialogTitle>
            <DialogDescription>
              قالب چک‌لیست را ویرایش کنید.
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <ChecklistTemplateForm
              template={selectedTemplate}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: ['checklist-templates'] });
              }}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Template Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>جزئیات قالب چک‌لیست</DialogTitle>
            <DialogDescription>
              مشاهده جزئیات کامل قالب چک‌لیست.
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <ChecklistTemplateDetails
              template={selectedTemplate}
              onClose={() => setIsDetailsDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
