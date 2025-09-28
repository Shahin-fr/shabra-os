'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import {
  Calendar,
  Clock,
  Save,
  RefreshCw,
  AlertCircle,
  User,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WorkSchedule {
  id: string;
  userId: string;
  saturday: boolean;
  sunday: boolean;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  createdAt: string;
  updatedAt: string;
}

interface WorkScheduleUser {
  id: string;
  name: string;
}

interface WorkScheduleResponse {
  workSchedule: WorkSchedule;
  user: WorkScheduleUser;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string;
}

const DAYS_OF_WEEK = [
  { key: 'saturday', label: 'شنبه', shortLabel: 'ش' },
  { key: 'sunday', label: 'یکشنبه', shortLabel: 'ی' },
  { key: 'monday', label: 'دوشنبه', shortLabel: 'د' },
  { key: 'tuesday', label: 'سه‌شنبه', shortLabel: 'س' },
  { key: 'wednesday', label: 'چهارشنبه', shortLabel: 'چ' },
  { key: 'thursday', label: 'پنج‌شنبه', shortLabel: 'پ' },
  { key: 'friday', label: 'جمعه', shortLabel: 'ج' },
] as const;

export function WorkScheduleManagement() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [workSchedule, setWorkSchedule] = useState<Partial<WorkSchedule>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const queryClient = useQueryClient();

  // Fetch employees
  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async (): Promise<Employee[]> => {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      const result = await response.json();
      return result.data || [];
    },
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch work schedule for selected employee
  const {
    data: workScheduleData,
    isLoading: workScheduleLoading,
    error: workScheduleError,
  } = useQuery({
    queryKey: ['work-schedule', selectedEmployeeId],
    queryFn: async (): Promise<WorkScheduleResponse> => {
      if (!selectedEmployeeId) throw new Error('No employee selected');
      
      const response = await fetch(`/api/admin/work-schedules/${selectedEmployeeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch work schedule');
      }
      return response.json();
    },
    enabled: !!selectedEmployeeId,
    retry: 2,
    staleTime: 2 * 60 * 1000,
  });

  // Update work schedule mutation
  const updateWorkScheduleMutation = useMutation({
    mutationFn: async (data: Partial<WorkSchedule>) => {
      if (!selectedEmployeeId) throw new Error('No employee selected');
      
      const response = await fetch(`/api/admin/work-schedules/${selectedEmployeeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update work schedule');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-schedule', selectedEmployeeId] });
      setIsEditing(false);
      setHasChanges(false);
      toast.success('برنامه کاری با موفقیت به‌روزرسانی شد');
    },
    onError: (error: Error) => {
      toast.error(`خطا در به‌روزرسانی برنامه کاری: ${error.message}`);
    },
  });

  const handleEmployeeSelect = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setIsEditing(false);
    setHasChanges(false);
  };

  const handleDayToggle = (dayKey: keyof WorkSchedule) => {
    if (!isEditing) return;
    
    setWorkSchedule(prev => ({
      ...prev,
      [dayKey]: !prev[dayKey],
    }));
    setHasChanges(true);
  };

  const handleEdit = () => {
    if (workScheduleData) {
      setWorkSchedule(workScheduleData.workSchedule);
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (selectedEmployeeId && workSchedule) {
      updateWorkScheduleMutation.mutate(workSchedule);
    }
  };

  const handleCancel = () => {
    if (workScheduleData) {
      setWorkSchedule(workScheduleData.workSchedule);
    }
    setIsEditing(false);
    setHasChanges(false);
  };

  const getWorkingDaysCount = () => {
    if (!workSchedule) return 0;
    return DAYS_OF_WEEK.filter(day => workSchedule[day.key as keyof WorkSchedule]).length;
  };

  const getWorkingDaysLabels = () => {
    if (!workSchedule) return [];
    return DAYS_OF_WEEK
      .filter(day => workSchedule[day.key as keyof WorkSchedule])
      .map(day => day.shortLabel);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <OptimizedMotion
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Settings className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">مدیریت برنامه کاری</CardTitle>
                  <p className="text-gray-600">تنظیم روزهای کاری کارمندان</p>
                </div>
              </div>
              <Button
                onClick={() => queryClient.invalidateQueries({ queryKey: ['work-schedule'] })}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 me-2" />
                بروزرسانی
              </Button>
            </div>
          </CardHeader>
        </Card>
      </OptimizedMotion>

      {/* Employee Selection */}
      <OptimizedMotion
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-[#ff0a54]" />
              انتخاب کارمند
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employee">کارمند</Label>
                <Select
                  value={selectedEmployeeId}
                  onValueChange={handleEmployeeSelect}
                  disabled={employeesLoading}
                >
                  <SelectTrigger className="w-full justify-end text-right">
                    <SelectValue placeholder="انتخاب کارمند برای تنظیم برنامه کاری" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees?.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.firstName} {employee.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </OptimizedMotion>

      {/* Work Schedule Display/Edit */}
      {selectedEmployeeId && (
        <OptimizedMotion
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#ff0a54]" />
                  برنامه کاری
                  {workScheduleData && (
                    <span className="text-sm font-normal text-gray-600">
                      - {workScheduleData.user.name}
                    </span>
                  )}
                </CardTitle>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <Button onClick={handleEdit} size="sm">
                      ویرایش
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        size="sm"
                        disabled={updateWorkScheduleMutation.isPending}
                      >
                        لغو
                      </Button>
                      <Button
                        onClick={handleSave}
                        size="sm"
                        disabled={!hasChanges || updateWorkScheduleMutation.isPending}
                        className="bg-[#ff0a54] hover:bg-[#ff0a54]/90"
                      >
                        {updateWorkScheduleMutation.isPending ? (
                          <RefreshCw className="h-4 w-4 me-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 me-2" />
                        )}
                        ذخیره
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {workScheduleLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                  <span className="me-2 text-gray-600">در حال بارگذاری...</span>
                </div>
              ) : workScheduleError ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    خطا در بارگذاری برنامه کاری. لطفاً دوباره تلاش کنید.
                  </AlertDescription>
                </Alert>
              ) : workScheduleData ? (
                <div className="space-y-6">
                  {/* Days of Week */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    {DAYS_OF_WEEK.map((day) => (
                      <div key={day.key} className="space-y-2">
                        <Label className="text-sm font-medium text-center block">
                          {day.label}
                        </Label>
                        <div className="flex items-center justify-center">
                          <Switch
                            checked={Boolean(workSchedule[day.key as keyof WorkSchedule])}
                            onCheckedChange={() => handleDayToggle(day.key as keyof WorkSchedule)}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="text-center">
                          <Badge
                            variant={workSchedule[day.key as keyof WorkSchedule] ? "default" : "secondary"}
                            className={
                              workSchedule[day.key as keyof WorkSchedule]
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-600"
                            }
                          >
                            {day.shortLabel}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium">خلاصه برنامه کاری:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-800">
                          {getWorkingDaysCount()} روز کاری
                        </Badge>
                        {getWorkingDaysLabels().length > 0 && (
                          <span className="text-sm text-gray-600">
                            ({getWorkingDaysLabels().join('، ')})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Changes Indicator */}
                  {hasChanges && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        تغییرات اعمال شده است. برای ذخیره تغییرات روی دکمه "ذخیره" کلیک کنید.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </OptimizedMotion>
      )}
    </div>
  );
}
